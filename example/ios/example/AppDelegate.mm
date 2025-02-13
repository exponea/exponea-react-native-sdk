#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"example";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  [UNUserNotificationCenter currentNotificationCenter].delegate = self;
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

- (BOOL)isUrlSupported:(NSURL *)url
{
  if (url.path == nil) {
    return false;
  }
  Boolean passed = false;
  if ([url.scheme  isEqual: @"exponea"]) {
    passed = true;
  } else if ([url.scheme  isEqual: @"https"]) {
    NSArray *validUniversalPaths = @[
      @"/exponea/track.html",
      @"/exponea/flush.html",
      @"/exponea/fetch.html",
      @"/exponea/inappcb.html",
      @"/exponea/anonymize.html",
    ];
    NSString *path = url.path;
    for (NSString* validPath in validUniversalPaths) {
      if ([path containsString: validPath]) {
        passed = true;
      }
    }
  }
  return passed;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  if (![self isUrlSupported: userActivity.webpageURL]) {
    return false;
  }
  [Exponea continueUserActivity: userActivity];
  return [RCTLinkingManager
          application:application
          continueUserActivity:userActivity
          restorationHandler:restorationHandler];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  if (![self isUrlSupported: url]) {
    return false;
  }
  return [RCTLinkingManager application:application openURL:url options:options];
}

//ExponeaRNAppDelegate


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
