import Configuration, {
  PushTokenTrackingFrequency,
  PushNotificationImportance,
  HttpLoggingLevel,
} from '../Configuration';
import EventType from '../EventType';
import {readFileSync} from 'fs';
test('should construct basic configuration', () => {
  const configuration: Configuration = {
    projectToken: 'mock-project-token',
    authorizationToken: 'mock-authorization-token',
  };

  expect(JSON.stringify(configuration)).toBe(
    readFileSync('./src/test_data/configurationMinimal.json', 'utf8').replace(
      /\s/g,
      '',
    ),
  );
});

test('should construct full configuration', () => {
  const configuration: Configuration = {
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
  };

  expect(JSON.stringify(configuration)).toBe(
    readFileSync('./src/test_data/configurationComplete.json', 'utf8').replace(
      /\s/g,
      '',
    ),
  );
});
