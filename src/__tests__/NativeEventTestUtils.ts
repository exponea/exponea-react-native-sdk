import { NativeEventEmitter } from 'react-native';

// Drive the real JS listeners through the NativeEventEmitter mock in jest.setup.js.
// Accept raw payloads so tests can also exercise malformed JSON.
export function emitNativeEvent(event: string, payload: string): void {
  (
    NativeEventEmitter as unknown as {
      emit: (event: string, payload: string) => void;
    }
  ).emit(event, payload);
}
