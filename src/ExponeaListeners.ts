import { NativeEventEmitter } from 'react-native';
import NativeExponea from './NativeExponea';
import type {
  OpenedPush,
  InAppMessage,
  InAppMessageButton,
  Segment,
} from './NativeExponea';
import type { SdkAuthError } from './SdkAuthError';

// Internal listener storage (JavaScript-side)
let pushOpenedListener: ((openedPush: OpenedPush) => void) | null = null;
let pushReceivedListener: ((data: any) => void) | null = null;
let inAppMessageCallback: InAppMessageCallbackImpl | null = null;
// Segmentation registrations keyed by an internal callback ID. Every registered
// SegmentationDataCallback instance owns exactly one native callback, so several
// instances may observe the same category while native evaluates `includeFirstLoad`
// for each of them independently.
const segmentationCallbacks = new Map<string, SegmentationDataCallback>();
// Prefix shared by IDs issued during this JS runtime, so IDs never repeat across
// stop/re-register cycles and a reload cannot collide with stale native entries.
const segmentationCallbackIdPrefix = `${Date.now().toString(36)}-${Math.random()
  .toString(36)
  .slice(2, 8)}`;
let segmentationCallbackSequence = 0;
// Shared by concurrent stopIntegration() calls until the native stop settles.
let pendingIntegrationStop: Promise<void> | null = null;
let sdkAuthErrorCallback: ((error: SdkAuthError) => void) | null = null;

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
  let payload: any;
  try {
    payload = JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse newSegments event', e);
    return;
  }
  // Events are addressed to the registration that produced them. Events for IDs
  // that were unregistered meanwhile (or released by stopIntegration) are dropped.
  const callback = segmentationCallbacks.get(payload?.callbackId);
  if (!callback || callback.exposingCategory !== payload.category) {
    return;
  }
  try {
    callback.onNewData(payload.segments);
  } catch (e) {
    console.error(
      'Segmentation callback failed to handle newSegments event',
      e
    );
  }
});

function findSegmentationCallbackId(
  callback: SegmentationDataCallback
): string | undefined {
  for (const [callbackId, registered] of segmentationCallbacks) {
    if (registered === callback) {
      return callbackId;
    }
  }
  return undefined;
}

function nextSegmentationCallbackId(): string {
  segmentationCallbackSequence += 1;
  return `${segmentationCallbackIdPrefix}-${segmentationCallbackSequence}`;
}

/**
 * Native SDKs drop all segmentation callbacks when the integration stops, so the
 * JS registrations are released as well. The native removal is repeated here for
 * every known ID to also cover registrations that reached native after it finished
 * its own cleanup but before this promise handler ran; native ignores unknown IDs.
 */
function releaseSegmentationCallbacksAfterStop(): void {
  const callbackIds = Array.from(segmentationCallbacks.keys());
  segmentationCallbacks.clear();
  callbackIds.forEach((callbackId) => {
    try {
      NativeExponea.onSegmentationCallbackRemove(callbackId);
    } catch (e) {
      console.error('Failed to release segmentation callback after stop', e);
    }
  });
}

eventEmitter.addListener('sdkAuthError', (data: any) => {
  if (!sdkAuthErrorCallback) return;
  try {
    sdkAuthErrorCallback(JSON.parse(data));
  } catch (e) {
    console.error('Failed to parse sdkAuthError event', e);
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
   * Multiple callbacks may be registered for the same category; each of them gets
   * its own native registration and `includeFirstLoad` handling. Registering an
   * instance that is already registered has no effect.
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
    if (findSegmentationCallbackId(callback) !== undefined) {
      return;
    }
    const callbackId = nextSegmentationCallbackId();
    // Store before notifying native so an immediate first-load event is delivered.
    segmentationCallbacks.set(callbackId, callback);
    try {
      NativeExponea.onSegmentationCallbackSet(
        callbackId,
        callback.exposingCategory,
        callback.includeFirstLoad
      );
    } catch (e) {
      segmentationCallbacks.delete(callbackId);
      throw e;
    }
  }

  /**
   * Unregisters a previously registered segmentation data callback.
   * Other callbacks registered for the same category stay active.
   * Unregistering an instance that is not registered has no effect.
   *
   * @param callback - The same SegmentationDataCallback instance that was registered
   */
  static unregisterSegmentationDataCallback(
    callback: SegmentationDataCallback
  ): void {
    const callbackId = findSegmentationCallbackId(callback);
    if (callbackId === undefined) {
      return;
    }
    segmentationCallbacks.delete(callbackId);
    NativeExponea.onSegmentationCallbackRemove(callbackId);
  }

  /**
   * Stops the native integration. On success all segmentation callback
   * registrations are released, mirroring the native SDKs which drop their
   * segmentation callbacks when the integration stops. Callbacks registered
   * before the stop settles are released too; register them again afterwards
   * (before or after the next `configure()`) to resume updates. A failed stop
   * keeps all registrations intact. Concurrent calls share one native stop.
   *
   * @internal Called by `Exponea.stopIntegration()`; not part of the public API.
   */
  static stopIntegration(): Promise<void> {
    if (pendingIntegrationStop) {
      return pendingIntegrationStop;
    }
    let nativeStop: Promise<void>;
    try {
      nativeStop = Promise.resolve(NativeExponea.stopIntegration());
    } catch (e) {
      nativeStop = Promise.reject(e);
    }
    const stop: Promise<void> = nativeStop
      .then(() => {
        releaseSegmentationCallbacksAfterStop();
      })
      .finally(() => {
        if (pendingIntegrationStop === stop) {
          pendingIntegrationStop = null;
        }
      });
    pendingIntegrationStop = stop;
    return stop;
  }

  /**
   * Registers a callback for SDK auth-token errors emitted by the native SDK.
   * Replaces any previously registered callback.
   */
  static setSdkAuthErrorCallback(
    callback: (error: SdkAuthError) => void
  ): void {
    sdkAuthErrorCallback = callback;
    NativeExponea.onSdkAuthErrorCallbackSet();
  }

  /** Removes the previously registered SDK auth error callback. */
  static removeSdkAuthErrorCallback(): void {
    sdkAuthErrorCallback = null;
    NativeExponea.onSdkAuthErrorCallbackRemove();
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
