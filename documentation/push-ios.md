---
title: iOS push notifications for React Native SDK
slug: react-native-sdk-push-ios
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk-push-notifications
content:
  excerpt: Enable push notifications on iOS using the React Native SDK
---

The React Native SDK relies on the native iOS SDK to handle push notifications on iOS. This guide provides shortened instructions for iOS within the context of the React Native SDK and refers to the [push notifications documentation for the iOS SDK](https://documentation.bloomreach.com/engagement/docs/ios-sdk-push-notifications) for details.

> 👍
>
> The SDK provides a push setup self-check feature to help developers successfully set up push notifications. The self-check will try to track the push token, request the {user.mkg} backend to send a silent push to the device, and check if the app is ready to open push notifications.
>
> To enable the setup check, call `Exponea.checkPushSetup()` **before** [Initial setup for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk):

> ❗️Important
>
> SDK versions 2.5.0 and higher use event-based token tracking to support multiple mobile applications per project. Learn more about [Push notifications for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#token-tracking-via-notification_state-event).

> ❗️
>
> The behaviour of push notification delivery and click tracking may be affected by the tracking consent feature, which, if enabled, requires explicit consent for tracking. Refer to the [Tracking consent for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent) for details.

## Prerequisites

To be able to send push notifications to iOS devices from {user.mkg}, you must:

- Obtain an Apple Push Notification service (APNs) authentication token signing key
- Add and configure the Apple Push Notification Service integration in the {user.mkg} web app

> 📘
>
> Follow the instructions in [Configure Apple Push Notification Service](https://documentation.bloomreach.com/engagement/docs/ios-sdk-configure-apns) in the native iOS SDK documentation if you haven't set this up yet.

> ❗️
>
> The integration instructions assume your app uses the bare workflow. If your app uses Expo, see [Expo support](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-expo) to integrate iOS push notifications.

## Integration

This section describes the steps to add the minimum push notification functionality (receive alert notifications) to your app.

### Step 1: Enable push capabilities

Open the Xcode project located in the `ios` folder in your React Native project.

In Xcode, select your application target, and on the `Signing & Capabilities` tab, add the following capabilities:

- `Push Notifications`
  Required for alert push notifications.
- `Background Modes` (select `Remote notifications`)
  Required for silent push notifications.
- `App Groups` (create a new app group for your app)
  Required for application extensions that handle push notification delivery and rich content.

> ❗️
>
> An Apple developer account with a paid membership is required to add the `Push Notifications` capability.

![Add the `Push Notifications` capability](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/documentation/images/ios-capabilities.png)

### Step 2: Implement application delegate methods

For your application to be able to respond to push notification-related events, its `AppDelegate` must implement several methods (see the [native iOS SDK documentation](https://documentation.bloomreach.com/engagement/docs/ios-sdk-push-notifications#step-3-implement-application-delegate-methods) for details).

> ❗️
>
> The SDK version 3.0.0 removes the `ExponeaRNAppDelegate` base class that your `AppDelegate` was expected to extend. Implement the delegate methods directly, as shown below. If you are updating from 2.x, refer to the [SDK version update guide](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-version-update#update-from-version-2xx-to-3xx).

Open `AppDelegate.swift` and implement the following. A complete reference implementation is available in the example app's [`AppDelegate.swift`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/ios/ExponeaExample/AppDelegate.swift).

```swift
import ExponeaSDK
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Set the UNUserNotificationCenter delegate
    UNUserNotificationCenter.current().delegate = self
    ...
    return true
  }

  // MARK: - Push notification token

  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Exponea.shared.handlePushNotificationToken(deviceToken: deviceToken)
  }

  // MARK: - Remote notification

  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    Exponea.shared.handlePushNotificationOpened(userInfo: userInfo)
    completionHandler(.newData)
  }

  // MARK: - UNUserNotificationCenterDelegate

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    Exponea.shared.handlePushNotificationOpened(response: response)
    completionHandler()
  }
}
```

> 📘 UIScene lifecycle
>
> Push notification handling stays in your `AppDelegate` when your app adopts the UIScene lifecycle (`UIApplicationSceneManifest` in `Info.plist`). Keep these methods there, and keep setting the `UNUserNotificationCenter` delegate in `application(_:didFinishLaunchingWithOptions:)`. Universal links are the exception: under UIScene, UIKit delivers them to your `SceneDelegate`. Learn more in [Universal links for iOS](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-links#ios).

> 📘
>
> These methods are required. The React Native SDK doesn't swizzle application delegate methods, so it tracks push notification tokens and opens only through these calls. Implement them even if another SDK that swizzles the same methods, such as Firebase, is installed. For more information, see [Coexistence with Firebase and other push SDKs](#coexistence-with-firebase-and-other-push-sdks).

### Step 3: Configure app group

When you [initialize the SDK](https://documentation.bloomreach.com/engagement/docs/ios-sdk-setup#initialize-the-sdk), you must set the `appGroup` property to the app group you created in [step 1](#step-1-enable-push-capabilities):

```typescript
Exponea.configure({
  ...
  ios: {
    appGroup: 'your app group'
  }
})
```

### Step 4: Request notification permission

Your app requires explicit permission from the user to receive "alert" notifications that are visible to the user.

You can request authorization by calling `Exponea.requestPushAuthorization()`:

```typescript
Exponea.requestPushAuthorization()
  .then((accepted) => {
    console.log(
      `User has ${accepted ? 'accepted' : 'rejected'} push notifications.`
    );
  })
  .catch((error) => console.log(error.message));
```

> 📘 Note
>
> `notification_state` events reflect push notification permission status in the `valid` and `description` properties. For more details, see [Token tracking via notification_state event](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#token-tracking-via-notification_state-event).

### Checklist:

- [ ] {user.mkg} should now be able to send push notifications to iOS devices. Refer to the [Creating a new notification](https://documentation.bloomreach.com/engagement/docs/mobile-push-notifications#creating-a-new-notification) guide for instructions.
- [ ] At this point, your app doesn't show images or actions in push notifications. Follow the instructions to implement [rich push notifications](#rich-push-notifications) if you want to support this.

## Customization

This section describes the customizations you can implement once you have integrated the minimum push notification functionality.

### Rich push notifications

Rich push notifications can contain images and buttons. To enable this functionality, you must add two application extensions: a **Notification Service Extension** and a **Notification Content Extension**.

For each extension, follow the instructions in [Notification extensions](https://documentation.bloomreach.com/engagement/docs/ios-sdk-notification-extensions) in the native iOS SDK documentation to set it up correctly to use the Exponea Notification Service included in the iOS SDK.

> 🚧
>
> The React Native SDK installs the native iOS SDK through CocoaPods. In the native guide, follow the CocoaPods steps instead of the Swift Package Manager steps. Also add `ExponeaSDK-Notifications` to your extension targets in `ios/Podfile`. The native guide recommends migrating to Swift Package Manager, but keep using CocoaPods in a React Native app.
>
> An upcoming release is planned to include the native iOS SDK in the npm package and to install `ExponeaSDK-Notifications` from there. Updating to that release requires a one-time change to these `Podfile` lines. The [SDK version update guide](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-version-update) will describe the change.

Calling the `ExponeaNotificationContentService.didReceive()` method will enhance the notification body with the image and actions delivered within the `UNNotification` payload. Notification actions shown by `ExponeaNotificationContentService` are registered with configurations to open your application with required information and handle campaign clicks automatically.

> ⚠️ **Important**
>
> The `ExponeaSDK-Notifications` pod version must match the core iOS SDK version used by `react-native-exponea-sdk`. CocoaPods doesn't warn you when the two versions differ. A mismatch doesn't break notification display, but the SDK silently stops tracking `delivered` status in {user.br}. When you update the React Native SDK, check `ExponeaSDK` in `ios/Podfile.lock` and update `ExponeaSDK-Notifications` in your extension targets to the same version.

#### Checklist:

- [ ] Check that push notifications with images and buttons sent from {user.mkg} are correctly displayed on your device. Push delivery tracking should work.
- [ ] If you don't see buttons in the expanded push notification, the content extension is **not** running. Double check `UNNotificationExtensionCategory` in `Info.plist` - notice the placement inside `NSExtensionAttributes`. Check that the `iOS Deployment Target` is the same for the extensions and the main app.

### Rich push notifications for Expo managed apps

For Expo apps, enable rich push with the `enableRichPush` and `enableNotificationContentExtension` options of the SDK's packaged config plugin. See [Expo support](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-expo#ios). The custom config plugin previously shown here is no longer needed. Don't combine it with the packaged plugin, because both add the same notification extension targets.

### Coexistence with Firebase and other push SDKs

The React Native SDK works alongside other SDKs that handle push notifications, such as `@react-native-firebase/messaging`. No opt-out or special configuration is required on either side.

**How it works:**
* The React Native SDK disables the native iOS SDK's automatic push notification tracking. It doesn't swizzle any `UIApplicationDelegate` or `UNUserNotificationCenterDelegate` methods, and it doesn't take ownership of `UNUserNotificationCenter.delegate`. The SDK tracks push notification tokens and opens only through the `Exponea.shared.handlePushNotificationToken` and `Exponea.shared.handlePushNotificationOpened` calls in your `AppDelegate`. For more information, see [Step 2: Implement application delegate methods](#step-2-implement-application-delegate-methods).
* `@react-native-firebase/messaging` registers as a `GULAppDelegateSwizzler` interceptor, and its `UNUserNotificationCenter` category forwards to the previously set delegate. Your `AppDelegate` methods therefore still run, and the SDK tracks each {user.mkg} push notification open exactly once.

> ❗️
>
> Don't set `FirebaseAppDelegateProxyEnabled` to `NO` in `Info.plist`. It disables Firebase's own APNs token plumbing and has no effect on {user.mkg} push notifications.

The React Native configuration doesn't expose the native `automaticPushNotificationTracking` flag, so it's always disabled. Call `Exponea.shared.handlePushNotificationOpened` only once per notification open. If you also call it from another delegate or a Firebase callback, the SDK tracks the open twice and runs the push notification action twice.

**Notification service extensions.** iOS invokes only one Notification Service Extension per notification. If your app needs both {user.mkg} rich push notifications and Firebase's `FIRMessagingExtensionHelper`, call both from the same single extension target — you can't split them across separate extensions per vendor.

> 📘
>
> If you also use `expo-notifications`, a third component competes for the notification center delegate. Test cold start, background, and foreground notification opens once all components are integrated.

### Retrieve push notification token manually

Sometimes, your application may need to retrieve the current push token while running. You can do this using the `Exponea.shared.trackPushToken` method.

A common use case is when the `Exponea.shared.anonymize()` method is called. Invoking `anonymize` removes the push notification token from local storage. Hence, it needs to be updated right after `anonymize`, or before or after `identifyCustomer`, depending on your push notifications usage.

```swift
class YourClass {
    @objc(signOutAndSignIn:resolve:reject:)
    func signOutAndSignIn(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Exponea.exponeaInstance.anonymize()
        // anonymize removed Push token, so another identifyCustomer will not be assigned to push notifications
        Exponea.exponeaInstance.identifyCustomer(...)
        Messaging.messaging().token { token, error in
          if let token = token {
            Exponea.exponeaInstance.trackPushToken(token)
            resolve(nil)
          } else {
            reject(error)
          }
        }
    }
}
```

### Show foreground notifications

The system calls the following method if the app is in the foreground while a push notification arrives. The default implementation shows the push notification. You can override this method if you want to change the default behavior.

```swift
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // show notification even if the app is in the foreground
        if #available(iOS 14, *) {
            completionHandler([.banner])
        } else {
            completionHandler([.alert])
        }
    }
```
