---
title: Initial setup for React Native SDK
slug: react-native-sdk-setup
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk
content:
  excerpt: Install and configure the React Native SDK
---

## Install the SDK

The Exponea React Native SDK can be installed in your app using [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/). [CocoaPods](https://cocoapods.org/) is required to set up the iOS app.

> ❗️Warning
>
> **SDK version 3.0.0 and higher** requires React Native's [New Architecture (TurboModules)](https://reactnative.dev/docs/turbo-modules). If your app still uses the old architecture (JavaScript Bridge), you must migrate before upgrading. Refer to the [React Native New Architecture migration guide](https://reactnative.dev/docs/new-architecture-intro) and the [SDK version update guide](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-version-update#update-from-version-2xx-to-3xx) for details.

The SDK is compatible with React Native 0.83.0 - 0.87.0 and requires Node.js `^22.13.0`, `^24.3.0`, or `>=26.0.0`.

> ❗️
>
> Please note that the installation instructions assume your app uses "bare workflow". For Expo-based apps, refer to [Expo development builds](#expo-development-builds) below and [Expo support](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-expo).

> 📘
>
> Refer to [React Native SDK release notes](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-release-notes) for the latest Exponea React Native SDK release.

### Install package

In your project's root folder, install the `react-native-exponea-sdk` package using either yarn or npm:

```shell yarn
yarn add react-native-exponea-sdk
```

```shell npm
npm install react-native-exponea-sdk --save
```

Optionally, you can specify version constraints as `react-native-exponea-sdk@<version>` (for example, `react-native-exponea-sdk@^1.8.0)`). Refer to [Ranges](https://github.com/npm/node-semver#versions) in the npm semver documentation for details.

### iOS setup

To resolve the Exponea SDK dependencies for the iOS app, first `cd` into the `ios` directory in your project:

```shell
cd ios
```

Then run the following command:

```shell
pod install
```

The minimum supported iOS version for the SDK is 15.1. You may need to change the iOS version on the first line of your `ios/Podfile` to `platform :ios, '15.1'`, or higher.

> 📘 UIScene lifecycle
>
> Apps built with the iOS 27 SDK must adopt the UIKit scene-based lifecycle (`UIApplicationSceneManifest`). Under UIScene, UIKit delivers universal links to your `SceneDelegate`, and you must start React Native from it. Push notification handling stays in your `AppDelegate`. For more information, see [Universal links for iOS](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-links#ios) and the [SDK version update guide](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-version-update#update-to-version-420-or-higher).

### Android setup

The minimum supported Android API level for the SDK is 24. You may need to set or update `minSdkVersion` in `android/app/build.gradle` to `24` or higher:

```gradle
android {
    ...
    defaultConfig {
        ...
        minSdkVersion 24
    }
```

#### Android Auto Backup and SDK SharedPreferences

The React Native SDK relies on the [native Android SDK](https://documentation.bloomreach.com/engagement/docs/android-sdk) to persist data in dedicated SharedPreferences files, for example `EXPONEA_PREFERENCES.xml` and `EXPONEA_PUSH_TOKEN.xml`. The native SDK ships with default Android Auto Backup rules that exclude only the push token and short-lived authentication data from backup.

If your app doesn't define its own backup rules, the SDK defaults apply automatically. No additional action required.

If your app defines its own backup rules, or you want to exclude SDK SharedPreferences from Auto Backup, configure them in your React Native project's Android host app:

- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/xml/backup_rules.xml` (API 30 and below)
- `android/app/src/main/res/xml/data_extraction_rules.xml` (API 31 and above)

> 📘
>
> For XML examples and default backup behavior, follow the instructions in [Android Auto Backup and SDK SharedPreferences](https://documentation.bloomreach.com/engagement/docs/android-sdk-setup#android-auto-backup-and-sdk-sharedpreferences) in the native Android SDK documentation.
>
> If you get a build error such as `Manifest merger failed` for `fullBackupContent` or `dataExtractionRules`, see [Build error "Manifest merger failed"](https://documentation.bloomreach.com/engagement/docs/android-sdk-setup#build-error-manifest-merger-failed) in the native Android SDK documentation.

## Initialize the SDK

Now that you have installed the SDK in your project, you must import, configure, and initialize the SDK in your application code.

> ❗️ Protect the privacy of your customers
>
> Make sure you have obtained and stored tracking consent from your customer before initializing Exponea React Native SDK.
>
> To ensure you're not tracking events without the customer's consent, you can use `Exponea.clearLocalCustomerData(appGroup)` when a customer opts out from tracking (this applies to new users or returning customers who have previously opted out). This will bring the SDK to a state as if it was never initialized. This option also prevents reusing existing cookies for returning customers.
>
> Refer to [Clear local customer data](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking#clear-local-customer-data) for details.
>
> If the customer denies tracking consent after Exponea React Native SDK is initialized, you can use `Exponea.stopIntegration()` to stop SDK integration and remove all locally stored data.
>
> Refer to [Stop SDK integration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking#stop-sdk-integration) for details.

> ❗️ Re-initializing after `stopIntegration()` (Android)
>
> On Android, `stopIntegration()` clears the locally stored push notification token. After a subsequent `Exponea.configure()` call, the SDK starts without a stored token.  After each re-initialization, your `FirebaseMessagingService.onNewToken` or HMS `onNewToken` callback must call `handleNewToken` with the token your app already holds. For more details, see [Push notification token is missing after `stopIntegration()`](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android#push-notification-token-is-missing-after-stopintegration).

`integrationConfig` is the required configuration parameter. For a standard integration, use `ProjectConfig` with `projectToken`, `authorizationToken`, and `baseUrl` (credentials available in the {user.mkg} web app under **Project settings** > **Access management** > **API**). For a {user.dh} [event stream](https://documentation.bloomreach.com/data-hub/docs/event-streams) integration, use `StreamConfig` with `streamId` and an optional `baseUrl` (stream ID available in the {user.dh} app under **Event streams** > select your stream > **Access Security**).
> 📘
>
> Refer to [Mobile SDKs API access management](https://documentation.bloomreach.com/engagement/docs/mobile-sdks-api-access-management) for details.

Import the SDK:

```typescript
import Exponea from 'react-native-exponea-sdk';
```

Initialize the SDK with a `ProjectConfig`:

```typescript
Exponea.configure({
  integrationConfig: {
    projectToken: 'YOUR_PROJECT_TOKEN',
    authorizationToken: 'YOUR_API_KEY',
    // default baseUrl value is https://api.exponea.com
    baseUrl: 'YOUR_API_BASE_URL',
  },
}).catch((error) => console.log(error));
```

Or initialize with a `StreamConfig`:

```typescript
Exponea.configure({
  integrationConfig: {
    streamId: 'YOUR_STREAM_ID',
    // default baseUrl value is https://api.exponea.com
    baseUrl: 'YOUR_API_BASE_URL',
  },
}).catch((error) => console.log(error));
```

> 📘  Note
>
> - For details on JWT authentication, see [SDK auth token authorization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#sdk-auth-token-authorization).
> - For an overview of event stream setup, see [configure React Native SDK with JWT authentication](https://documentation.bloomreach.com/data-hub/docs/configure-react-native-sdk-with-jwt-authentication) in the {user.dh} documentation.

### Initialize with customer identity

Optionally, provide a `CustomerIdentity` as the second argument to `Exponea.configure()` to identify the customer immediately during initialization:

```typescript
import type { CustomerIdentity } from 'react-native-exponea-sdk';

const customerIdentity: CustomerIdentity = {
  customerIds: { registered: 'jane.doe@example.com' },
  sdkAuthToken: 'your-jwt-token',
};

Exponea.configure(
  {
    integrationConfig: {
      streamId: 'YOUR_STREAM_ID',
      baseUrl: 'YOUR_API_BASE_URL',
    },
  },
  customerIdentity
).catch((error) => console.log(error));
```

### Configure application ID

**Multiple mobile apps:** If your {user.mkg} project supports multiple mobile apps, specify the `applicationId` in your configuration. This helps distinguish between different apps in your project.

```typescript
Exponea.configure({
    ...,
    applicationId: '<Your application id>',
    ...
}).catch(error => console.log(error))
```

Make sure your `applicationId` value matches exactly Application ID configured in your {user.mkg} under **Project Settings > Campaigns > Channels > Push Notifications.**

**Single mobile app:** If your {user.mkg} project supports only one app, you can skip the `applicationId` configuration. The SDK will automatically use the default value "default-application".

### Configure the SDK only once

React Native application code can be reloaded without restarting the native application itself. This speeds up the development process, but it also means that native code usually continues to run as if nothing happened. You should configure the SDK only once. When developing with hot reload enabled, you should check `Exponea.isConfigured()` before configuring the SDK.

```typescript
async function configureExponea(configuration: Configuration) {
  try {
    if (!(await Exponea.isConfigured())) {
      Exponea.configure(configuration);
    } else {
      console.log('Exponea SDK already configured.');
    }
  } catch (error) {
    console.log(error);
  }
}
```

### Done!

At this point, the SDK is active and should now be tracking sessions in your app.

## Expo development builds

Expo support is experimental.
Expo SDK 57 apps use React Native 0.86.x and require a native development build;
Expo Go is not supported. The SDK includes a config plugin that replaces the
custom plugin previously shown here.

Follow [Expo SDK 57 setup](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-expo)
to install the package, configure native integration and push notifications,
build the app, and initialize the SDK. Keep the React Native version aligned
with Expo SDK 57 rather than selecting another version from the SDK's bare
React Native support range.

## Other SDK configuration

### Advanced configuration

The SDK can be further configured by setting additional properties of the `Configuration` object. For a complete list of available configuration parameters, refer to the [Configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) documentation.

### Log level

The SDK supports the following log levels defined in `LogLevel`:

| Log level | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| `OFF`     | Disables all logging                                                     |
| `ERROR`   | Serious errors or breaking issues                                        |
| `WARN`    | Warnings and recommendations + `ERROR`                                   |
| `INFO`    | Informative messages + `WARN` + `ERROR`                                  |
| `DBG`     | Debugging information + `INFO` + `WARN` + `ERROR`                        |
| `VERBOSE` | Information about all SDK actions + `DBG` + `INFO` + `WARN` + `ERROR`.   |

> ❗️Warning
>
> **SDK version 3.0.0 change:** The `LogLevel.DEBUG` enum member has been renamed to `LogLevel.DBG` and its wire value changed from `'DEBUG'` to `'DBG'` to avoid a conflict with the iOS `#define DEBUG` preprocessor macro. Code referencing `LogLevel.DEBUG` must be updated to `LogLevel.DBG`. If you hardcode the string value (for example, for storage or comparison), update `'DEBUG'` to `'DBG'`. On iOS, `'DBG'` maps to `.verbose` as the native iOS SDK has no separate debug level.

The default log level is `INFO`. While developing or debugging, setting the log level to `debug` or `verbose` can be helpful.

You can set the log level at runtime as follows:

```typescript
Exponea.setLogLevel(LogLevel.VERBOSE);
```

### Logger callbacks

On Android, you can also receive every log entry emitted by the native SDK. Keep the same callback reference to unregister it when it is no longer needed.

```typescript
import Exponea, {
  registerLoggerCallback,
  unregisterLoggerCallback,
} from 'react-native-exponea-sdk';

const logger = ({ level, message, throwable }) => {
  console.log(`[${level}] ${message}`, throwable);
};

registerLoggerCallback(logger);
// Or: Exponea.registerLoggerCallback(logger);

unregisterLoggerCallback(logger);
```

Each callback receives a `LoggerEvent` with `level`, `message`, and an optional `throwable` stack trace as a string. You can register multiple callbacks. On iOS, registering and removing callbacks has no effect because the pinned native SDK doesn't expose a logger observer API.

### Data flushing

Read [Data flushing](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-data-flushing) to learn more about how the SDK uploads data to the {user.mkg} API and how to customize this behavior.
