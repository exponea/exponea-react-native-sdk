//
//  Exponea+Tracking.swift
//  Exponea
//
//  Created by Panaxeo on 23/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea {
    @objc(identifyCustomer:properties:resolve:reject:)
    func identifyCustomer(
        customerIds: NSDictionary,
        properties: NSDictionary,
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            Exponea.exponeaInstance.identifyCustomer(
                customerIds: try JsonDataParser.parse(dictionary: customerIds).mapValues {
                    if case .string(let stringValue) = $0.jsonValue {
                        return stringValue
                    } else {
                        throw ExponeaDataError.invalidType(for: "customer id (only string values are supported)")
                    }
                },
                properties: try JsonDataParser.parse(dictionary: properties),
                timestamp: nil
            )
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(flushData:reject:)
    func flushData(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        Exponea.exponeaInstance.flushData()
        resolve(nil)
    }

    @objc(trackEvent:properties:timestamp:resolve:reject:)
    func trackEvent(
        eventType: String,
        properties: NSDictionary,
        timestamp: NSDictionary,
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            Exponea.exponeaInstance.trackEvent(
                properties: try JsonDataParser.parse(dictionary: properties),
                timestamp: try timestamp.getOptionalSafely(property: "timestamp"),
                eventType: eventType
            )
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackSessionStart:resolve:reject:)
    func trackSessionStart(timestamp: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard timestamp.object(forKey: "timestamp") == nil else {
            rejectPromise(reject, error: ExponeaError.notAvailableForPlatform(name: "Setting session start timestamp"))
            return
        }
        Exponea.exponeaInstance.trackSessionStart()
        resolve(nil)
    }

    @objc(trackSessionEnd:resolve:reject:)
    func trackSessionEnd(timestamp: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard timestamp.object(forKey: "timestamp") == nil else {
            rejectPromise(reject, error: ExponeaError.notAvailableForPlatform(name: "Setting session end timestamp"))
            return
        }
        Exponea.exponeaInstance.trackSessionEnd()
        resolve(nil)
    }
}
