import { readFileSync } from 'fs';

class CaptureSlot<T> {
  get captured(): T {
    if (!this.isCaptured) {
      throw new Error('No captured item');
    }
    return this._captured as T;
  }
  private _captured?: T;
  isCaptured = false;
  capture(instance: T) {
    this.isCaptured = true;
    this._captured = instance;
  }
}

export class TestUtils {
  static readJsonFile(path: string): string {
    return JSON.stringify(JSON.parse(readFileSync(path, 'utf8')));
  }

  static readJsonAsParams(path: string): string {
    return ['[', this.readJsonFile(path), ']'].join('');
  }

  static mockExponeaNative(mock: any | undefined = undefined) {
    jest.mock('react-native', () => {
      const RN = jest.requireActual('react-native');
      RN.NativeModules.Exponea = mock ?? {
        onInAppMessageCallbackSet: jest.fn(),
        onSegmentationCallbackSet: jest.fn(),
        onSegmentationCallbackRemove: jest.fn(),
      };
      Object.defineProperty(RN, 'TurboModuleRegistry', {
        get: () => ({
          getEnforcing: jest.fn(
            () =>
              mock ?? {
                onInAppMessageCallbackSet: jest.fn(),
                onSegmentationCallbackSet: jest.fn(),
                onSegmentationCallbackRemove: jest.fn(),
                onPushOpenedListenerSet: jest.fn(),
                onPushOpenedListenerRemove: jest.fn(),
                onPushReceivedListenerSet: jest.fn(),
                onPushReceivedListenerRemove: jest.fn(),
                onInAppMessageCallbackRemove: jest.fn(),
                addListener: jest.fn(),
                removeListeners: jest.fn(),
              }
          ),
          get: jest.fn(),
        }),
      });
      return RN;
    });
  }

  static captureSlot<T>(): CaptureSlot<T> {
    return new CaptureSlot<T>();
  }
}

// Note: mockExponeaNative() is no longer needed as jest.setup.js handles mocking
