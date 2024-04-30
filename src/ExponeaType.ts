import Configuration from './Configuration';
import EventType from './EventType';
import ExponeaProject from './ExponeaProject';
import {JsonObject} from './Json';
import Consent from './Consent';
import {Recommendation, RecommendationOptions} from './Recommendation';
import AppInboxStyle from './AppInboxStyle';
import {AppInboxMessage} from './AppInboxMessage';
import {AppInboxAction} from './AppInboxAction';

interface ExponeaType {
  /** Configures Exponea SDK. Should only be called once. You need to configure ExponeaSDK before calling most methods */
  configure(configuration: Configuration): Promise<void>;

  isConfigured(): Promise<boolean>;
  /** Resolves to cookie of the current customer */
  getCustomerCookie(): Promise<string>;

  /** Enable automatic push notification diagnostics *before* configuring the SDK to help you with push notification integration */
  checkPushSetup(): Promise<void>;

  /** Resolves to current FlushMode used by the SDK */
  getFlushMode(): Promise<FlushMode>;

  /** Sets the Flush mode of the SDK */
  setFlushMode(flushingMode: FlushMode): Promise<void>;

  /** Gets the period with which events are tracked to Exponea backend. Only valid in PERIOD FlushMode */
  getFlushPeriod(): Promise<number>;

  /** Sets the period with which events are tracked to Exponea backend. Only valid in PERIOD FlushMode */
  setFlushPeriod(period: number): Promise<void>;

  /** Resolves to current LogLevel native SDK uses. */
  getLogLevel(): Promise<LogLevel>;

  /** Sets LogLevel for native SDK. */
  setLogLevel(loggerLevel: LogLevel): Promise<void>;

  /** Get default properties tracked with every event */
  getDefaultProperties(): Promise<JsonObject>;

  /** Set default properties tracked with every event.
   * Only use for reconfiguration, preferred way of setting default properties is configuration object.
   */
  setDefaultProperties(properties: JsonObject): Promise<void>;

  /** Anonymizes current customer and creates a new one. Push token is cleared on Exponea backend.
   * Optionally changes default Exponea project and event-project mapping.
   */
  anonymize(
    exponeaProject?: ExponeaProject,
    projectMapping?: {[key in EventType]?: Array<ExponeaProject>},
  ): Promise<void>;

  /** Identifies current customer with new customer ids and properties */
  identifyCustomer(
    customerIds: Record<string, string>,
    properties: JsonObject,
  ): Promise<void>;

  /** Flushes data to Exponea backend. Only usable in MANUAL FlushMode */
  flushData(): Promise<void>;

  /** Tracks custom event to Exponea backend */
  trackEvent(
    eventName: string,
    properties: JsonObject,
    timestamp?: number,
  ): Promise<void>;

  /** Manually tracks session start. Only usable when automaticSessionTracking is disabled in Configuration */
  trackSessionStart(timestamp?: number): Promise<void>;

  /** Manually tracks session end. Only usable when automaticSessionTracking is disabled in Configuration */
  trackSessionEnd(timestamp?: number): Promise<void>;

  /** Fetches consents for the current customer */
  fetchConsents(): Promise<Array<Consent>>;

  /** Fetches recommendations based on RecommendationOptions */
  fetchRecommendations(
    options: RecommendationOptions,
  ): Promise<Array<Recommendation>>;

  /** Listener to be called when push notification is opened. The SDK will hold last OpenedPush until you set the listener  */
  setPushOpenedListener(listener: (openedPush: OpenedPush) => void): void;

  /** Removes push notification opened listener */
  removePushOpenedListener(): void;

  /**
   * Listener to be called when push notification is received.
   * Called for both regular and silent push notifications on Android, and silent notifications *only* on iOS
   * The SDK will hold last data until you set the listener
   */
  setPushReceivedListener(listener: (data: JsonObject) => void): void;

  /** Removes push notification received listener */
  removePushReceivedListener(): void;

  setInAppMessageCallback(
    overrideDefaultBehavior: boolean,
    trackActions: boolean,
    callback: (action: InAppMessageAction) => void,
  ): void;

  removeInAppMessageCallback(): void;

  /**
   * Requests authorization and subsequently registers for receiving notifications for iOS platform
   * @deprecated use `requestPushAuthorization` instead
   */
  requestIosPushAuthorization(): Promise<boolean>;

  /**
   * Requests authorization and subsequently registers for receiving notifications for both Android and iOS platform
   */
  requestPushAuthorization(): Promise<boolean>;

  setAppInboxProvider(withStyle: AppInboxStyle): Promise<void>;

  /**
   * Track AppInbox message detail opened event
   * Event is tracked if parameter 'message' has TRUE value of 'hasTrackingConsent' property
   */
  trackAppInboxOpened(message: AppInboxMessage): Promise<void>;

  /**
   * Track AppInbox message detail opened event
   */
  trackAppInboxOpenedWithoutTrackingConsent(
    message: AppInboxMessage,
  ): Promise<void>;

  /**
   * Track AppInbox message click event
   * Event is tracked if one or both conditions met:
   *     - parameter 'message' has TRUE value of 'hasTrackingConsent' property
   *     - parameter 'buttonLink' has TRUE value of query parameter 'xnpe_force_track'
   */
  trackAppInboxClick(
    action: AppInboxAction,
    message: AppInboxMessage,
  ): Promise<void>;

  /**
   * Track AppInbox message click event
   */
  trackAppInboxClickWithoutTrackingConsent(
    action: AppInboxAction,
    message: AppInboxMessage,
  ): Promise<void>;

  /**
   * Marks AppInbox message as read
   */
  markAppInboxAsRead(message: AppInboxMessage): Promise<boolean>;

  /**
   * Fetches AppInbox for the current customer
   */
  fetchAppInbox(): Promise<Array<AppInboxMessage>>;

  /**
   * Fetches AppInbox message by ID for the current customer
   */
  fetchAppInboxItem(messageId: string): Promise<AppInboxMessage>;

  setAutomaticSessionTracking(enabled: boolean): Promise<void>;

  setSessionTimeout(timeout: number): Promise<void>;

  setAutoPushNotification(enabled: boolean): Promise<void>;

  setCampaignTTL(seconds: number): Promise<void>;

  trackPushToken(token: string): Promise<void>;

  trackHmsPushToken(token: string): Promise<void>;

  trackDeliveredPush(params: Record<string, string>): Promise<void>;

  trackDeliveredPushWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackClickedPush(params: Record<string, string>): Promise<void>;

  trackClickedPushWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackPaymentEvent(params: Record<string, string>): Promise<void>;

  isExponeaPushNotification(params: Record<string, string>): Promise<boolean>;

  trackInAppMessageClick(params: Record<string, string>): Promise<void>;

  trackInAppMessageClickWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackInAppMessageClose(params: Record<string, string>): Promise<void>;

  trackInAppMessageCloseWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackInAppContentBlockClick(params: Record<string, string>): Promise<void>;

  trackInAppContentBlockClickWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackInAppContentBlockClose(params: Record<string, string>): Promise<void>;

  trackInAppContentBlockCloseWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackInAppContentBlockShown(params: Record<string, string>): Promise<void>;

  trackInAppContentBlockShownWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  trackInAppContentBlockError(params: Record<string, string>): Promise<void>;

  trackInAppContentBlockErrorWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void>;

  registerSegmentationDataCallback(
      callback: SegmentationDataCallback
  ): void;

  unregisterSegmentationDataCallback(
      callback: SegmentationDataCallback
  ): void;

  getSegments(exposingCategory: string): Promise<Array<Segment>>;
}

export enum FlushMode {
  /** Events are flushed to Exponea backend immediately when they are tracked */
  IMMEDIATE = 'IMMEDIATE',
  /** Events are flushed to Exponea backend periodically based on flush period */
  PERIOD = 'PERIOD',
  /** Events are flushed to Exponea backend when application is closed */
  APP_CLOSE = 'APP_CLOSE',
  /** Events are flushed to Exponea when flushData() is manually called by the developer */
  MANUAL = 'MANUAL',
}

export enum LogLevel {
  OFF = 'OFF',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  VERBOSE = 'VERBOSE',
}

export interface OpenedPush {
  action: PushAction;
  url?: string;
  /** Additional data defined on Exponea web app when creating the push */
  additionalData?: JsonObject;
}

export enum PushAction {
  /** "Open App" action */
  APP = 'app',
  /** "Deep link" action. In order to open your application from deeplink, extra setup is required. */
  DEEPLINK = 'deeplink',
  /** "Open web browser" action. Exponea SDK will automatically open the browser in this case. */
  WEB = 'web',
}

export interface InAppMessageAction {
  message: InAppMessage;
  button?: InAppMessageButton;
  interaction: boolean;
}

export interface InAppMessage {
  id: string;
  name: string;
  message_type?: string;
  frequency: string;
  payload?: JsonObject;
  variant_id: number;
  variant_name: string;
  trigger?: JsonObject;
  date_filter?: JsonObject;
  load_priority?: number;
  load_delay?: number;
  close_timeout?: number;
  payload_html?: string;
  is_html?: boolean;
  has_tracking_consent?: boolean;
  consent_category_tracking?: string;
}

export interface InAppMessageButton {
  text?: string;
  url?: string;
}

export interface InAppContentBlock {
  id: string,
  name: string,
  date_filter?: JsonObject,
  frequency?: string,
  load_priority?: number,
  consentCategoryTracking?: string,
  content_type?: string,
  content?: JsonObject,
  placeholders: []
}

export interface InAppContentBlockAction {
  type: string,
  name?: string,
  url?: string,
}

export class SegmentationDataCallback {
  readonly exposingCategory: string;
  readonly includeFirstLoad: boolean;
  private readonly onNewDataFunc: (data: Array<Segment>) => void;
  constructor(
      exposingCategory: string,
      includeFirstLoad: boolean,
      callback: (data: Array<Segment>) => void,
  ) {
    this.exposingCategory = exposingCategory;
    this.includeFirstLoad = includeFirstLoad;
    this.onNewDataFunc = callback;
  }
  onNewData(data: Array<Segment>): void {
    this.onNewDataFunc(data)
  }
}

export type Segment = Record<string, string>

export default ExponeaType;
