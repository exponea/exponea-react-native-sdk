# React Native Exponea SDK
React Native Exponea SDK allows your application to interact with the [Exponea](https://exponea.com/) Customer Data & Experience Platform. Exponea empowers B2C marketers to raise conversion rates, improve acquisition ROI, and maximize customer lifetime value.

React native is implemented in Typescript as a wrapper around [native Android SDK](https://github.com/exponea/exponea-android-sdk) and [native iOS SDK](https://github.com/exponea/exponea-ios-sdk).

## Getting started

`$ yarn add react-native-exponea-sdk`  
or  
`$ npm react-native-exponea-sdk --save`  
or whatever JS hipsters use these days.

> Since version 0.60.0 React native auto-links dependencies. When using older version of React Native you have to link the package yourself  
`$ react-native link react-native-exponea-sdk`

### Extra iOS setup
Native module for iOS uses Swift. You must have *some* Swift code in your project in order for it to work. You can just open the XCode project and create a dummy swift file. When XCode asks, let it create bridging header file. After that you can build the application from command line.
> This seems weird, but it's the official way to do this. See end of [Exporting Swift](https://reactnative.dev/docs/native-modules-ios#exporting-swift) section in the official React Native documentation.

## Documentation
  * [Basics concepts](./documentation/BASIC_CONCEPTS.md)
  * [Configuration](./documentation/CONFIGURATION.md)
  * [Tracking](./documentation/TRACKING.md)
  * [Fetching](./documentation/FETCHING.md)
  * [Push notifications](./documentation/PUSH.md)
  * [Anonymize customer](./documentation/ANONYMIZE.md)
  * [Example/Package development documentation](./documentation/DEVELOPMENT.md) - Learn how to build example application or the package itself
