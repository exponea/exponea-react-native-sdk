/* eslint-disable @typescript-eslint/no-unused-vars */
import ExponeaType, {
  FlushMode,
  InAppMessageAction,
  LogLevel, Segment,
  SegmentationDataCallback,
} from './ExponeaType';
import Configuration from './Configuration';
import {RecommendationOptions, Recommendation} from './Recommendation';
import Consent from './Consent';
import {JsonObject} from './Json';
import ExponeaProject from './ExponeaProject';
import EventType from './EventType';
import AppInboxStyle from './AppInboxStyle';
import {AppInboxMessage} from './AppInboxMessage';
import {AppInboxAction} from './AppInboxAction';
import configuration from "./Configuration";
import exponeaProject from "./ExponeaProject";

/*
Purpose of this file is to test typescript typings and serialization of parameters and return types
to make sure native platforms use data in the expected format.
When adding functions to the ExponeaType, add a test case here.
*/

let lastArgumentsJson = '';

const mockExponea: ExponeaType = {
  configure(configuration: Configuration): Promise<void> {
    lastArgumentsJson = JSON.stringify([configuration]);
    return Promise.resolve();
  },

  isConfigured(): Promise<boolean> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve(true);
  },

  getCustomerCookie(): Promise<string> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve('mock-customer-cookie');
  },

  checkPushSetup(): Promise<void> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve();
  },

  getFlushMode(): Promise<FlushMode> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve(FlushMode.PERIOD);
  },

  setFlushMode(flushingMode: FlushMode): Promise<void> {
    lastArgumentsJson = JSON.stringify([flushingMode]);
    return Promise.resolve();
  },

  getFlushPeriod(): Promise<number> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve(123);
  },

  setFlushPeriod(period: number): Promise<void> {
    lastArgumentsJson = JSON.stringify([period]);
    return Promise.resolve();
  },

  getLogLevel(): Promise<LogLevel> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve(LogLevel.INFO);
  },

  setLogLevel(loggerLevel: LogLevel): Promise<void> {
    lastArgumentsJson = JSON.stringify([loggerLevel]);
    return Promise.resolve();
  },

  getDefaultProperties(): Promise<JsonObject> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve({});
  },

  setDefaultProperties(properties: JsonObject): Promise<void> {
    lastArgumentsJson = JSON.stringify([properties]);
    return Promise.resolve();
  },

  anonymize(
    exponeaProject?: ExponeaProject,
    projectMapping?: {[key in EventType]?: Array<ExponeaProject>},
  ): Promise<void> {
    lastArgumentsJson = JSON.stringify([exponeaProject, projectMapping]);
    return Promise.resolve();
  },

  identifyCustomer(
    customerIds: Record<string, string>,
    properties: JsonObject,
  ): Promise<void> {
    lastArgumentsJson = JSON.stringify([customerIds, properties]);
    return Promise.resolve();
  },

  flushData(): Promise<void> {
    lastArgumentsJson = JSON.stringify([]);
    return Promise.resolve();
  },

  trackEvent(
    eventName: string,
    properties: JsonObject,
    timestamp?: number,
  ): Promise<void> {
    lastArgumentsJson = JSON.stringify([eventName, properties, timestamp]);
    return Promise.resolve();
  },

  trackSessionStart(timestamp: number | undefined): Promise<void> {
    lastArgumentsJson = JSON.stringify([timestamp]);
    return Promise.resolve();
  },

  trackSessionEnd(timestamp: number | undefined): Promise<void> {
    lastArgumentsJson = JSON.stringify([timestamp]);
    return Promise.resolve();
  },

  fetchConsents(): Promise<Array<Consent>> {
    lastArgumentsJson = JSON.stringify([]);
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
          en: {key: 'en-value'},
          cz: {key: 'cz-value'},
        },
      },
    ]);
  },

  fetchRecommendations(
    options: RecommendationOptions,
  ): Promise<Array<Recommendation>> {
    lastArgumentsJson = JSON.stringify([options]);
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
  },

  setPushOpenedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */,

  removePushOpenedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */,

  setPushReceivedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */,

  removePushReceivedListener() {} /* eslint-disable-line @typescript-eslint/no-empty-function */,

  requestIosPushAuthorization(): Promise<boolean> {
    return Promise.resolve(true);
  },

  requestPushAuthorization(): Promise<boolean> {
    return Promise.resolve(true);
  },

  setAppInboxProvider(withStyle: AppInboxStyle): Promise<void> {
    lastArgumentsJson = JSON.stringify([withStyle]);
    return Promise.resolve();
  },

  trackAppInboxOpened(_message: AppInboxMessage): Promise<void> {
    return Promise.resolve();
  },

  trackAppInboxOpenedWithoutTrackingConsent(
    _message: AppInboxMessage,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackAppInboxClick(
    _action: AppInboxAction,
    _message: AppInboxMessage,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackAppInboxClickWithoutTrackingConsent(
    _action: AppInboxAction,
    _message: AppInboxMessage,
  ): Promise<void> {
    return Promise.resolve();
  },

  markAppInboxAsRead(_message: AppInboxMessage): Promise<boolean> {
    return Promise.resolve(true);
  },

  fetchAppInbox(): Promise<Array<AppInboxMessage>> {
    return Promise.resolve([]);
  },

  fetchAppInboxItem(_messageId: string): Promise<AppInboxMessage> {
    return Promise.resolve({id: '1', type: 'push'});
  },

  setInAppMessageCallback(
    overrideDefaultBehavior: boolean,
    trackActions: boolean,
    callback: (action: InAppMessageAction) => void,
  ) {} /* eslint-disable-line @typescript-eslint/no-empty-function */,

  removeInAppMessageCallback() {} /* eslint-disable-line @typescript-eslint/no-empty-function */,

  setAutomaticSessionTracking(enabled: boolean): Promise<void> {
    return Promise.resolve();
  },

  setSessionTimeout(timeout: number): Promise<void> {
    return Promise.resolve();
  },

  setAutoPushNotification(enabled: boolean): Promise<void> {
    return Promise.resolve();
  },

  setCampaignTTL(seconds: number): Promise<void> {
    return Promise.resolve();
  },

  trackPushToken(token: string): Promise<void> {
    return Promise.resolve();
  },

  trackHmsPushToken(token: string): Promise<void> {
    return Promise.resolve();
  },

  trackDeliveredPush(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackDeliveredPushWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackClickedPush(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackClickedPushWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackPaymentEvent(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  isExponeaPushNotification(params: Record<string, string>): Promise<boolean> {
    return Promise.resolve(true);
  },

  trackInAppMessageClick(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackInAppMessageClickWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackInAppMessageClose(
    params: Record<string, string>, 
    interaction = true
  ): Promise<void> {
    return Promise.resolve();
  },

  trackInAppMessageCloseWithoutTrackingConsent(
    params: Record<string, string>,
    interaction = true
  ): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockClick(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockClickWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockClose(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockCloseWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockShown(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockShownWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockError(params: Record<string, string>): Promise<void> {
    return Promise.resolve();
  },

  trackInAppContentBlockErrorWithoutTrackingConsent(
    params: Record<string, string>,
  ): Promise<void> {
    return Promise.resolve();
  },

  getSegments(exposingCategory: string): Promise<Array<Segment>> {
    lastArgumentsJson = exposingCategory;
    return Promise.resolve([]);
  },

  registerSegmentationDataCallback(callback: SegmentationDataCallback): void {
    lastArgumentsJson = JSON.stringify({
      exposingCategory: callback.exposingCategory,
      includeFirstLoad: callback.includeFirstLoad
    })
  },

  unregisterSegmentationDataCallback(callback: SegmentationDataCallback): void {
    lastArgumentsJson = JSON.stringify({
      exposingCategory: callback.exposingCategory,
      includeFirstLoad: callback.includeFirstLoad
    })
  }
};

describe('parameter serialization and typings', () => {
  test('configure', async () => {
    mockExponea.configure({
      projectToken: 'mock-project-token',
      authorizationToken: 'mock-authorization-token',
    });
    expect(lastArgumentsJson).toBe(
      '[{"projectToken":"mock-project-token","authorizationToken":"mock-authorization-token"}]',
    );
  });

  test('isConfigured', () => {
    mockExponea.isConfigured();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('getCustomerCookie', () => {
    mockExponea.getCustomerCookie();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('checkPushSetup', () => {
    mockExponea.checkPushSetup();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('getFlushMode', () => {
    mockExponea.getFlushMode();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('setFlushMode', () => {
    mockExponea.setFlushMode(FlushMode.APP_CLOSE);
    expect(lastArgumentsJson).toBe('["APP_CLOSE"]');
  });

  test('getFlushPeriod', () => {
    mockExponea.getFlushPeriod();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('setFlushPeriod', () => {
    mockExponea.setFlushPeriod(123);
    expect(lastArgumentsJson).toBe('[123]');
  });

  test('getLogLevel', () => {
    mockExponea.getLogLevel();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('setLogLevel', () => {
    mockExponea.setLogLevel(LogLevel.VERBOSE);
    expect(lastArgumentsJson).toBe('["VERBOSE"]');
  });

  test('getDefaultProperties', () => {
    mockExponea.getDefaultProperties();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('setDefaultProperties', () => {
    mockExponea.setDefaultProperties({key: 'value', number: '123'});
    expect(lastArgumentsJson).toBe('[{"key":"value","number":"123"}]');
  });

  test('anonymize', () => {
    mockExponea.anonymize();
    expect(lastArgumentsJson).toBe('[null,null]');
    mockExponea.anonymize(
      {
        projectToken: 'new-mock-project-token',
        authorizationToken: 'new-mock-authorization-token',
      },
      {
        [EventType.SESSION_END]: [
          {
            projectToken: 'session-end-mock-project-token',
            authorizationToken: 'session-end-mock-authorization-token',
          },
        ],
      },
    );
    expect(lastArgumentsJson).toBe(
      `
      [
        {
          "projectToken": "new-mock-project-token",
          "authorizationToken": "new-mock-authorization-token"
        },
        {
          "SESSION_END": [
            {
              "projectToken": "session-end-mock-project-token",
              "authorizationToken": "session-end-mock-authorization-token"
            }
          ]
        }
      ]
    `.replace(/\s/g, ''),
    );
  });

  test('identifyCustomer', () => {
    mockExponea.identifyCustomer(
      {email: 'mock@email.com'},
      {
        string: 'value',
        boolean: false,
        number: 3.14159,
        array: ['value1', 'value2'],
        object: {
          key: 'value',
        },
      },
    );
    expect(lastArgumentsJson).toBe(
      `
      [
        {
          "email": "mock@email.com"
        },
        {
          "string": "value",
          "boolean": false,
          "number": 3.14159,
          "array": [
            "value1",
            "value2"
          ],
          "object": {
            "key": "value"
          }
        }
      ]
    `.replace(/\s/g, ''),
    );
  });

  test('flushData', () => {
    mockExponea.flushData();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('trackEvent', () => {
    mockExponea.trackEvent('my-event-name', {key: 'value'});
    expect(lastArgumentsJson).toBe('["my-event-name",{"key":"value"},null]');
    mockExponea.trackEvent('my-event-name', {key: 'value'}, 123);
    expect(lastArgumentsJson).toBe('["my-event-name",{"key":"value"},123]');
  });

  test('trackSessionStart', () => {
    mockExponea.trackSessionStart();
    expect(lastArgumentsJson).toBe('[null]');
    mockExponea.trackSessionStart(123);
    expect(lastArgumentsJson).toBe('[123]');
  });

  test('trackSessionEnd', () => {
    mockExponea.trackSessionEnd();
    expect(lastArgumentsJson).toBe('[null]');
    mockExponea.trackSessionEnd(123);
    expect(lastArgumentsJson).toBe('[123]');
  });

  test('fetchConsents', () => {
    mockExponea.fetchConsents();
    expect(lastArgumentsJson).toBe('[]');
  });

  test('fetchRecommendations', () => {
    mockExponea.fetchRecommendations({
      id: 'mock-recommendation-id',
      fillWithRandom: false,
    });
    expect(lastArgumentsJson).toBe(
      '[{"id":"mock-recommendation-id","fillWithRandom":false}]',
    );
    mockExponea.fetchRecommendations({
      id: 'mock-recommendation-id',
      fillWithRandom: false,
      size: 123,
      items: {item1: 'value1'},
      catalogAttributesWhitelist: ['item1'],
    });
    expect(lastArgumentsJson).toBe(
      `
      [
        {
          "id": "mock-recommendation-id",
          "fillWithRandom": false,
          "size": 123,
          "items": {
            "item1": "value1"
          },
          "catalogAttributesWhitelist": [
            "item1"
          ]
        }
      ]
    `.replace(/\s/g, ''),
    );
  });
  test('appInboxStyle', () => {
    mockExponea.setAppInboxProvider({
      appInboxButton: {
        textOverride: 'test',
      },
    });
    expect(lastArgumentsJson).toBe(
      `
    [{
      "appInboxButton": {
        "textOverride": "test"
      }
    }]
    `.replace(/\s/g, ''),
    );
  });
  test('Segmentation callback registration', () => {
    const callback = new SegmentationDataCallback(
        "discovery",
        true,
        data => {
          // nothing to do here
        }
    );
    mockExponea.registerSegmentationDataCallback(callback)
    expect(lastArgumentsJson).toBe(`{"exposingCategory":"discovery","includeFirstLoad":true}`)
  });
  test('Segmentation callback un-registration', () => {
    const callback = new SegmentationDataCallback(
        "discovery",
        true,
        data => {
          // nothing to do here
        }
    );
    mockExponea.unregisterSegmentationDataCallback(callback)
    expect(lastArgumentsJson).toBe(`{"exposingCategory":"discovery","includeFirstLoad":true}`)
  });
});
