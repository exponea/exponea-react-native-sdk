import NativeExponea from './NativeExponea';
import type { Segment } from './NativeExponea';
import { ExponeaListeners } from './ExponeaListeners';
import type { ExponeaType } from './index';

/**
 * Implementation of the Exponea SDK public API.
 * Combines Interface A (Turbo Module methods) and Interface B (Listener methods).
 *
 * This implementation delegates to:
 * - NativeExponea: For 59 Turbo Module methods
 * - ExponeaListeners: For 8 event listener methods
 */
export const Exponea: ExponeaType = {
  // Interface A implementations (delegate to Turbo Module)
  configure: (configMap) => NativeExponea.configure(configMap),
  isConfigured: () => Promise.resolve(NativeExponea.isConfigured()),
  getCustomerCookie: () => NativeExponea.getCustomerCookie(),
  identifyCustomer: (customerIds, properties) =>
    NativeExponea.identifyCustomer(customerIds, properties),
  anonymize: (exponeaProject, projectMapping) =>
    NativeExponea.anonymize(exponeaProject as any, projectMapping as any),

  getDefaultProperties: async () => {
    const jsonString = await NativeExponea.getDefaultProperties();
    // Native layer returns JSON string, parse it to object
    return JSON.parse(jsonString as string);
  },
  setDefaultProperties: (properties) =>
    NativeExponea.setDefaultProperties(properties),

  trackEvent: (eventName, properties, timestamp) =>
    NativeExponea.trackEvent(eventName, properties, timestamp),
  trackSessionStart: (timestamp) => NativeExponea.trackSessionStart(timestamp),
  trackSessionEnd: (timestamp) => NativeExponea.trackSessionEnd(timestamp),

  fetchConsents: () => NativeExponea.fetchConsents(),
  fetchRecommendations: (options) =>
    NativeExponea.fetchRecommendations(options),

  requestPushAuthorization: () => NativeExponea.requestPushAuthorization(),
  requestIosPushAuthorization: () =>
    NativeExponea.requestIosPushAuthorization(),

  setAutomaticSessionTracking: (enabled) =>
    NativeExponea.setAutomaticSessionTracking(enabled),
  setSessionTimeout: (timeout) => NativeExponea.setSessionTimeout(timeout),
  setAutoPushNotification: (enabled) =>
    NativeExponea.setAutoPushNotification(enabled),
  setCampaignTTL: (seconds) => NativeExponea.setCampaignTTL(seconds),

  trackPushToken: (token) => NativeExponea.trackPushToken(token),
  trackHmsPushToken: (token) => NativeExponea.trackHmsPushToken(token),

  setAppInboxProvider: (withStyle) =>
    NativeExponea.setAppInboxProvider(withStyle),
  trackAppInboxOpened: (message) => NativeExponea.trackAppInboxOpened(message),
  trackAppInboxOpenedWithoutTrackingConsent: (message) =>
    NativeExponea.trackAppInboxOpenedWithoutTrackingConsent(message),
  trackAppInboxClick: (action, message) =>
    NativeExponea.trackAppInboxClick(action, message),
  trackAppInboxClickWithoutTrackingConsent: (action, message) =>
    NativeExponea.trackAppInboxClickWithoutTrackingConsent(action, message),
  markAppInboxAsRead: (message) => NativeExponea.markAppInboxAsRead(message),
  fetchAppInbox: () => NativeExponea.fetchAppInbox(),
  fetchAppInboxItem: (messageId) => NativeExponea.fetchAppInboxItem(messageId),

  trackDeliveredPush: (params) => NativeExponea.trackDeliveredPush(params),
  trackDeliveredPushWithoutTrackingConsent: (params) =>
    NativeExponea.trackDeliveredPushWithoutTrackingConsent(params),
  trackClickedPush: (params) => NativeExponea.trackClickedPush(params),
  trackClickedPushWithoutTrackingConsent: (params) =>
    NativeExponea.trackClickedPushWithoutTrackingConsent(params),
  trackPaymentEvent: (params) => NativeExponea.trackPaymentEvent(params),
  isExponeaPushNotification: (params) =>
    NativeExponea.isExponeaPushNotification(params),

  trackInAppMessageClick: (message, buttonText, buttonUrl) =>
    NativeExponea.trackInAppMessageClick(
      message,
      buttonText == null ? null : buttonText,
      buttonUrl == null ? null : buttonUrl
    ),
  trackInAppMessageClickWithoutTrackingConsent: (
    message,
    buttonText,
    buttonUrl
  ) =>
    NativeExponea.trackInAppMessageClickWithoutTrackingConsent(
      message,
      buttonText == null ? null : buttonText,
      buttonUrl == null ? null : buttonUrl
    ),
  trackInAppMessageClose: (message, buttonText, interaction) =>
    NativeExponea.trackInAppMessageClose(
      message,
      buttonText == null ? null : buttonText,
      interaction
    ),
  trackInAppMessageCloseWithoutTrackingConsent: (
    message,
    buttonText,
    interaction
  ) =>
    NativeExponea.trackInAppMessageCloseWithoutTrackingConsent(
      message,
      buttonText == null ? null : buttonText,
      interaction
    ),

  trackInAppContentBlockClick: (params) =>
    NativeExponea.trackInAppContentBlockClick(params),
  trackInAppContentBlockClickWithoutTrackingConsent: (params) =>
    NativeExponea.trackInAppContentBlockClickWithoutTrackingConsent(params),
  trackInAppContentBlockClose: (params) =>
    NativeExponea.trackInAppContentBlockClose(params),
  trackInAppContentBlockCloseWithoutTrackingConsent: (params) =>
    NativeExponea.trackInAppContentBlockCloseWithoutTrackingConsent(params),
  trackInAppContentBlockShown: (params) =>
    NativeExponea.trackInAppContentBlockShown(params),
  trackInAppContentBlockShownWithoutTrackingConsent: (params) =>
    NativeExponea.trackInAppContentBlockShownWithoutTrackingConsent(params),
  trackInAppContentBlockError: (params) =>
    NativeExponea.trackInAppContentBlockError(params),
  trackInAppContentBlockErrorWithoutTrackingConsent: (params) =>
    NativeExponea.trackInAppContentBlockErrorWithoutTrackingConsent(params),

  getSegments: (exposingCategory, force) =>
    NativeExponea.getSegments(exposingCategory, force) as Promise<
      Array<Segment>
    >,
  stopIntegration: () => NativeExponea.stopIntegration(),
  clearLocalCustomerData: (appGroup) =>
    NativeExponea.clearLocalCustomerData(appGroup),

  checkPushSetup: () => NativeExponea.checkPushSetup(),
  getFlushMode: () => NativeExponea.getFlushMode(),
  setFlushMode: (flushMode) => NativeExponea.setFlushMode(flushMode),
  getFlushPeriod: () => NativeExponea.getFlushPeriod(),
  setFlushPeriod: (period) => NativeExponea.setFlushPeriod(period),
  getLogLevel: () => NativeExponea.getLogLevel(),
  setLogLevel: (level) => NativeExponea.setLogLevel(level),
  flushData: () => NativeExponea.flushData(),

  // Interface B implementations (delegate to ExponeaListeners)
  setPushOpenedListener: (listener) =>
    ExponeaListeners.setPushOpenedListener(listener),
  removePushOpenedListener: () => ExponeaListeners.removePushOpenedListener(),
  setPushReceivedListener: (listener) =>
    ExponeaListeners.setPushReceivedListener(listener),
  removePushReceivedListener: () =>
    ExponeaListeners.removePushReceivedListener(),
  setInAppMessageCallback: (callback) =>
    ExponeaListeners.setInAppMessageCallback(callback),
  removeInAppMessageCallback: () =>
    ExponeaListeners.removeInAppMessageCallback(),
  registerSegmentationDataCallback: (callback) =>
    ExponeaListeners.registerSegmentationDataCallback(callback),
  unregisterSegmentationDataCallback: (callback) =>
    ExponeaListeners.unregisterSegmentationDataCallback(callback),
};

// Add internal testing method (not part of public API)
(Exponea as any).handleInAppMessageAction = (eventDataString: string) =>
  ExponeaListeners.handleInAppMessageAction(eventDataString);
