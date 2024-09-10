# React Native Exponea SDK

React Native Exponea SDK allows your application to interact with the [Bloomreach Engagement](https://www.bloomreach.com/) Customer Data & Experience Platform. Engagement empowers B2C marketers to raise conversion rates, improve acquisition ROI, and maximize customer lifetime value.

The SDK is implemented in Typescript as a wrapper around [native Android SDK](https://github.com/exponea/exponea-android-sdk) and [native iOS SDK](https://github.com/exponea/exponea-ios-sdk). It is compatible with React Native 0.69.0 - 0.74.5. Earlier versions may work but have not been tested.

> Bloomreach Engagement was formerly known as Exponea. For backward compatibility, the Exponea name continues to be used in the React Native SDK.

## Getting started

Install the package using npm or yarn:
* `$ yarn add react-native-exponea-sdk`
* `$ npm install react-native-exponea-sdk --save`

> For projects using Expo, you'll need to switch to *Bare Workflow* using `expo eject`.

### iOS setup

* `$ cd ios`
* `$ pod install`

Minimal supported iOS version for Exponea SDK is 13.4, you may need to change iOS version on the first line of your `ios/Podfile` to `platform :ios, '13.4'`, or higher.

### Android setup

You'll most likely need to enable multidex. Edit `android/app/build.gradle` and add `multiDexEnabled true` to android defaultConfig.
```
android {
    ...
    defaultConfig {
        ...
        multiDexEnabled true
    }
```

## Documentation

- [Initial SDK setup](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup)
  - [Configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration)
  - [Authorization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization)
  - [Data flushing](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-data-flushing)
- [Basic concepts](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-basic-concepts)
- [Tracking](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking)
  - [Tracking consent](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent)
- [Links](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-links)
- [Push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications)
  - [Android push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android)
  - [iOS push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios)
- [Fetch data](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-fetch-data)
- [In-app personalization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-in-app-personalization)
  - [In-app messages](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-in-app-messages)
  - [In-app content blocks](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-in-app-content-blocks)
- [App Inbox](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-app-inbox)
- [Example app](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-example-app)
- [Development](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-development)
- [Release notes](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-release-notes)
   - [SDK version update guide](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-version-update)

If facing any issues, look for **Troubleshooting** section in the respective document.

## Release Notes

[Release notes](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-release-notes) for the SDK.

## Support

Are you a Bloomreach customer and dealing with some issues on mobile SDK? You can reach the official Engagement Support [via these recommended ways](https://documentation.bloomreach.com/engagement/docs/engagement-support#contacting-the-support).
Note that Github repository issues and PRs will also be considered but with the lowest priority and without guaranteed output.
