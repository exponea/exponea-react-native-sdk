import { NativeEventEmitter } from 'react-native';
import NativeExponea from './NativeExponea';
import type {
  OpenedPush,
  InAppMessage,
  InAppMessageButton,
  Segment,
} from './NativeExponea';

// Internal listener storage (JavaScript-side)
let pushOpenedListener: ((openedPush: OpenedPush) => void) | null = null;
let pushReceivedListener: ((data: any) => void) | null = null;
let inAppMessageCallback: InAppMessageCallbackImpl | null = null;
let segmentationCallbacks: Map<string, SegmentationDataCallback> = new Map();

// Event emitter setup (listens to native events)
// For TurboModules in new architecture, pass the native module instance
const eventEmitter = new NativeEventEmitter(NativeExponea as any);

// Global event listeners (JavaScript-side)
eventEmitter.addListener('pushOpened', (data: any) => {
  if (pushOpenedListener) {
    try {
      const parsed = JSON.parse(data);
      pushOpenedListener(parsed);
    } catch (e) {
      console.error('Failed to parse pushOpened event', e);
    }
  }
});

eventEmitter.addListener('pushReceived', (data: any) => {
  if (pushReceivedListener) {
    try {
      const parsed = JSON.parse(data);
      pushReceivedListener(parsed);
    } catch (e) {
      console.error('Failed to parse pushReceived event', e);
    }
  }
});

eventEmitter.addListener('inAppAction', (data: any) => {
  if (inAppMessageCallback) {
    try {
      const action = JSON.parse(data);
      handleInAppMessageAction(action, inAppMessageCallback);
    } catch (e) {
      console.error('Failed to parse inAppAction event', e);
    }
  }
});

eventEmitter.addListener('newSegments', (data: any) => {
  try {
    const payload = JSON.parse(data);
    const callback = segmentationCallbacks.get(payload.category);
    if (callback) {
      callback.onNewData(payload.segments);
    }
  } catch (e) {
    console.error('Failed to parse newSegments event', e);
  }
});

// Helper for InApp message action handling
function handleInAppMessageAction(
  action: any,
  callback: InAppMessageCallbackImpl
) {
  const actionType = action.type?.toLowerCase();
  const message = action.message;
  const button = action.button;

  switch (actionType) {
    case 'show':
      if (callback.inAppMessageShown) {
        callback.inAppMessageShown(message);
      }
      break;
    case 'action': // click action
      if (callback.inAppMessageClickAction) {
        callback.inAppMessageClickAction(message, button);
      }
      break;
    case 'close':
      if (callback.inAppMessageCloseAction) {
        callback.inAppMessageCloseAction(message, button, action.interaction);
      }
      break;
    case 'error':
      if (callback.inAppMessageError) {
        callback.inAppMessageError(message, action.errorMessage);
      }
      break;
  }
}

// Public Interface B methods
export class ExponeaListeners {
  /**
   * Sets a listener to handle push notification opened events.
   * The listener will be called when a user opens a push notification.
   *
   * @param listener - Callback function that receives opened push notification data
   *
   * @example
   * ExponeaListeners.setPushOpenedListener((openedPush) => {
   *   console.log('Push opened:', openedPush.action, openedPush.url);
   * });
   */
  static setPushOpenedListener(
    listener: (openedPush: OpenedPush) => void
  ): void {
    pushOpenedListener = listener;
    // Notify native that listener is set (triggers pending events)
    NativeExponea.onPushOpenedListenerSet();
  }

  /**
   * Removes the push notification opened event listener.
   * After calling this, opened push events will no longer trigger callbacks.
   */
  static removePushOpenedListener(): void {
    pushOpenedListener = null;
    NativeExponea.onPushOpenedListenerRemove();
  }

  /**
   * Sets a listener to handle push notification received events.
   * The listener will be called when a push notification is received while the app is in foreground.
   *
   * @param listener - Callback function that receives push notification data
   *
   * @example
   * ExponeaListeners.setPushReceivedListener((data) => {
   *   console.log('Push received:', data);
   * });
   */
  static setPushReceivedListener(listener: (data: any) => void): void {
    pushReceivedListener = listener;
    NativeExponea.onPushReceivedListenerSet();
  }

  /**
   * Removes the push notification received event listener.
   * After calling this, received push events will no longer trigger callbacks.
   */
  static removePushReceivedListener(): void {
    pushReceivedListener = null;
    NativeExponea.onPushReceivedListenerRemove();
  }

  /**
   * Sets a callback handler for in-app message lifecycle events.
   * Allows custom handling of in-app message display, clicks, and close actions.
   *
   * @param callback - Implementation of InAppMessageCallbackImpl interface
   *
   * @example
   * ExponeaListeners.setInAppMessageCallback({
   *   overrideDefaultBehavior: true,
   *   trackActions: true,
   *   inAppMessageShown: (message) => console.log('Message shown:', message.name)
   * });
   */
  static setInAppMessageCallback(callback: InAppMessageCallbackImpl): void {
    inAppMessageCallback = callback;
    NativeExponea.onInAppMessageCallbackSet(
      callback.overrideDefaultBehavior,
      callback.trackActions
    );
  }

  /**
   * Removes the in-app message callback handler.
   * After calling this, in-app message events will use default behavior.
   */
  static removeInAppMessageCallback(): void {
    inAppMessageCallback = null;
    NativeExponea.onInAppMessageCallbackRemove();
  }

  /**
   * Registers a callback to receive customer segmentation data updates.
   * The callback will be invoked when segments for the specified category change.
   *
   * @param callback - SegmentationDataCallback instance with category and update handler
   *
   * @example
   * const callback = new SegmentationDataCallback(
   *   'discovery',
   *   true,
   *   (segments) => console.log('Segments updated:', segments)
   * );
   * ExponeaListeners.registerSegmentationDataCallback(callback);
   */
  static registerSegmentationDataCallback(
    callback: SegmentationDataCallback
  ): void {
    segmentationCallbacks.set(callback.exposingCategory, callback);
    // Notify native to start observing this category
    NativeExponea.onSegmentationCallbackSet(
      callback.exposingCategory,
      callback.includeFirstLoad
    );
  }

  /**
   * Unregisters a previously registered segmentation data callback.
   *
   * @param callback - The same SegmentationDataCallback instance that was registered
   */
  static unregisterSegmentationDataCallback(
    callback: SegmentationDataCallback
  ): void {
    segmentationCallbacks.delete(callback.exposingCategory);
    NativeExponea.onSegmentationCallbackRemove(callback.exposingCategory);
  }

  /**
   * Internal method for testing: simulates an in-app message action event.
   * This method is used by tests to simulate native events without a real native module.
   *
   * @internal
   * @param eventDataString - JSON string containing the action data
   */
  static handleInAppMessageAction(eventDataString: string): void {
    if (inAppMessageCallback) {
      try {
        const action = JSON.parse(eventDataString);
        handleInAppMessageAction(action, inAppMessageCallback);
      } catch (e) {
        console.error('Failed to parse inAppAction event', e);
      }
    }
  }
}

// Types for Interface B
export interface InAppMessageCallbackImpl {
  overrideDefaultBehavior: boolean;
  trackActions: boolean;
  inAppMessageClickAction: (
    message: InAppMessage,
    button: InAppMessageButton
  ) => void;
  inAppMessageCloseAction: (
    message: InAppMessage,
    button: InAppMessageButton | undefined,
    interaction: boolean
  ) => void;
  inAppMessageError: (
    message: InAppMessage | undefined,
    errorMessage: string
  ) => void;
  inAppMessageShown: (message: InAppMessage) => void;
}

/**
 * Callback handler for customer segmentation data updates.
 * Used to receive notifications when customer segments change for a specific category.
 *
 * @example
 * const callback = new SegmentationDataCallback(
 *   'discovery',           // Category to observe
 *   true,                  // Include first load
 *   (segments) => {        // Callback when segments change
 *     console.log('New segments:', segments);
 *   }
 * );
 */
export class SegmentationDataCallback {
  readonly exposingCategory: string;
  readonly includeFirstLoad: boolean;
  private readonly onNewDataFunc: (data: Array<Segment>) => void;

  constructor(
    exposingCategory: string,
    includeFirstLoad: boolean,
    callback: (data: Array<Segment>) => void
  ) {
    this.exposingCategory = exposingCategory;
    this.includeFirstLoad = includeFirstLoad;
    this.onNewDataFunc = callback;
  }

  onNewData(data: Array<Segment>): void {
    this.onNewDataFunc(data);
  }
}
