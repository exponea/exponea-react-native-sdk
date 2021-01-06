//
//  ExponeaAppDelegate.m
//  Exponea
//
//  Created by Panaxeo on 28/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>
#import "ExponeaAppDelegate.h"

@implementation ExponeaAppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    if (launchOptions && [launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey]) {
        [Exponea handlePushNotificationOpenedWithUserInfo:[launchOptions valueForKey:UIApplicationLaunchOptionsRemoteNotificationKey]];
    }
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
    return YES;
}

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

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
    [Exponea continueUserActivity: userActivity];
    return false;
}

@end
