---
title: SDK development
excerpt: Work with the React Native SDK source code.
slug: react-native-sdk-development
categorySlug: integrations
parentDocSlug: react-native-sdk
---

# SDK development guide

The project consists of TypeScript code in the `/src` folder, a native Android module implementation in `/android`, and a native iOS module in `/ios`. To see SDK functionality in action, we provide an [example application](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-example-app) you can find in `/example`.

## TypeScript

* We use [Yarn](https://yarnpkg.com/) package manager, since it uses caching of packages and is overall faster to install dependencies than NPM. When developing new features and running the example app you'll need to do this a LOT. Run `yarn` to install dependencies.
* We use [TypeScript](https://www.typescriptlang.org/) to improve the developer experience when using the SDK. The code is located in `/src` and transpiled into `/lib`, which is published to NPM. Use `yarn run build` to transpile TypeScript to JavaScript (including type definitions).
* We use [Jest](https://jestjs.io/) to run unit tests. Use `yarn test` to run unit tests.
* We use [ESLint](https://eslint.org/) to check our code for issues and format it. Use `yarn run lint` to detect issues or `yarn run lint --fix` to fix them.


## Android

The native Android  module is written in Kotlin, since that's also used for our native [Android SDK](https://documentation.bloomreach.com/engagement/docs/android-sdk).

React Native is smart and installs Gradle dependencies from the `/node_modules` folder. Make sure you run `yarn` at the project root level to install all dependencies before working on the native Android module. You can work on the native module in Android Studio, or use Gradle wrapper directly.
* We use [ktlint](https://ktlint.github.io/) to format the code, use `./gradlew ktlintFormat` to fix code formatting issues.
* We use [JUnit4](https://junit.org/junit4/) to run unit tests. Use `./gradlew test` to run unit tests.

## iOS

The native iOS  module is written in Swift, since that's also used for our native [iOS SDK](https://documentation.bloomreach.com/engagement/docs/ios-sdk).

React Native is smart and installs dependencies from the `/node_modules` folder. Make sure you run `yarn` at the project root level to install all dependencies before working on the native iOS module. In `/ios`, you'll find an XCode workspace that you can ise to open and build/test the native module.

* We use [CocoaPods](https://cocoapods.org/) to manage dependencies. You'll see a `Podfile` that defines dependencies for the "standalone" XCode project that we use to develop the native iOS  module. These pods won't be part of released package. The `.podspec` file is located at package level. Run `pod install` before opening the XCode project and starting development.
* We use [SwiftLint](https://github.com/realm/SwiftLint) to format the code. After installing SwiftLint on your development machine, you can use `swiftlint` to check your code.
* We use [Quick](https://github.com/Quick/Quick) to write tests, you can run them directly in XCode.
