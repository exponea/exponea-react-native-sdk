//
//  Exponea.swift
//  Exponea
//
//  Created by Panaxeo on 09/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK
import React

// This protocol is used queried using reflection by native iOS SDK to see if it's run by RN SDK
@objc(IsExponeaReactNativeSDK)
protocol IsExponeaReactNativeSDK {
}
@objc(ExponeaRNVersion)
public class ExponeaRNVersion: NSObject, ExponeaVersionProvider {
    required public override init() { }
    public func getVersion() -> String {
        "1.4.0"
    }
}

@objc(Exponea)
class Exponea: RCTEventEmitter {
    override init() {
        super.init()
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc(supportedEvents)
    override func supportedEvents() -> [String] {
        return ["pushOpened", "pushReceived"]
    }

    override func sendEvent(withName name: String!, body: Any) {
        if let sendEventOverride = sendEventOverride {
            sendEventOverride(name, body)
        } else {
            super.sendEvent(withName: name, body: body)
        }
    }

    // to be changed in unit tests
    static var exponeaInstance: ExponeaType = ExponeaSDK.Exponea.shared

    // to be changed in unit tests
    var sendEventOverride: ((String, Any) -> Void)?

    let errorCode = "ExponeaSDK"
    let defaultFlushPeriod = 5 * 60 // 5 minutes

    // We have to hold OpenedPush until pushOpenedListener set in JS
    var pendingOpenedPush: OpenedPush?
    var pushOpenedListenerSet = false
    // We have to hold received push data until pushReceivedListener set in JS
    var pendingReceivedPushData: [AnyHashable: Any]?
    var pushReceivedListenerSet = false

    func rejectPromise(_ reject: RCTPromiseRejectBlock, error: Error) {
        reject(errorCode, error.localizedDescription, error)
    }

    @objc(configure:resolve:reject:)
    func configure(configuration: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let parser = ConfigurationParser(configuration)
        guard !Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.alreadyConfigured)
            return
        }
        do {
            Exponea.exponeaInstance.configure(
                try parser.parseProjectSettings(),
                pushNotificationTracking: try parser.parsePushNotificationTracking(),
                automaticSessionTracking: try parser.parseSessionTracking(),
                defaultProperties: try parser.parseDefaultProperties(),
                flushingSetup: try parser.parseFlushingSetup(),
                allowDefaultCustomerProperties: try parser.parseAllowDefaultCustomerProperties(),
                advancedAuthEnabled: try parser.parseAdvancedAuthEnabled()
            )
            Exponea.exponeaInstance.pushNotificationsDelegate = self
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(isConfigured:reject:)
    func isConfigured(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(Exponea.exponeaInstance.isConfigured)
    }

    @objc(getCustomerCookie:reject:)
    func getCustomerCookie(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        resolve(Exponea.exponeaInstance.customerCookie)
    }

    @objc(checkPushSetup:reject:)
    func checkPushSetup(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard !Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.alreadyConfigured)
            return
        }
        Exponea.exponeaInstance.checkPushSetup = true
        resolve(nil)
    }

    @objc(getFlushMode:reject:)
    func getFlushMode(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch Exponea.exponeaInstance.flushingMode {
        case .automatic: resolve("APP_CLOSE")
        case .immediate: resolve("IMMEDIATE")
        case .periodic: resolve("PERIOD")
        case .manual: resolve("MANUAL")
        }
    }

    @objc(setFlushMode:resolve:reject:)
    func setFlushMode(flushMode: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch flushMode {
        case "APP_CLOSE":
            Exponea.exponeaInstance.flushingMode = .automatic
            resolve(nil)
        case "IMMEDIATE":
            Exponea.exponeaInstance.flushingMode = .immediate
            resolve(nil)
        case "PERIOD":
            Exponea.exponeaInstance.flushingMode = .periodic(defaultFlushPeriod)
            resolve(nil)
        case "MANUAL":
            Exponea.exponeaInstance.flushingMode = .manual
            resolve(nil)
        default:
            let error = ExponeaDataError.invalidValue(for: "flush mode")
            reject(errorCode, error.localizedDescription, error)
        }
    }

    @objc(getFlushPeriod:reject:)
    func getFlushPeriod(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch Exponea.exponeaInstance.flushingMode {
        case .periodic(let period):
            resolve(period)
        default:
            rejectPromise(reject, error: ExponeaError.flushModeNotPeriodic)
        }
    }

    @objc(setFlushPeriod:resolve:reject:)
    func setFlushPeriod(flushPeriod: NSNumber, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch Exponea.exponeaInstance.flushingMode {
        case .periodic:
            Exponea.exponeaInstance.flushingMode = .periodic(flushPeriod.intValue)
            resolve(nil)
        default:
            rejectPromise(reject, error: ExponeaError.flushModeNotPeriodic)
        }
    }

    @objc(getLogLevel:reject:)
    func getLogLevel(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch ExponeaSDK.Exponea.logger.logLevel {
        case .none:
            resolve("OFF")
        case .verbose:
            resolve("VERBOSE")
        case .warning:
            resolve("WARN")
        case .error:
            resolve("ERROR")
        }
    }

    @objc(setLogLevel:resolve:reject:)
    func setLogLevel(logLevel: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch logLevel {
        case "OFF":
            ExponeaSDK.Exponea.logger.logLevel = .none
            resolve(nil)
        case "ERROR":
            ExponeaSDK.Exponea.logger.logLevel = .error
            resolve(nil)
        case "WARN":
            ExponeaSDK.Exponea.logger.logLevel = .warning
            resolve(nil)
        case "INFO":
            rejectPromise(reject, error: ExponeaError.notAvailableForPlatform(name: "INFO log level"))
        case "DEBUG":
            rejectPromise(reject, error: ExponeaError.notAvailableForPlatform(name: "DEBUG log level"))
        case "VERBOSE":
            ExponeaSDK.Exponea.logger.logLevel = .verbose
            resolve(nil)
        default:
            rejectPromise(reject, error: ExponeaDataError.invalidValue(for: "Log level"))
        }
    }

    @objc(getDefaultProperties:reject:)
    func getDefaultProperties(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard let properties = Exponea.exponeaInstance.defaultProperties else {
            resolve("{}")
            return
        }
        do {
            resolve(
                String(
                    data: try JSONSerialization.data(withJSONObject: properties),
                    encoding: .utf8
                )
            )
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(setDefaultProperties:resolve:reject:)
    func setDefaultProperties(
        properties: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let parsedProperties = try JsonDataParser.parse(dictionary: properties)
            Exponea.exponeaInstance.defaultProperties = parsedProperties
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }
}
