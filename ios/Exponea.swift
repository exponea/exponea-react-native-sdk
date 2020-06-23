//
//  Exponea.swift
//  Exponea
//
//  Created by Panaxeo on 09/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

@objc(Exponea)
class Exponea: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    let errorCode = "ExponeaSDK"
    let defaultFlushPeriod = 5 * 60 // 5 minutes

    func rejectPromise(_ reject: RCTPromiseRejectBlock, error: Error) {
        reject(errorCode, error.localizedDescription, error)
    }

    @objc(configure:resolve:reject:)
    func configure(configuration: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let parser = ConfigurationParser(configuration)
        guard !ExponeaSDK.Exponea.shared.isConfigured else {
            rejectPromise(reject, error: ExponeaError.alreadyConfigured)
            return
        }
        do {
            ExponeaSDK.Exponea.shared.configure(
                try parser.parseProjectSettings(),
                automaticPushNotificationTracking: try parser.parsePushNotificationTracking(),
                automaticSessionTracking: try parser.parseSessionTracking(),
                defaultProperties: try parser.parseDefaultProperties(),
                flushingSetup: try parser.parseFlushingSetup()
            )
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(isConfigured:reject:)
    func isConfigured(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(ExponeaSDK.Exponea.shared.isConfigured)
    }

    @objc(getCustomerCookie:reject:)
    func getCustomerCookie(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard ExponeaSDK.Exponea.shared.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        resolve(ExponeaSDK.Exponea.shared.customerCookie)
    }

    @objc(checkPushSetup:reject:)
    func checkPushSetup(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard !ExponeaSDK.Exponea.shared.isConfigured else {
            rejectPromise(reject, error: ExponeaError.alreadyConfigured)
            return
        }
        // not available until iOS SDK is updated in EXRN-32
        // ExponeaSDK.Exponea.shared.checkPushSetup = true
        resolve(nil)
    }

    @objc(getFlushMode:reject:)
    func getFlushMode(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch ExponeaSDK.Exponea.shared.flushingMode {
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
            ExponeaSDK.Exponea.shared.flushingMode = .automatic
            resolve(nil)
        case "IMMEDIATE":
            ExponeaSDK.Exponea.shared.flushingMode = .immediate
            resolve(nil)
        case "PERIOD":
            ExponeaSDK.Exponea.shared.flushingMode = .periodic(defaultFlushPeriod)
            resolve(nil)
        case "MANUAL":
            ExponeaSDK.Exponea.shared.flushingMode = .manual
            resolve(nil)
        default:
            let error = ExponeaDataError.invalidValue(for: "flush mode")
            reject(errorCode, error.localizedDescription, error)
        }
    }

    @objc(getFlushPeriod:reject:)
    func getFlushPeriod(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch ExponeaSDK.Exponea.shared.flushingMode {
        case .periodic(let period):
            resolve(period)
        default:
            rejectPromise(reject, error: ExponeaError.flushModeNotPeriodic)
        }
    }

    @objc(setFlushPeriod:resolve:reject:)
    func setFlushPeriod(flushPeriod: NSNumber, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        switch ExponeaSDK.Exponea.shared.flushingMode {
        case .periodic:
            ExponeaSDK.Exponea.shared.flushingMode = .periodic(flushPeriod.intValue)
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
}
