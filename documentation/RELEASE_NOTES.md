## Release Notes
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
