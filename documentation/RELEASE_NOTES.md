## :arrow_double_up: [SDK version update guide](./VERSION_UPDATE.md)

## Release Notes
## Release Notes for 1.8.2
#### July 02, 2024
* Fixed:
  * Fixes an issue with Segmentation API for not supported event type - Segmentation API refactored to be compatible with native modules


## Release Notes for 1.8.1
#### June 20, 2024
* Features
  * Native iOS SDK updated to 2.26.2 and Android to 3.14.0
* Bug Fixes
  * Fixed: SDK Privacy manifest value is assigned under wrong key (in native iOS SDK)


## Release Notes for 1.8.0
#### April 30, 2024
* Features
  * Segmentation API feature support
  * Case of using RCTAppDelegate described more deeply in documentation
  * How to run example app documentation update


## Release Notes for 1.7.0
#### April 12, 2024
* Features
  * ReactNative support increased to 0.73.6
  * In-app content blocks behaviour handler added
  * Android PUSH notification permission request support
* Bug Fixes
  * Fixed: Duplicate projectToken in configuration example in configuration.md docu


## Release Notes for 1.6.1
#### March 21, 2024
* Features
  * Native iOS SDK updated to 2.24.0 version
* Bug Fixes
  * Fixed: Native iOS SDK - SDK notifies initialization finish prematurely and causes ignoring of postponed SDK API methods


## Release Notes for 1.6.0
#### November 29, 2023
* Features
  * In-app content block feature has been added into SDK
  * ReactNative support increased to 0.72.7
  * Anonymize feature has been described with more details in documentation
  * PUSH notification Payload structure has been documented
  * PUSH handling described with more details in documentation
  * Tracking of PUSH token has been described with more details in documentation
* Bug Fixes
  * Fixed: HMS token usage example in docu misused methods for GMS


## Release Notes for 1.5.2
#### July 13, 2023
* Features
  * Native iOS SDK updated to 2.16.4 version to XCode 14.3 support
* Bug Fixes
  * Fixed: Peer dependency to react was invalid


## Release Notes for 1.5.1
#### June 08, 2023
* Features
  * App Inbox styling used directly from native SDKs
* Bug Fixes
  * Fixed: Swift path fixed for XCode14.2+ in iOS part
  * Fixed: RN 71.8 has been used for any Android build; Now a REACT_NATIVE_VERSION guides a build process
  * Fixed: Android app build was crashing because of unnecessary codegenConfig
  * Fixed: Adding of Firebase dependency was missing from migration documentations 


## Release Notes for 1.5.0
#### May 23, 2023
* Features
  * Native SDK updated - Android to 3.6.1 and iOS to 2.16.2
  * ReactNative support increased to 0.71.8
  * API has been extended to match native SDKs as much as possible (additional tracking of Inapp messages, App Inbox, Push token and notifications)
  * Added InApp messages callback handler to define your customised message action handling


## Release Notes for 1.4.0
#### April 04, 2023
* Features
  * Native SDK updated - Android to 3.5.0 (Now we are able to show PUSH notification without requirement of runtime SDK init (from killed state), all events will be tracked)
  * Support section added to main Readme


## Release Notes for 1.3.1
#### March 07, 2023
* Bug Fixes
  * Fixed: Updates iOS SDK with AppInbox detail layout fixes


## Release Notes for 1.3.0
#### February 27, 2023
* Features
  * Added App Inbox feature with PUSH and HTML - Inbox message type support
  * Added support for Customer token authorization


## Release Notes for 1.2.0
#### December 08, 2022
* Features
  * Native SDK updated - Android to 3.2.1 and iOS to 2.13.1
  * Added Configuration flag to be able to disable tracking of default properties along with customer properties
  * Guiding documentation added for Push notification update after certain circumstances
  * Added documentation notes about tracking consent according to DSGVO/GDPR


## Release Notes for 1.1.2
#### December 06, 2022
* Features
  * React native upgraded to max supported version 0.70.6
  * Android minimal API increased to 21
  * iOS minimal SDK increased to 12.4
* Bug Fixes
  * Fixed: License established to MIT in npmjs


## Release Notes for 1.1.1
#### October 07, 2022
* Bug Fixes
  * Fixed: Native iOS SDK updated for Webview configuration setup compatible with swift5.7
  * Fixed: Unit tests and lint fixes due to the latest changes

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
  * Native Android SDK updated to 3.0.2 - [Android SDK Release notes](https://github.com/exponea/exponea-android-sdk/blob/main/Documentation/RELEASE_NOTES.md)
  * Native iOS SDK updated to 2.11.2 - [iOS SDK Release notest](https://documentation.bloomreach.com/engagement/docs/ios-sdk-release-notes#release-notes-for-2112)
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
