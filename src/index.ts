import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import ExponeaType, {InAppMessageAction, OpenedPush, Segment, SegmentationDataCallback} from './ExponeaType';
import ExponeaProject from './ExponeaProject';
import EventType from './EventType';
import {JsonObject} from './Json';
import Consent from './Consent';
import {Recommendation, RecommendationOptions} from './Recommendation';
import {AppInboxMessage} from './AppInboxMessage';
import {AppInboxAction} from './AppInboxAction';
import {SegmentationCallbackBridge} from "./SegmentationCallbackBridge";

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
    overrideDefaultBehavior: boolean,
    trackActions: boolean,
    callback: (action: InAppMessageAction) => void,
  ): void {
    inAppMessageCallback = callback;
    NativeModules.Exponea.onInAppMessageCallbackSet(
      overrideDefaultBehavior,
      trackActions,
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

  trackInAppMessageClick(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageClick(params);
  },

  trackInAppMessageClickWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageClickWithoutTrackingConsent(
      params,
    );
  },

  trackInAppMessageClose(params: Record<string, string>): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageClose(params);
  },

  trackInAppMessageCloseWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return NativeModules.Exponea.trackInAppMessageCloseWithoutTrackingConsent(
      params,
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
    const bridge = new SegmentationCallbackBridge(callback)
    const promise: Promise<string> = NativeModules.Exponea.registerSegmentationDataCallback(
        callback.exposingCategory,
        callback.includeFirstLoad
    );
    promise.then(callbackId => {
      bridge.assignNativeCallbackId(callbackId);
      segmentationCallbackBridges.push(bridge);
      eventEmitter.addListener(bridge.getEventEmitterKey(), (data: string) => {
        callback.onNewData(JSON.parse(data));
      })
    })
  },

  unregisterSegmentationDataCallback(
      callback: SegmentationDataCallback
  ): void {
    const assignedBridgeIndex = segmentationCallbackBridges
        .findIndex(item => item.callback === callback);
    if (assignedBridgeIndex < 0) {
      return;
    }
    const assignedBridge = segmentationCallbackBridges[assignedBridgeIndex];
    const promise: Promise<void> = NativeModules.Exponea.unregisterSegmentationDataCallback(
        assignedBridge.nativeCallbackId
    );
    promise.then(value => {
      segmentationCallbackBridges.splice(assignedBridgeIndex, 1);
      eventEmitter.removeAllListeners(assignedBridge.getEventEmitterKey());
    });
  },

  async getSegments(exposingCategory: string): Promise<Array<Segment>> {
    return JSON.parse(await NativeModules.Exponea.getSegments(exposingCategory))
  },
};

let pushOpenedUserListener: ((openedPush: OpenedPush) => void) | null = null;
let pushReceivedUserListener: ((data: JsonObject) => void) | null = null;
let inAppMessageCallback: ((action: InAppMessageAction) => void) | null = null;

const eventEmitter = new NativeEventEmitter(NativeModules.Exponea);

const segmentationCallbackBridges: SegmentationCallbackBridge[] = []

eventEmitter.addListener('pushOpened', (pushOpened: string) => {
  pushOpenedUserListener && pushOpenedUserListener(JSON.parse(pushOpened));
});

eventEmitter.addListener('pushReceived', (data: string) => {
  pushReceivedUserListener && pushReceivedUserListener(JSON.parse(data));
});

eventEmitter.addListener('inAppAction', (data: string) => {
  inAppMessageCallback && inAppMessageCallback(JSON.parse(data));
});

export default Exponea;
