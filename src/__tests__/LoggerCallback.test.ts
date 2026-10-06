import { NativeEventEmitter } from 'react-native';
import Exponea, { LogLevel } from '../index';
import NativeExponea from '../NativeExponea';

function emitLogger(data: string): void {
  (
    NativeEventEmitter as unknown as {
      emit: (event: string, data: string) => void;
    }
  ).emit('logger', data);
}

describe('logger callbacks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('decodes native log events, including throwable stack traces', () => {
    const callback = jest.fn();
    Exponea.registerLoggerCallback(callback);

    emitLogger(
      JSON.stringify({
        level: 'ERROR',
        message: 'Request failed',
        throwable: 'java.lang.IllegalStateException: Request failed',
      })
    );

    expect(callback).toHaveBeenCalledWith({
      level: LogLevel.ERROR,
      message: 'Request failed',
      throwable: 'java.lang.IllegalStateException: Request failed',
    });

    Exponea.unregisterLoggerCallback(callback);
  });

  test('maps the Android DEBUG wire value to public DBG', () => {
    const callback = jest.fn();
    Exponea.registerLoggerCallback(callback);

    emitLogger(JSON.stringify({ level: 'DEBUG', message: 'Debug details' }));

    expect(callback).toHaveBeenCalledWith({
      level: LogLevel.DBG,
      message: 'Debug details',
    });

    Exponea.unregisterLoggerCallback(callback);
  });

  test('invokes all registered callbacks and removes only the matching reference', () => {
    const first = jest.fn();
    const second = jest.fn();
    Exponea.registerLoggerCallback(first);
    Exponea.registerLoggerCallback(second);

    emitLogger(JSON.stringify({ level: 'INFO', message: 'Before removal' }));
    Exponea.unregisterLoggerCallback(first);
    emitLogger(JSON.stringify({ level: 'INFO', message: 'After removal' }));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);

    Exponea.unregisterLoggerCallback(second);
  });

  test('subscribes natively on the first callback and unsubscribes after the last', () => {
    const first = jest.fn();
    const second = jest.fn();

    Exponea.registerLoggerCallback(first);
    Exponea.registerLoggerCallback(first);
    Exponea.registerLoggerCallback(second);
    expect(NativeExponea.registerLoggerCallback).toHaveBeenCalledTimes(1);

    Exponea.unregisterLoggerCallback(first);
    expect(NativeExponea.unregisterLoggerCallback).not.toHaveBeenCalled();
    Exponea.unregisterLoggerCallback(second);
    expect(NativeExponea.unregisterLoggerCallback).toHaveBeenCalledTimes(1);
  });

  test('ignores malformed native payloads', () => {
    const callback = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    Exponea.registerLoggerCallback(callback);

    expect(() => emitLogger('not-valid-json')).not.toThrow();
    emitLogger(JSON.stringify({ level: 'INFO' }));
    emitLogger(JSON.stringify({ level: 'UNKNOWN', message: 'Invalid level' }));

    expect(callback).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(3);

    Exponea.unregisterLoggerCallback(callback);
    errorSpy.mockRestore();
  });
});
