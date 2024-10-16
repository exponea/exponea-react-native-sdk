//
//  MockExponea.swift
//  Tests
//
//  Created by Panaxeo on 30/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK
import Exponea

class MockExponea: ExponeaType {

    var appInboxProvider: ExponeaSDK.AppInboxProvider = DefaultAppInboxProvider()

    init() {}

    struct Call {
        let name: String
        let params: [Any?]
    }

    var calls: [Call] = []

    var isConfiguredValue: Bool = false
    var isConfigured: Bool {
        get {
            calls.append(Call(name: "isConfigured:get", params: []))
            return isConfiguredValue
        }
        set {
            calls.append(Call(name: "isConfigured:set", params: [newValue]))
            isConfiguredValue = newValue
        }
    }

    var configurationValue: Configuration?
    var configuration: Configuration? {
        get {
            calls.append(Call(name: "configuration:get", params: []))
            return configurationValue
        }
        set {
            calls.append(Call(name: "configuration:set", params: [newValue]))
            configurationValue = newValue
        }
    }

    var customerCookieValue: String?
    var customerCookie: String? {
        get {
            calls.append(Call(name: "customerCookie:get", params: []))
            return customerCookieValue
        }
        set {
            calls.append(Call(name: "customerCookie:set", params: [newValue]))
            customerCookieValue = newValue
        }
    }

    var flushingModeValue: FlushingMode = .automatic
    var flushingMode: FlushingMode {
        get {
            calls.append(Call(name: "flushingMode:get", params: []))
            return flushingModeValue
        }
        set {
            calls.append(Call(name: "flushingMode:set", params: [newValue]))
            flushingModeValue = newValue
        }
    }

    var pushNotificationsDelegateValue: PushNotificationManagerDelegate?
    var pushNotificationsDelegate: PushNotificationManagerDelegate? {
        get {
            calls.append(Call(name: "pushNotificationsDelegate:get", params: []))
            return pushNotificationsDelegateValue
        }
        set {
            calls.append(Call(name: "pushNotificationsDelegate:set", params: [newValue]))
            pushNotificationsDelegateValue = newValue
        }
    }

    var inAppMessagesDelegateValue: InAppMessageActionDelegate = TestDefaultInAppDelegate()

    var inAppMessagesDelegate: InAppMessageActionDelegate {
        get {
            calls.append(Call(name: "inAppMessagesDelegate:get", params: []))
            return inAppMessagesDelegateValue
        }
        set {
            calls.append(Call(name: "inAppMessagesDelegate:set", params: [newValue]))
            inAppMessagesDelegateValue = newValue
        }
    }

    var inAppContentBlocksManager: ExponeaSDK.InAppContentBlocksManagerType?

    var safeModeEnabled: Bool {
        get { fatalError("Not implemented") }
        set { fatalError("Not implemented \(newValue)") }
    }

    var checkPushSetupValue: Bool = false
    var checkPushSetup: Bool {
        get {
            calls.append(Call(name: "checkPushSetup:get", params: []))
            return checkPushSetupValue
        }
        set {
            calls.append(Call(name: "checkPushSetup:set", params: [newValue]))
            checkPushSetupValue = newValue
        }
    }

    var defaultPropertiesValue: [String: JSONConvertible]?
    var defaultProperties: [String: JSONConvertible]? {
        get {
            calls.append(Call(name: "defaultProperties:get", params: []))
            return defaultPropertiesValue
        }
        set {
            calls.append(Call(name: "defaultProperties:set", params: [newValue]))
            defaultPropertiesValue = newValue
        }
    }

    func configure(
        _ projectSettings: Exponea.ProjectSettings,
        pushNotificationTracking: Exponea.PushNotificationTracking,
        automaticSessionTracking: Exponea.AutomaticSessionTracking,
        defaultProperties: [String: JSONConvertible]?,
        inAppContentBlocksPlaceholders: [String]?,
        flushingSetup: Exponea.FlushingSetup,
        allowDefaultCustomerProperties: Bool?,
        advancedAuthEnabled: Bool?,
        manualSessionAutoClose: Bool
    ) {
        calls.append(
            Call(
                name: "configure",
                params: [
                    pushNotificationTracking,
                    automaticSessionTracking,
                    defaultProperties,
                    flushingSetup,
                    allowDefaultCustomerProperties,
                    advancedAuthEnabled,
                    manualSessionAutoClose
                ]
            )
        )
    }

    func configure(
        projectToken: String,
        authorization: Authorization,
        baseUrl: String?,
        appGroup: String?,
        defaultProperties: [String: JSONConvertible]?,
        inAppContentBlocksPlaceholders: [String]?,
        allowDefaultCustomerProperties: Bool?,
        advancedAuthEnabled: Bool?,
        manualSessionAutoClose: Bool
    ) {
        fatalError("Not implemented")
    }

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
        manualSessionAutoClose: Bool
    ) {
        fatalError("Not implemented")
    }

    func configure(plistName: String) {
        fatalError("Not implemented")
    }

    func trackEvent(properties: [String: JSONConvertible], timestamp: Double?, eventType: String?) {
        calls.append(Call(name: "trackEvent", params: [properties, timestamp, eventType]))
    }

    func trackCampaignClick(url: URL, timestamp: Double?) {
        fatalError("Not implemented")
    }

    func trackPayment(properties: [String: JSONConvertible], timestamp: Double?) {
        calls.append(Call(name: "trackPayment", params: [properties, timestamp]))
    }

    func identifyCustomer(
        customerIds: [String: String]?,
        properties: [String: JSONConvertible],
        timestamp: Double?
    ) {
        calls.append(Call(name: "identifyCustomer", params: [customerIds, properties]))
    }

    func flushData() {
        calls.append(Call(name: "flushData", params: []))
    }

    func flushData(completion: ((FlushResult) -> Void)?) {
        fatalError("Not implemented")
    }

    func trackPushToken(_ token: Data) {
        calls.append(Call(name: "trackPushToken", params: [token]))
    }

    func trackPushToken(_ token: String?) {
        calls.append(Call(name: "trackPushToken", params: [token]))
    }

    func handlePushNotificationToken(deviceToken: Data) {
        fatalError("Not implemented")
    }

    func trackPushOpened(with userInfo: [AnyHashable: Any]) {
        calls.append(Call(name: "trackPushOpened", params: [userInfo]))
    }

    func handlePushNotificationOpened(response: UNNotificationResponse) {
        fatalError("Not implemented")
    }

    func handlePushNotificationOpened(userInfo: [AnyHashable: Any], actionIdentifier: String?) {
        fatalError("Not implemented")
    }

    func trackSessionStart() {
        calls.append(Call(name: "trackSessionStart", params: []))
    }

    func trackSessionEnd() {
        calls.append(Call(name: "trackSessionEnd", params: []))
    }

    func fetchRecommendation<T>(
        with options: RecommendationOptions,
        completion: @escaping (Result<RecommendationResponse<T>>) -> Void
    ) where T: RecommendationUserData {
        calls.append(Call(name: "fetchRecommendation", params: [options, completion]))
    }

    func fetchConsents(completion: @escaping (Result<ConsentsResponse>) -> Void) {
        calls.append(Call(name: "fetchConsents", params: [completion]))
    }

    func anonymize() {
        calls.append(Call(name: "anonymize", params: []))
    }

    func anonymize(exponeaProject: ExponeaProject, projectMapping: [EventType: [ExponeaProject]]?) {
        calls.append(Call(name: "anonymize", params: [exponeaProject, projectMapping]))
    }
    func trackInAppMessageClick(message: InAppMessage, buttonText: String?, buttonLink: String?) {
        calls.append(Call(name: "trackInAppMessageClick", params: [message, buttonText, buttonLink]))
    }

    func trackInAppMessageClose(message: ExponeaSDK.InAppMessage, buttonText: String?, isUserInteraction: Bool?) {
        calls.append(Call(name: "trackInAppMessageClose", params: [message, buttonText, isUserInteraction]))
    }

    func trackPushOpenedWithoutTrackingConsent(with userInfo: [AnyHashable: Any]) {
        calls.append(Call(name: "trackPushOpenedWithoutTrackingConsent", params: [userInfo]))
    }

    func handlePushNotificationOpenedWithoutTrackingConsent(userInfo: [AnyHashable: Any], actionIdentifier: String?) {
        fatalError("Not implemented")
    }

    func trackInAppMessageClickWithoutTrackingConsent(
        message: ExponeaSDK.InAppMessage,
        buttonText: String?,
        buttonLink: String?
    ) {
        calls.append(Call(
            name: "trackInAppMessageClickWithoutTrackingConsent",
            params: [message, buttonText, buttonLink]
        ))
    }

    func trackInAppMessageCloseClickWithoutTrackingConsent(
        message: ExponeaSDK.InAppMessage,
        buttonText: String?,
        isUserInteraction: Bool?
    ) {
        calls.append(Call(
            name: "trackInAppMessageCloseClickWithoutTrackingConsent",
            params: [message, buttonText, isUserInteraction]
        ))
    }

    func trackAppInboxOpened(message: ExponeaSDK.MessageItem) {
        fatalError("Not implemented")
    }

    func trackAppInboxOpenedWithoutTrackingConsent(message: ExponeaSDK.MessageItem) {
        fatalError("Not implemented")
    }

    func trackAppInboxClick(action: ExponeaSDK.MessageItemAction, message: ExponeaSDK.MessageItem) {
        fatalError("Not implemented")
    }

    func trackAppInboxClickWithoutTrackingConsent(
        action: ExponeaSDK.MessageItemAction,
        message: ExponeaSDK.MessageItem
    ) {
        fatalError("Not implemented")
    }

    func markAppInboxAsRead(_ message: ExponeaSDK.MessageItem, completition: ((Bool) -> Void)?) {
        fatalError("Not implemented")
    }

    func getAppInboxButton() -> UIButton {
        fatalError("Not implemented")
    }

    func getAppInboxListViewController() -> UIViewController {
        fatalError("Not implemented")
    }

    func getAppInboxListViewController(
        onItemClicked: @escaping (ExponeaSDK.MessageItem, Int) -> Void
    ) -> UIViewController {
        fatalError("Not implemented")
    }

    func getAppInboxDetailViewController(_ messageId: String) -> UIViewController {
        fatalError("Not implemented")
    }

    func fetchAppInbox(completion: @escaping (ExponeaSDK.Result<[ExponeaSDK.MessageItem]>) -> Void) {
        fatalError("Not implemented")
    }

    func fetchAppInboxItem(
        _ messageId: String,
        completion: @escaping (ExponeaSDK.Result<ExponeaSDK.MessageItem>) -> Void
    ) {
        fatalError("Not implemented")
    }

    func handlePushNotificationToken(token: String) {
        fatalError("Not implemented")
    }

    func trackPushReceived(content: UNNotificationContent) {
        fatalError("Not implemented")
    }

    func trackPushReceived(userInfo: [AnyHashable: Any]) {
        calls.append(Call(name: "trackPushReceived", params: [userInfo]))
    }

    func trackPushReceivedWithoutTrackingConsent(content: UNNotificationContent) {
        fatalError("Not implemented")
    }

    func trackPushReceivedWithoutTrackingConsent(userInfo: [AnyHashable: Any]) {
        calls.append(Call(name: "trackPushReceivedWithoutTrackingConsent", params: [userInfo]))
    }

    func trackInAppContentBlockClick(
        placeholderId: String,
        action: ExponeaSDK.InAppContentBlockAction,
        message: ExponeaSDK.InAppContentBlockResponse
    ) {
        calls.append(Call(name: "trackInAppContentBlockClick", params: [placeholderId, action, message]))
    }

    func trackInAppContentBlockClickWithoutTrackingConsent(
        placeholderId: String,
        action: ExponeaSDK.InAppContentBlockAction,
        message: ExponeaSDK.InAppContentBlockResponse
    ) {
        calls.append(Call(
            name: "trackInAppContentBlockClickWithoutTrackingConsent",
            params: [placeholderId, action, message]
        ))
    }

    func trackInAppContentBlockClose(
        placeholderId: String,
        message: ExponeaSDK.InAppContentBlockResponse
    ) {
        calls.append(Call(name: "trackInAppContentBlockClose", params: [placeholderId, message]))
    }

    func trackInAppContentBlockCloseWithoutTrackingConsent(
        placeholderId: String,
        message: ExponeaSDK.InAppContentBlockResponse
    ) {
        calls.append(Call(name: "trackInAppContentBlockCloseWithoutTrackingConsent", params: [placeholderId, message]))
    }

    func trackInAppContentBlockShown(
        placeholderId: String,
        message: ExponeaSDK.InAppContentBlockResponse
    ) {
        calls.append(Call(name: "trackInAppContentBlockShown", params: [placeholderId, message]))
    }

    func trackInAppContentBlockShownWithoutTrackingConsent(
        placeholderId: String,
        message: ExponeaSDK.InAppContentBlockResponse
    ) {
        calls.append(Call(name: "trackInAppContentBlockShownWithoutTrackingConsent", params: [placeholderId, message]))
    }

    func trackInAppContentBlockError(
        placeholderId: String,
        message: ExponeaSDK.InAppContentBlockResponse,
        errorMessage: String
    ) {
        calls.append(Call(name: "trackInAppContentBlockError", params: [placeholderId, message, errorMessage]))
    }

    func trackInAppContentBlockErrorWithoutTrackingConsent(
        placeholderId: String,
        message: ExponeaSDK.InAppContentBlockResponse,
        errorMessage: String
    ) {
        calls.append(Call(
            name: "trackInAppContentBlockErrorWithoutTrackingConsent",
            params: [placeholderId, message, errorMessage]
        ))
    }

    func getSegments(
        force: Bool,
        category: ExponeaSDK.SegmentCategory,
        result: @escaping ExponeaSDK.TypeBlock<[ExponeaSDK.SegmentDTO]>
    ) {
        calls.append(Call(name: "getSegments", params: [category, force]))
        result([])
    }
}

class TestDefaultInAppDelegate: InAppMessageActionDelegate {
    public let overrideDefaultBehavior = false
    public let trackActions = true
    func inAppMessageShown(message: ExponeaSDK.InAppMessage) {}
    func inAppMessageError(message: ExponeaSDK.InAppMessage?, errorMessage: String) {}
    func inAppMessageClickAction(message: ExponeaSDK.InAppMessage, button: ExponeaSDK.InAppMessageButton) {}
    func inAppMessageCloseAction(
        message: ExponeaSDK.InAppMessage,
        button: ExponeaSDK.InAppMessageButton?,
        interaction: Bool
    ) {}
}
