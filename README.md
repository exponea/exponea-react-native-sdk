# React Native Exponea SDK
React Native Exponea SDK allows your application to interact with the [Exponea](https://exponea.com/) Customer Data & Experience Platform. Exponea empowers B2C marketers to raise conversion rates, improve acquisition ROI, and maximize customer lifetime value.

React native is implemented in Typescript as a wrapper around [native Android SDK](https://github.com/exponea/exponea-android-sdk) and [native iOS SDK](https://github.com/exponea/exponea-ios-sdk).

## Getting started
Install the package using npm or yarn:
* `$ yarn add react-native-exponea-sdk`
* `$ npm install react-native-exponea-sdk --save`

> For projects using Expo, you'll need to switch to *Bare Workflow* using `expo eject`.

### iOS setup

* `$ cd ios`
* `$ pod install`

Minimal supported iOS version for Exponea SDK is 10.3, you may need to change iOS version on the first line of your `ios/Podfile` to `platform :ios, '10.3'`, or higher.

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
  * [Basics concepts](./documentation/BASIC_CONCEPTS.md)
  * [Configuration](./documentation/CONFIGURATION.md)
  * [Tracking](./documentation/TRACKING.md)
  * [Tracking Campaigns(Android App Links/Universal links)](./documentation/LINKING.md)
  * [Fetching](./documentation/FETCHING.md)
  * [Push notifications](./documentation/PUSH.md)
  * [Anonymize customer](./documentation/ANONYMIZE.md)
  * [In-app messages](./documentation/IN_APP_MESSAGES.md)
  * [Example/Package development documentation](./documentation/DEVELOPMENT.md) - Learn how to build example application or the package itself

If facing any issues, look for **Troubleshooting** section in the respective document.

## Release Notes

[Release notes](./documentation/RELEASE_NOTES.md) for the SDK.
