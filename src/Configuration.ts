import EventType from './EventType';
import type ExponeaProject from './ExponeaProject';
import type { JsonObject } from './Json';

export interface ProjectConfig {
  /** Project token of the Exponea project */
  projectToken: string;
  /** Authorization token of the Exponea project */
  authorizationToken: string;
  /** Base URL of the Exponea project */
  baseUrl?: string;
}

export interface StreamConfig {
  /** Stream (Data Hub) ID */
  streamId: string;
  /** Base URL override for the Stream endpoint */
  baseUrl?: string;
}

/** Either a {@link ProjectConfig} or a {@link StreamConfig}. The two modes are mutually exclusive. */
export type IntegrationConfig =
  | (ProjectConfig & { streamId?: never })
  | (StreamConfig & { projectToken?: never; authorizationToken?: never });

type WithIntegrationConfig = {
  integrationConfig: IntegrationConfig;
  projectToken?: never;
  authorizationToken?: never;
  baseUrl?: never;
};

type WithLegacyProject = {
  integrationConfig?: never;
  /** @deprecated Use integrationConfig with ProjectConfig instead. */
  projectToken: string;
  /** @deprecated Use integrationConfig with ProjectConfig instead. */
  authorizationToken: string;
  /** @deprecated Use integrationConfig with ProjectConfig instead. */
  baseUrl?: string;
};

interface BaseConfiguration {
  /** @deprecated Use integrationRouteMap with ProjectConfig instead. */
  projectMapping?: { [key in EventType]?: Array<ExponeaProject> };
  /** Map event types to extra projects. Every event is tracked into default project and all projects based on this mapping */
  integrationRouteMap?: { [key in EventType]?: Array<ProjectConfig> };
  /** Default properties added to every event tracked to Exponea */
  defaultProperties?: JsonObject;
  /** Number of retries for event flushing in case of a failure */
  flushMaxRetries?: number;
  /** Time in seconds that user has to have the app closed for session to be ended */
  sessionTimeout?: number;
  /** Flag controlling automatic session tracking */
  automaticSessionTracking?: boolean;
  /** Defines how often should the SDK track push notification token to Exponea */
  pushTokenTrackingFrequency?: PushTokenTrackingFrequency;
  /**
   * @deprecated Android no longer uses this flag — the push token is always tracked and permission state is reflected via notification_state.valid.
   * Use ios.requirePushAuthorization instead.
   */
  requirePushAuthorization?: boolean;
  /** Flag to apply `defaultProperties` list to `identifyCustomer` tracking event. */
  allowDefaultCustomerProperties?: boolean;
  /** If true, Customer Token authentication is used */
  advancedAuthEnabled?: boolean;
  /** Platform specific settings for Android */
  android?: AndroidConfiguration;
  /** Platform specific settings for iOS */
  ios?: IOSConfiguration;
  /** Automatically load content of In-app content blocks assigned to these Placeholder IDs */
  inAppContentBlockPlaceholdersAutoLoad?: Array<string>;
  /** Determines whether the SDK automatically tracks session_end for sessions that remain open when trackSessionStart() is called multiple times in manual session tracking mode. */
  manualSessionAutoClose?: boolean;
  /** Application identifier for the SDK. Defaults to 'default-application'. Must be lowercase alphanumeric with optional dots/hyphens between segments (max 50 characters, pattern: ^[a-z0-9]+(?:[-.][a-z0-9]+)*$) */
  applicationId?: string;
  /** If true, a new device ID is generated when anonymize() is called. Defaults to false to preserve existing behavior. */
  regenerateDeviceIdOnAnonymize?: boolean;
}

type Configuration = BaseConfiguration &
  (WithIntegrationConfig | WithLegacyProject);

export interface AndroidConfiguration {
  /**
   * @deprecated Android no longer uses this flag — the push token is always tracked and permission state is reflected via notification_state.valid.
   */
  requirePushAuthorization?: boolean;
  /** If true, push notifications are automatically tracked */
  automaticPushNotifications?: boolean;
  /** Android resource id of the icon to be used for push notifications */
  pushIcon?: number;
  /** Android resource name of the icon to be used for push notifications */
  pushIconResourceName?: string;
  /** Accent color of push notification icon and buttons */
  pushAccentColor?: number;
  /** Accent color of push notification icon and buttons, specified by RGBA channels separated by comma */
  pushAccentColorRGBA?: string;
  /** Accent color of push notification icon and buttons, specified by resource name*/
  pushAccentColorName?: string;
  /** Channel name for push notifications. Only for API level 26+ */
  pushChannelName?: string;
  /** Channel description for push notifications. Only for API level 26+ */
  pushChannelDescription?: string;
  /** Channel ID for push notifications. Only for API level 26+ */
  pushChannelId?: string;
  /** Notification importance for the notification channel. Only for API level 26+ */
  pushNotificationImportance?: PushNotificationImportance;
  /** Level of HTTP logging */
  httpLoggingLevel?: HttpLoggingLevel;
  /**
   * Flag that enables or disables cookies in WebViews. Cookies in WebView could be misused by malware so it is
   * recommended to keep them disabled (default value). According to shared CookieManager in android, this flag
   * could affect all WebView instances used by application. If your application is using WebView and page logic
   * depends on cookies, you may allow them with `true` value.
   */
  allowWebViewCookies?: boolean;
}

export interface IOSConfiguration {
  /** Controls whether the SDK calls registerForRemoteNotifications() only after the OS reports authorized/provisional status. When false, the SDK registers unconditionally to support silent pushes without user permission. Default true. */
  requirePushAuthorization?: boolean;
  /** App group used for communication between main app and notification extensions */
  appGroup?: string;
}

export enum PushTokenTrackingFrequency {
  /** Tracked on the first launch or if the token changes */
  ON_TOKEN_CHANGE = 'ON_TOKEN_CHANGE',

  /** Tracked every time the app is launched */
  EVERY_LAUNCH = 'EVERY_LAUNCH',

  /** Tracked once on days when the user opens the app */
  DAILY = 'DAILY',
}

export enum PushNotificationImportance {
  /** Translates to android.app.NotificationManager.IMPORTANCE_MIN */
  MIN = 'MIN',

  /** Translates to android.app.NotificationManager.IMPORTANCE_LOW */
  LOW = 'LOW',

  /** Translates to android.app.NotificationManager.IMPORTANCE_DEFAULT */
  DEFAULT = 'DEFAULT',

  /** Translates to android.app.NotificationManager.IMPORTANCE_HIGH */
  HIGH = 'HIGH',
}

export enum HttpLoggingLevel {
  /** No logs. */
  NONE = 'NONE',
  /** Logs request and response lines. */
  BASIC = 'BASIC',
  /** Logs request and response lines and their respective headers. */
  HEADERS = 'HEADERS',
  /** Logs request and response lines and their respective headers and bodies (if present). */
  BODY = 'BODY',
}

export type { Configuration as default };
