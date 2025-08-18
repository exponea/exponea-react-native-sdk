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
        sendEvent(withData: OpenedPush(
            action: PushAction.from(actionType: action),
            url: value,
            additionalData: extraData
        ))
    }

    func silentPushNotificationReceived(extraData: [AnyHashable: Any]?) {
        guard let extraData = extraData else { return }
        sendEvent(withData: extraData as ReceivedPush)
    }

    func sendOpenedPush(_ openedPush: OpenedPush) {
        sendEvent(withData: openedPush)
    }

    @objc(onPushOpenedListenerSet)
    func onPushOpenedListenerSet() {
        startObserving(for: .pushClick())
    }

    @objc(onPushOpenedListenerRemove)
    func onPushOpenedListenerRemove() {
        stopObserving(for: .pushClick())
    }

    func sendReceivedPushData(_ pushData: [AnyHashable: Any]) {
        sendEvent(withData: pushData as ReceivedPush)
    }

    @objc(onPushReceivedListenerSet)
    func onPushReceivedListenerSet() {
        startObserving(for: .pushReceived())
    }

    @objc(onPushReceivedListenerRemove)
    func onPushReceivedListenerRemove() {
        stopObserving(for: .pushReceived())
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

internal typealias ReceivedPush = [AnyHashable: Any]
