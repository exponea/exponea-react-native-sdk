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

    @objc(trackPushToken:resolve:reject:)
    func trackPushToken(
        token: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        Exponea.exponeaInstance.trackPushToken(token)
        resolve(nil)
    }

    @objc(trackHmsPushToken:resolve:reject:)
    func trackHmsPushToken(
        token: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        rejectPromise(reject, error: ExponeaError.notAvailableForPlatform(name: "iOS"))
    }

    @objc(trackDeliveredPush:resolve:reject:)
    func trackDeliveredPush(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let source = try JsonDataParser.parse(dictionary: params)
            let jsonSource = JSONValue.convert(source)
            let data: [String: JSONConvertible] = jsonSource.mapValues { val in
                val.jsonConvertible
            }
            Exponea.exponeaInstance.trackPushReceived(userInfo: data)
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackDeliveredPushWithoutTrackingConsent:resolve:reject:)
    func trackDeliveredPushWithoutTrackingConsent(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let source = try JsonDataParser.parse(dictionary: params)
            let jsonSource = JSONValue.convert(source)
            let data: [String: JSONConvertible] = jsonSource.mapValues { val in
                val.jsonConvertible
            }
            Exponea.exponeaInstance.trackPushReceivedWithoutTrackingConsent(userInfo: data)
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackClickedPush:resolve:reject:)
    func trackClickedPush(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let source = try JsonDataParser.parse(dictionary: params)
            let jsonSource = JSONValue.convert(source)
            let data: [String: JSONConvertible] = jsonSource.mapValues { val in
                val.jsonConvertible
            }
            Exponea.exponeaInstance.trackPushOpened(with: data)
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackClickedPushWithoutTrackingConsent:resolve:reject:)
    func trackClickedPushWithoutTrackingConsent(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let source = try JsonDataParser.parse(dictionary: params)
            let jsonSource = JSONValue.convert(source)
            let data: [String: JSONConvertible] = jsonSource.mapValues { val in
                val.jsonConvertible
            }
            Exponea.exponeaInstance.trackPushOpenedWithoutTrackingConsent(with: data)
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackPaymentEvent:resolve:reject:)
    func trackPaymentEvent(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let source = try JsonDataParser.parse(dictionary: params)
            let jsonSource = JSONValue.convert(source)
            let data: [String: JSONConvertible] = jsonSource.mapValues { val in
                val.jsonConvertible
            }
            Exponea.exponeaInstance.trackPayment(properties: data, timestamp: nil)
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackInAppMessageClick:resolve:reject:)
    func trackInAppMessageClick(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let json = try? JSONSerialization.data(withJSONObject: params),
              let inAppMessageAction = try? JSONDecoder().decode(InAppMessageAction.self, from: json),
              let inAppMessage = inAppMessageAction.message else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageClick(
            message: inAppMessage,
            buttonText: inAppMessageAction.button?.text,
            buttonLink: inAppMessageAction.button?.url
        )
        resolve(nil)
    }

    @objc(trackInAppMessageClickWithoutTrackingConsent:resolve:reject:)
    func trackInAppMessageClickWithoutTrackingConsent(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let json = try? JSONSerialization.data(withJSONObject: params),
              let inAppMessageAction = try? JSONDecoder().decode(InAppMessageAction.self, from: json),
              let inAppMessage = inAppMessageAction.message else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageClickWithoutTrackingConsent(
            message: inAppMessage,
            buttonText: inAppMessageAction.button?.text,
            buttonLink: inAppMessageAction.button?.url
        )
        resolve(nil)
    }

    @objc(trackInAppMessageClose:resolve:reject:)
    func trackInAppMessageClose(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let json = try? JSONSerialization.data(withJSONObject: params),
              let inAppMessageAction = try? JSONDecoder().decode(InAppMessageAction.self, from: json),
              let inAppMessage = inAppMessageAction.message else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageClose(
            message: inAppMessage,
            buttonText: inAppMessageAction.button?.text,
            isUserInteraction: inAppMessageAction.interaction
        )
        resolve(nil)
    }

    @objc(trackInAppMessageCloseWithoutTrackingConsent:resolve:reject:)
    func trackInAppMessageCloseWithoutTrackingConsent(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let json = try? JSONSerialization.data(withJSONObject: params),
              let inAppMessageAction = try? JSONDecoder().decode(InAppMessageAction.self, from: json),
              let inAppMessage = inAppMessageAction.message else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageCloseClickWithoutTrackingConsent(
            message: inAppMessage,
            buttonText: inAppMessageAction.button?.text,
            isUserInteraction: inAppMessageAction.interaction
        )
        resolve(nil)
    }

    func parseInAppContentBlockAction(data: NSDictionary) throws -> InAppContentBlockAction {
        var actionType: InAppContentBlockActionType = .close
        if let typeString: String = try data.getRequiredSafely(property: "type") {
            switch typeString {
            case "browser": actionType = .browser
            case "deeplink": actionType = .deeplink
            case "close": actionType = .close
            default: throw ExponeaDataError.invalidValue(for: "type")
            }
        }
        let name: String? = try data.getOptionalSafely(property: "name")
        let url: String?  = try data.getOptionalSafely(property: "url")
        return InAppContentBlockAction(name: name, url: url, type: actionType)
    }

    @objc(trackInAppContentBlockClick:resolve:reject:)
    func trackInAppContentBlockClick(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let actionData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockAction"),
              let inAppContentBlockAction = try? parseInAppContentBlockAction(data: actionData),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              )
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockClick(
            placeholderId: placeholderId,
            action: inAppContentBlockAction,
            message: inAppContentBlockResponse
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockClickWithoutTrackingConsent:resolve:reject:)
    func trackInAppContentBlockClickWithoutTrackingConsent(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let actionData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockAction"),
              let inAppContentBlockAction = try? parseInAppContentBlockAction(data: actionData),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              )
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockClickWithoutTrackingConsent(
            placeholderId: placeholderId,
            action: inAppContentBlockAction,
            message: inAppContentBlockResponse
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockClose:resolve:reject:)
    func trackInAppContentBlockClose(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              )
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockClose(
            placeholderId: placeholderId,
            message: inAppContentBlockResponse
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockCloseWithoutTrackingConsent:resolve:reject:)
    func trackInAppContentBlockCloseWithoutTrackingConsent(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              )
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockCloseWithoutTrackingConsent(
            placeholderId: placeholderId,
            message: inAppContentBlockResponse
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockShown:resolve:reject:)
    func trackInAppContentBlockShown(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              )
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockShown(
            placeholderId: placeholderId,
            message: inAppContentBlockResponse
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockShownWithoutTrackingConsent:resolve:reject:)
    func trackInAppContentBlockShownWithoutTrackingConsent(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              )
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockShownWithoutTrackingConsent(
            placeholderId: placeholderId,
            message: inAppContentBlockResponse
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockError:resolve:reject:)
    func trackInAppContentBlockError(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              ),
              let errorMessage: String = try? data.getOptionalSafely(property: "errorMessage")
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockError(
            placeholderId: placeholderId,
            message: inAppContentBlockResponse,
            errorMessage: errorMessage
        )
        resolve(nil)
    }

    @objc(trackInAppContentBlockErrorWithoutTrackingConsent:resolve:reject:)
    func trackInAppContentBlockErrorWithoutTrackingConsent(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let placeholderId: String = try? data.getOptionalSafely(property: "placeholderId"),
              let responseData: NSDictionary = try? data.getOptionalSafely(property: "inAppContentBlockResponse"),
              let responseJson = try? JSONSerialization.data(withJSONObject: responseData),
              let inAppContentBlockResponse = try? JSONDecoder().decode(
                InAppContentBlockResponse.self,
                from: responseJson
              ),
              let errorMessage: String = try? data.getOptionalSafely(property: "errorMessage")
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppContentBlockErrorWithoutTrackingConsent(
            placeholderId: placeholderId,
            message: inAppContentBlockResponse,
            errorMessage: errorMessage
        )
        resolve(nil)
    }
}
