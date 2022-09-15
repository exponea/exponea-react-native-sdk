## :arrow_double_up: [SDK version update guide](./VERSION_UPDATE.md)

## Release Notes
## Release Notes for 1.1.0
#### September 01, 2022
* Features
  * Added a support of HTML InApp messages
  * Shows a warn log for developer if old SDK version is used
* Bug Fixes
  * Fixed: Version upgrade guide is linked from README and Release Notes documentations
  * Fixed: License established to MIT
  * Fixed: Duplicated push open action track is not called on app cold start

## Release Notes for 1.0.0
#### February 15, 2022
* Features
  * React native upgraded to 0.67
  * Native Android SDK updated to 3.0.2 - [Android SDK Release notes](https://github.com/exponea/exponea-android-sdk/blob/develop/Documentation/RELEASE_NOTES.md)
  * Native iOS SDK updated to 2.11.2 - [iOS SDK Release notest](https://github.com/exponea/exponea-ios-sdk/blob/develop/Documentation/RELEASE_NOTES.md#release-notes-for-2112)
  * Gradle 7 support
* Bug Fixes
  * Fixed: Android 12 issues


## Release Notes for 0.5.2
#### July 12, 2021
* Features
  * Native iOS SDK updated to 2.11.1
  * Native Android SDK updated to 2.9.5
  * Android push icon and accent color can now be specified in a more user-friendly way (by resource name instead of resource ID integer). New configuration parameters are available - `pushIconResourceName` and `pushAccentColorName`. In addition, accent color can be set with RGBA channels using the new configuration parameter `pushAccentColorRGBA`.


## Release Notes for 0.5.1
#### May 31, 2021
* Features
  * Documentation improvements
  * Native iOS SDK updated to 2.11.0
  * Native Android SDK updated to 2.9.4
  * React native upgraded to 0.64
* Bug Fixes
  * Fixed: ExponeaAppDelegate renamed to ExponeaRNAppDelegate to avoid swift compiler error "'ExponeaAppDelegate' has different definitions in different modules"


## Release Notes for 0.5.0
#### January 08, 2021
* Features
  * Universal link/App link tracking added. There is some setup required that is described in [documentation](./LINKING.md)
* Bug Fixes
  * Fixed: All user defined data is now forwarded to Javascript when fetching recommendations on iOS
  * **BREAKING CHANGE:**
  The SDK now processes notification open events that start the application on iOS. Before, the app had to running and minimized for the notification to be processed. To respond to notifications that start the application, the SDK needs to run some processing in `application:didFinishLaunchingWithOptions`.
  `ExponeaAppDelegate` now implements this method where it processes the notification and sets notification center delegate. Your `AppDelegate application:didFinishLaunchingWithOptions` now requires a **call to super** `[super application:application didFinishLaunchingWithOptions:launchOptions];`. Calling `[UNUserNotificationCenter currentNotificationCenter].delegate = self;` is no longer required. See [iOS push notifications documentation](./PUSH_IOS.md) for more details.

## Release Notes for 0.4.1
#### January 04, 2021
* Version 0.4.0 is a bad release that contains development Cocoapods. This version is just a re-release of 0.4.0

## Release Notes for 0.4.0 (DEPRECATED)
#### November 23, 2020
* Features
  * Native iOS SDK updated to 2.9.3
  * Native Android SDK updated to 2.9.0
  * Added runtime configuration of default properties

## Release Notes for 0.3.0
#### October 07, 2020
* Features
  * Native iOS SDK updated to 2.9.2
  * Native Android SDK updated to 2.8.3

### Release Notes for 0.2.0
#### August 11, 2020
* Features
  * Documentation improvements
  * Native iOS SDK updated to 2.8.1
  * Native Android SDK updated to 2.8.0

### Release Notes for 0.1.0
#### July 2, 2020
* Features
  * Initial release with with (almost)feature-complete functionality of the mobile SDKs.
