import Foundation
import UIKit
import UserNotifications
import ExponeaSDK

/// The native SDK's own default delegate has no public initializer.
private final class NoOpInAppMessageDelegate: InAppMessageActionDelegate {
    let overrideDefaultBehavior = false
    let trackActions = true
    func inAppMessageShown(message: InAppMessage) {}
    func inAppMessageError(message: InAppMessage?, errorMessage: String) {}
    func inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton) {}
    func inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton?, interaction: Bool) {}
}

/// Stand-in for the native SDK behind `ExponeaBridge.exponeaInstance`. It records the App Inbox
/// calls the bridge makes and answers `fetchAppInboxItem` from `appInboxItems`; every other
/// requirement is a no-op.
final class FakeExponea: ExponeaType {
    enum FakeError: Error {
        case appInboxMessageNotFound
    }

    var isConfigured = true
    var configuration: Configuration?
    var customerCookie: String?
    var flushingMode: FlushingMode = .manual
    var pushNotificationsDelegate: PushNotificationManagerDelegate?
    var inAppMessagesDelegate: InAppMessageActionDelegate = NoOpInAppMessageDelegate()
    var appInboxProvider: AppInboxProvider = DefaultAppInboxProvider()
    var inAppContentBlocksManager: InAppContentBlocksManagerType?
    var inAppContentBlocksController: RuntimeInContentBlockControllerType?
    var safeModeEnabled = false
    var checkPushSetup = false
    var defaultProperties: [String: JSONConvertible]?

    // MARK: - Recorded App Inbox interaction

    var appInboxItems: [String: MessageItem] = [:]
    var fetchedAppInboxItemIds: [String] = []
    var openedMessages: [MessageItem] = []
    var openedMessagesWithoutConsent: [MessageItem] = []
    var clicks: [(action: MessageItemAction, message: MessageItem)] = []
    var clicksWithoutConsent: [(action: MessageItemAction, message: MessageItem)] = []

    func fetchAppInboxItem(_ messageId: String, completion: @escaping (ExponeaSDK.Result<MessageItem>) -> Void) {
        fetchedAppInboxItemIds.append(messageId)
        let result: ExponeaSDK.Result<MessageItem>
        if let item = appInboxItems[messageId] {
            result = .success(item)
        } else {
            result = .failure(FakeError.appInboxMessageNotFound)
        }
        // The native SDK completes asynchronously on the main queue.
        DispatchQueue.main.async { completion(result) }
    }

    func trackAppInboxOpened(message: MessageItem) {
        openedMessages.append(message)
    }

    func trackAppInboxOpenedWithoutTrackingConsent(message: MessageItem) {
        openedMessagesWithoutConsent.append(message)
    }

    func trackAppInboxClick(action: MessageItemAction, message: MessageItem) {
        clicks.append((action, message))
    }

    func trackAppInboxClickWithoutTrackingConsent(action: MessageItemAction, message: MessageItem) {
        clicksWithoutConsent.append((action, message))
    }

    // MARK: - Unused requirements

    func configure(
        _ integrationConfig: any IntegrationType,
        pushNotificationTracking: ExponeaSDK.Exponea.PushNotificationTracking,
        automaticSessionTracking: ExponeaSDK.Exponea.AutomaticSessionTracking,
        defaultProperties: [String: JSONConvertible]?,
        inAppContentBlocksPlaceholders: [String]?,
        flushingSetup: ExponeaSDK.Exponea.FlushingSetup,
        allowDefaultCustomerProperties: Bool?,
        advancedAuthEnabled: Bool?,
        manualSessionAutoClose: Bool,
        applicationID: String?
    ) {}

    func configure(
        projectToken: String,
        authorization: Authorization,
        baseUrl: String?,
        appGroup: String?,
        defaultProperties: [String: JSONConvertible]?,
        inAppContentBlocksPlaceholders: [String]?,
        allowDefaultCustomerProperties: Bool?,
        advancedAuthEnabled: Bool?,
        manualSessionAutoClose: Bool,
        applicationID: String?
    ) {}

    func configure(
        projectToken: String,
        projectMapping: [EventType: [ExponeaProject]],
        authorization: Authorization,
        baseUrl: String?,
        appGroup: String?,
        defaultProperties: [String: JSONConvertible]?,
        inAppContentBlocksPlaceholders: [String]?,
        allowDefaultCustomerProperties: Bool?,
        advancedAuthEnabled: Bool?,
        manualSessionAutoClose: Bool,
        applicationID: String?
    ) {}

    func configure(plistName: String) {}
    func configure(with configuration: Configuration, authContext: CustomerIdentity?) {}
    func setSdkAuthToken(_ token: String) {}
    func setJwtErrorHandler(_ handler: @escaping (JwtErrorContext) -> Void) {}
    func identifyCustomer(context: CustomerIdentity, properties: [String: JSONConvertible], timestamp: Double?) {}
    func trackEvent(properties: [String: JSONConvertible], timestamp: Double?, eventType: String?) {}
    func trackCampaignClick(url: URL, timestamp: Double?) {}
    func handleUniversalLink(_ userActivity: NSUserActivity) -> Bool { false }
    func trackPayment(properties: [String: JSONConvertible], timestamp: Double?) {}
    func identifyCustomer(customerIds: [String: String]?, properties: [String: JSONConvertible], timestamp: Double?) {}
    func flushData() {}
    func flushData(completion: ((FlushResult) -> Void)?) {}
    func trackPushToken(_ token: Data) {}
    func trackPushToken(_ token: String) {}
    func trackPushToken(_ token: String?) {}
    func handlePushNotificationToken(deviceToken: Data) {}
    func trackCurrentPushNotificationToken() {}
    func handlePushNotificationToken(token: String) {}
    func trackPushReceived(content: UNNotificationContent) {}
    func trackPushReceived(userInfo: [AnyHashable: Any]) {}
    func trackPushReceivedWithoutTrackingConsent(content: UNNotificationContent) {}
    func trackPushReceivedWithoutTrackingConsent(userInfo: [AnyHashable: Any]) {}
    func trackPushOpened(with userInfo: [AnyHashable: Any]) {}
    func handlePushNotificationOpened(response: UNNotificationResponse) {}
    func handlePushNotificationOpened(userInfo: [AnyHashable: Any], actionIdentifier: String?) {}
    func trackPushOpenedWithoutTrackingConsent(with userInfo: [AnyHashable: Any]) {}
    func handlePushNotificationOpenedWithoutTrackingConsent(userInfo: [AnyHashable: Any], actionIdentifier: String?) {}
    func trackInAppMessageClickWithoutTrackingConsent(message: InAppMessage, buttonText: String?, buttonLink: String?) {}
    func trackInAppMessageCloseClickWithoutTrackingConsent(message: InAppMessage, buttonText: String?, isUserInteraction: Bool?) {}
    func markAppInboxAsRead(_ message: MessageItem, completition: ((Bool) -> Void)?) {}
    func getAppInboxButton() -> UIButton { UIButton() }
    func getAppInboxListViewController() -> UIViewController { UIViewController() }
    func getAppInboxListViewController(onItemClicked: @escaping (MessageItem, Int) -> Void) -> UIViewController { UIViewController() }
    func getAppInboxDetailViewController(_ messageId: String) -> UIViewController { UIViewController() }
    func trackSessionStart() {}
    func trackSessionEnd() {}
    func fetchRecommendation<T: RecommendationUserData>(
        with options: RecommendationOptions,
        completion: @escaping (ExponeaSDK.Result<RecommendationResponse<T>>) -> Void
    ) {}
    func fetchConsents(completion: @escaping (ExponeaSDK.Result<ConsentsResponse>) -> Void) {}
    func fetchAppInbox(completion: @escaping (ExponeaSDK.Result<[MessageItem]>) -> Void) {}
    func fetchAppInboxMessages(completion: @escaping (ExponeaSDK.Result<[MessageItem]>) -> Void) {}
    func anonymize() {}
    func anonymize(exponeaProject: ExponeaProject, projectMapping: [EventType: [ExponeaProject]]?) {}
    func anonymize(exponeaIntegrationType: any ExponeaIntegrationType, exponeaProjectMapping: [EventType: [ExponeaProject]]?) {}
    func anonymize(completion: (() -> Void)?) {}
    func trackInAppMessageClick(message: InAppMessage, buttonText: String?, buttonLink: String?) {}
    func trackInAppMessageClose(message: InAppMessage, buttonText: String?, isUserInteraction: Bool?) {}
    func trackInAppContentBlockClick(placeholderId: String, action: InAppContentBlockAction, message: InAppContentBlockResponse) {}
    func trackInAppContentBlockClickWithoutTrackingConsent(placeholderId: String, action: InAppContentBlockAction, message: InAppContentBlockResponse) {}
    func trackInAppContentBlockClose(placeholderId: String, message: InAppContentBlockResponse) {}
    func trackInAppContentBlockCloseWithoutTrackingConsent(placeholderId: String, message: InAppContentBlockResponse) {}
    func trackInAppContentBlockShown(placeholderId: String, message: InAppContentBlockResponse) {}
    func trackInAppContentBlockShownWithoutTrackingConsent(placeholderId: String, message: InAppContentBlockResponse) {}
    func trackInAppContentBlockError(placeholderId: String, message: InAppContentBlockResponse, errorMessage: String) {}
    func trackInAppContentBlockErrorWithoutTrackingConsent(placeholderId: String, message: InAppContentBlockResponse, errorMessage: String) {}
    func getSegments(force: Bool, category: SegmentCategory, result: @escaping TypeBlock<[SegmentDTO]>) {}
    func stopIntegration() {}
    func stopIntegration(completion: (() -> Void)?) {}
    func clearLocalCustomerData(appGroup: String) {}
}
