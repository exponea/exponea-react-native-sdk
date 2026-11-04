---
title: Expo support for React Native SDK
slug: react-native-sdk-expo
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk-setup
content:
  excerpt: Integrate the React Native SDK into an Expo SDK 57 app with the packaged config plugin
---

Use the SDK's packaged config plugin to add the React Native SDK to an Expo SDK 57 app, including optional push notifications. The plugin configures the native Android and iOS projects at build time, so you don't copy native code into them. It works with native development builds and EAS Build. Expo Go isn't supported because the SDK contains native code, and other Expo SDK versions haven't been tested with this plugin.

> 🚧 Important
>
> Expo support, including the config plugin, is experimental. Its options and the native code it generates may change in future releases. Test your integration, especially push notifications, on physical devices before you release your app, and report problems in the [GitHub repository](https://github.com/exponea/exponea-react-native-sdk/issues).

## Requirements

- React Native 0.86.x, as required by Expo SDK 57. The SDK's wider React Native peer range applies to bare React Native apps.
- Node.js `^22.13.0`, `^24.3.0`, or `>=26.0.0`, which is the SDK's engine range.
- Android SDK 36 for local Android builds.
- Xcode 26.4 or newer for local iOS builds. Expo SDK 57 requires iOS 16.4 or newer.
- A Swift `AppDelegate` and a Groovy `android/app/build.gradle`, which are the native projects Expo SDK 57 generates.

The plugin stops with an error for an Objective-C `AppDelegate` or a Kotlin DSL `build.gradle.kts`.

Run `npx expo install --check` to check your Expo dependencies. Don't upgrade React Native independently. For details, see [Expo SDK 57 requirements](https://docs.expo.dev/versions/v57.0.0/).

## Install the plugin

1. In your Expo app directory, run:

   ```shell
   npx expo install react-native-exponea-sdk
   ```

2. Add the plugin to your existing `app.json` or `app.config.js`. For `app.json`:

   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.example.app"
       },
       "android": {
         "package": "com.example.app"
       },
       "plugins": ["react-native-exponea-sdk"]
     }
   }
   ```

3. Replace the identifiers with your own and preserve your existing app settings and plugins. If you previously added the custom config plugins shown in the setup and iOS push guides, replace their entries with this packaged plugin. Don't run them together.

The plugin adds Android Firebase Messaging dependencies and a message service, and iOS push-token, notification-open, and universal-link handlers. You don't need to copy the bare React Native delegate or message-service code into the generated projects.

Domain association and app-link configuration are still required for your own links. For details, see [App links](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-links).

## Set up push notifications (optional)

Configure push for each platform you support.

> 📘 Note
>
> Push notifications are optional. If you don't need them, skip to [Build and run the app](#build-and-run-the-app).

### Configure Android push

1. Register your Android package in Firebase and download `google-services.json`.
2. Set its path in your Expo config, and merge this into the configuration from [Install the plugin](#install-the-plugin):

   ```json
   {
     "expo": {
       "android": {
         "package": "com.example.app",
         "googleServicesFile": "./google-services.json"
       }
     }
   }
   ```

3. Supply the file locally or through [EAS file environment variables](https://docs.expo.dev/eas/environment-variables/).
4. [Configure the Firebase Cloud Messaging integration](https://documentation.bloomreach.com/engagement/docs/android-sdk-firebase#configure-the-firebase-cloud-messaging-integration-in-usermkg) in {user.mkg}.

The Expo plugin supports Firebase push only. Huawei push isn't supported.

### Configure iOS push

1. [Configure APNs](https://documentation.bloomreach.com/engagement/docs/ios-sdk-configure-apns) in {user.mkg}. The {user.mkg} APNs integration doesn't require Firebase's `GoogleService-Info.plist`.
2. Set up Apple signing for your bundle identifier.
3. Enable the push entitlement in your Expo config. Merge this into the configuration from [Install the plugin](#install-the-plugin):

   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.example.app",
         "entitlements": {
           "aps-environment": "development"
         }
       }
     }
   }
   ```

   Set `aps-environment` to match your signing profile: `development` for development builds and `production` for distribution.

4. Optional: to receive silent notifications, also enable the `remote-notification` background mode. Merge this into the same configuration:

   ```json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "UIBackgroundModes": ["remote-notification"]
         }
       }
     }
   }
   ```

### Set up rich push on iOS

Register an Apple app group shared by the app and its notification service extension. Then replace the plugin entry in your Expo config with:

```json
[
  "react-native-exponea-sdk",
  {
    "enableRichPush": true,
    "enableNotificationContentExtension": true,
    "appGroup": "group.com.example.app"
  }
]
```

The plugin adds the app-group entitlement and the notification extension targets:

- `enableRichPush` adds `ExponeaNotificationService`.
- `enableNotificationContentExtension` adds `ExponeaNotificationContent` for expanded notification content. It requires `enableRichPush`.

For all options and their defaults, see [Plugin options](#plugin-options).

### Sign iOS rich push extensions with EAS

For EAS builds with generated native projects, merge this into your Expo config when both extension options are enabled. The plugin creates the native targets but doesn't add this EAS metadata:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "build": {
          "experimental": {
            "ios": {
              "appExtensions": [
                {
                  "targetName": "ExponeaNotificationService",
                  "bundleIdentifier": "com.example.app.ExponeaNotificationService",
                  "entitlements": {
                    "com.apple.security.application-groups": [
                      "group.com.example.app"
                    ]
                  }
                },
                {
                  "targetName": "ExponeaNotificationContent",
                  "bundleIdentifier": "com.example.app.ExponeaNotificationContent",
                  "entitlements": {}
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

Replace `com.example.app` with your `ios.bundleIdentifier` and use the plugin's app group. Preserve existing `extra.eas` settings, such as `projectId`. Omit the content extension entry if `enableNotificationContentExtension` is disabled.

The app and the service extension share the app group. The generated content extension has no app-group entitlement. EAS uses these declarations to prepare each extension's signing credentials before prebuild. For details, see [EAS app extension configuration](https://docs.expo.dev/build-reference/app-extensions/).

### Use expo-notifications

If your app's `package.json` lists `expo-notifications` when you run prebuild, the plugin generates native code that works alongside it:

| Platform | How the plugin integrates                                                                                              | Notification delivery                                                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Android  | The generated message service extends the expo-notifications Firebase service.                                         | The SDK handles {user.mkg} notifications. Other messages and token refreshes are passed to expo-notifications. {user.mkg} notifications aren't delivered to expo-notifications listeners. |
| iOS      | expo-notifications remains the notification center delegate. The plugin registers with it to track notification opens. | Push tokens and remote notifications reach both the SDK and expo-notifications.                                                                                                           |

On iOS, foreground presentation follows your `Notifications.setNotificationHandler` configuration.

Run `npx expo prebuild --clean` after you install or remove `expo-notifications`. The plugin stops with an error if the generated `AppDelegate.swift` still matches the previous setup.

## Build and run the app

Generate the native projects, then build for your platform:

```shell
npx expo prebuild --clean
npx expo run:android
# Or, on macOS:
npx expo run:ios
```

Alternatively, use [EAS Build](https://docs.expo.dev/build/introduction/) with the push files and signing credentials configured for your build environment. For an EAS development client, follow [Expo's development build setup](https://docs.expo.dev/develop/development-builds/create-a-build/).

Re-run prebuild and rebuild after you change plugin options or native configuration. `--clean` regenerates `ios/` and `android/`, so keep native customizations in config plugins when you use this workflow.

## Initialize the SDK

The plugin configures the native projects at build time. Initialize the SDK in your application code, for example with a project integration:

```typescript
import Exponea from 'react-native-exponea-sdk';

async function initializeExponea() {
  await Exponea.configure({
    integrationConfig: {
      projectToken: 'YOUR_PROJECT_TOKEN',
      authorizationToken: 'YOUR_PUBLIC_API_KEY',
      baseUrl: 'YOUR_API_BASE_URL',
    },
    ios: {
      appGroup: 'group.com.example.app',
    },
  });
}
```

Call and await `initializeExponea()` during app startup when tracking consent allows initialization, and handle any rejected promise. For rich push, `ios.appGroup` must match the plugin's app group from [Set up rich push on iOS](#set-up-rich-push-on-ios). Omit it if you don't use an app group.

For credentials, consent requirements, and stream integration, see [SDK initialization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk).

### Request push permission

If you set up push, request push permission after initialization, at an appropriate point in your user flow, such as a notification opt-in button:

```typescript
const accepted = await Exponea.requestPushAuthorization();
```

## Verify the integration

On a physical device, verify the following:

- Session tracking works.
- If push is enabled, permission, token tracking, notification receipt, and notification opens work.
- If rich push is enabled, images, actions, and delivery tracking work.

For platform behavior and troubleshooting, see [iOS push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios) and [Android push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android). Their manual native setup steps are replaced by the Expo configuration in this guide.

## Plugin options

Pass options as the second item of the plugin entry in your Expo config.

| Option                               | Default | Description                                                                                                   |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| `enableRichPush`                     | `false` | Adds the `ExponeaNotificationService` notification service extension.                                         |
| `enableNotificationContentExtension` | `false` | Adds the `ExponeaNotificationContent` extension for expanded notification content. Requires `enableRichPush`. |
| `appGroup`                           | none    | The Apple app group shared by the app and its notification service extension.                                 |

If you omit `appGroup`, the plugin uses the first existing `ios.entitlements["com.apple.security.application-groups"]` value. Rich push requires an app group from one of these sources.

## Example app

For a runnable reference, see the repository's [Expo example app](https://github.com/exponea/exponea-react-native-sdk/tree/main/example_expo).
