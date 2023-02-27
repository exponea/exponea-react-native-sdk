import EventType from './EventType';
import ExponeaProject from './ExponeaProject';
import {JsonObject} from './Json';

interface Configuration {
  /** Default Exponea project token */
  projectToken: string;
  /** Default Exponea project authorization token */
  authorizationToken: string;
  /** Default Exponea project base URL */
  baseUrl?: string;
  /** Map event types to extra projects. Every event is tracked into default project and all projects based on this mapping */
  projectMapping?: {
    [key in EventType]?: Array<ExponeaProject>;
  };
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
  /** Flag to apply `defaultProperties` list to `identifyCustomer` tracking event. */
  allowDefaultCustomerProperties?: boolean;
  /** If true, Customer Token authentication is used */
  advancedAuthEnabled?: boolean;
  /** Platform specific settings for Android */
  android?: AndroidConfiguration;
  /** Platform specific settings for iOS */
  ios?: IOSConfiguration;
}

export interface AndroidConfiguration {
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
}

export interface IOSConfiguration {
  /** If true, push notification registration and push token tracking is only done if the device is authorized to display push notifications */
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

export default Configuration;
