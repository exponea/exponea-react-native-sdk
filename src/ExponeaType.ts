import Configuration from './Configuration';
import EventType from './EventType';
import ExponeaProject from './ExponeaProject';
import {JsonObject} from './Json';
import Consent from './Consent';
import {RecommendationOptions, Recommendation} from './Recommendation';

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
  fetchRecommendation(
    options: RecommendationOptions,
  ): Promise<Array<Recommendation>>;
}

export enum FlushMode {
  /** Events are flushed to Exponea backend immediately when they are tracked */
  IMMEDIATE = 'IMMEDIATE',
  /** Events are flushed to Exponea backend periodically based on FlushPeriod */
  PERIOD = 'PERIOD',
  /** Events are flushed to Exponea backend when application is closed */
  APP_CLOSE = 'APP_CLOSE',
  /** Events are flushed to Exponea when flushData() is manually called by the develop */
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

export default ExponeaType;
