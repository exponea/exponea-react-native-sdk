import ExponeaSDK
import UserNotifications

@objcMembers public class ExponeaPushHandler: NSObject {

    public static func handlePushNotificationToken(_ deviceToken: Data) {
        ExponeaSDK.Exponea.shared.handlePushNotificationToken(deviceToken: deviceToken)
    }

    public static func handlePushNotificationOpened(response: UNNotificationResponse) {
        ExponeaSDK.Exponea.shared.handlePushNotificationOpened(response: response)
    }

    public static func handlePushNotificationOpened(userInfo: [AnyHashable: Any]) {
        ExponeaSDK.Exponea.shared.handlePushNotificationOpened(userInfo: userInfo)
    }

    public static func continueUserActivity(_ userActivity: NSUserActivity) {
        guard let url = userActivity.webpageURL else { return }
        ExponeaSDK.Exponea.shared.trackCampaignClick(url: url, timestamp: nil)
    }
}
