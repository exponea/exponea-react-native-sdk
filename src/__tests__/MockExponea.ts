import type {
  ExponeaType,
  InAppMessage,
  Segment,
  Consent,
  Recommendation,
  RecommendationOptions,
  AppInboxStyle,
  AppInboxMessage,
  AppInboxAction,
  InAppMessageCallback,
  JsonObject,
  ExponeaProject,
} from '../index';
import {
  FlushMode,
  LogLevel,
  SegmentationDataCallback,
  EventType,
} from '../index';
import { InAppMessageActionDef } from '../InAppMessageActionDef';
import type Configuration from '../Configuration';
import { TestUtils } from './TestUtils';
import Exponea from '../index';

TestUtils.mockExponeaNative();

export class MockExponea implements ExponeaType {
  lastArgumentsJson = '';
  configure(configuration: Configuration): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([configuration], withoutNulls);
    return Promise.resolve();
  }

  isConfigured(): Promise<boolean> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve(true);
  }

  getCustomerCookie(): Promise<string> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve('mock-customer-cookie');
  }

  checkPushSetup(): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve();
  }

  getFlushMode(): Promise<FlushMode> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve(FlushMode.PERIOD);
  }

  setFlushMode(flushingMode: FlushMode): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([flushingMode], withoutNulls);
    return Promise.resolve();
  }

  getFlushPeriod(): Promise<number> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve(123);
  }

  setFlushPeriod(period: number): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([period], withoutNulls);
    return Promise.resolve();
  }

  getLogLevel(): Promise<LogLevel> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve(LogLevel.INFO);
  }

  setLogLevel(loggerLevel: LogLevel): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([loggerLevel], withoutNulls);
    return Promise.resolve();
  }

  getDefaultProperties(): Promise<JsonObject> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve({});
  }

  setDefaultProperties(properties: JsonObject): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([properties], withoutNulls);
    return Promise.resolve();
  }

  anonymize(
    exponeaProject?: ExponeaProject,
    projectMapping?: { [key in EventType]?: Array<ExponeaProject> }
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      [exponeaProject, projectMapping],
      withoutNulls
    );
    return Promise.resolve();
  }

  identifyCustomer(
    customerIds: Record<string, string>,
    properties: JsonObject
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      [customerIds, properties],
      withoutNulls
    );
    return Promise.resolve();
  }

  flushData(): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve();
  }

  trackEvent(
    eventName: string,
    properties: JsonObject,
    timestamp?: number
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      [eventName, properties, timestamp],
      withoutNulls
    );
    return Promise.resolve();
  }

  trackSessionStart(timestamp?: number): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([timestamp], withoutNulls);
    return Promise.resolve();
  }

  trackSessionEnd(timestamp?: number): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([timestamp], withoutNulls);
    return Promise.resolve();
  }

  fetchConsents(): Promise<Array<Consent>> {
    this.lastArgumentsJson = JSON.stringify([], withoutNulls);
    return Promise.resolve([
      {
        id: 'mock-consent-id',
        legitimateInterest: true,
        sources: {
          createdFromCRM: false,
          imported: true,
          fromConsentPage: false,
          privateAPI: true,
          publicAPI: false,
          trackedFromScenario: false,
        },
        translations: {
          en: { key: 'en-value' },
          cz: { key: 'cz-value' },
        },
      },
    ]);
  }

  fetchRecommendations(
    options: RecommendationOptions
  ): Promise<Array<Recommendation>> {
    this.lastArgumentsJson = JSON.stringify([options], withoutNulls);
    return Promise.resolve([
      {
        engineName: 'mock-engine-name',
        itemId: 'mock-item-id',
        recommendationId: 'mock-recommendation-id',
        recommendationVariantId: 'mock-recommendation-variant-id',
        data: {
          key: 'value',
        },
      },
    ]);
  }

  setPushOpenedListener() {}

  removePushOpenedListener() {}

  setPushReceivedListener() {}

  removePushReceivedListener() {}

  requestIosPushAuthorization(): Promise<boolean> {
    return Promise.resolve(true);
  }

  requestPushAuthorization(): Promise<boolean> {
    return Promise.resolve(true);
  }

  setAppInboxProvider(withStyle: AppInboxStyle): Promise<void> {
    this.lastArgumentsJson = JSON.stringify([withStyle], withoutNulls);
    return Promise.resolve();
  }

  trackAppInboxOpened(_message: AppInboxMessage): Promise<void> {
    return Promise.resolve();
  }

  trackAppInboxOpenedWithoutTrackingConsent(
    _message: AppInboxMessage
  ): Promise<void> {
    return Promise.resolve();
  }

  trackAppInboxClick(
    _action: AppInboxAction,
    _message: AppInboxMessage
  ): Promise<void> {
    return Promise.resolve();
  }

  trackAppInboxClickWithoutTrackingConsent(
    _action: AppInboxAction,
    _message: AppInboxMessage
  ): Promise<void> {
    return Promise.resolve();
  }

  markAppInboxAsRead(_message: AppInboxMessage): Promise<boolean> {
    return Promise.resolve(true);
  }

  fetchAppInbox(): Promise<Array<AppInboxMessage>> {
    return Promise.resolve([]);
  }

  fetchAppInboxItem(_messageId: string): Promise<AppInboxMessage> {
    return Promise.resolve({ id: '1', type: 'push' });
  }

  setInAppMessageCallback(callback: InAppMessageCallback) {
    Exponea.setInAppMessageCallback(callback);
  }

  removeInAppMessageCallback() {
    Exponea.removeInAppMessageCallback();
  }

  setAutomaticSessionTracking(_enabled: boolean): Promise<void> {
    return Promise.resolve();
  }

  setSessionTimeout(_timeout: number): Promise<void> {
    return Promise.resolve();
  }

  setAutoPushNotification(_enabled: boolean): Promise<void> {
    return Promise.resolve();
  }

  setCampaignTTL(_seconds: number): Promise<void> {
    return Promise.resolve();
  }

  trackPushToken(_token: string): Promise<void> {
    return Promise.resolve();
  }

  trackHmsPushToken(_token: string): Promise<void> {
    return Promise.resolve();
  }

  trackDeliveredPush(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  trackDeliveredPushWithoutTrackingConsent(
    _params: Record<string, string>
  ): Promise<void> {
    return Promise.resolve();
  }

  trackClickedPush(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  trackClickedPushWithoutTrackingConsent(
    _params: Record<string, string>
  ): Promise<void> {
    return Promise.resolve();
  }

  trackPaymentEvent(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  isExponeaPushNotification(_params: Record<string, string>): Promise<boolean> {
    return Promise.resolve(true);
  }

  trackInAppMessageClick(
    message: InAppMessage,
    buttonText: string | null,
    buttonUrl: string | null
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      InAppMessageActionDef.buildForClick(message, buttonText, buttonUrl),
      withoutNulls
    );
    return Promise.resolve();
  }

  trackInAppMessageClickWithoutTrackingConsent(
    message: InAppMessage,
    buttonText: string | null | undefined,
    buttonUrl: string | null | undefined
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      InAppMessageActionDef.buildForClick(message, buttonText, buttonUrl),
      withoutNulls
    );
    return Promise.resolve();
  }

  trackInAppMessageClose(
    message: InAppMessage,
    buttonText: string | null | undefined,
    interaction: boolean
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      InAppMessageActionDef.buildForClose(message, buttonText, interaction),
      withoutNulls
    );
    return Promise.resolve();
  }

  trackInAppMessageCloseWithoutTrackingConsent(
    message: InAppMessage,
    buttonText: string | null | undefined,
    interaction: boolean
  ): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      InAppMessageActionDef.buildForClose(message, buttonText, interaction),
      withoutNulls
    );
    return Promise.resolve();
  }

  trackInAppContentBlockClick(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockClickWithoutTrackingConsent(
    _params: Record<string, string>
  ): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockClose(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockCloseWithoutTrackingConsent(
    _params: Record<string, string>
  ): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockShown(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockShownWithoutTrackingConsent(
    _params: Record<string, string>
  ): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockError(_params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  }

  trackInAppContentBlockErrorWithoutTrackingConsent(
    _params: Record<string, string>
  ): Promise<void> {
    return Promise.resolve();
  }

  getSegments(
    exposingCategory: string,
    force?: boolean
  ): Promise<Array<Segment>> {
    this.lastArgumentsJson = JSON.stringify(
      { exposingCategory, force },
      withoutNulls
    );
    return Promise.resolve([]);
  }

  registerSegmentationDataCallback(callback: SegmentationDataCallback): void {
    this.lastArgumentsJson = JSON.stringify(
      {
        exposingCategory: callback.exposingCategory,
        includeFirstLoad: callback.includeFirstLoad,
      },
      withoutNulls
    );
  }

  unregisterSegmentationDataCallback(callback: SegmentationDataCallback): void {
    this.lastArgumentsJson = JSON.stringify(
      {
        exposingCategory: callback.exposingCategory,
        includeFirstLoad: callback.includeFirstLoad,
      },
      withoutNulls
    );
  }

  simulateEmit(eventName: string, eventData: string) {
    switch (eventName) {
      case 'inAppAction':
        (Exponea as any).handleInAppMessageAction(eventData);
        break;
      default:
        fail('Unsupported emit event: ' + eventName);
    }
  }

  stopIntegration(): Promise<void> {
    return Promise.resolve();
  }

  clearLocalCustomerData(appGroup?: string): Promise<void> {
    this.lastArgumentsJson = JSON.stringify(
      { appGroup: appGroup },
      withoutNulls
    );
    return Promise.resolve();
  }
}
function withoutNulls(this: any, key: string, value: any) {
  if (value !== null) return value;
}
