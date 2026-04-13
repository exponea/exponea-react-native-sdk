import Foundation
import ExponeaSDK
import UIKit
import UserNotifications
import React

// Queried via NSProtocolFromString("IsExponeaReactNativeSDK") by the native iOS SDK to
// detect that it is running inside a React Native app, which selects the correct layout
// path in InAppDialogContainerView (avoids double-counting safe area insets).
@objc(IsExponeaReactNativeSDK)
protocol IsExponeaReactNativeSDK {}

// Queried via NSClassFromString("ExponeaRNVersion") by the native iOS SDK to retrieve
// the React Native SDK version string for analytics/diagnostics.
@objc(ExponeaRNVersion)
public class ExponeaRNVersion: NSObject, ExponeaVersionProvider {
    required public override init() {}
    public func getVersion() -> String { "3.0.0" }
}

@objcMembers public class ExponeaBridge: NSObject {

   static let shared = ExponeaBridge()

    static var exponeaInstance: ExponeaType = ExponeaSDK.Exponea.shared

    // Listener state for event emission
    private var pushOpenedListenerSet = false
    private var pushReceivedListenerSet = false
    private var pendingOpenedPush: [AnyHashable: Any]?
    private var pendingReceivedPush: [AnyHashable: Any]?

    // In-app message listener state
    private var inAppCallbackListenerSet = false
    private var inAppOverrideDefaultBehavior: Bool = false
    private var inAppTrackActions: Bool = true

    // Segmentation callback storage keyed by category name
    private var segmentationCallbacksByCategory: [String: SegmentCallbackData] = [:]

    // Event emitter reference for sending events to JavaScript
    public weak var eventEmitter: RCTEventEmitter?

    public func isConfigured() -> Bool {
        return ExponeaBridge.exponeaInstance.isConfigured
    }

    /// Configure Exponea SDK with the provided configuration
    /// - Parameter configMap: Dictionary containing configuration parameters
    /// - Parameter success: Success callback called when configuration succeeds
    /// - Parameter failure: Failure callback called when configuration fails
    public func configure(
        configMap: [AnyHashable: Any],
        success: @escaping () -> Void,
        failure: @escaping (Error) -> Void
    ) {
        let parser = ConfigurationParser(configMap as NSDictionary)

        guard !ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.alreadyConfigured)
            return
        }

        do {
            ExponeaBridge.exponeaInstance.configure(
                try parser.parseProjectSettings(),
                pushNotificationTracking: try parser.parsePushNotificationTracking(),
                automaticSessionTracking: try parser.parseSessionTracking(),
                defaultProperties: try parser.parseDefaultProperties(),
                inAppContentBlocksPlaceholders: try parser.parseInAppContentBlocksPlaceholders(),
                flushingSetup: try parser.parseFlushingSetup(),
                allowDefaultCustomerProperties: try parser.parseAllowDefaultCustomerProperties(),
                advancedAuthEnabled: try parser.parseAdvancedAuthEnabled(),
                manualSessionAutoClose: try parser.parseManualSessionAutoClose(),
                applicationID: try parser.parseApplicationId()
            )

            // Verify configuration succeeded
            if ExponeaBridge.exponeaInstance.isConfigured {
                ExponeaBridge.exponeaInstance.inAppMessagesDelegate = self
                success()
            } else {
                failure(ExponeaError.configurationError)
            }
        } catch {
            failure(error)
        }
    }

    // MARK: - Customer Methods
    public func getCustomerCookie() -> String? {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return nil
        }
        return ExponeaSDK.Exponea.shared.customerCookie
    }

    // MARK: - Default Properties Methods
    public func getDefaultProperties() -> [AnyHashable: Any]? {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return nil
        }
        // Return empty dictionary if no default properties are set, rather than nil
        return (ExponeaSDK.Exponea.shared.defaultProperties as? [AnyHashable: Any]) ?? [:]
    }

    public func setDefaultProperties(_ properties: [AnyHashable: Any]) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let parsedProperties = try JsonDataParser.parse(dictionary: properties as NSDictionary)
            ExponeaSDK.Exponea.shared.defaultProperties = parsedProperties
            return true
        } catch {
            print("ExponeaBridge: Failed to parse default properties: \(error)")
            return false
        }
    }

    public func identifyCustomer(customerIds: [AnyHashable: Any], properties: [AnyHashable: Any]) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            // Parse customer IDs - must be strings
            var parsedCustomerIds: [String: String] = [:]
            for (key, value) in customerIds {
                guard let keyString = key as? String,
                      let valueString = value as? String else {
                    throw ExponeaDataError.invalidType(for: "customerIds must be string key-value pairs")
                }
                parsedCustomerIds[keyString] = valueString
            }

            // Parse properties
            let parsedProperties = try JsonDataParser.parse(dictionary: properties as NSDictionary)

            // Call SDK
            ExponeaSDK.Exponea.shared.identifyCustomer(
                customerIds: parsedCustomerIds,
                properties: parsedProperties,
                timestamp: nil
            )
            return true
        } catch {
            print("ExponeaBridge: Failed to identify customer: \(error)")
            return false
        }
    }

    public func anonymize(
        exponeaProject: [AnyHashable: Any]?,
        projectMapping: [AnyHashable: Any]?,
        success: @escaping () -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }

        do {
            // If no project switching, simple anonymize
            if exponeaProject == nil && projectMapping == nil {
                ExponeaSDK.Exponea.shared.anonymize()
                success()
                return
            }

            // Parse new project if provided, otherwise use current main project
            var parsedProject: ExponeaProject? = nil
            if let projectDict = exponeaProject as? NSDictionary {
                let defaultBaseUrl = ExponeaSDK.Constants.Repository.baseUrl
                parsedProject = try ConfigurationParser.parseExponeaProject(
                    dictionary: projectDict,
                    defaultBaseUrl: defaultBaseUrl
                )
            }

            // Get the project to use - parsed project or current main project
            guard let projectToUse = parsedProject ?? ExponeaSDK.Exponea.shared.configuration?.mainProject else {
                failure(ExponeaError.fetchError(description: "No project available for anonymize. Either provide exponeaProject or ensure SDK has a mainProject configured."))
                return
            }

            // Parse project mapping if provided
            var parsedMapping: [EventType: [ExponeaProject]]? = nil
            if let mappingDict = projectMapping as? NSDictionary {
                let baseUrl = projectToUse.baseUrl
                parsedMapping = try ConfigurationParser.parseProjectMapping(
                    dictionary: mappingDict,
                    defaultBaseUrl: baseUrl
                )
            }

            // Call SDK with project switching
            ExponeaSDK.Exponea.shared.anonymize(
                exponeaProject: projectToUse,
                projectMapping: parsedMapping
            )
            success()
        } catch {
            // Propagate parsing errors with full details
            failure(error)
        }
    }

    // MARK: - Event Tracking Methods
    public func trackEvent(eventName: String, properties: [AnyHashable: Any], timestamp: NSNumber?) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let parsedProperties = try JsonDataParser.parse(dictionary: properties as NSDictionary)
            let timestampValue: Double? = timestamp?.doubleValue

            ExponeaSDK.Exponea.shared.trackEvent(
                properties: parsedProperties,
                timestamp: timestampValue,
                eventType: eventName
            )
            return true
        } catch {
            print("ExponeaBridge: Failed to track event: \(error)")
            return false
        }
    }

    public func trackSessionStart(timestamp: NSNumber?) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        // Note: iOS SDK does not support custom timestamps for session tracking
        // The timestamp parameter is accepted for API compatibility but ignored
        ExponeaSDK.Exponea.shared.trackSessionStart()
        return true
    }

    public func trackSessionEnd(timestamp: NSNumber?) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        // Note: iOS SDK does not support custom timestamps for session tracking
        // The timestamp parameter is accepted for API compatibility but ignored
        ExponeaSDK.Exponea.shared.trackSessionEnd()
        return true
    }

    // MARK: - Fetch Operations
    public func fetchConsents(success: @escaping ([NSDictionary]) -> Void, failure: @escaping (Error) -> Void) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }

        ExponeaSDK.Exponea.shared.fetchConsents { (result: ExponeaSDK.Result<ConsentsResponse>) in
            switch result {
            case .success(let response):
                let consentDicts = response.consents.map { TypeConverters.consentToDict($0) }
                success(consentDicts)
            case .failure(let error):
                failure(error)
            }
        }
    }

    @objc(fetchRecommendationsWithOptions:success:failure:)
    public func fetchRecommendations(options: [AnyHashable: Any], success: @escaping ([NSDictionary]) -> Void, failure: @escaping (Error) -> Void) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured for fetchRecommendations")
            failure(ExponeaError.notConfigured)
            return
        }

        print("ExponeaBridge: Parsing recommendation options: \(options)")

        do {
            let recommendationOptions = try TypeConverters.parseRecommendationOptions(from: options as NSDictionary)

            print("ExponeaBridge: Fetching recommendations with options: \(recommendationOptions)")

            ExponeaSDK.Exponea.shared.fetchRecommendation(with: recommendationOptions) { (result: ExponeaSDK.Result<RecommendationResponse<AllRecommendationData>>) in
                print("ExponeaBridge: Received recommendation result")
                switch result {
                case .success(let response):
                    guard let recommendations = response.value else {
                        print("ExponeaBridge: Empty recommendation result")
                        failure(ExponeaError.fetchError(description: "Empty recommendation result"))
                        return
                    }
                    print("ExponeaBridge: Converting \(recommendations.count) recommendations to dictionaries")
                    let recommendationDicts = recommendations.map { TypeConverters.recommendationToDict($0) }
                    success(recommendationDicts)
                case .failure(let error):
                    print("ExponeaBridge: Recommendation fetch failed: \(error)")
                    failure(error)
                }
            }
        } catch {
            print("ExponeaBridge: Error parsing recommendation options: \(error)")
            failure(error)
        }
    }

    // MARK: - Push Authorization
    public func requestIosPushAuthorization(completion: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.badge, .alert, .sound]) { (granted, _) in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            completion(granted)
        }
    }

    public func requestPushAuthorization(completion: @escaping (Bool) -> Void) {
        print("[ExponeaSDK] Requesting push notification authorization...")
        UNUserNotificationCenter.current().requestAuthorization(options: [.badge, .alert, .sound]) { (granted, error) in
            if let error = error {
                print("[ExponeaSDK] Push authorization error: \(error.localizedDescription)")
            }
            print("[ExponeaSDK] Push authorization granted: \(granted)")
            if granted {
                DispatchQueue.main.async {
                    print("[ExponeaSDK] Registering for remote notifications...")
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            completion(granted)
        }
    }

    // MARK: - Push Setup
    public func checkPushSetup() {
        ExponeaSDK.Exponea.shared.checkPushSetup = true
    }

    // MARK: - Session Configuration Methods
    public func setAutomaticSessionTracking(_ enabled: Bool) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured,
              let exponea = ExponeaBridge.exponeaInstance as? ExponeaInternal else {
            return false
        }
        if enabled {
            let timeout = exponea.configuration?.sessionTimeout ?? Constants.Session.defaultTimeout
            exponea.setAutomaticSessionTracking(automaticSessionTracking: .enabled(timeout: timeout))
        } else {
            exponea.setAutomaticSessionTracking(automaticSessionTracking: .disabled)
        }
        return true
    }

    public func setSessionTimeout(_ timeout: Double) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured,
              let exponea = ExponeaBridge.exponeaInstance as? ExponeaInternal else {
            return false
        }
        exponea.setAutomaticSessionTracking(automaticSessionTracking: .enabled(timeout: timeout))
        return true
    }

    public func setAutoPushNotification(_ enabled: Bool) {
        print("ExponeaBridge: setAutoPushNotification - automatic push notification handling can only be configured during SDK initialization on iOS.")
    }

    public func setCampaignTTL(_ seconds: Double) {
        print("ExponeaBridge: setCampaignTTL is not available on iOS.")
    }

    // MARK: - Push Tracking Methods
    public func trackPushToken(_ token: String) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }
        ExponeaSDK.Exponea.shared.trackPushToken(token)
        return true
    }

    public func trackDeliveredPush(_ params: [AnyHashable: Any], considerConsent: Bool) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            return false
        }
        if considerConsent {
            ExponeaSDK.Exponea.shared.trackPushReceived(userInfo: params)
        } else {
            ExponeaSDK.Exponea.shared.trackPushReceivedWithoutTrackingConsent(userInfo: params)
        }
        return true
    }

    public func trackClickedPush(_ params: [AnyHashable: Any], considerConsent: Bool) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }
        if considerConsent {
            ExponeaSDK.Exponea.shared.trackPushOpened(with: params)
        } else {
            ExponeaSDK.Exponea.shared.trackPushOpenedWithoutTrackingConsent(with: params)
        }
        return true
    }

    public func isExponeaPushNotification(_ params: [AnyHashable: Any]) -> Bool {
        return ExponeaSDK.Exponea.isExponeaNotification(userInfo: params)
    }

    public func trackPaymentEvent(
        params: [AnyHashable: Any],
        success: @escaping () -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }

        do {
            let parsedProperties = try JsonDataParser.parse(dictionary: params as NSDictionary)
            ExponeaSDK.Exponea.shared.trackPayment(properties: parsedProperties, timestamp: nil)
            success()
        } catch {
            failure(error)
        }
    }

    // MARK: - Flushing Methods
    public func getFlushMode() -> String {
        return flushModeToString(ExponeaSDK.Exponea.shared.flushingMode)
    }

    public func setFlushMode(_ mode: String) -> Bool {
        do {
            ExponeaSDK.Exponea.shared.flushingMode = try stringToFlushMode(mode)
            return true
        } catch {
            print("ExponeaBridge: Invalid flush mode '\(mode)': \(error)")
            return false
        }
    }

    public func getFlushPeriod() -> Double {
        // Extract period from periodic mode
        if case .periodic(let period) = ExponeaSDK.Exponea.shared.flushingMode {
            return Double(period)
        }
        return 0.0 // Default if not in periodic mode
    }

    public func setFlushPeriod(_ period: Double) {
        // Set periodic mode with the given period
        ExponeaSDK.Exponea.shared.flushingMode = .periodic(Int(period))
    }

    // MARK: - Logging Methods
    public func getLogLevel() -> String {
        return logLevelToString(ExponeaSDK.Exponea.logger.logLevel)
    }

    public func setLogLevel(_ level: String) -> Bool {
        do {
            ExponeaSDK.Exponea.logger.logLevel = try stringToLogLevel(level)
            return true
        } catch {
            print("ExponeaBridge: Invalid log level '\(level)': \(error)")
            return false
        }
    }

    // MARK: - Data Flushing
    public func flushData(completion: @escaping () -> Void) {
        ExponeaSDK.Exponea.shared.flushData(completion: { _ in
            completion()
        })
    }

    // MARK: - Segmentation & Utilities
    public func getSegments(
        _ exposingCategory: String,
        force: Bool,
        success: @escaping ([NSDictionary]) -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }

        let category = SegmentCategory(type: exposingCategory, data: [])
        ExponeaSDK.Exponea.shared.getSegments(force: force, category: category) { segments in
            let dicts = segments.map { segment -> NSDictionary in
                return [
                    "id": segment.id,
                    "segmentation_id": segment.segmentationId
                ] as NSDictionary
            }
            success(dicts)
        }
    }

    public func stopIntegration(
        success: @escaping () -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }
        DispatchQueue.main.async {
            ExponeaSDK.Exponea.shared.stopIntegration()
            success()
        }
    }

    public func clearLocalCustomerData(
        _ appGroup: String?,
        success: @escaping () -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard !ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.generalError("The functionality is unavailable due to running Integration"))
            return
        }
        guard let appGroup = appGroup, !appGroup.isEmpty else {
            failure(ExponeaError.generalError("appGroup is required for clearLocalCustomerData on iOS"))
            return
        }
        ExponeaSDK.Exponea.shared.clearLocalCustomerData(appGroup: appGroup)
        success()
    }

    // MARK: - App Inbox Methods
    public func fetchAppInbox(
        success: @escaping ([NSDictionary]) -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }

        ExponeaSDK.Exponea.shared.fetchAppInbox { result in
            switch result {
            case .success(let response):
                let messages = response.map { TypeConverters.appInboxMessageToDict($0) }
                success(messages)
            case .failure(let error):
                failure(error)
            }
        }
    }

    public func fetchAppInboxItem(
        _ messageId: String,
        success: @escaping (NSDictionary) -> Void,
        failure: @escaping (Error) -> Void
    ) {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            failure(ExponeaError.notConfigured)
            return
        }

        ExponeaSDK.Exponea.shared.fetchAppInboxItem(messageId) { result in
            switch result {
            case .success(let message):
                success(TypeConverters.appInboxMessageToDict(message))
            case .failure(let error):
                failure(error)
            }
        }
    }

    public func markAppInboxAsRead(_ messageDict: [AnyHashable: Any]) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let message = try TypeConverters.parseAppInboxMessage(from: messageDict as NSDictionary)
            ExponeaSDK.Exponea.shared.markAppInboxAsRead(message) { marked in
                print("ExponeaBridge: Message marked as read: \(marked)")
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse app inbox message: \(error)")
            return false
        }
    }

    public func trackAppInboxOpened(
        _ messageDict: [AnyHashable: Any],
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let message = try TypeConverters.parseAppInboxMessage(from: messageDict as NSDictionary)
            if considerConsent {
                ExponeaSDK.Exponea.shared.trackAppInboxOpened(message: message)
            } else {
                ExponeaSDK.Exponea.shared.trackAppInboxOpenedWithoutTrackingConsent(message: message)
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse app inbox message: \(error)")
            return false
        }
    }

    public func trackAppInboxClick(
        _ actionDict: [AnyHashable: Any],
        message messageDict: [AnyHashable: Any],
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let message = try TypeConverters.parseAppInboxMessage(from: messageDict as NSDictionary)
            let action = try TypeConverters.parseAppInboxAction(from: actionDict as NSDictionary)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackAppInboxClick(action: action, message: message)
            } else {
                ExponeaSDK.Exponea.shared.trackAppInboxClickWithoutTrackingConsent(action: action, message: message)
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse app inbox data: \(error)")
            return false
        }
    }

    // MARK: - App Inbox Provider
    public func setAppInboxProvider(_ styleDict: [AnyHashable: Any]) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            // Use native SDK's parser
            let parser = AppInboxStyleParser(styleDict as NSDictionary)
            let appInboxStyle = try parser.parse()

            // Set styled provider
            ExponeaSDK.Exponea.shared.appInboxProvider = StyledAppInboxProvider(appInboxStyle)

            return true
        } catch {
            print("ExponeaBridge: Failed to parse app inbox style: \(error)")
            return false
        }
    }

    // MARK: - In-App Message Tracking Methods
    public func trackInAppMessageClick(
        _ messageDict: [AnyHashable: Any],
        buttonText: String?,
        buttonUrl: String?,
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let message = try TypeConverters.parseInAppMessage(from: messageDict as NSDictionary)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackInAppMessageClick(
                    message: message,
                    buttonText: buttonText,
                    buttonLink: buttonUrl
                )
            } else {
                ExponeaSDK.Exponea.shared.trackInAppMessageClickWithoutTrackingConsent(
                    message: message,
                    buttonText: buttonText,
                    buttonLink: buttonUrl
                )
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse in-app message: \(error)")
            return false
        }
    }

    public func trackInAppMessageClose(
        _ messageDict: [AnyHashable: Any],
        buttonText: String?,
        interaction: Bool,
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        do {
            let message = try TypeConverters.parseInAppMessage(from: messageDict as NSDictionary)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackInAppMessageClose(
                    message: message,
                    buttonText: buttonText,
                    isUserInteraction: interaction
                )
            } else {
                ExponeaSDK.Exponea.shared.trackInAppMessageCloseClickWithoutTrackingConsent(
                    message: message,
                    buttonText: buttonText,
                    isUserInteraction: interaction
                )
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse in-app message: \(error)")
            return false
        }
    }

    // MARK: - In-App Content Block Tracking Methods
    public func trackInAppContentBlockClick(
        _ params: [AnyHashable: Any],
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        guard let placeholderId = params["placeholderId"] as? String else {
            print("ExponeaBridge: Invalid placeholder ID")
            return false
        }

        do {
            guard let messageDict = parseDictionary(params["contentBlock"]) else {
                print("ExponeaBridge: Invalid contentBlock data")
                return false
            }
            guard let actionDict = parseDictionary(params["action"]) else {
                print("ExponeaBridge: Invalid action data")
                return false
            }
            let message = try TypeConverters.parseInAppContentBlockResponse(from: messageDict)
            let action = try TypeConverters.parseInAppContentBlockAction(from: actionDict)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockClick(
                    placeholderId: placeholderId,
                    action: action,
                    message: message
                )
            } else {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockClickWithoutTrackingConsent(
                    placeholderId: placeholderId,
                    action: action,
                    message: message
                )
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse content block data: \(error)")
            return false
        }
    }

    public func trackInAppContentBlockClose(
        _ params: [AnyHashable: Any],
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        guard let placeholderId = params["placeholderId"] as? String else {
            print("ExponeaBridge: Invalid placeholder ID")
            return false
        }

        do {
            guard let messageDict = parseDictionary(params["contentBlock"]) else {
                print("ExponeaBridge: Invalid contentBlock data")
                return false
            }
            let message = try TypeConverters.parseInAppContentBlockResponse(from: messageDict)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockClose(
                    placeholderId: placeholderId,
                    message: message
                )
            } else {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockCloseWithoutTrackingConsent(
                    placeholderId: placeholderId,
                    message: message
                )
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse content block data: \(error)")
            return false
        }
    }

    public func trackInAppContentBlockShown(
        _ params: [AnyHashable: Any],
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        guard let placeholderId = params["placeholderId"] as? String else {
            print("ExponeaBridge: Invalid placeholder ID")
            return false
        }

        do {
            guard let messageDict = parseDictionary(params["contentBlock"]) else {
                print("ExponeaBridge: Invalid contentBlock data")
                return false
            }
            let message = try TypeConverters.parseInAppContentBlockResponse(from: messageDict)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockShown(
                    placeholderId: placeholderId,
                    message: message
                )
            } else {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockShownWithoutTrackingConsent(
                    placeholderId: placeholderId,
                    message: message
                )
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse content block data: \(error)")
            return false
        }
    }

    public func trackInAppContentBlockError(
        _ params: [AnyHashable: Any],
        considerConsent: Bool
    ) -> Bool {
        guard ExponeaBridge.exponeaInstance.isConfigured else {
            print("ExponeaBridge: SDK not configured")
            return false
        }

        guard let placeholderId = params["placeholderId"] as? String else {
            print("ExponeaBridge: Invalid placeholder ID")
            return false
        }

        do {
            guard let messageDict = parseDictionary(params["contentBlock"]) else {
                print("ExponeaBridge: Invalid contentBlock data")
                return false
            }
            guard let errorMessage = params["errorMessage"] as? String else {
                print("ExponeaBridge: Missing errorMessage")
                return false
            }
            let message = try TypeConverters.parseInAppContentBlockResponse(from: messageDict)

            if considerConsent {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockError(
                    placeholderId: placeholderId,
                    message: message,
                    errorMessage: errorMessage
                )
            } else {
                ExponeaSDK.Exponea.shared.trackInAppContentBlockErrorWithoutTrackingConsent(
                    placeholderId: placeholderId,
                    message: message,
                    errorMessage: errorMessage
                )
            }
            return true
        } catch {
            print("ExponeaBridge: Failed to parse content block data: \(error)")
            return false
        }
    }

    private func parseDictionary(_ value: Any?) -> NSDictionary? {
        if let dict = value as? NSDictionary {
            return dict
        }
        if let dict = value as? [AnyHashable: Any] {
            return dict as NSDictionary
        }
        if let jsonString = value as? String,
           let data = jsonString.data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: data, options: []),
           let dict = json as? [String: Any] {
            return dict as NSDictionary
        }
        return nil
    }

    // MARK: - Enum Converters
    private func flushModeToString(_ mode: FlushingMode) -> String {
        switch mode {
        case .immediate: return "IMMEDIATE"
        case .periodic: return "PERIOD"
        case .automatic: return "APP_CLOSE"
        case .manual: return "MANUAL"
        @unknown default: return "PERIOD"
        }
    }

    // MARK: - Listener Lifecycle Methods
    public func onPushOpenedListenerSet() {
        pushOpenedListenerSet = true
        if let pending = pendingOpenedPush {
            emitPushOpenedEvent(pending)
            pendingOpenedPush = nil
        }
    }

    public func onPushOpenedListenerRemove() {
        pushOpenedListenerSet = false
    }

    public func onPushReceivedListenerSet() {
        pushReceivedListenerSet = true
        if let pending = pendingReceivedPush {
            emitPushReceivedEvent(pending)
            pendingReceivedPush = nil
        }
    }

    public func onPushReceivedListenerRemove() {
        pushReceivedListenerSet = false
    }

    @objc(onInAppMessageCallbackSet:trackActions:)
    public func onInAppMessageCallbackSet(overrideDefaultBehavior: Bool, trackActions: Bool) {
        inAppOverrideDefaultBehavior = overrideDefaultBehavior
        inAppTrackActions = trackActions
        inAppCallbackListenerSet = true
    }

    public func onInAppMessageCallbackRemove() {
        inAppCallbackListenerSet = false
        inAppOverrideDefaultBehavior = false
        inAppTrackActions = true
    }

    public func onSegmentationCallbackSet(category: String, includeFirstLoad: Bool) {
        if let existing = segmentationCallbacksByCategory[category] {
            SegmentationManager.shared.removeCallback(callbackData: existing)
        }
        let callbackData = SegmentCallbackData(
            category: SegmentCategory(type: category, data: []),
            isIncludeFirstLoad: includeFirstLoad
        ) { [weak self] segments in
            guard let self = self else { return }
            let segmentsArray = segments.map { segment -> [String: Any] in
                ["id": segment.id, "segmentation_id": segment.segmentationId]
            }
            self.emitNewSegments(category: category, segments: segmentsArray)
        }
        segmentationCallbacksByCategory[category] = callbackData
        SegmentationManager.shared.addCallback(callbackData: callbackData)
    }

    public func onSegmentationCallbackRemove(category: String) {
        guard let callbackData = segmentationCallbacksByCategory[category] else { return }
        SegmentationManager.shared.removeCallback(callbackData: callbackData)
        segmentationCallbacksByCategory.removeValue(forKey: category)
    }

    // MARK: - Event Emission Methods
    private func emitPushOpenedEvent(_ push: [AnyHashable: Any]) {
        if pushOpenedListenerSet {
            if let jsonString = try? convertToJSONString(push) {
                sendEventToJS(name: "pushOpened", body: jsonString)
            }
        } else {
            pendingOpenedPush = push
        }
    }

    private func emitPushReceivedEvent(_ data: [AnyHashable: Any]) {
        if pushReceivedListenerSet {
            if let jsonString = try? convertToJSONString(data) {
                sendEventToJS(name: "pushReceived", body: jsonString)
            }
        } else {
            pendingReceivedPush = data
        }
    }

    private func emitInAppMessageAction(_ action: [AnyHashable: Any]) {
        if let jsonString = try? convertToJSONString(action) {
            sendEventToJS(name: "inAppAction", body: jsonString)
        }
    }

    private func buildInAppAction(
        type: String,
        message: ExponeaSDK.InAppMessage?,
        button: ExponeaSDK.InAppMessageButton? = nil,
        interaction: Bool? = nil,
        errorMessage: String? = nil
    ) -> [AnyHashable: Any] {
        var action: [AnyHashable: Any] = ["type": type]
        if let message = message,
           let msgDict = try? encodeToSnakeCaseDict(message) {
            action["message"] = msgDict
        }
        if let button = button {
            var btnDict: [String: Any] = [:]
            if let text = button.text { btnDict["text"] = text }
            if let url = button.url { btnDict["url"] = url }
            action["button"] = btnDict
        }
        if let interaction = interaction {
            action["interaction"] = interaction
        }
        if let errorMessage = errorMessage {
            action["errorMessage"] = errorMessage
        }
        return action
    }

    private func encodeToSnakeCaseDict<T: Encodable>(_ value: T) throws -> [String: Any] {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(value)
        guard let dict = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NSError(
                domain: "ExponeaBridge", code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Failed to convert encoded data to dictionary"]
            )
        }
        return dict
    }

    private func emitNewSegments(category: String, segments: [[AnyHashable: Any]]) {
        let payload: [AnyHashable: Any] = [
            "category": category,
            "segments": segments
        ]
        if let jsonString = try? convertToJSONString(payload) {
            sendEventToJS(name: "newSegments", body: jsonString)
        }
    }

    private func sendEventToJS(name: String, body: Any?) {
        // Use RCTEventEmitter to send events to JavaScript
        eventEmitter?.sendEvent(withName: name, body: body)
    }

    private func convertToJSONString(_ dict: [AnyHashable: Any]) throws -> String {
        let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
        guard let jsonString = String(data: jsonData, encoding: .utf8) else {
            throw NSError(domain: "ExponeaBridge", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert JSON data to string"])
        }
        return jsonString
    }

    private func stringToFlushMode(_ string: String) throws -> FlushingMode {
        switch string {
        case "IMMEDIATE": return .immediate
        case "PERIOD": return .periodic(60) // Default to 60 seconds
        case "APP_CLOSE": return .automatic
        case "MANUAL": return .manual
        default: throw ExponeaError.invalidValue(for: "FlushMode: \(string)")
        }
    }

    private func logLevelToString(_ level: ExponeaSDK.LogLevel) -> String {
        switch level {
        case .none: return "OFF"
        case .error: return "ERROR"
        case .warning: return "WARN"
        case .verbose: return "VERBOSE"
        @unknown default: return "VERBOSE"
        }
    }

    private func stringToLogLevel(_ string: String) throws -> ExponeaSDK.LogLevel {
        switch string {
        case "OFF": return .none
        case "ERROR": return .error
        case "WARN": return .warning
        case "INFO": return .verbose // Map INFO to VERBOSE
        case "DBG": return .verbose
        case "VERBOSE": return .verbose
        default: throw ExponeaError.invalidValue(for: "LogLevel: \(string)")
        }
    }
}

// MARK: - InAppMessageActionDelegate
extension ExponeaBridge: InAppMessageActionDelegate {
    public var overrideDefaultBehavior: Bool {
        return inAppOverrideDefaultBehavior
    }

    public var trackActions: Bool {
        return inAppTrackActions
    }

    public func inAppMessageShown(message: ExponeaSDK.InAppMessage) {
        guard inAppCallbackListenerSet else { return }
        emitInAppMessageAction(buildInAppAction(type: "SHOW", message: message))
    }

    public func inAppMessageError(message: ExponeaSDK.InAppMessage?, errorMessage: String) {
        guard inAppCallbackListenerSet else { return }
        emitInAppMessageAction(buildInAppAction(type: "ERROR", message: message, errorMessage: errorMessage))
    }

    public func inAppMessageClickAction(message: ExponeaSDK.InAppMessage, button: ExponeaSDK.InAppMessageButton) {
        guard inAppCallbackListenerSet else { return }
        emitInAppMessageAction(buildInAppAction(type: "ACTION", message: message, button: button))
    }

    public func inAppMessageCloseAction(
        message: ExponeaSDK.InAppMessage,
        button: ExponeaSDK.InAppMessageButton?,
        interaction: Bool
    ) {
        guard inAppCallbackListenerSet else { return }
        emitInAppMessageAction(buildInAppAction(type: "CLOSE", message: message, button: button, interaction: interaction))
    }
}
