// Mock React Native modules before any modules are loaded
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  const mockModule = {
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
  };

  // Mock TurboModuleRegistry as a read-only property
  Object.defineProperty(RN, 'TurboModuleRegistry', {
    get: () => ({
      getEnforcing: jest.fn(() => mockModule),
      get: jest.fn(() => mockModule),
    }),
    configurable: true,
  });

  // Mock NativeModules as a read-only property
  const existingNativeModules = RN.NativeModules || {};
  Object.defineProperty(RN, 'NativeModules', {
    get: () => ({
      ...existingNativeModules,
      Exponea: mockModule,
    }),
    configurable: true,
  });

  // Mock NativeEventEmitter to accept undefined argument in tests
  class MockNativeEventEmitter {
    constructor(nativeModule) {
      // Accept undefined in tests
      this.nativeModule = nativeModule;
      this.listeners = new Map();
    }

    addListener(eventType, listener) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, []);
      }
      this.listeners.get(eventType).push(listener);
      return {
        remove: () => {
          const listeners = this.listeners.get(eventType);
          if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
        },
      };
    }

    removeAllListeners(eventType) {
      this.listeners.delete(eventType);
    }

    removeSubscription(subscription) {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    }
  }

  Object.defineProperty(RN, 'NativeEventEmitter', {
    get: () => MockNativeEventEmitter,
    configurable: true,
  });

  return RN;
});
