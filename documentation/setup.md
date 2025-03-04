---
title: Initial SDK setup
excerpt: Install and configure the React Native SDK
slug: react-native-sdk-setup
categorySlug: integrations
parentDocSlug: react-native-sdk
---

## Install the SDK

The Exponea React Native SDK can be installed in your app using [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/). [CocoaPods](https://cocoapods.org/) is required to set up the iOS app.

The SDK is compatible with React Native 0.69.0 - 0.76.6. Earlier versions may work but have not been tested.

> ❗️
>
> Please note that the installation instructions assume your app uses "bare workflow". For Expo-based apps using "managed workflow", refer to [Expo managed apps](#expo-managed-apps) below.

> 📘
>
> Refer to https://github.com/exponea/exponea-react-native-sdk for the latest Exponea React Native SDK release.

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

### Android setup

The minimum supported Android API level for the SDK is 23. You may need to set or update `minSdkVersion` in `android/app/build.gradle` to `23` or higher:

```gradle
android {
    ...
    defaultConfig {
        ...
        minSdkVersion 23
    }
```

## Initialize the SDK

Now that you have installed the SDK in your project, you must import, configure, and initialize the SDK in your application code.

The required configuration parameters are `projectToken`, `authorizationToken`, and `baseUrl`. You can find these in the Bloomreach Engagement webapp under `Project settings` > `Access management` > `API`.

> 📘
>
> Refer to [Mobile SDKs API access management](https://documentation.bloomreach.com/engagement/docs/mobile-sdks-api-access-management) for details.

Import the SDK:

```typescript
import Exponea from 'react-native-exponea-sdk';
```

Initialize the SDK:

```typescript
Exponea.configure({
  projectToken: "YOUR_PROJECT_TOKEN",
  authorizationToken: "YOUR_API_KEY",
  // default baseUrl value is https://api.exponea.com
  baseUrl: "YOUR_API_BASE_URL" 
}).catch(error => console.log(error))
```

### Configure the SDK only once

React Native application code can be reloaded without restarting the native application itself. This speeds up the development process, but it also means that native code usually continues to run as if nothing happened. You should configure the SDK only once. When developing with hot reload enabled, you should check `Exponea.isConfigured()` before configuring the SDK.

```typescript
async function configureExponea(configuration: Configuration) {
  try {
    if (!await Exponea.isConfigured()) {
      Exponea.configure(configuration)
    } else {
      console.log("Exponea SDK already configured.")
    }
  } catch (error) {
    console.log(error)
  }
}
```

### Done!

At this point, the SDK is active and should now be tracking sessions in your app.

## Expo managed apps

To install Exponea React Native SDK in an Expo managed app, please follow these steps.

### Install package

In your project's root folder, install the `react-native-exponea-sdk` package using either yarn or npm:

```shell yarn
yarn add react-native-exponea-sdk
```

```shell npm
npm install react-native-exponea-sdk --save
```

Optionally, you can specify version constraints as `react-native-exponea-sdk@<version>` (for example, `react-native-exponea-sdk@^1.8.0)`). Refer to [Ranges](https://github.com/npm/node-semver#versions) in the npm semver documentation for details.

### Create Expo config plugin

You need to create an [Expo config plugin](https://docs.expo.dev/config-plugins/plugins-and-mods/) that implements the required modifications at native level, including:

- [iOS setup](#ios-setup)
- [Android setup](#android-setup)
- [Android push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android)
- [iOS push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios)

Below is an example Expo config plugin that you can use as a starting point:

```typescript
/* eslint-disable @typescript-eslint/no-var-requires */
const {
  withPlugins,
  withAppBuildGradle,
  withAndroidManifest,
  withAppDelegate,
  withDangerousMod,
} = require("@expo/config-plugins");
const { writeFileSync, mkdirSync } = require("fs");

// Update android/app/build.gradle
function withExponeaBuildGradle(config) {
  return withAppBuildGradle(config, async (cfg) => {
    const { modResults } = cfg;
    const { contents } = modResults;
    const lines = contents.split("\n");
    const configIndex = lines.findIndex((line) => /defaultConfig {/.test(line));
    const dependenciesIndex = lines.findIndex((line) =>
      /dependencies {/.test(line)
    );

    modResults.contents = [
      ...lines.slice(0, configIndex + 1),
      "        multiDexEnabled true",
      ...lines.slice(configIndex + 1, dependenciesIndex + 1),
      `    implementation("com.google.firebase:firebase-messaging:24.0.0")`,
      ...lines.slice(dependenciesIndex + 1),
    ].join("\n");

    return cfg;
  });
}

// Update android/app/src/main/AndroidManifest.xml
function withExponeaAndroidManifest(config) {
  return withAndroidManifest(config, async (cfg) => {
    if (!cfg.modResults.manifest.application[0].service)
      cfg.modResults.manifest.application[0].service = [];
    cfg.modResults.manifest.application[0].service.push({
      $: {
        "android:name": ".MessageService",
        "android:exported": "false",
      },
      "intent-filter": [
        {
          action: {
            $: {
              "android:name": "com.google.firebase.MESSAGING_EVENT",
            },
          },
        },
      ],
    });
    return cfg;
  });
}

// Update ios/MyApp/AppDelegate.mm
function withExponeaAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    const { modResults } = cfg;
    const { contents } = modResults;
    const lines = contents.split("\n");

    const importIndex = lines.findIndex((line) =>
      /^#import "AppDelegate.h"/.test(line)
    );
    const didFinishLaunchingIndex = lines.findIndex((line) =>
      /return \[super application:application didFinishLaunchingWithOptions:launchOptions\]/.test(
        line
      )
    );
    const continueUserActivityIndex = lines.findIndex((line) =>
      /return \[super application:application continueUserActivity:userActivity restorationHandler:restorationHandler\]/.test(
        line
      )
    );
    const didRegisterForRemoteNotificationsWithDeviceTokenIndex =
      lines.findIndex((line) =>
        /return \[super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken\]/.test(
          line
        )
      );
    const didReceiveRemoteNotificationIndex = lines.findIndex((line) =>
      /return \[super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler\]/.test(
        line
      )
    );
    const endIndex = lines.findIndex((line) => /@end/.test(line));

    modResults.contents = [
      ...lines.slice(0, importIndex),
      `#import <ExponeaRNAppDelegate.h>
#import <UserNotifications/UserNotifications.h>`,
      ...lines.slice(importIndex, didFinishLaunchingIndex),
      `  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;`,
      ...lines.slice(didFinishLaunchingIndex, continueUserActivityIndex),
      `  [Exponea continueUserActivity: userActivity];`,
      ...lines.slice(
        continueUserActivityIndex,
        didRegisterForRemoteNotificationsWithDeviceTokenIndex
      ),
      `  [Exponea handlePushNotificationToken: deviceToken];`,
      ...lines.slice(
        didRegisterForRemoteNotificationsWithDeviceTokenIndex,
        didReceiveRemoteNotificationIndex
      ),
      `  [Exponea handlePushNotificationOpenedWithUserInfo:userInfo];`,
      ...lines.slice(didReceiveRemoteNotificationIndex, endIndex),
      `- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
    withCompletionHandler:(void (^)(void))completionHandler
{
  [Exponea handlePushNotificationOpenedWithResponse: response];
  completionHandler();
}`,
      ...lines.slice(endIndex),
    ].join("\n");

    return cfg;
  });
}

// Add the file MessageService.java
function withExponeaAndroidMessageService(config) {
  return withDangerousMod(config, [
    "android",
    (cfg) => {
      const androidProjRoot = cfg.modRequest.platformProjectRoot;
      const packageName = cfg.android.package;
      const pathToDir = packageName.replaceAll(".", "/");
      mkdirSync(`${androidProjRoot}/app/src/main/java/${pathToDir}`, {
        recursive: true,
      });
      writeFileSync(
        `${androidProjRoot}/app/src/main/java/${pathToDir}/MessageService.java`,
        `package ${packageName};

import android.app.NotificationManager;
import android.content.Context;
import androidx.annotation.NonNull;
import com.exponea.ExponeaModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MessageService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        ExponeaModule.Companion.handleRemoteMessage(
                getApplicationContext(),
                remoteMessage.getData(),
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE));
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        ExponeaModule.Companion.handleNewToken(
                getApplicationContext(),
                token);
    }
}
`
      );
      return cfg;
    },
  ]);
}

// Replace AppDelegate.h
function withExponeaIosAppDelegateH(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const iosProjRoot = cfg.modRequest.platformProjectRoot;
      const projectName = cfg.name;
      writeFileSync(
        `${iosProjRoot}/${projectName}/AppDelegate.h`,
        `#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>
#import <UserNotifications/UNUserNotificationCenter.h>

@interface AppDelegate : EXAppDelegateWrapper <UNUserNotificationCenterDelegate>

@end
`
      );
      return cfg;
    },
  ]);
}

function withExponea(config) {
  return withPlugins(config, [
    withExponeaBuildGradle,
    withExponeaAndroidManifest,
    withExponeaAppDelegate,
    withExponeaAndroidMessageService,
    withExponeaIosAppDelegateH,
  ]);
}

module.exports = withExponea;
```

> 🚧
>
> The example plugin has been tested with Expo 50. The native files are modified using find/replace logic; using a different Expo version might require some tweaking.

> 🚧
>
> Please note that [iOS rich push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios#rich-push-notifications) require additional native setup that is not part of the example plugin but can be achieved in a similar way.

Place the plugin file in your project (for example, at `plugins/exponea/index.js`) and add it to `plugins` in your project app config in `app.json`.

Also in your project app config, add the required configuration for [Android push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android) and [iOS push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios).

```json
{
    "ios": {
      "entitlements": {
        "aps-environment": "development",
        "com.apple.security.application-groups": ["<your-app-group-id>"]
      },
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "package": "<your-package.id>",
      "googleServicesFile": "<path-to-your-google-services.json>"
    },
   "plugins": ["./plugins/exponea/index.js"]
}
```

To verify that the plugin works correctly, run [prebuild](https://docs.expo.dev/guides/adopting-prebuild/#prebuild) and inspect the resulting `ios` and `android` folders for the expected modifications. If the result is satisfactory, delete the `ios` and `android` folders. The normal build process will run this prebuild step automatically for every build.

## Other SDK configuration

### Advanced configuration

The SDK can be further configured by setting additional properties of the `Configuration` object. For a complete list of available configuration parameters, refer to the [Configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) documentation.

### Log level

The SDK supports the following log levels defined in `LogLevel`:

| Log level | Description |
| ----------| ----------- |
| `OFF`     | Disables all logging |
| `ERROR`   | Serious errors or breaking issues |
| `WARN` | Warnings and recommendations + `ERROR` |
| `INFO`    | Informative messages + `WARN` + `ERROR` |
| `DEBUG`   | Debugging information + `INFO` + `WARN` + `ERROR`  |
| `VERBOSE` | Information about all SDK actions + `DEBUG` + `INFO` + `WARN` + `ERROR`. |

The default log level is `INFO`. While developing or debugging, setting the log level to `debug` or `verbose` can be helpful.

You can set the log level at runtime as follows:

```typescript
Exponea.setLogLevel(LogLevel.VERBOSE);
```

### Data flushing

Read [Data flushing](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-data-flushing) to learn more about how the SDK uploads data to the Engagement API and how to customize this behavior.