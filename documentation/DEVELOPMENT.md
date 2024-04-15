# Package development guide
Package consists of typescript code in `/src` folder, Android native module implementation in `/android` and native iOS module in `/ios`. To see SDK functionality in action, we have built an example application you can find in `/example`.

## Typescript
* We use [yarn](https://yarnpkg.com/) package manager, since it uses caching of packages and is overall faster to install dependencies than npm. When developing new features and running example app you'll need to do this a LOT. Run `yarn` to install dependencies.
* We use [typescript](https://www.typescriptlang.org/) to improve developer experience when using this package. Code is located in `/src` and transpiled into `/lib` that is published to npm. Use `yarn run build` to transpile typescript to javascript(including type definitions).
* We use [jest](https://jestjs.io/) to run unit tests. Use `yarn test` to run unit tests.
* We use [eslint](https://eslint.org/) to check our code for issues and format it. Use `yarn run lint` to detect issues or `yarn run lint --fix` to fix them.


## Android
Android native module is written in Kotlin, since that's also used for our native SDK. React Native is smart and installs gradle dependencies from `/node_modules` folder. Make sure you run `yarn` at package level to install all dependencies before working on Android native module. You can work on native module in Android studio, or use gradle wrapper directly. 
* We use [ktlint](https://ktlint.github.io/) to format the code, use `./gradlew ktlintFormat` to fix code formatting issues.
* We use [JUnit4](https://junit.org/junit4/) to run unit tests. Use `./gradlew test` to run unit tests.

## iOS
iOS native module is written in Swift, since that's also used for our native SDK. React Native is smart and installs gradle dependencies from `/node_modules` folder. Make sure you run `yarn` at package level to install all dependencies before working on iOS native module. In `/ios`, you'll find a XCode workspace that you can open and build/test the native module.

* We use [cocoapods](https://cocoapods.org/) to manage dependencies. You'll see a `Podfile` that defines dependencies for "standalone" XCode project that we use to develop iOS native module. These pods won't be part of released package, `.podspec` file is located at package level. Run `pod install` before opening XCode project and starting development.
* We use [swiftlint](https://github.com/realm/SwiftLint) to format the code. After installing swiftlint on your develment machine, you can use `swiftlint` to check your code.
* We use [quick](https://github.com/Quick/Quick) to write tests, you can run them directly in XCode.


## Example application
To test and showcase the functionality of the SDK, we provide an example application in `/example`. Example application is linked to the package directly, but there are some caveats.

### Prerequisites for running the example application
* Linked package is linked as a symbolic link, which includes `node_modules` as well. This results in Metro bundler running 2 instances of React and errors on app startup. Make sure you `rm -rf node_modules` in package before running `yarn` in `example` folder.
* Same goes for `Pods` in `ios` folder. If you see errors building for iOS, try `rm -rf ios/Pods`.
* When making changes to javascript part of the package, don't forget to build it with `yarn run build`.
* When making changes to iOS native module, you sometimes need to reinstall the dependency for example app with `pod install` in `example/ios`

### Running example application
0. check previous section and make sure you followed all the necessary steps, package itself should be clean. 
1. `cd example`
2. `yarn` to install dependencies.
3. you can start Metro bundler on your own using `yarn run start`
4. `react-native run-android --mode=GmsDebug` to build and run the Android application for GMS.  Use `HmsDebug` to build application for Huawei devices without GooglePlay services but with HMS Core. For React Native version <0.73, use `--variant` instead of `--mode`, see [#2026](https://github.com/react-native-community/cli/pull/2026). You can also open `android` folder in Android Studio and build yourself. 
5. `pod install` in `example/ios` to install dependencies for ios application.
6. `react-native run-ios` to build and run the iOS application. You can also open workspace in `ios` folder in XCode and build yourself. It's recommended - you'll get logs easily this way.

> You can select iOS simulator on which you want the application to run with ` react-native run-ios --simulator="iPhone SE (2nd generation)"`. Android only supports one device attached at a time. You can start your preferred emulator in Android Device Manager before running `react-native run-android`.

### Testing and linting
* You can check typescript typings with `yarn run build`
* There are currently no unit tests for Example application, but tests can be run run `yarn test`
* We use eslint for linting, run it with `yarn run lint`.