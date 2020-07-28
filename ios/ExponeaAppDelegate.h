//
//  ExponeaAppDelegate.h
//  Exponea
//
//  Created by Panaxeo on 28/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

// We partially declare the interface for swift Exponea here.
// When Exponea.m is included, native module is registered automatically causing it to be registered twice
@interface Exponea
 + (void)handlePushNotificationToken:(NSData * _Nonnull)deviceToken;
 + (void)handlePushNotificationOpenedWithUserInfo:(NSDictionary * _Nonnull)userInfo;
 + (void)handlePushNotificationOpenedWithResponse:(UNNotificationResponse * _Nonnull)response;
@end


@interface ExponeaAppDelegate: UIResponder <UIApplicationDelegate, UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
