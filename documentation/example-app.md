---
title: Example app for React Native SDK
slug: react-native-sdk-example-app
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk
content:
  excerpt: 'Build, run, and navigate the example app included with the React Native SDK'
---

The Exponea React Native SDK includes an example application you can use as a reference implementation. You can build and run the app, test Engagement features, and compare the code and behavior of your implementation with the expected behavior and code in the example app.

## Prerequisites

You must have the following software installed to be able to build and run the example app:

- [Node](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/)
- [React Native CLI](https://github.com/react-native-community/cli)
- [Watchman](https://facebook.github.io/watchman/)
- [Git](https://git-scm.com/)
- [Android Studio](https://developer.android.com/studio) with a virtual or physical device set up to run the app on Android
- [Xcode](https://developer.apple.com/xcode/) and [CocoaPods](https://cocoapods.org/) with a virtual or physical device set up to run the app on iOS

> 👍
>
> Follow React Native's [Get started](https://reactnative.dev/docs/environment-setup) guide if you are new to React Native.

## Build and run the example app

1. Clone the [exponea-react-native-sdk](https://github.com/exponea/exponea-react-native-sdk) repository on GitHub:
   ```shell
   git clone https://github.com/exponea/exponea-react-native-sdk.git
   ```
2. Enter the `exponea-react-native-sdk` directory:
   ```shell
   cd exponea-react-native-sdk
   ```
3. Run the following commands to do a clean build of the SDK:
   ```
   ./cleanCache.sh
   yarn
   yarn run build
   rm -rdf node_modules
   ```
4. Enter the `example` directory containing the example app:
   ```shell
   cd example
   ```
5. Run yarn to resolve dependencies:
   ```
   yarn
   ```
6. To run the app on iOS:
   1. Run CocoaPods in the `ios` directory to install dependencies:
      ```shell
      cd ios
      pod install
      cd ..
      ```
   2. Run the app:
      ```shell
      react-native run-ios
      ```
7. To run the app on Android:
   1. Connect a virtual or physical Android device.
   2. Run the app:
      ```shell
      react-native run-android --mode=GmsDebug
      ```
      Alternatively, use `--mode=HmsDebug` for Huawei devices without GooglePlay services but with HMS Core. For React Native version <0.73, use `--variant` instead of `--mode`, see [#2026](https://github.com/react-native-community/cli/pull/2026).

> 📘
>
> To enable push notifications in the example app, you must also configure the [Apple Push Notification Service integration](https://documentation.bloomreach.com/engagement/docs/ios-sdk-configure-apns) (for iOS) or the [Firebase integration](https://documentation.bloomreach.com/engagement/docs/android-sdk-configure-firebase) or [Huawei integration](https://documentation.bloomreach.com/engagement/docs/android-sdk-configure-huawei) (for Android) in the Exponea web app.

## Navigate the example app

![Example app auth screens](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/documentation/images/example-app-react-native-auth.png)

Running the app in the simulator displays the **AuthScreen**. The screen fields change depending on the selected integration type. Here's how to set it up:
1. Select your integration type from the segmented control: **Project Config** or **Stream Config**.
2. For **Project Config**:
   - Enter your `Project token`.
   - Enter your `Authorization token` (API key).
   - **Optional:** Enter `Advanced Auth key` to enable [customer token authorization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#customer-token-authorization).
3. For **Stream Config**:
   - Enter your `Stream ID`. You can find the stream ID in the Data hub app under `Event streams` > select your stream > `Access Security`.
   - **Optional:** Enter `JWT Key ID` and `JWT Secret` to enable local JWT token generation for testing. Both must be provided together. For more details, see [SDK auth token authorization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#sdk-auth-token-authorization).
4. Enter the `Base URL` (API base URL for the Bloomreach platform).
5. **Optional:** Enter a hard ID in the `Registered` field to identify the customer. Leave blank for anonymous tracking.
6. **Optional:** Enter `Application ID` if your Engagement project supports multiple mobile apps. If you leave this blank, the SDK uses the default value `default-application`. See [Configuration for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).
7. Click `Start` to [initialize the SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk).

The **Clear local data** button invokes `clearLocalCustomerData()` to delete all locally stored data without initializing the SDK.

> [`AuthScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/AuthScreen.tsx)

The app provides several screens, accessible using the bottom navigation, to test the different SDK features:

- The **Tracking** screen enables you to test tracking of different events and properties, as well as open the app inbox. The `Identify customer` and `Track event` buttons open modals to enter test data.

  > [`TrackingScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/TrackingScreen.tsx) > [`IdentifyCustomerModal.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/IdentifyCustomerModal.tsx) > [`TrackEventModal.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/TrackEventModal.tsx)

- The **Fetching** screen enables you to fetch consents, recommendations, and segments.

  > [`FetchingScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/FetchingScreen.tsx)

- The **Flushing** screen lets you trigger a manual data flush, anonymize the current customer, and stop the SDK integration. The `Anonymize` button opens a modal where you can optionally enter new project configuration parameters.

  > [`FlushingScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/FlushingScreen.tsx) > [AnonymizeModal.tsx](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/AnonymizeModal.tsx)

- The **Config** screen enables you to configure default properties to track with any event. The `Default properties` button opens a modal that lists the current default properties and enables you to enter new ones.

  > [TrackingScreen.tsx](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/TrackingScreen.tsx) > [DefaultPropertiesModal.tsx](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/DefaultPropertiesModal.tsx)

- The **In-App Content Blocks** screens displays in-app content blocks. Use placeholder IDs `example_top`, `ph_x_example_iOS`, and `example_list` in your in-app content block settings.
  > [`InAppCbScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/InAppCbScreen.tsx)

Try out the different features in the app, then find the customer profile in the Engagement web app (under `Data & Assets` > `Customers`) to see the properties and events tracked by the SDK.

Until you use `Identify customer` in the app, the customer is tracked anonymously using a cookie soft ID. You can look up the cookie value in the logs and find the corresponding profile in the Engagement web app.

Once you use `Identify customer` in the app to set the `registered` hard ID (use an email address as value), the customer is identified and can be found in Engagement web app by their email address.

> 📘
>
> Refer to [Customer identification](https://documentation.bloomreach.com/engagement/docs/customer-identification) for more information on soft IDs and hard IDs.

![Example app screens](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/documentation/images/example-app-react-native.png)

## Troubleshooting

If you encounter any issues running the example app, the following may help:

- Run `rm -rf node_modules` in the root folder before running `yarn` in the `example` folder.
- If you see errors building for iOS, run `rm -rf Pods`, then `pod install` in the `example/ios` folder.
