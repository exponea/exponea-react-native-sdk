---
title: Initial SDK setup
excerpt: Install and configure the React Native SDK
slug: react-native-sdk-setup
categorySlug: integrations
parentDocSlug: react-native-sdk
---

## Install the SDK

The Exponea React Native SDK can be installed in your app using [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/). [CocoaPods](https://cocoapods.org/) is required to set up the iOS app.

> ❗️
>
> Please note that projects using Expo Managed Workflow must switch to Bare Workflow to be able to use the Exponea React Native SDK.

> 📘
>
> Refer to https://github.com/exponea/exponea-react-native-sdk for the latest Exponea Android SDK release.

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

The minimum supported iOS version for the SDK is 13.4. You may need to change the iOS version on the first line of your `ios/Podfile` to `platform :ios, '13.4'`, or higher.

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
