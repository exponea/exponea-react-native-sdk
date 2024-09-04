---
title: iOS push notifications
excerpt: Enable push notifications on iOS using the React Native SDK
slug: react-native-sdk-push-ios
categorySlug: integrations
parentDocSlug: react-native-sdk-push-notifications
---

The React Native SDK relies on the native iOS SDK to handle push notifications on iOS. This guide provides shortened instructions for iOS within the context of the React Native SDK and refers to the [push notifications documentation for the iOS SDK](https://documentation.bloomreach.com/engagement/docs/ios-sdk-push-notifications) for details.

> 👍
>
> The SDK provides a push setup self-check feature to help developers successfully set up push notifications. The self-check will try to track the push token, request the Engagement backend to send a silent push to the device, and check if the app is ready to open push notifications.
>
> To enable the setup check, call `Exponea.checkPushSetup()` **before** [initializing the SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk):

> ❗️
>
> The behaviour of push notification delivery and click tracking may be affected by the tracking consent feature, which, if enabled, requires explicit consent for tracking. Refer to the [tracking consent documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent) for details.

## Prerequisites

To be able to send push notifications to iOS devices from Engagement, you must:

- Obtain an Apple Push Notification service (APNs) authentication token signing key
- Add and configure the Apple Push Notification Service integration in the Engagement web app

> 📘
>
> Follow the instructions in [Configure Apple Push Notification Service](https://documentation.bloomreach.com/engagement/docs/ios-sdk-configure-apns) in the native iOS SDK documentation if you haven't set this up yet.

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

![Add the `Push Notifications` capability](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/Documentation/images/ios-capabilities.png)

### Step 2: Implement application delegate methods

For your application to be able to respond to push notification-related events, its `AppDelegate` must implement several methods (see the [native iOS SDK documentation](https://documentation.bloomreach.com/engagement/docs/ios-sdk-push-notifications#step-3-implement-application-delegate-methods) for details).

[`ExponeaRNAppDelegate.m`](https://github.com/exponea/exponea-react-native-sdk/blob/main/ios/ExponeaRNAppDelegate.m) in the React Native SDK provides default implementations of these methods. We recommend that you extend `ExponeaRNAppDelegate` in your `AppDelegate`. 

1. Open `AppDelegate.h` and replace the contents with the following:
   ```swift
   #import <React/RCTBridgeDelegate.h>
   #import <UIKit/UIKit.h>
   #import <ExponeaRNAppDelegate.h>
 
   @interface AppDelegate : ExponeaRNAppDelegate<RCTBridgeDelegate>
   @end
   ```
2. Open `AppDelegate.m` and add a super call to `didFinishLaunchingWithOptions`:
   ```swift
     - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
     {
       ...
       [super application:application didFinishLaunchingWithOptions:launchOptions];
     return YES;
   }
   ```

If, for some reason, you don't want to or are not able to extend `ExponeaRNAppDelegate`, for example because you are using `RCTAppDelegate` introduced in React Native 0.71, import `ExponeaRNAppDelegate.h` in `AppDelegate.m` and copy over the methods and add calls to Exponea to the existing methods. You must set the `UNUserNotificationCenter` delegate and code for processing notifications to `didFinishLaunchingWithOptions`. Your implementation of `AppDelegate` should look like this:

```swift
#import <ExponeaRNAppDelegate.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
...
// Set UNUserNotificationCenter delegate
[UNUserNotificationCenter currentNotificationCenter].delegate = self;
...
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
// call Exponea continueUserActivity method
[Exponea continueUserActivity: userActivity];
...
}

...

// Methods copied from ExponeaRNAppDelegate
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [Exponea handlePushNotificationToken: deviceToken];
}

- (void)application:(UIApplication *)application
      didReceiveRemoteNotification:(NSDictionary *)userInfo
      fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [Exponea handlePushNotificationOpenedWithUserInfo:userInfo];
  completionHandler(UIBackgroundFetchResultNewData);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
      didReceiveNotificationResponse:(UNNotificationResponse *)response
      withCompletionHandler:(void (^)(void))completionHandler
{
  [Exponea handlePushNotificationOpenedWithResponse: response];
  completionHandler();
}

@end
```

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
.then(accepted => {
  console.log(`User has ${accepted ? 'accepted': 'rejected'} push notifications.`)
})
.catch(error => console.log(error.message))
```

> 👍
>
> Push notification authorization status is tracked as customer property `apple_push_notification_authorized`.

### Checklist:

 - [ ] Engagement should now be able to send push notifications to iOS devices. Refer to the [Creating a new notification](https://documentation.bloomreach.com/engagement/docs/mobile-push-notifications#creating-a-new-notification) guide for instructions.
 - [ ] At this point, your app doesn't show images or actions in push notifications. Follow the instructions to implement [rich push notifications](#rich-push-notifications) if you want to support this.

## Customization

This section describes the customizations you can implement once you have integrated the minimum push notification functionality.

### Rich push notifications

Rich push notifications can contain images and buttons. To enable this functionality, you must add two application extensions: a **Notification Service Extension** and a **Notification Content Extension**.

For each extension, follow the instructions in [Notification extensions](https://documentation.bloomreach.com/engagement/docs/ios-sdk-notification-extensions) in the native iOS SDK documentation to set it up correctly to use the Exponea Notification Service included in the iOS SDK.

Calling the `ExponeaNotificationContentService.didReceive()` method will enhance the notification body with the image and actions delivered within the `UNNotification` payload. Notification actions shown by `ExponeaNotificationContentService` are registered with configurations to open your application with required information and handle campaign clicks automatically.

#### Checklist:
 - [ ] Check that push notifications with images and buttons sent from Engagement are correctly displayed on your device. Push delivery tracking should work.
 - [ ] If you don't see buttons in the expanded push notification, the content extension is **not** running. Double check `UNNotificationExtensionCategory` in `Info.plist` - notice the placement inside `NSExtensionAttributes`. Check that the `iOS Deployment Target` is the same for the extensions and the main app.

### Retrieve push notification token manually

Sometimes, your application may need to retrieve the current push token while running. You can do this using the `Exponea.shared.trackPushToken` method.

A common use case is when the `Exponea.shared.anonymize()` method is called. Invoking `anonymize` removes the push notification token from local storage. Hence, it needs to be updated right after `anonymize`, or before or after `identifyCustomer`, depending on your push notifications usage.

``` swift
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
    override func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // show notification even if the app is in the foreground
        if #available(iOS 14, *) {
            completionHandler([.banner])
        } else {
            completionHandler([.alert])
        }
    }
```
