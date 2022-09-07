//
//  MockExponea.swift
//  Tests
//
//  Created by Panaxeo on 30/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

class MockExponea: ExponeaType {
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

    var inAppMessagesDelegateValue: InAppMessageActionDelegate = InAppDelegate()
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
        flushingSetup: Exponea.FlushingSetup
    ) {
        calls.append(
            Call(
                name: "configure",
                params: [pushNotificationTracking, automaticSessionTracking, defaultProperties, flushingSetup]
            )
        )
    }

    func configure(
        projectToken: String,
        authorization: Authorization,
        baseUrl: String?,
        appGroup: String?,
        defaultProperties: [String: JSONConvertible]?
    ) {
        fatalError("Not implemented")
    }

    func configure(
        projectToken: String,
        projectMapping: [EventType: [ExponeaProject]],
        authorization: Authorization,
        baseUrl: String?,
        appGroup: String?,
        defaultProperties: [String: JSONConvertible]?
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
        fatalError("Not implemented")
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
        fatalError("Not implemented")
    }

    func trackPushToken(_ token: String?) {
        fatalError("Not implemented")
    }

    func handlePushNotificationToken(deviceToken: Data) {
        fatalError("Not implemented")
    }

    func trackPushOpened(with userInfo: [AnyHashable: Any]) {
        fatalError("Not implemented")
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
}
