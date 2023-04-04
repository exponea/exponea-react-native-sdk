# iOS Push notification setup
The setup process for iOS is a bit more complicated, in some complex scenarios it's best to refer to [native iOS SDK documentation](https://github.com/exponea/exponea-ios-sdk/blob/develop/Documentation/PUSH.md)

> Exponea iOS SDK contains self-check functionality to help you successfully setup push notifications. Self-check will try to track push token, request Exponea backend to send silent push to the device and check the app is ready to open push notifications. To enable self-check call `Exponea.checkPushSetup()` **before** configuring the SDK.

> The behaviour of Push delivery and click tracking may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](https://github.com/exponea/exponea-ios-sdk/blob/develop/Documentation/TRACKING_CONSENT.md).

## Setup process
 1. [Setting application capabilities](#1-application-capabilities)
 2. [Setting Exponea application delegate](#2-exponea-app-delegate)
 3. [Updating Exponea configuration](#3-configuration)
 4. [Configuring Exponea to send push notifications](#4-configuring-exponea-to-send-push-notifications)
 5. [Authorizing the application for receiving push notifications](#5-authorizing-for-receiving-push-notifications)
 6. [Rich push notifications](#6-rich-push-notifications)(optional)

## 1. Application capabilities
You need to set up capabilities for your application. Open your application located in `ios` folder, select it on left panel in XCode, go to `Signing & Capabilities` and add capabilities:
 - `Push Notifications` required for alert push notifications.
 - `Background Modes` and select `Remote notifications` required for silent push notifications.
 - `App Groups` and create new app group for your app. This is required for application extensions that will handle push notification delivery and rich content.

 > In order to add `Push Notifications` capability, your Apple developer account needs to have paid membership. Without it, capability selector doesn't contain this capability at all.

![](images/capabilities.png)

## 2. Exponea App delegate
To react to push notification related events, the application's AppDelegate must implement a few methods. We've created a AppDelegate superclass to help you with that.
* Open `AppDelegate.h` and replace the contents with
  ``` objc
  #import <React/RCTBridgeDelegate.h>
  #import <UIKit/UIKit.h>
  #import <ExponeaRNAppDelegate.h>

  @interface AppDelegate : ExponeaRNAppDelegate<RCTBridgeDelegate>
  @end
  ```
* Open `AppDelegate.m` and add a super call to `didFinishLaunchingWithOptions`
  ``` objc
    - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
    {
      ...
      [super application:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
  }
  ```

> If you cannot/don't want to use ExponeaRNAppDelegate superclass, import `ExponeaRNAppDelegate.h` in `AppDelegate.m` and copy over the methods/add calls to Exponea to existing ones. You'll also have to set the `UNUserNotificationCenter` delegate and code for processing notifications to `didFinishLaunchingWithOptions`.

## 3. App group configuration
To enable push notifications, you'll need to set your app group created in the previous step. App group is a property of the `Configuration` javascript object.
``` typescript
Exponea.configure({
  ...
  ios: {
    appGroup: 'your app group'
  }
})
```

## 4. Configuring Exponea to send push notifications
To be able to send push notifications from Exponea backend, you need to connect Exponea web application to Apple Push Notification service. To do so, open Project settings in your Exponea app and navigate to Channels/Push notifications. Fill in all the field: `Team ID`, `Key ID`, `ES256 Private Key` and `Application Bundle ID`.

[Exponea web app push notification configuration](./APNS.md) guide contains screenshots showing where the data is located.

## 5. Authorizing for receiving push notifications
You'll need a special permission for notifications visible to the user. To request it, call `Exponea.requestIosPushAuthorization()` from **javascript**.
``` typescript 
Exponea.requestIosPushAuthorization()
.then(accepted => {
  console.log(`User has ${accepted ? 'accepted': 'rejected'} push notifications.`)
})
.catch(error => console.log(error.message))
```

#### Checklist: 
 - After being authorized to receive push notification, push notification token is tracked to customer profile as `apple_push_notification_id`
 - You should be able to receive a push notifications send from Exponea backend. You can learn how to do it in [Sending Push notifications guide](./PUSH_SEND.md). The received push notification won't contain image or actions, you'll need to setup Rich push notifications for that.

## 6. Rich push notifications
iOS application needs 2 application extensions to be able to show custom image and buttons in push notifications. To create an extension, open `ios` project in XCode and select `File/New/Target`
>  Make sure that the `iOS Deployment Target` of your extensions is the same as target for your main app. XCode will set it to latest when creating extensions.

![](./images/extension1.png)

### Notification Service Extension
Create new Notification Service Extension and give it `App Groups` capability selecting the group you created for your main app.
![](./images/extension2.png)
In the extension, you have to call Exponea methods for processing notification and handling timeouts.
``` swift
import UserNotifications
import ExponeaSDK_Notifications // we'll add this pod later

class NotificationService: UNNotificationServiceExtension {
    let exponeaService = ExponeaNotificationService(
        appGroup: "your-app-group" // don't forget to change this!
    )

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        exponeaService.process(request: request, contentHandler: contentHandler)
    }

    override func serviceExtensionTimeWillExpire() {
        exponeaService.serviceExtensionTimeWillExpire()
    }
}
```

> **NOTE:** Calling of `ExponeaNotificationService.process` is allowed before SDK initialization in case that previous initialization process was done. In such a case, methods will track events with configuration of last initialization. Please consider to do SDK initialization in `UIApplicationDelegate.application(application, didFinishLaunchingWithOptions)` or before this method in case of update of your application to apply a fresh new configuration.

### Notification Content Extension
Create new Notification Content Extension. By default the extension will contain storyboard file that you can delete, we'll change the default view controller implementation. Service extension that we created in the previous step will change the notification `categoryIdentifier` to `EXPONEA_ACTIONABLE`. We have to configure the content extension to display push notifications with that category. Open `Info.plist` in created content extension group and add `UNNotificationExtensionCategory`. Next, remove `NSExtensionMainStoryboard` and instead use `NSExtensionPrincipalClass` set to your view controller.
![](./images/extension3.png)

Your view controller class should just forward the notification to our service that will correctly display it.
``` swift
import UIKit
import UserNotifications
import UserNotificationsUI
import ExponeaSDK_Notifications // we'll add this pod later

class NotificationViewController: UIViewController, UNNotificationContentExtension {
    let exponeaService = ExponeaNotificationContentService()

    func didReceive(_ notification: UNNotification) {
        exponeaService.didReceive(notification, context: extensionContext, viewController: self)
    }
}
```

### Dependency configuration
Open `ios/Podfile` and add `ExponeaSDK-Notifications` for both of your extension targets.
```
# Don't forget to change names to your targets!

target 'ExampleNotificationService' do
  pod 'ExponeaSDK-Notifications'
end

target 'ExampleNotificationContent' do
  pod 'ExponeaSDK-Notifications'
end
```

Once done, run `pod install` in `ios` folder to install the dependencies. You should be able to run the application now.

### Retrieve Push notification token manually

In some cases, your application may need to retrieve current Push token while running. This step is needed especially in case of `Exponea.shared.anonymize()` method usage. Invoking of `anonymize` method will remove a Push notification token from storage, so it needs to be updated right after `anonymize` or before/after `identifyCustomer`, it depends on your Push notifications usage.

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

#### Checklist:
 - push notification with image and buttons sent from Exponea web app should be properly displayed on your device. Push delivery tracking should work.
 - if you don't see buttons in the expanded push notification, it means the content extension is **not** running. Double check `UNNotificationExtensionCategory` in the Info.plist - notice the placement inside `NSExtensionAttributes`. Check that the `iOS Deployment Target` is the same for extensions and main app.
  
## Great job!
You should now be able to send and receive push notifications from Exponea.

> To test your push notification setup, send push notifications to your device from Exponea backend following [Sending Push notifications guide](./PUSH_SEND.md)
