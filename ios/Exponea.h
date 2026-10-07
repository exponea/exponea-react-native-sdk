#import <ExponeaSpec/ExponeaSpec.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>

@interface Exponea : RCTEventEmitter <NativeExponeaSpec>

/// Forwards the APNs device token to the native ExponeaSDK for notification_state tracking.
/// Call from application:didRegisterForRemoteNotificationsWithDeviceToken: in your AppDelegate.
+ (void)handlePushNotificationToken:(NSData *)deviceToken;

/// Handles a push notification open from a UNNotificationResponse.
/// Call from userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler: in your AppDelegate.
+ (void)handlePushNotificationOpenedWithResponse:(UNNotificationResponse *)response;

/// Handles a push notification open from raw userInfo.
/// Call from application:didReceiveRemoteNotification:fetchCompletionHandler: in your AppDelegate.
+ (void)handlePushNotificationOpenedWithUserInfo:(NSDictionary *)userInfo;

/// Tracks a universal link campaign click.
/// Call from application:continueUserActivity:restorationHandler: in your AppDelegate.
/// Legacy AppDelegate lifecycle only: under UIScene, UIKit doesn't call this AppDelegate method
/// for universal links. Subclass ExponeaSceneDelegate in a Swift SceneDelegate instead.
+ (void)continueUserActivity:(NSUserActivity *)userActivity;

@end
