import { TurboModuleRegistry, type TurboModule } from 'react-native';

// Types defined here for codegen compatibility (codegen can't handle imported types)
export interface ExponeaProject {
  projectToken: string;
  authorizationToken: string;
  baseUrl?: string;
}

export interface Consent {
  id: string;
  legitimateInterest: boolean;
  sources: ConsentSources;
  translations: Object;
}

export interface ConsentSources {
  createdFromCRM: boolean;
  imported: boolean;
  fromConsentPage: boolean;
  privateAPI: boolean;
  publicAPI: boolean;
  trackedFromScenario: boolean;
}

export interface RecommendationOptions {
  id: string;
  fillWithRandom: boolean;
  size?: number;
  items?: Object;
  noTrack?: boolean;
  catalogAttributesWhitelist?: Array<string>;
}

export interface Recommendation {
  engineName: string;
  itemId: string;
  recommendationId: string;
  recommendationVariantId: string;
  data: Object;
}

// Note: JsonObject with index signature causes codegen error: "TSIndexSignature is not a supported object literal type"
// Using Object type instead for codegen compatibility, but export JsonObject type for better DX
export type JsonObject = { [key: string]: any };

export type Segment = Readonly<{ [key: string]: string }>;

export interface AppInboxAction {
  action?: string;
  title?: string;
  url?: string;
}

export interface AppInboxMessage {
  id: string;
  type: string;
  is_read?: boolean;
  create_time?: number;
  content?: Object;
}

export interface ButtonStyle {
  textOverride?: string;
  textColor?: string;
  backgroundColor?: string;
  showIcon?: boolean;
  textSize?: string;
  enabled?: boolean;
  borderRadius?: string;
  textWeight?: string;
}

export interface TextViewStyle {
  visible?: boolean;
  textColor?: string;
  textSize?: string;
  textWeight?: string;
  textOverride?: string;
}

export interface ImageViewStyle {
  visible?: boolean;
  backgroundColor?: string;
}

export interface ProgressBarStyle {
  visible?: boolean;
  progressColor?: string;
  backgroundColor?: string;
}

export interface AppInboxListItemStyle {
  backgroundColor?: string;
  readFlag?: ImageViewStyle;
  receivedTime?: TextViewStyle;
  title?: TextViewStyle;
  content?: TextViewStyle;
  image?: ImageViewStyle;
}

export interface AppInboxListViewStyle {
  backgroundColor?: string;
  item?: AppInboxListItemStyle;
}

export interface DetailViewStyle {
  title?: TextViewStyle;
  content?: TextViewStyle;
  receivedTime?: TextViewStyle;
  image?: ImageViewStyle;
  button?: ButtonStyle;
}

export interface ListViewStyle {
  emptyTitle?: TextViewStyle;
  emptyMessage?: TextViewStyle;
  errorTitle?: TextViewStyle;
  errorMessage?: TextViewStyle;
  progress?: ProgressBarStyle;
  list?: AppInboxListViewStyle;
}

export interface AppInboxStyle {
  appInboxButton?: ButtonStyle;
  detailView?: DetailViewStyle;
  listView?: ListViewStyle;
}

export interface Spec extends TurboModule {
  isConfigured(): boolean;

  /** Configures Exponea SDK. Should only be called once. You need to configure ExponeaSDK before calling most methods */
  configure(configMap: Object): Promise<void>;

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

  /** Get default properties tracked with every event (JSON string) */
  getDefaultProperties(): Promise<string>;

  /** Set default properties tracked with every event.
   * Only use for reconfiguration, preferred way of setting default properties is configuration object.
   */
  setDefaultProperties(properties: Object): Promise<void>;

  /** Anonymizes current customer and creates a new one. Push token is cleared on Exponea backend.
   * Optionally changes default Exponea project and event-project mapping.
   */
  anonymize(
    exponeaProject?: ExponeaProject,
    projectMapping?: Object
  ): Promise<void>;

  /** Identifies current customer with new customer ids and properties */
  identifyCustomer(customerIds: Object, properties: Object): Promise<void>;

  /** Flushes data to Exponea backend. Only usable in MANUAL FlushMode */
  flushData(): Promise<void>;

  /** Tracks custom event to Exponea backend */
  trackEvent(
    eventName: string,
    properties: Object,
    timestamp?: number
  ): Promise<void>;

  /** Manually tracks session start. Only usable when automaticSessionTracking is disabled in Configuration */
  trackSessionStart(timestamp?: number): Promise<void>;

  /** Manually tracks session end. Only usable when automaticSessionTracking is disabled in Configuration */
  trackSessionEnd(timestamp?: number): Promise<void>;

  /** Fetches consents for the current customer */
  fetchConsents(): Promise<Array<Consent>>;

  /** Fetches recommendations based on RecommendationOptions */
  fetchRecommendations(
    options: RecommendationOptions
  ): Promise<Array<Recommendation>>;

  /**
   * Requests authorization and subsequently registers for receiving notifications for iOS platform
   * @deprecated use `requestPushAuthorization` instead
   */
  requestIosPushAuthorization(): Promise<boolean>;

  /**
   * Requests authorization and subsequently registers for receiving notifications for both Android and iOS platform
   */
  requestPushAuthorization(): Promise<boolean>;

  /** Sets whether automatic session tracking is enabled */
  setAutomaticSessionTracking(enabled: boolean): Promise<void>;

  /** Sets session timeout in seconds */
  setSessionTimeout(timeout: number): Promise<void>;

  /** Sets whether automatic push notification tracking is enabled */
  setAutoPushNotification(enabled: boolean): Promise<void>;

  /** Sets campaign TTL in seconds */
  setCampaignTTL(seconds: number): Promise<void>;

  /** Manually tracks push notification token to Exponea */
  trackPushToken(token: string): Promise<void>;

  /** Manually tracks HMS push notification token to Exponea (Huawei Mobile Services) */
  trackHmsPushToken(token: string): Promise<void>;

  /** Sets App Inbox provider with custom styling */
  setAppInboxProvider(withStyle: AppInboxStyle): Promise<void>;

  /** Tracks App Inbox message opened event (respects tracking consent) */
  trackAppInboxOpened(message: AppInboxMessage): Promise<void>;

  /** Tracks App Inbox message opened event (ignores tracking consent) */
  trackAppInboxOpenedWithoutTrackingConsent(
    message: AppInboxMessage
  ): Promise<void>;

  /** Tracks App Inbox message click event (respects tracking consent) */
  trackAppInboxClick(
    action: AppInboxAction,
    message: AppInboxMessage
  ): Promise<void>;

  /** Tracks App Inbox message click event (ignores tracking consent) */
  trackAppInboxClickWithoutTrackingConsent(
    action: AppInboxAction,
    message: AppInboxMessage
  ): Promise<void>;

  /** Marks App Inbox message as read */
  markAppInboxAsRead(message: AppInboxMessage): Promise<boolean>;

  /** Fetches all App Inbox messages for the current customer */
  fetchAppInbox(): Promise<Array<AppInboxMessage>>;

  /** Fetches a specific App Inbox message by ID */
  fetchAppInboxItem(messageId: string): Promise<AppInboxMessage>;

  /** Tracks push notification delivery event (respects tracking consent) */
  trackDeliveredPush(params: Object): Promise<void>;

  /** Tracks push notification delivery event (ignores tracking consent) */
  trackDeliveredPushWithoutTrackingConsent(params: Object): Promise<void>;

  /** Tracks push notification click event (respects tracking consent) */
  trackClickedPush(params: Object): Promise<void>;

  /** Tracks push notification click event (ignores tracking consent) */
  trackClickedPushWithoutTrackingConsent(params: Object): Promise<void>;

  /** Tracks payment event */
  trackPaymentEvent(params: Object): Promise<void>;

  /** Checks if notification payload belongs to Exponea */
  isExponeaPushNotification(params: Object): Promise<boolean>;

  /** Tracks in-app message click event (respects tracking consent) */
  trackInAppMessageClick(
    message: InAppMessage,
    buttonText: string | null,
    buttonUrl: string | null
  ): Promise<void>;

  /** Tracks in-app message click event (ignores tracking consent) */
  trackInAppMessageClickWithoutTrackingConsent(
    message: InAppMessage,
    buttonText: string | null,
    buttonUrl: string | null
  ): Promise<void>;

  /** Tracks in-app message close event (respects tracking consent) */
  trackInAppMessageClose(
    message: InAppMessage,
    buttonText: string | null,
    interaction: boolean
  ): Promise<void>;

  /** Tracks in-app message close event (ignores tracking consent) */
  trackInAppMessageCloseWithoutTrackingConsent(
    message: InAppMessage,
    buttonText: string | null,
    interaction: boolean
  ): Promise<void>;

  /** Tracks in-app content block click event (respects tracking consent) */
  trackInAppContentBlockClick(params: Object): Promise<void>;

  /** Tracks in-app content block click event (ignores tracking consent) */
  trackInAppContentBlockClickWithoutTrackingConsent(
    params: Object
  ): Promise<void>;

  /** Tracks in-app content block close event (respects tracking consent) */
  trackInAppContentBlockClose(params: Object): Promise<void>;

  /** Tracks in-app content block close event (ignores tracking consent) */
  trackInAppContentBlockCloseWithoutTrackingConsent(
    params: Object
  ): Promise<void>;

  /** Tracks in-app content block shown event (respects tracking consent) */
  trackInAppContentBlockShown(params: Object): Promise<void>;

  /** Tracks in-app content block shown event (ignores tracking consent) */
  trackInAppContentBlockShownWithoutTrackingConsent(
    params: Object
  ): Promise<void>;

  /** Tracks in-app content block error event (respects tracking consent) */
  trackInAppContentBlockError(params: Object): Promise<void>;

  /** Tracks in-app content block error event (ignores tracking consent) */
  trackInAppContentBlockErrorWithoutTrackingConsent(
    params: Object
  ): Promise<void>;

  /** Fetches customer segments for the given category */
  getSegments(
    exposingCategory: string,
    force?: boolean
  ): Promise<Array<Object>>;

  /** Stops all SDK tracking and integration */
  stopIntegration(): Promise<void>;

  /** Clears all local customer data from device storage */
  clearLocalCustomerData(appGroup?: string): Promise<void>;

  // ============================================================================
  // Internal Listener Lifecycle (JS -> Native)
  // ============================================================================

  /** Notify native that push opened listener is set */
  onPushOpenedListenerSet(): void;
  /** Notify native that push opened listener is removed */
  onPushOpenedListenerRemove(): void;
  /** Notify native that push received listener is set */
  onPushReceivedListenerSet(): void;
  /** Notify native that push received listener is removed */
  onPushReceivedListenerRemove(): void;

  /** Notify native that in-app message callback is set */
  onInAppMessageCallbackSet(
    overrideDefaultBehavior: boolean,
    trackActions: boolean
  ): void;
  /** Notify native that in-app message callback is removed */
  onInAppMessageCallbackRemove(): void;

  /** Notify native that segmentation callback is set */
  onSegmentationCallbackSet(category: string, includeFirstLoad: boolean): void;
  /** Notify native that segmentation callback is removed */
  onSegmentationCallbackRemove(category: string): void;
}

export enum FlushMode {
  IMMEDIATE = 'IMMEDIATE',
  PERIOD = 'PERIOD',
  APP_CLOSE = 'APP_CLOSE',
  MANUAL = 'MANUAL',
}

export enum LogLevel {
  OFF = 'OFF',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DBG = 'DBG',
  VERBOSE = 'VERBOSE',
}

export interface OpenedPush {
  action: PushAction;
  url?: string;
  /** Additional data defined on Exponea web app when creating the push */
  additionalData?: Object;
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
  message?: InAppMessage;
  button?: InAppMessageButton;
  interaction?: boolean;
  errorMessage?: string;
  type: InAppMessageActionType;
}

export enum InAppMessageActionType {
  SHOW = 'SHOW',
  ACTION = 'ACTION',
  CLOSE = 'CLOSE',
  ERROR = 'ERROR',
}

export interface InAppMessage {
  id: string;
  name: string;
  message_type?: string;
  frequency: string;
  payload?: Object;
  variant_id: number;
  variant_name: string;
  trigger?: Object;
  date_filter?: Object;
  load_priority?: number;
  load_delay?: number;
  close_timeout?: number;
  payload_html?: string;
  is_html?: boolean;
  has_tracking_consent?: boolean;
  consent_category_tracking?: string;
  is_rich_text?: boolean;
}

export interface InAppMessageButton {
  text?: string;
  url?: string;
}

export interface InAppContentBlock {
  id: string;
  name: string;
  date_filter?: Object;
  frequency?: string;
  load_priority?: number;
  consentCategoryTracking?: string;
  content_type?: string;
  content?: Object;
  placeholders: [];
}

export interface InAppContentBlockAction {
  type: string;
  name?: string;
  url?: string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Exponea');
