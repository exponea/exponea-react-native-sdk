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

    @objc(configure:resolve:reject:)
    func configure(configuration: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let parser = ConfigurationParser(configuration)
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
            reject("ExponeaSDK", error.localizedDescription, error)
        }
    }

    @objc(isConfigured:reject:)
    func isConfigured(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        resolve(ExponeaSDK.Exponea.shared.isConfigured)
    }

    @objc(getCustomerCookie:reject:)
    func getCustomerCookie(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if !ExponeaSDK.Exponea.shared.isConfigured {
            reject("ExponeaSDK", ExponeaError.notConfigured.localizedDescription, ExponeaError.notConfigured)
        }
        resolve(ExponeaSDK.Exponea.shared.customerCookie)
    }
}
