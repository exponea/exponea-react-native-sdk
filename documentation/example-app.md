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

The Exponea React Native SDK includes an example application you can use as a reference implementation. You can build and run the app, test {user.mkg} features, and compare the code and behavior of your implementation with the expected behavior and code in the example app.

## Prerequisites

You must have the following software installed to be able to build and run the example app:

- [Node](https://nodejs.org/en) 22.13.0 or higher within 22.x, 24.3.0 or higher within 24.x, or 26.0.0 or higher
- [Yarn](https://yarnpkg.com/)
- [React Native CLI](https://github.com/react-native-community/cli)
- [Watchman](https://facebook.github.io/watchman/)
- [Git](https://git-scm.com/)
- [Android Studio](https://developer.android.com/studio) with a virtual or physical device set up to run the app on Android
- [Xcode](https://developer.apple.com/xcode/) 26 or higher and [CocoaPods](https://cocoapods.org/) with a virtual or physical device set up to run the app on iOS

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
      Alternatively, use `--mode=HmsDebug` for Huawei devices without GooglePlay services but with HMS Core.

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
   - Enter your `Stream ID`. You can find the stream ID in the {user.dh} app under **Event streams** > select your stream > **Access Security**.
   - **Optional:** Enter `JWT Key ID` and `JWT Secret` to enable local JWT token generation for testing. Both must be provided together. For more details, see [SDK auth token authorization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#sdk-auth-token-authorization).
4. Enter the `Base URL` (API base URL for the {user.br} platform).
5. **Optional:** Enter a hard ID in the `Registered` field to identify the customer. Leave blank for anonymous tracking.
6. **Optional:** Enter `Application ID` if your {user.mkg} project supports multiple mobile apps. If you leave this blank, the SDK uses the default value `default-application`. See [Configuration for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).
7. Click `Start` to [initialize the SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk).

The **Clear local data** button invokes `clearLocalCustomerData()` to delete all locally stored data without initializing the SDK.

> [`AuthScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/AuthScreen.tsx)

The app includes several screens that you can open from the bottom navigation to test SDK features. The header on every screen contains an SDK status indicator that turns green when the SDK is initialized; a button that opens the **SDK Logs** overlay, where you can filter by log level; the {user.br} logo, which opens an overview of the current SDK configuration.
- The **Fetching** screen enables you to fetch consents, recommendations, and segments. It also contains the App Inbox button.

  > [`FetchingScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/FetchingScreen.tsx) > [`FetchRecommendationsModal.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/FetchRecommendationsModal.tsx)

- The **Tracking** screen enables you to identify the customer, track custom events, payments, and page views, and test push notification tracking.
  - The `Identify customer` and `Track Custom Event` buttons open modals where you enter test data.
  - The `Track Custom Event` modal includes presets for triggering in-app message test campaigns.
  - In the **Stream Config** section, the `Set auth token` button sets a locally generated SDK auth token for the identified customer.

  > [`TrackingScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/TrackingScreen.tsx) > [`IdentifyCustomerModal.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/IdentifyCustomerModal.tsx) > [`TrackEventModal.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/TrackEventModal.tsx)

- The **Flushing** screen lets you read and change the flush mode, flush period, and log level, and trigger a manual data flush.

  > [`FlushingScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/FlushingScreen.tsx)

- The **Anonymize** screen lets you anonymize the current customer and stop the SDK integration. The `Anonymize` button opens a modal where you can optionally enter new project configuration parameters.

  > [`AnonymizeScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/AnonymizeScreen.tsx) > [`AnonymizeModal.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/components/AnonymizeModal.tsx)

- The **In-app CB** screen displays in-app content blocks. Use placeholder IDs `example_top`, `example_list`, and `ph_x_example_iOS` (iOS) or `ph_x_example_Android` (Android) in your in-app content block settings. Turn on **Show Carousels** to display carousel content blocks with placeholder IDs `example_carousel_ios` (iOS) or `example_carousel_and` (Android).

  > [`InAppCbScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/InAppCbScreen.tsx) > [`CarouselScreen.tsx`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/src/screens/CarouselScreen.tsx)

> 📘
>
> On iOS, the example app uses the UIScene lifecycle. React Native starts from [`SceneDelegate.swift`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/ios/ExponeaExample/SceneDelegate.swift), which also tracks universal links and forwards links to React Native `Linking`. [`AppDelegate.swift`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/ios/ExponeaExample/AppDelegate.swift) handles push notifications.

Try out the different features in the app, then find the customer profile in the {user.mkg} web app (under `Data & Assets` > `Customers`) to see the properties and events tracked by the SDK.

Until you use `Identify customer` in the app, the customer is tracked anonymously using a cookie soft ID. You can look up the cookie value in the logs and find the corresponding profile in the {user.mkg} web app.

Once you use `Identify customer` in the app to set the `registered` hard ID (use an email address as value), the customer is identified and can be found in {user.mkg} web app by their email address.

> 📘
>
> Refer to [Customer identification](https://documentation.bloomreach.com/engagement/docs/customer-identification) for more information on soft IDs and hard IDs.

![Example app Fetching and Tracking screens with Identify customer and Track Event modals](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/documentation/images/example-app-react-native.png)

![Example app Flushing, Anonymize and In-app CB screens](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/documentation/images/example-app-react-native-2.png)

## Troubleshooting

If you encounter any issues running the example app, the following may help:

- Run `rm -rf node_modules` in the root folder before running `yarn` in the `example` folder.
- If you see errors building for iOS, run `rm -rf Pods`, then `pod install` in the `example/ios` folder.
