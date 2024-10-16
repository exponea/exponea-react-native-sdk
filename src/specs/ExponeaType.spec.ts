/* eslint-disable @typescript-eslint/no-unused-vars */
import {FlushMode, LogLevel, SegmentationDataCallback,} from '../ExponeaType';
import EventType from '../EventType';
import {TestUtils} from "./TestUtils";
import {MockExponea} from "./MockExponea";
import {HttpLoggingLevel, PushNotificationImportance, PushTokenTrackingFrequency} from "../Configuration";

/*
Purpose of this file is to test typescript typings and serialization of parameters and return types
to make sure native platforms use data in the expected format.
When adding functions to the ExponeaType, add a test case here.
*/
describe('parameter serialization and typings', () => {
  let mockExponea: MockExponea;
  beforeEach(() => {
    mockExponea = new MockExponea()
  })
  test('configure', async () => {
    mockExponea.configure({
      projectToken: 'mock-project-token',
      authorizationToken: 'mock-authorization-token',
    });
    expect(mockExponea.lastArgumentsJson).toBe(
      '[{"projectToken":"mock-project-token","authorizationToken":"mock-authorization-token"}]',
    );
  });

  test('configure with complete setup', async () => {
    mockExponea.configure({
      projectToken: 'mock-project-token',
      authorizationToken: 'mock-authorization-token',
      baseUrl: 'http://mock-base-url.xxx',
      projectMapping: {
        [EventType.BANNER]: [
          {
            projectToken: 'other-project-token',
            authorizationToken: 'other-auth-token',
          },
        ],
      },
      defaultProperties: {
        string: 'value',
        boolean: false,
        number: 3.14159,
        array: ['value1', 'value2'],
        object: {
          key: 'value',
        },
      },
      flushMaxRetries: 10,
      sessionTimeout: 60,
      automaticSessionTracking: true,
      pushTokenTrackingFrequency: PushTokenTrackingFrequency.DAILY,
      allowDefaultCustomerProperties: false,
      android: {
        automaticPushNotifications: true,
        pushIcon: 12345,
        pushAccentColor: 123,
        pushChannelName: 'mock-push-channel-name',
        pushChannelDescription: 'mock-push-channel-description',
        pushChannelId: 'mock-push-channel-id',
        pushNotificationImportance: PushNotificationImportance.HIGH,
        httpLoggingLevel: HttpLoggingLevel.BODY,
      },
      ios: {
        requirePushAuthorization: false,
        appGroup: 'mock-app-group',
      },
      manualSessionAutoClose: true,
    });
    expect(mockExponea.lastArgumentsJson).toBe(
        TestUtils.readJsonAsParams('./src/test_data/configurationComplete.json'),
    );
  });

  test('isConfigured', () => {
    mockExponea.isConfigured();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('getCustomerCookie', () => {
    mockExponea.getCustomerCookie();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('checkPushSetup', () => {
    mockExponea.checkPushSetup();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('getFlushMode', () => {
    mockExponea.getFlushMode();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('setFlushMode', () => {
    mockExponea.setFlushMode(FlushMode.APP_CLOSE);
    expect(mockExponea.lastArgumentsJson).toBe('["APP_CLOSE"]');
  });

  test('getFlushPeriod', () => {
    mockExponea.getFlushPeriod();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('setFlushPeriod', () => {
    mockExponea.setFlushPeriod(123);
    expect(mockExponea.lastArgumentsJson).toBe('[123]');
  });

  test('getLogLevel', () => {
    mockExponea.getLogLevel();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('setLogLevel', () => {
    mockExponea.setLogLevel(LogLevel.VERBOSE);
    expect(mockExponea.lastArgumentsJson).toBe('["VERBOSE"]');
  });

  test('getDefaultProperties', () => {
    mockExponea.getDefaultProperties();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('setDefaultProperties', () => {
    mockExponea.setDefaultProperties({key: 'value', number: '123'});
    expect(mockExponea.lastArgumentsJson).toBe('[{"key":"value","number":"123"}]');
  });

  test('anonymize', () => {
    mockExponea.anonymize();
    expect(mockExponea.lastArgumentsJson).toBe('[null,null]');
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
    expect(mockExponea.lastArgumentsJson).toBe(
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
    expect(mockExponea.lastArgumentsJson).toBe(
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
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('trackEvent', () => {
    mockExponea.trackEvent('my-event-name', {key: 'value'});
    expect(mockExponea.lastArgumentsJson).toBe('["my-event-name",{"key":"value"},null]');
    mockExponea.trackEvent('my-event-name', {key: 'value'}, 123);
    expect(mockExponea.lastArgumentsJson).toBe('["my-event-name",{"key":"value"},123]');
  });

  test('trackSessionStart', () => {
    mockExponea.trackSessionStart();
    expect(mockExponea.lastArgumentsJson).toBe('[null]');
    mockExponea.trackSessionStart(123);
    expect(mockExponea.lastArgumentsJson).toBe('[123]');
  });

  test('trackSessionEnd', () => {
    mockExponea.trackSessionEnd();
    expect(mockExponea.lastArgumentsJson).toBe('[null]');
    mockExponea.trackSessionEnd(123);
    expect(mockExponea.lastArgumentsJson).toBe('[123]');
  });

  test('fetchConsents', () => {
    mockExponea.fetchConsents();
    expect(mockExponea.lastArgumentsJson).toBe('[]');
  });

  test('fetchRecommendations', () => {
    mockExponea.fetchRecommendations({
      id: 'mock-recommendation-id',
      fillWithRandom: false,
    });
    expect(mockExponea.lastArgumentsJson).toBe(
      '[{"id":"mock-recommendation-id","fillWithRandom":false}]',
    );
    mockExponea.fetchRecommendations({
      id: 'mock-recommendation-id',
      fillWithRandom: false,
      size: 123,
      items: {item1: 'value1'},
      catalogAttributesWhitelist: ['item1'],
    });
    expect(mockExponea.lastArgumentsJson).toBe(
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
    expect(mockExponea.lastArgumentsJson).toBe(
      `
    [{
      "appInboxButton": {
        "textOverride": "test"
      }
    }]
    `.replace(/\s/g, ''),
    );
  });
});
