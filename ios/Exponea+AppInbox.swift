//
//  Exponea+AppInbox.swift
//  Exponea
//
//  Created by Adam Mihalik on 23/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea {
    private func normalizeData(_ source: [String: JSONValue]?) throws -> [String: Any?] {
        let rawContent = try JSONEncoder().encode(source)
        let normalized = try JSONSerialization.jsonObject(
            with: rawContent, options: []
        ) as? [String: Any?]
        return normalized ?? [:]
    }
    @objc(fetchAppInbox:reject:)
    func fetchAppInbox(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        Exponea.exponeaInstance.fetchAppInbox { result in
            switch result {
            case .success(let response):
                do {
                    let simpleMessages: [[String: Any?]] = try response.map({ message in
                        // keep in sync with AppInboxMessage.ts
                        let simpleMsg: [String: Any?] = [
                            "id": message.id,
                            "type": message.type,
                            "is_read": message.read,
                            "create_time": message.rawReceivedTime,
                            "content": try self.normalizeData(message.rawContent)
                        ]
                        return simpleMsg
                    })
                    resolve(String(data: try JSONSerialization.data(withJSONObject: simpleMessages), encoding: .utf8))
                } catch {
                    self.rejectPromise(reject, error: error)
                }
            case .failure(let error):
                self.rejectPromise(reject, error: error)
            }
        }
    }

    @objc(fetchAppInboxItem:resolve:reject:)
    func fetchAppInboxItem(
        messageId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        Exponea.exponeaInstance.fetchAppInboxItem(messageId) { result in
            switch result {
            case .success(let message):
                do {
                    // keep in sync with AppInboxMessage.ts
                    let simpleMessage: [String: Any?] = [
                        "id": message.id,
                        "type": message.type,
                        "is_read": message.read,
                        "create_time": message.rawReceivedTime,
                        "content": try self.normalizeData(message.rawContent)
                    ]
                    resolve(String(data: try JSONSerialization.data(withJSONObject: simpleMessage), encoding: .utf8))
                } catch {
                    self.rejectPromise(reject, error: error)
                }
            case .failure(let error):
                self.rejectPromise(reject, error: error)
            }
        }
    }

    @objc(markAppInboxAsRead:resolve:reject:)
    func markAppInboxAsRead(
        message: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            guard let messageId: String = try message.getRequiredSafely(property: "id") else {
                rejectPromise(
                    reject,
                    error: ExponeaError.fetchError(description: "AppInbox message data are invalid. See logs")
                )
                return
            }
            Exponea.exponeaInstance.fetchAppInboxItem(messageId) { nativeMessageResult in
                switch nativeMessageResult {
                case .success(let nativeMessage):
                    // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
                    Exponea.exponeaInstance.markAppInboxAsRead(nativeMessage) { marked in
                        resolve(marked)
                    }
                case .failure(let error):
                    self.rejectPromise(reject, error: error)
                }
            }
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackAppInboxClick:message:resolve:reject:)
    func trackAppInboxClick(
        action: NSDictionary,
        message: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            guard let messageId: String = try message.getRequiredSafely(property: "id") else {
                rejectPromise(
                    reject,
                    error: ExponeaError.fetchError(description: "AppInbox message data are invalid. See logs")
                )
                return
            }
            // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
            Exponea.exponeaInstance.fetchAppInboxItem(messageId) { nativeMessageResult in
                switch nativeMessageResult {
                case .success(let nativeMessage):
                    do {
                        let action = MessageItemAction(
                            action: try action.getOptionalSafely(property: "action"),
                            title: try action.getOptionalSafely(property: "title"),
                            url: try action.getOptionalSafely(property: "url")
                        )
                        Exponea.exponeaInstance.trackAppInboxClick(action: action, message: nativeMessage)
                        resolve(nil)
                    } catch {
                        self.rejectPromise(reject, error: error)
                    }
                case .failure(let error):
                    self.rejectPromise(reject, error: error)
                }
            }
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackAppInboxOpened:resolve:reject:)
    func trackAppInboxOpened(
        message: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            guard let messageId: String = try message.getRequiredSafely(property: "id") else {
                rejectPromise(
                    reject,
                    error: ExponeaError.fetchError(description: "AppInbox message data are invalid. See logs")
                )
                return
            }
            // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
            Exponea.exponeaInstance.fetchAppInboxItem(messageId) { nativeMessageResult in
                switch nativeMessageResult {
                case .success(let nativeMessage):
                    Exponea.exponeaInstance.trackAppInboxOpened(message: nativeMessage)
                    resolve(nil)
                case .failure(let error):
                    self.rejectPromise(reject, error: error)
                }
            }
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackAppInboxClickWithoutTrackingConsent:message:resolve:reject:)
    func trackAppInboxClickWithoutTrackingConsent(
        action: NSDictionary,
        message: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            guard let messageId: String = try message.getRequiredSafely(property: "id") else {
                rejectPromise(
                    reject,
                    error: ExponeaError.fetchError(description: "AppInbox message data are invalid. See logs")
                )
                return
            }
            // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
            Exponea.exponeaInstance.fetchAppInboxItem(messageId) { nativeMessageResult in
                switch nativeMessageResult {
                case .success(let nativeMessage):
                    do {
                        let actionJson = try JSONSerialization.data(withJSONObject: action)
                        let action = try JSONDecoder().decode(MessageItemAction.self, from: actionJson)
                        Exponea.exponeaInstance.trackAppInboxClickWithoutTrackingConsent(
                            action: action,
                            message: nativeMessage
                        )
                        resolve(nil)
                    } catch {
                        self.rejectPromise(reject, error: error)
                    }
                case .failure(let error):
                    self.rejectPromise(reject, error: error)
                }
            }
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(trackAppInboxOpenedWithoutTrackingConsent:resolve:reject:)
    func trackAppInboxOpenedWithoutTrackingConsent(
        message: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            guard let messageId: String = try message.getRequiredSafely(property: "id") else {
                rejectPromise(
                    reject,
                    error: ExponeaError.fetchError(description: "AppInbox message data are invalid. See logs")
                )
                return
            }
            // we need to fetch native MessageItem; method needs syncToken and customerIds to be fetched
            Exponea.exponeaInstance.fetchAppInboxItem(messageId) { nativeMessageResult in
                switch nativeMessageResult {
                case .success(let nativeMessage):
                    Exponea.exponeaInstance.trackAppInboxOpened(message: nativeMessage)
                    resolve(nil)
                case .failure(let error):
                    self.rejectPromise(reject, error: error)
                }
            }
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    @objc(setAppInboxProvider:resolve:reject:)
    func setAppInboxProvider(
        configuration: NSDictionary,
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        do {
            let appInboxStyle = try AppInboxStyleParser(configuration).parse()
            Exponea.exponeaInstance.appInboxProvider = ReactNativeAppInboxProvider(appInboxStyle)
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }
}
