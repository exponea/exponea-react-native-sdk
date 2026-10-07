import UIKit

/// UIScene lifecycle helpers for React Native hosts.
///
/// Under UIScene, UIKit delivers universal links to the `SceneDelegate` instead of
/// `application(_:continue:restorationHandler:)`, and `launchOptions` in
/// `didFinishLaunchingWithOptions` no longer contain the launch URL or user activity.
/// Swift hosts subclass `ExponeaSceneDelegate` (native SDK) for tracking and use `launchOptions(from:)`
/// when starting React Native.
public class ExponeaSceneHandler {

    /// Rebuilds `launchOptions` from scene connection options, so that `Linking.getInitialURL()`
    /// returns the launch URL on cold launch. Pass the result to
    /// `RCTReactNativeFactory.startReactNative(withModuleName:in:launchOptions:)`.
    public static func launchOptions(
        from connectionOptions: UIScene.ConnectionOptions
    ) -> [UIApplication.LaunchOptionsKey: Any] {
        launchOptions(url: connectionOptions.urlContexts.first?.url, userActivities: connectionOptions.userActivities)
    }

    static func launchOptions(
        url: URL?,
        userActivities: Set<NSUserActivity>
    ) -> [UIApplication.LaunchOptionsKey: Any] {
        var launchOptions: [UIApplication.LaunchOptionsKey: Any] = [:]
        if let url = url {
            launchOptions[.url] = url
        }
        if let userActivity = browsingWebUserActivity(from: userActivities) {
            // Keys read by RCTLinkingManager getInitialURL
            launchOptions[.userActivityDictionary] = [
                UIApplication.LaunchOptionsKey.userActivityType.rawValue: userActivity.activityType,
                "UIApplicationLaunchOptionsUserActivityKey": userActivity
            ]
        }
        return launchOptions
    }

    static func browsingWebUserActivity(from userActivities: Set<NSUserActivity>) -> NSUserActivity? {
        userActivities.first {
            $0.activityType == NSUserActivityTypeBrowsingWeb && $0.webpageURL != nil
        }
    }
}
