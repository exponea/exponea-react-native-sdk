---
title: Development for React Native SDK
slug: react-native-sdk-development
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk
content:
  excerpt: Work with the React Native SDK source code.
---

# Development for React Native SDK

The project consists of TypeScript code in the `/src` folder, a native Android module implementation in `/android`, and a native iOS module in `/ios`. To see SDK functionality in action, we provide an [Example app for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-example-app) you can find in `/example`.

## TypeScript

- We use [Yarn](https://yarnpkg.com/) package manager, since it uses caching of packages and is overall faster to install dependencies than NPM. When developing new features and running the example app you'll need to do this a LOT. Run `yarn` to install dependencies.
- We use [TypeScript](https://www.typescriptlang.org/) to improve the developer experience when using the SDK. The code is located in `/src` and transpiled into `/lib`, which is published to NPM. Use `yarn run build` to transpile TypeScript to JavaScript (including type definitions).
- We use [Jest](https://jestjs.io/) to run unit tests. Use `yarn test` to run unit tests.
- We use [ESLint](https://eslint.org/) to check our code for issues and format it. Use `yarn run lint` to detect issues or `yarn run lint --fix` to fix them.

## Android

The native Android module is written in Kotlin, since that's also used for our native [Android SDK](https://documentation.bloomreach.com/engagement/docs/android-sdk).

React Native is smart and installs Gradle dependencies from the `/node_modules` folder. Make sure you run `yarn` at the project root level to install all dependencies before working on the native Android module. `/android` has no Gradle wrapper of its own: open `/example/android` in Android Studio, or use its Gradle wrapper, which builds the native module as `:react-native-exponea-sdk`.

- We use [JUnit4](https://junit.org/junit4/) to run unit tests. Use `./gradlew :react-native-exponea-sdk:testDebugUnitTest` in `/example/android` to run unit tests.

## iOS

The native iOS module is written in Swift, since that's also used for our native [iOS SDK](https://documentation.bloomreach.com/engagement/docs/ios-sdk).

React Native is smart and installs dependencies from the `/node_modules` folder. Make sure you run `yarn` at the project root level to install all dependencies before working on the native iOS module. `/ios` has no Xcode project of its own: open the example app's workspace, `/example/ios/ExponeaExample.xcworkspace`, to build and test the native module.

- We use [CocoaPods](https://cocoapods.org/) to manage dependencies. The `.podspec` file is located at package level. Run `bundle install` in `/example` and then `bundle exec pod install` in `/example/ios` before opening the workspace in Xcode.
- We use [XCTest](https://developer.apple.com/documentation/xctest) to write tests. The `ExponeaExample` scheme includes the native module's `react-native-exponea-sdk-Unit-Tests`, so you can run them directly in Xcode.
