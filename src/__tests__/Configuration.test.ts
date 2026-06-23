import {
  PushTokenTrackingFrequency,
  PushNotificationImportance,
  HttpLoggingLevel,
} from '../Configuration';
import type Configuration from '../Configuration';
import EventType from '../EventType';
import { Exponea } from '../ExponeaImpl';
import NativeExponea from '../NativeExponea';

jest.mock('../NativeExponea', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(() => Promise.resolve()),
  },
}));

const mockConfigure = NativeExponea.configure as ReturnType<typeof jest.fn>;

beforeEach(() => {
  mockConfigure.mockClear();
});

const PROJECT_TOKEN = 'mock-project-token';
const AUTH_TOKEN = 'mock-authorization-token';
const BASE_URL = 'http://mock-base-url.xxx';
const OTHER_PROJECT_TOKEN = 'other-project-token';
const OTHER_AUTH_TOKEN = 'other-auth-token';
const STREAM_ID = 'mock-stream-id';
const STREAM_BASE_URL = 'https://mock-stream-url.xxx';

// ---------------------------------------------------------------------------
// Legacy style (backward-compatibility)
// ---------------------------------------------------------------------------

test('legacy Configuration type accepts projectToken + authorizationToken (type check)', () => {
  const configuration: Configuration = {
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
  };

  expect(configuration.projectToken).toBe(PROJECT_TOKEN);
  expect(configuration.authorizationToken).toBe(AUTH_TOKEN);
});

test('legacy Configuration type accepts all fields (type check)', () => {
  const pushChannelName = 'mock-push-channel-name';
  const pushChannelDescription = 'mock-push-channel-description';
  const pushChannelId = 'mock-push-channel-id';
  const appGroup = 'mock-app-group';

  const configuration: Configuration = {
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    baseUrl: BASE_URL,
    projectMapping: {
      [EventType.BANNER]: [
        {
          projectToken: OTHER_PROJECT_TOKEN,
          authorizationToken: OTHER_AUTH_TOKEN,
        },
      ],
    },
    defaultProperties: {
      string: 'value',
      boolean: false,
      number: 3.14159,
      array: ['value1', 'value2'],
      object: { key: 'value' },
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
      pushChannelName,
      pushChannelDescription,
      pushChannelId,
      pushNotificationImportance: PushNotificationImportance.HIGH,
      httpLoggingLevel: HttpLoggingLevel.BODY,
      requirePushAuthorization: false,
      allowWebViewCookies: false,
    },
    ios: {
      requirePushAuthorization: false,
      appGroup,
    },
    manualSessionAutoClose: true,
  };

  expect(configuration.projectToken).toBe(PROJECT_TOKEN);
  expect(configuration.authorizationToken).toBe(AUTH_TOKEN);
  expect(configuration.baseUrl).toBe(BASE_URL);
  expect(configuration.sessionTimeout).toBe(60);
  expect(configuration.flushMaxRetries).toBe(10);
  expect(configuration.automaticSessionTracking).toBe(true);
  expect(configuration.pushTokenTrackingFrequency).toBe(
    PushTokenTrackingFrequency.DAILY
  );
  expect(configuration.allowDefaultCustomerProperties).toBe(false);
  expect(configuration.manualSessionAutoClose).toBe(true);
  expect(configuration.android).toEqual({
    automaticPushNotifications: true,
    pushIcon: 12345,
    pushAccentColor: 123,
    pushChannelName,
    pushChannelDescription,
    pushChannelId,
    pushNotificationImportance: PushNotificationImportance.HIGH,
    httpLoggingLevel: HttpLoggingLevel.BODY,
    requirePushAuthorization: false,
    allowWebViewCookies: false,
  });
  expect(configuration.ios).toEqual({
    requirePushAuthorization: false,
    appGroup,
  });
  expect(configuration.projectMapping?.[EventType.BANNER]).toEqual([
    { projectToken: OTHER_PROJECT_TOKEN, authorizationToken: OTHER_AUTH_TOKEN },
  ]);
});

// ---------------------------------------------------------------------------
// New integration config style
// ---------------------------------------------------------------------------

test('Configuration type accepts minimal ProjectConfig (type check)', () => {
  const config: Configuration = {
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
  };

  expect((config.integrationConfig as any).projectToken).toBe(PROJECT_TOKEN);
  expect((config.integrationConfig as any).authorizationToken).toBe(AUTH_TOKEN);
});

test('Configuration type accepts minimal StreamConfig (type check)', () => {
  const config: Configuration = {
    integrationConfig: { streamId: STREAM_ID },
  };

  expect((config.integrationConfig as any).streamId).toBe(STREAM_ID);
});

test('Configuration type accepts all fields with ProjectConfig (type check)', () => {
  const pushChannelName = 'mock-push-channel-name';
  const pushChannelDescription = 'mock-push-channel-description';
  const pushChannelId = 'mock-push-channel-id';
  const appGroup = 'mock-app-group';

  const config: Configuration = {
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
      baseUrl: BASE_URL,
    },
    integrationRouteMap: {
      [EventType.BANNER]: [
        {
          projectToken: OTHER_PROJECT_TOKEN,
          authorizationToken: OTHER_AUTH_TOKEN,
        },
      ],
    },
    defaultProperties: {
      string: 'value',
      boolean: false,
      number: 3.14159,
      array: ['value1', 'value2'],
      object: { key: 'value' },
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
      pushChannelName,
      pushChannelDescription,
      pushChannelId,
      pushNotificationImportance: PushNotificationImportance.HIGH,
      httpLoggingLevel: HttpLoggingLevel.BODY,
      requirePushAuthorization: false,
      allowWebViewCookies: false,
    },
    ios: {
      requirePushAuthorization: false,
      appGroup,
    },
    manualSessionAutoClose: true,
    regenerateDeviceIdOnAnonymize: true,
  };

  expect(config.integrationConfig).toEqual({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    baseUrl: BASE_URL,
  });
  expect(config.sessionTimeout).toBe(60);
  expect(config.flushMaxRetries).toBe(10);
  expect(config.automaticSessionTracking).toBe(true);
  expect(config.pushTokenTrackingFrequency).toBe(
    PushTokenTrackingFrequency.DAILY
  );
  expect(config.allowDefaultCustomerProperties).toBe(false);
  expect(config.manualSessionAutoClose).toBe(true);
  expect(config.regenerateDeviceIdOnAnonymize).toBe(true);
  expect(config.android).toEqual({
    automaticPushNotifications: true,
    pushIcon: 12345,
    pushAccentColor: 123,
    pushChannelName,
    pushChannelDescription,
    pushChannelId,
    pushNotificationImportance: PushNotificationImportance.HIGH,
    httpLoggingLevel: HttpLoggingLevel.BODY,
    requirePushAuthorization: false,
    allowWebViewCookies: false,
  });
  expect(config.ios).toEqual({ requirePushAuthorization: false, appGroup });
  expect(config.integrationRouteMap?.[EventType.BANNER]).toEqual([
    { projectToken: OTHER_PROJECT_TOKEN, authorizationToken: OTHER_AUTH_TOKEN },
  ]);
});

test('Configuration type accepts all fields with StreamConfig (type check)', () => {
  const pushChannelName = 'mock-push-channel-name';
  const pushChannelDescription = 'mock-push-channel-description';
  const pushChannelId = 'mock-push-channel-id';
  const appGroup = 'mock-app-group';

  const config: Configuration = {
    integrationConfig: { streamId: STREAM_ID, baseUrl: STREAM_BASE_URL },
    defaultProperties: {
      string: 'value',
      boolean: false,
      number: 3.14159,
      array: ['value1', 'value2'],
      object: { key: 'value' },
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
      pushChannelName,
      pushChannelDescription,
      pushChannelId,
      pushNotificationImportance: PushNotificationImportance.HIGH,
      httpLoggingLevel: HttpLoggingLevel.BODY,
      requirePushAuthorization: false,
      allowWebViewCookies: false,
    },
    ios: {
      requirePushAuthorization: false,
      appGroup,
    },
    manualSessionAutoClose: true,
    regenerateDeviceIdOnAnonymize: true,
  };

  expect(config.integrationConfig).toEqual({
    streamId: STREAM_ID,
    baseUrl: STREAM_BASE_URL,
  });
  expect(config.sessionTimeout).toBe(60);
  expect(config.flushMaxRetries).toBe(10);
  expect(config.automaticSessionTracking).toBe(true);
  expect(config.pushTokenTrackingFrequency).toBe(
    PushTokenTrackingFrequency.DAILY
  );
  expect(config.allowDefaultCustomerProperties).toBe(false);
  expect(config.manualSessionAutoClose).toBe(true);
  expect(config.regenerateDeviceIdOnAnonymize).toBe(true);
  expect(config.android).toEqual({
    automaticPushNotifications: true,
    pushIcon: 12345,
    pushAccentColor: 123,
    pushChannelName,
    pushChannelDescription,
    pushChannelId,
    pushNotificationImportance: PushNotificationImportance.HIGH,
    httpLoggingLevel: HttpLoggingLevel.BODY,
    requirePushAuthorization: false,
    allowWebViewCookies: false,
  });
  expect(config.ios).toEqual({ requirePushAuthorization: false, appGroup });
});

// ---------------------------------------------------------------------------
// Bridge payload shape — legacy migration and config normalization
// ---------------------------------------------------------------------------

test('configure passes ProjectConfig integrationConfig as nested to native', async () => {
  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
      baseUrl: BASE_URL,
    },
  });

  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.integrationConfig).toEqual({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    baseUrl: BASE_URL,
  });
  expect(called.projectToken).toBeUndefined();
  expect(called.authorizationToken).toBeUndefined();
  expect(called.baseUrl).toBeUndefined();
});

test('configure passes StreamConfig integrationConfig as nested to native', async () => {
  await Exponea.configure({
    integrationConfig: { streamId: STREAM_ID, baseUrl: STREAM_BASE_URL },
  });

  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.integrationConfig).toEqual({
    streamId: STREAM_ID,
    baseUrl: STREAM_BASE_URL,
  });
});

test('configure wraps legacy projectToken/authorizationToken into integrationConfig for native', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    sessionTimeout: 60,
    android: { automaticPushNotifications: true },
    ios: { requirePushAuthorization: false, appGroup: 'mock-app-group' },
  });

  expect(warnSpy).toHaveBeenCalledWith(
    "'projectToken' and 'authorizationToken' at the root level are deprecated. Use 'integrationConfig' with 'ProjectConfig' instead."
  );
  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.integrationConfig).toEqual({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
  });
  expect(called.projectToken).toBeUndefined();
  expect(called.authorizationToken).toBeUndefined();
  // ...rest fields must survive migrateLegacyConfig's spread
  expect(called.sessionTimeout).toBe(60);
  expect(called.android).toEqual({ automaticPushNotifications: true });
  expect(called.ios).toEqual({
    requirePushAuthorization: false,
    appGroup: 'mock-app-group',
  });
  warnSpy.mockRestore();
});

test('configure wraps legacy projectToken/authorizationToken/baseUrl into integrationConfig for native', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    baseUrl: BASE_URL,
    sessionTimeout: 60,
    android: { automaticPushNotifications: true },
    ios: { requirePushAuthorization: false, appGroup: 'mock-app-group' },
  });

  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.integrationConfig).toEqual({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    baseUrl: BASE_URL,
  });
  expect(called.baseUrl).toBeUndefined();
  // ...rest fields must survive migrateLegacyConfig's spread
  expect(called.sessionTimeout).toBe(60);
  expect(called.android).toEqual({ automaticPushNotifications: true });
  expect(called.ios).toEqual({
    requirePushAuthorization: false,
    appGroup: 'mock-app-group',
  });
  warnSpy.mockRestore();
});

test('configure passes integrationRouteMap to native unchanged', async () => {
  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
    integrationRouteMap: {
      [EventType.BANNER]: [
        {
          projectToken: OTHER_PROJECT_TOKEN,
          authorizationToken: OTHER_AUTH_TOKEN,
        },
      ],
    },
  });

  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.projectMapping).toBeUndefined();
  expect(called.integrationRouteMap).toEqual({
    [EventType.BANNER]: [
      {
        projectToken: OTHER_PROJECT_TOKEN,
        authorizationToken: OTHER_AUTH_TOKEN,
      },
    ],
  });
});

test('configure warns and uses integrationRouteMap when both projectMapping and integrationRouteMap are set', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
    integrationRouteMap: {
      [EventType.BANNER]: [
        {
          projectToken: OTHER_PROJECT_TOKEN,
          authorizationToken: OTHER_AUTH_TOKEN,
        },
      ],
    },
    projectMapping: {
      [EventType.INSTALL]: [
        {
          projectToken: PROJECT_TOKEN,
          authorizationToken: AUTH_TOKEN,
          baseUrl: BASE_URL,
        },
      ],
    },
  } as any);

  expect(warnSpy).toHaveBeenCalledWith(
    "Both 'projectMapping' and 'integrationRouteMap' are set. 'integrationRouteMap' takes precedence; 'projectMapping' will be ignored."
  );
  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.integrationRouteMap).toEqual({
    [EventType.BANNER]: [
      {
        projectToken: OTHER_PROJECT_TOKEN,
        authorizationToken: OTHER_AUTH_TOKEN,
      },
    ],
  });
  expect(called.projectMapping).toBeUndefined();
  warnSpy.mockRestore();
});

test('configure renames legacy projectMapping to integrationRouteMap for native', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    projectToken: PROJECT_TOKEN,
    authorizationToken: AUTH_TOKEN,
    projectMapping: {
      [EventType.BANNER]: [
        {
          projectToken: OTHER_PROJECT_TOKEN,
          authorizationToken: OTHER_AUTH_TOKEN,
          baseUrl: BASE_URL,
        },
      ],
    },
  } as any);

  expect(warnSpy).toHaveBeenCalledWith(
    "'projectMapping' is deprecated. Use 'integrationRouteMap' with 'ProjectConfig' instead."
  );
  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.projectMapping).toBeUndefined();
  expect(called.integrationRouteMap).toEqual({
    [EventType.BANNER]: [
      {
        projectToken: OTHER_PROJECT_TOKEN,
        authorizationToken: OTHER_AUTH_TOKEN,
        baseUrl: BASE_URL,
      },
    ],
  });
  warnSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// customerIdentity
// ---------------------------------------------------------------------------

test('configure passes null as second arg to native when customerIdentity is omitted', async () => {
  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
  });

  expect(mockConfigure.mock.lastCall![1]).toBeNull();
});

test('configure passes customerIdentity as second arg to native', async () => {
  const customerIdentity = {
    customerIds: { email: 'test@example.com' },
    sdkAuthToken: 'mock-jwt',
  };

  await Exponea.configure(
    {
      integrationConfig: {
        projectToken: PROJECT_TOKEN,
        authorizationToken: AUTH_TOKEN,
      },
    },
    customerIdentity
  );

  expect(mockConfigure.mock.lastCall![1]).toEqual(customerIdentity);
});

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

test('configure rejects when neither integrationConfig nor projectToken is provided', async () => {
  await expect(
    Exponea.configure({ authorizationToken: AUTH_TOKEN } as any)
  ).rejects.toThrow(
    new Error(
      'Configuration requires either integrationConfig (ProjectConfig or StreamConfig) or the deprecated projectToken + authorizationToken.'
    )
  );
  expect(mockConfigure).not.toHaveBeenCalled();
});

test('configure rejects when both integrationConfig and projectToken are provided', async () => {
  await expect(
    Exponea.configure({
      integrationConfig: {
        projectToken: PROJECT_TOKEN,
        authorizationToken: AUTH_TOKEN,
      },
      projectToken: PROJECT_TOKEN,
    } as any)
  ).rejects.toThrow(
    new Error(
      'Provide either integrationConfig or the deprecated projectToken + authorizationToken, not both.'
    )
  );
  expect(mockConfigure).not.toHaveBeenCalled();
});

test('configure rejects when both integrationConfig and empty-string projectToken are provided', async () => {
  await expect(
    Exponea.configure({
      integrationConfig: {
        projectToken: PROJECT_TOKEN,
        authorizationToken: AUTH_TOKEN,
      },
      projectToken: '',
    } as any)
  ).rejects.toThrow(
    new Error(
      'Provide either integrationConfig or the deprecated projectToken + authorizationToken, not both.'
    )
  );
  expect(mockConfigure).not.toHaveBeenCalled();
});

test('configure warns when StreamConfig is used with advancedAuthEnabled', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: { streamId: STREAM_ID },
    advancedAuthEnabled: true,
  });

  expect(warnSpy).toHaveBeenCalledWith(
    "'advancedAuthEnabled' is not supported with 'StreamConfig' and will be ignored."
  );
  warnSpy.mockRestore();
});

test('configure warns when StreamConfig is used with integrationRouteMap', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: { streamId: STREAM_ID },
    integrationRouteMap: {
      [EventType.BANNER]: [
        { projectToken: PROJECT_TOKEN, authorizationToken: AUTH_TOKEN },
      ],
    },
  });

  expect(warnSpy).toHaveBeenCalledWith(
    "'integrationRouteMap'/'projectMapping' is not supported with 'StreamConfig' and will be ignored."
  );
  warnSpy.mockRestore();
});

test('configure does not warn when ProjectConfig is used with advancedAuthEnabled', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
    advancedAuthEnabled: true,
  });

  expect(warnSpy).not.toHaveBeenCalled();
  const called = mockConfigure.mock.lastCall![0] as any;
  expect(called.advancedAuthEnabled).toBe(true);
  warnSpy.mockRestore();
});

test('configure warns when root-level requirePushAuthorization is set', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
    requirePushAuthorization: false,
  } as any);

  expect(warnSpy).toHaveBeenCalledWith(
    "[Exponea] 'requirePushAuthorization' at the root level is deprecated. Use 'ios.requirePushAuthorization' instead. It has no effect on Android."
  );
  warnSpy.mockRestore();
});

test('configure warns when android.requirePushAuthorization is set', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
    android: { requirePushAuthorization: false },
  });

  expect(warnSpy).toHaveBeenCalledWith(
    "[Exponea] 'android.requirePushAuthorization' is deprecated and has no effect on Android. Remove it from your configuration."
  );
  warnSpy.mockRestore();
});

test('configure does not warn when only ios.requirePushAuthorization is set', async () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  await Exponea.configure({
    integrationConfig: {
      projectToken: PROJECT_TOKEN,
      authorizationToken: AUTH_TOKEN,
    },
    ios: { requirePushAuthorization: false },
  });

  expect(warnSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
});
