//
//  Exponea+PushNotifications.swift
//  Exponea
//
//  Created by Panaxeo on 25/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea: PushNotificationManagerDelegate {
    func pushNotificationOpened(
        with action: ExponeaNotificationActionType,
        value: String?,
        extraData: [AnyHashable: Any]?
    ) {
        let openedPush = OpenedPush(
            action: PushAction.from(actionType: action),
            url: value,
            additionalData: extraData
        )
        if pushOpenedListenerSet {
            sendOpenedPush(openedPush)
        } else {
            pendingOpenedPush = openedPush
        }
    }

    func silentPushNotificationReceived(extraData: [AnyHashable: Any]?) {
        guard let extraData = extraData else { return }
        if pushReceivedListenerSet {
            sendReceivedPushData(extraData)
        } else {
            pendingReceivedPushData = extraData
        }
    }

    func sendOpenedPush(_ openedPush: OpenedPush) {
        let payload: [String: Any?] = [
            "action": openedPush.action.rawValue,
            "url": openedPush.url,
            "additionalData": openedPush.additionalData
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let body = String(data: data, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "Unable to serialize opened push.")
            return
        }
        sendEvent(withName: "pushOpened", body: body)
    }

    @objc(onPushOpenedListenerSet)
    func onPushOpenedListenerSet() {
        pushOpenedListenerSet = true
        if let pending = pendingOpenedPush {
            sendOpenedPush(pending)
            pendingOpenedPush = nil
        }
    }

    @objc(onPushOpenedListenerRemove)
    func onPushOpenedListenerRemove() {
        pushOpenedListenerSet = false
    }

    func sendReceivedPushData(_ pushData: [AnyHashable: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: pushData),
              let body = String(data: data, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "Unable to serialize received push data.")
            return
        }
        sendEvent(withName: "pushReceived", body: body)
    }

    @objc(onPushReceivedListenerSet)
    func onPushReceivedListenerSet() {
        pushReceivedListenerSet = true
        if let pendingData = pendingReceivedPushData {
            sendReceivedPushData(pendingData)
            pendingReceivedPushData = nil
        }
    }

    @objc(onPushReceivedListenerRemove)
    func onPushReceivedListenerRemove() {
        pushReceivedListenerSet = false
    }

    @objc(requestPushAuthorization:reject:)
    func requestPushAuthorization(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.badge, .alert, .sound]) { (granted, _) in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            resolve(granted)
        }
    }

    @objc(handlePushNotificationToken:)
    static func handlePushNotificationToken(deviceToken: Data) {
        Exponea.exponeaInstance.handlePushNotificationToken(deviceToken: deviceToken)
    }

    @objc
    static func handlePushNotificationOpened(userInfo: [AnyHashable: Any]) {
        Exponea.exponeaInstance.handlePushNotificationOpened(userInfo: userInfo, actionIdentifier: nil)
    }

    @objc
    static func handlePushNotificationOpened(response: UNNotificationResponse) {
        Exponea.exponeaInstance.handlePushNotificationOpened(response: response)
    }
}

enum PushAction: String {
    case app
    case deeplink
    case web

    static func from(actionType: ExponeaNotificationActionType) -> PushAction {
        switch actionType {
        case .none: return .app
        case .openApp: return .app
        case .deeplink: return .deeplink
        case .browser: return .web
        case .selfCheck: return .app
        }
    }
}

struct OpenedPush {
    let action: PushAction
    let url: String?
    let additionalData: [AnyHashable: Any]?
}
