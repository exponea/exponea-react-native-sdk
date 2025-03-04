import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { AppInboxAction } from './AppInboxAction';
import { AppInboxMessage } from './AppInboxMessage';
import Consent from './Consent';
import EventType from './EventType';
import ExponeaProject from './ExponeaProject';
import ExponeaType, {
  InAppMessage,
  InAppMessageAction,
  InAppMessageActionType,
  OpenedPush,
  Segment,
  SegmentationDataCallback
} from './ExponeaType';
import { InAppMessageActionDef } from "./InAppMessageActionDef";
import { InAppMessageCallback } from "./InAppMessageCallback";
import { JsonObject } from './Json';
import { Recommendation, RecommendationOptions } from './Recommendation';
import { SegmentationCallbackBridge, SegmentationDataWrapper } from "./SegmentationCallbackBridge";

/*
React native bridge doesn't like optional parameters, we have to implement it ourselves.
Parameters that are null/undefined are ignored and the bridge looks for a method with one less parameter(and fails).
When calling native methods we pass each optional parameter as an object with key equal to parameter name
*/

const Exponea: ExponeaType = {
  configure: NativeModules.Exponea.configure,

  isConfigured: NativeModules.Exponea.isConfigured,

  getCustomerCookie: NativeModules.Exponea.getCustomerCookie,

  checkPushSetup: NativeModules.Exponea.checkPushSetup,

  getFlushMode: NativeModules.Exponea.getFlushMode,

  setFlushMode: NativeModules.Exponea.setFlushMode,

  getFlushPeriod: NativeModules.Exponea.getFlushPeriod,

  setFlushPeriod: NativeModules.Exponea.setFlushPeriod,

  getLogLevel: NativeModules.Exponea.getLogLevel,

  setLogLevel: NativeModules.Exponea.setLogLevel,

  async getDefaultProperties(): Promise<JsonObject> {
    return JSON.parse(await NativeModules.Exponea.getDefaultProperties());
  },

  setDefaultProperties: NativeModules.Exponea.setDefaultProperties,

  anonymize(
    exponeaProject?: ExponeaProject,
    projectMapping?: {[key in EventType]?: Array<ExponeaProject>},
  ): Promise<void> {
    return NativeModules.Exponea.anonymize({exponeaProject}, {projectMapping});
  },

  identifyCustomer: NativeModules.Exponea.identifyCustomer,

  flushData: NativeModules.Exponea.flushData,

  trackEvent(
    eventName: string,
    properties: JsonObject,
    timestamp?: number,
  ): Promise<void> {
    return NativeModules.Exponea.trackEvent(eventName, properties, {timestamp});
  },

  trackSessionStart(timestamp?: number): Promise<void> {
    return NativeModules.Exponea.trackSessionStart({timestamp});
  },

  trackSessionEnd(timestamp?: number): Promise<void> {
    return NativeModules.Exponea.trackSessionEnd({timestamp});
  },

  async fetchConsents(): Promise<Array<Consent>> {
    return JSON.parse(await NativeModules.Exponea.fetchConsents());
  },

  async fetchRecommendations(
    options: RecommendationOptions,
  ): Promise<Array<Recommendation>> {
    return JSON.parse(
      await NativeModules.Exponea.fetchRecommendations(options),
    );
  },

  setPushOpenedListener(listener: (openedPush: OpenedPush) => void): void {
    pushOpenedUserListener = listener;
    NativeModules.Exponea.onPushOpenedListenerSet();
  },

  removePushOpenedListener(): void {
    pushOpenedUserListener = null;
    NativeModules.Exponea.onPushOpenedListenerRemove();
  },

  setPushReceivedListener(listener: (data: JsonObject) => void): void {
    pushReceivedUserListener = listener;
    NativeModules.Exponea.onPushReceivedListenerSet();
  },

  removePushReceivedListener(): void {
    pushReceivedUserListener = null;
    NativeModules.Exponea.onPushReceivedListenerRemove();
  },

  setInAppMessageCallback(
    callback: InAppMessageCallback
  ): void {
    inAppMessageCallback = callback;
    NativeModules.Exponea.onInAppMessageCallbackSet(
        inAppMessageCallback.overrideDefaultBehavior,
        inAppMessageCallback.trackActions,
    );
  },

  removeInAppMessageCallback(): void {
    inAppMessageCallback = null;
    NativeModules.Exponea.onInAppMessageCallbackRemove();
  },

  async requestIosPushAuthorization(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      throw new Error('requestIosPushAuthorization is only available on iOS!');
    }
    return NativeModules.Exponea.requestPushAuthorization();
  },

  async requestPushAuthorization(): Promise<boolean> {
    return NativeModules.Exponea.requestPushAuthorization();
  },

  setAppInboxProvider: NativeModules.Exponea.setAppInboxProvider,

  async trackAppInboxOpened(message: AppInboxMessage): Promise<void> {
    return NativeModules.Exponea.trackAppInboxOpened(message);
  },

  async trackAppInboxOpenedWithoutTrackingConsent(
    message: AppInboxMessage,
  ): Promise<void> {
    return NativeModules.Exponea.trackAppInboxOpened(message);
  },

  async trackAppInboxClick(
    action: AppInboxAction,
    message: AppInboxMessage,
  ): Promise<void> {
    return NativeModules.Exponea.trackAppInboxClick(action, message);
  },

  async trackAppInboxClickWithoutTrackingConsent(
    action: AppInboxAction,
    message: AppInboxMessage,
  ): Promise<void> {
    return NativeModules.Exponea.trackAppInboxClick(action, message);
  },

  async markAppInboxAsRead(message: AppInboxMessage): Promise<boolean> {
    return NativeModules.Exponea.markAppInboxAsRead(message);
  },

  async fetchAppInbox(): Promise<Array<AppInboxMessage>> {
    return JSON.parse(await NativeModules.Exponea.fetchAppInbox());
  },

  async fetchAppInboxItem(messageId: string): Promise<AppInboxMessage> {
    return JSON.parse(await NativeModules.Exponea.fetchAppInboxItem(messageId));
  },

  setAutomaticSessionTracking(enabled: boolean): Promise<void> {
    return NativeModules.Exponea.setAutomaticSessionTracking(enabled);
  },

  setSessionTimeout(timeout: number): Promise<void> {
    return NativeModules.Exponea.setSessionTimeout(timeout);
  },

  setAutoPushNotification(enabled: boolean): Promise<void> {
    return NativeModules.Exponea.setAutoPushNotification(enabled);
  },

  setCampaignTTL(seconds: number): Promise<void> {
    return NativeModules.Exponea.setCampaignTTL(seconds);
  },

  trackPushToken(token: string): Promise<void> {
    return NativeModules.Exponea.trackPushToken(token);
  },

  trackHmsPushToken(token: string): Promise<void> {
    return NativeModules.Exponea.trackHmsPushToken(token);
  },

  trackDeliveredPush(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackDeliveredPush(params);
  },

  trackDeliveredPushWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackDeliveredPushWithoutTrackingConsent(
      params,
    );
  },

  trackClickedPush(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackClickedPush(params);
  },

  trackClickedPushWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackClickedPushWithoutTrackingConsent(params);
  },

  trackPaymentEvent(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackPaymentEvent(params);
  },

  isExponeaPushNotification(params: Record<string, string>): Promise<boolean> {
    return NativeModules.Exponea.isExponeaPushNotification(params);
  },

  trackInAppMessageClick(
      message: InAppMessage,
      buttonText: string|null|undefined,
      buttonUrl: string|null|undefined
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageClick(
        InAppMessageActionDef.buildForClick(message, buttonText, buttonUrl)
    )
  },

  trackInAppMessageClickWithoutTrackingConsent(
      message: InAppMessage,
      buttonText: string|null|undefined,
      buttonUrl: string|null|undefined
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageClickWithoutTrackingConsent(
        InAppMessageActionDef.buildForClick(message, buttonText, buttonUrl)
    );
  },

  trackInAppMessageClose(
      message: InAppMessage,
      buttonText: string|null|undefined,
      interaction: boolean
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageClose(
        InAppMessageActionDef.buildForClose(message, buttonText, interaction)
    );
  },

  trackInAppMessageCloseWithoutTrackingConsent(
      message: InAppMessage,
      buttonText: string|null|undefined,
      interaction: boolean
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageCloseWithoutTrackingConsent(
        InAppMessageActionDef.buildForClose(message, buttonText, interaction)
    );
  },

  trackInAppContentBlockClick(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockClick(params);
  },

  trackInAppContentBlockClickWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockClickWithoutTrackingConsent(
      params,
    );
  },

  trackInAppContentBlockClose(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockClose(params);
  },

  trackInAppContentBlockCloseWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockCloseWithoutTrackingConsent(
      params,
    );
  },

  trackInAppContentBlockShown(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockShown(params);
  },

  trackInAppContentBlockShownWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockShownWithoutTrackingConsent(
      params,
    );
  },

  trackInAppContentBlockError(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockError(params);
  },

  trackInAppContentBlockErrorWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppContentBlockErrorWithoutTrackingConsent(
      params,
    );
  },

  registerSegmentationDataCallback(
      callback: SegmentationDataCallback
  ): void {
    const bridgeToRegister = new SegmentationCallbackBridge(callback)
    const promise: Promise<string> = NativeModules.Exponea.registerSegmentationDataCallback(
        callback.exposingCategory,
        callback.includeFirstLoad
    );
    promise.then(callbackId => {
      bridgeToRegister.assignNativeCallbackId(callbackId);
      segmentationCallbackBridges.push(bridgeToRegister);
    })
  },

  unregisterSegmentationDataCallback(
      callback: SegmentationDataCallback
  ): void {
    const assignedBridgeIndex = segmentationCallbackBridges.findIndex(item => item.callback === callback);
    if (assignedBridgeIndex < 0) {
      return;
    }
    const assignedBridge = segmentationCallbackBridges[assignedBridgeIndex];
    const promise: Promise<void> = NativeModules.Exponea.unregisterSegmentationDataCallback(
        assignedBridge.nativeCallbackId
    );
    promise.then(value => {
      segmentationCallbackBridges.splice(assignedBridgeIndex, 1);
    });
  },

  async getSegments(exposingCategory: string, force?: boolean): Promise<Array<Segment>> {
    return JSON.parse(await NativeModules.Exponea.getSegments({
      exposingCategory: exposingCategory,
      force: force
    }))
  },
};

let pushOpenedUserListener: ((openedPush: OpenedPush) => void) | null = null;
let pushReceivedUserListener: ((data: JsonObject) => void) | null = null;
let inAppMessageCallback: InAppMessageCallback | null = null;

const eventEmitter = new NativeEventEmitter(NativeModules.Exponea);

const segmentationCallbackBridges: SegmentationCallbackBridge[] = []

eventEmitter.addListener('pushOpened', (pushOpened: string) => {
  pushOpenedUserListener && pushOpenedUserListener(JSON.parse(pushOpened));
});

eventEmitter.addListener('pushReceived', (data: string) => {
  pushReceivedUserListener && pushReceivedUserListener(JSON.parse(data));
});

const handleSegmentationsUpdate = (data: string) => {
  const receivedData: SegmentationDataWrapper = JSON.parse(data)
  segmentationCallbackBridges.forEach(bridge => {
    if (bridge.nativeCallbackId == receivedData.callbackId) {
      bridge.callback.onNewData(receivedData.data);
    }
  });
}

eventEmitter.addListener('newSegments', handleSegmentationsUpdate)

const handleInAppMessageAction = (data: string) => {
  if (!inAppMessageCallback) {
    return
  }
  const receivedAction = JSON.parse(data) as InAppMessageAction
  switch (receivedAction.type) {
    case InAppMessageActionType.SHOW:
      if (!receivedAction.message) {
        console.error("In-app callback invoked for shown message without data")
        return;
      }
      inAppMessageCallback.inAppMessageShown(receivedAction.message)
      break;
    case InAppMessageActionType.CLOSE:
      if (!receivedAction.message || receivedAction.interaction === undefined) {
        console.error("In-app callback invoked for closed message without data")
        return;
      }
      inAppMessageCallback.inAppMessageCloseAction(
          receivedAction.message,
          receivedAction.button,
          receivedAction.interaction
      )
      break;
    case InAppMessageActionType.ERROR:
      if (!receivedAction.errorMessage) {
        console.error("In-app callback invoked for error report without data")
        return;
      }
      inAppMessageCallback.inAppMessageError(receivedAction.message, receivedAction.errorMessage)
      break;
    case InAppMessageActionType.ACTION:
      if (!receivedAction.message || !receivedAction.button) {
        console.error("In-app callback invoked for clicked action without data")
        return;
      }
      inAppMessageCallback.inAppMessageClickAction(receivedAction.message, receivedAction.button)
      break;
    default:
      console.error(`In-app callback invoked for unknown action ${receivedAction.type}`);
  }
}

eventEmitter.addListener('inAppAction', handleInAppMessageAction);

export default Exponea;

// Internal functions, tests purpose
(Exponea as any)["handleInAppMessageAction"] = handleInAppMessageAction
