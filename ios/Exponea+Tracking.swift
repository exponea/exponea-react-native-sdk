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
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackInAppMessageClick:resolve:reject:)
    func trackInAppMessageClick(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let messageData: NSDictionary = try? data.getOptionalSafely(property: "message"),
              let json = try? JSONSerialization.data(withJSONObject: messageData),
              let inAppMessage = try? JSONDecoder().decode(InAppMessage.self, from: json),
              let button: NSDictionary = try? data.getOptionalSafely(property: "button"),
              let link: String = try? button.getOptionalSafely(property: "url")
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageClick(
            message: inAppMessage,
            buttonText: try? button.getOptionalSafely(property: "text"),
            buttonLink: link
        )
    }

    @objc(trackInAppMessageClickWithoutTrackingConsent:resolve:reject:)
    func trackInAppMessageClickWithoutTrackingConsent(
        data: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let messageData: NSDictionary = try? data.getOptionalSafely(property: "message"),
              let json = try? JSONSerialization.data(withJSONObject: messageData),
              let inAppMessage = try? JSONDecoder().decode(InAppMessage.self, from: json),
              let button: NSDictionary = try? data.getOptionalSafely(property: "button"),
              let link: String = try? button.getOptionalSafely(property: "url")
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageClickWithoutTrackingConsent(
            message: inAppMessage,
            buttonText: try? button.getOptionalSafely(property: "text"),
            buttonLink: link
        )
    }

    @objc(trackInAppMessageClose:isUserInteraction:resolve:reject:)
    func trackInAppMessageClose(
        message: NSDictionary,
        isUserInteraction: Bool = true,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let json = try? JSONSerialization.data(withJSONObject: message),
              let inAppMessage = try? JSONDecoder().decode(InAppMessage.self, from: json) else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageClose(
            message: inAppMessage,
            isUserInteraction: isUserInteraction
        )
    }

    @objc(trackInAppMessageCloseWithoutTrackingConsent:isUserInteraction:resolve:reject:)
    func trackInAppMessageCloseWithoutTrackingConsent(
        message: NSDictionary,
        isUserInteraction: Bool = true,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        guard let json = try? JSONSerialization.data(withJSONObject: message),
              let inAppMessage = try? JSONDecoder().decode(InAppMessage.self, from: json) else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Unable to parse InApp message from given data"
            ))
            return
        }
        Exponea.exponeaInstance.trackInAppMessageCloseClickWithoutTrackingConsent(
            message: inAppMessage,
            isUserInteraction: isUserInteraction
        )
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
    }
}
