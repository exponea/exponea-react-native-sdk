import ExponeaSDK
import UserNotifications

@objcMembers public class ExponeaPushHandler: NSObject {

    /// Universal link tracking used by `continueUserActivity(_:)`, replaceable in tests.
    static var universalLinkHandler: (NSUserActivity) -> Bool = {
        ExponeaSDK.Exponea.shared.handleUniversalLink($0)
    }

    public static func handlePushNotificationToken(_ deviceToken: Data) {
        ExponeaSDK.Exponea.shared.handlePushNotificationToken(deviceToken: deviceToken)
    }

    public static func handlePushNotificationOpened(response: UNNotificationResponse) {
        ExponeaSDK.Exponea.shared.handlePushNotificationOpened(response: response)
    }

    public static func handlePushNotificationOpened(userInfo: [AnyHashable: Any]) {
        ExponeaSDK.Exponea.shared.handlePushNotificationOpened(userInfo: userInfo)
    }

    /// Tracks a universal link campaign click. Ignores activities that are not
    /// `NSUserActivityTypeBrowsingWeb` or have no `webpageURL`.
    /// - Returns: `true` if the activity was a universal link and was tracked.
    @discardableResult
    public static func continueUserActivity(_ userActivity: NSUserActivity) -> Bool {
        universalLinkHandler(userActivity)
    }
}
