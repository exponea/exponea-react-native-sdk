import { NativeEventEmitter } from 'react-native';
import Exponea, { SdkAuthErrorCode } from '../index';
import type { SdkAuthError } from '../index';
import NativeExponea from '../NativeExponea';

// Drives the real `sdkAuthError` listener registered at module load in
// ExponeaListeners.ts (native -> JS path), via the mocked NativeEventEmitter.
function emitSdkAuthError(data: string): void {
  (
    NativeEventEmitter as unknown as { emit: (e: string, d: string) => void }
  ).emit('sdkAuthError', data);
}

describe('SDK auth error callback', () => {
  afterEach(() => {
    Exponea.removeSdkAuthErrorCallback();
    jest.clearAllMocks();
  });

  test('parses the native payload and delivers it to the registered callback', () => {
    const received: SdkAuthError[] = [];
    Exponea.setSdkAuthErrorCallback((error) => received.push(error));

    emitSdkAuthError(
      JSON.stringify({
        errorCode: 'TOKEN_EXPIRED',
        customerIds: { registered: 'test@example.com' },
      })
    );

    expect(received).toHaveLength(1);
    expect(received[0]!.errorCode).toBe(SdkAuthErrorCode.TOKEN_EXPIRED);
    expect(received[0]!.customerIds).toStrictEqual({
      registered: 'test@example.com',
    });
  });

  test('delivers an empty customerIds object when the platform provides none', () => {
    const received: SdkAuthError[] = [];
    Exponea.setSdkAuthErrorCallback((error) => received.push(error));

    emitSdkAuthError(
      JSON.stringify({ errorCode: 'TOKEN_ABOUT_TO_EXPIRE', customerIds: {} })
    );

    expect(received).toHaveLength(1);
    expect(received[0]!.errorCode).toBe(SdkAuthErrorCode.TOKEN_ABOUT_TO_EXPIRE);
    expect(received[0]!.customerIds).toStrictEqual({});
  });

  test('does not deliver events after the callback is removed', () => {
    const callback = jest.fn();
    Exponea.setSdkAuthErrorCallback(callback);
    Exponea.removeSdkAuthErrorCallback();

    emitSdkAuthError(
      JSON.stringify({ errorCode: 'TOKEN_REJECTED', customerIds: {} })
    );

    expect(callback).not.toHaveBeenCalled();
  });

  test('does not throw and does not invoke the callback on malformed JSON', () => {
    const callback = jest.fn();
    Exponea.setSdkAuthErrorCallback(callback);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => emitSdkAuthError('not-valid-json')).not.toThrow();

    expect(callback).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  test('notifies the native module on set and remove', () => {
    Exponea.setSdkAuthErrorCallback(() => {});
    expect(NativeExponea.onSdkAuthErrorCallbackSet).toHaveBeenCalledTimes(1);

    Exponea.removeSdkAuthErrorCallback();
    expect(NativeExponea.onSdkAuthErrorCallbackRemove).toHaveBeenCalledTimes(1);
  });
});
