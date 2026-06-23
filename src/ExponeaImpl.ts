import NativeExponea from './NativeExponea';
import type { Segment, JsonObject, ExponeaProject } from './NativeExponea';
import { ExponeaListeners } from './ExponeaListeners';
import type { ExponeaType } from './index';
import type Configuration from './Configuration';
import type { IntegrationConfig, ProjectConfig } from './Configuration';
import type EventType from './EventType';
import type { CustomerIdentity } from './CustomerIdentity';

function migrateLegacyConfig(config: Configuration, isStreamConfig: boolean) {
  const {
    integrationConfig,
    integrationRouteMap,
    projectMapping,
    projectToken,
    authorizationToken,
    baseUrl,
    advancedAuthEnabled,
    ...rest
  } = config as any;

  const resolvedIntegrationConfig =
    integrationConfig ??
    (baseUrl
      ? { projectToken, authorizationToken, baseUrl }
      : { projectToken, authorizationToken });

  const routeMap = integrationRouteMap ?? projectMapping;

  return {
    ...rest,
    integrationConfig: resolvedIntegrationConfig,
    // StreamConfig doesn't support integrationRouteMap or advancedAuthEnabled — strip them
    // so the bridge payload matches what was warned about in configure().
    ...(!isStreamConfig && routeMap ? { integrationRouteMap: routeMap } : {}),
    ...(!isStreamConfig && advancedAuthEnabled !== undefined
      ? { advancedAuthEnabled }
      : {}),
  };
}

function isCustomerIdentity(
  value: Record<string, string> | CustomerIdentity
): value is CustomerIdentity {
  const ids = (value as CustomerIdentity).customerIds;
  return typeof ids === 'object' && ids !== null;
}

const identifyCustomer: ExponeaType['identifyCustomer'] = (
  customerIdsOrIdentity: Record<string, string> | CustomerIdentity,
  properties?: JsonObject
): Promise<void> => {
  const identity: CustomerIdentity = isCustomerIdentity(customerIdsOrIdentity)
    ? customerIdsOrIdentity
    : { customerIds: customerIdsOrIdentity };
  return NativeExponea.identifyCustomer(identity, properties ?? {});
};

const anonymize: ExponeaType['anonymize'] = (
  integrationConfig?: IntegrationConfig | ExponeaProject,
  integrationRouteMap?: {
    [key in EventType]?: Array<ProjectConfig | ExponeaProject>;
  }
): Promise<void> => {
  if ((integrationConfig as any)?.streamId && integrationRouteMap) {
    console.warn(
      "'integrationRouteMap' is not supported with 'StreamConfig' and will be ignored."
    );
  }
  return NativeExponea.anonymize(
    integrationConfig as any,
    integrationRouteMap as any
  );
};

/**
 * Implementation of the Exponea SDK public API.
 * Combines Interface A (Turbo Module methods) and Interface B (Listener methods).
 */
export const Exponea: ExponeaType = {
  // Interface A implementations (delegate to Turbo Module)
  configure: (config, customerIdentity?: CustomerIdentity) => {
    const hasLegacy = config.projectToken !== undefined;
    const hasNew = config.integrationConfig !== undefined;
    if (!hasLegacy && !hasNew) {
      return Promise.reject(
        new Error(
          'Configuration requires either integrationConfig (ProjectConfig or StreamConfig) or the deprecated projectToken + authorizationToken.'
        )
      );
    }
    if (hasLegacy && hasNew) {
      return Promise.reject(
        new Error(
          'Provide either integrationConfig or the deprecated projectToken + authorizationToken, not both.'
        )
      );
    }
    if (hasLegacy) {
      console.warn(
        "'projectToken' and 'authorizationToken' at the root level are deprecated. Use 'integrationConfig' with 'ProjectConfig' instead."
      );
    }
    const isStreamConfig =
      hasNew && !!(config.integrationConfig as any)?.streamId;
    const hasRouteMap = !!(
      config.integrationRouteMap || (config as any).projectMapping
    );
    if (!isStreamConfig) {
      if (
        (config as any).projectMapping &&
        !(config as any).integrationRouteMap
      ) {
        console.warn(
          "'projectMapping' is deprecated. Use 'integrationRouteMap' with 'ProjectConfig' instead."
        );
      }
      if (
        (config as any).projectMapping &&
        (config as any).integrationRouteMap
      ) {
        console.warn(
          "Both 'projectMapping' and 'integrationRouteMap' are set. 'integrationRouteMap' takes precedence; 'projectMapping' will be ignored."
        );
      }
    }
    if (isStreamConfig && config.advancedAuthEnabled) {
      console.warn(
        "'advancedAuthEnabled' is not supported with 'StreamConfig' and will be ignored."
      );
    }
    if (isStreamConfig && hasRouteMap) {
      console.warn(
        "'integrationRouteMap'/'projectMapping' is not supported with 'StreamConfig' and will be ignored."
      );
    }
    const bridgePayload = migrateLegacyConfig(config, isStreamConfig);
    return NativeExponea.configure(bridgePayload, customerIdentity ?? null);
  },
  isConfigured: () => Promise.resolve(NativeExponea.isConfigured()),
  getCustomerCookie: () => NativeExponea.getCustomerCookie(),
  identifyCustomer,
  anonymize,
  setSdkAuthToken: (token) => NativeExponea.setSdkAuthToken(token),

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
  setSdkAuthErrorCallback: (callback) =>
    ExponeaListeners.setSdkAuthErrorCallback(callback),
  removeSdkAuthErrorCallback: () =>
    ExponeaListeners.removeSdkAuthErrorCallback(),
};

// Add internal testing method (not part of public API)
(Exponea as any).handleInAppMessageAction = (eventDataString: string) =>
  ExponeaListeners.handleInAppMessageAction(eventDataString);
