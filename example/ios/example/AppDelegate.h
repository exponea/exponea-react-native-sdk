#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <ExponeaRNAppDelegate.h>

@interface AppDelegate : RCTAppDelegate<UNUserNotificationCenterDelegate>
- (BOOL)isUrlSupported:(NSURL *)url;
@end
