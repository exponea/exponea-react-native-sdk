//
//  Exponea+InAppMessage.swift
//  Exponea
//
//  Created by Adam Mihalik on 17/05/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea: InAppMessageActionDelegate {
    var overrideDefaultBehavior: Bool {
        self.inAppOverrideDefaultBehavior
    }

    var trackActions: Bool {
        self.inAppTrackActions
    }

    func inAppMessageShown(message: ExponeaSDK.InAppMessage) {
        onInAppAction(InAppMessageAction(
            message: message,
            button: nil,
            interaction: nil,
            errorMessage: nil,
            type: .show
        ))
    }

    func inAppMessageError(message: ExponeaSDK.InAppMessage?, errorMessage: String) {
        onInAppAction(InAppMessageAction(
            message: message,
            button: nil,
            interaction: nil,
            errorMessage: errorMessage,
            type: .error
        ))
    }

    func inAppMessageClickAction(message: ExponeaSDK.InAppMessage, button: ExponeaSDK.InAppMessageButton) {
        onInAppAction(InAppMessageAction(
            message: message,
            button: button,
            interaction: nil,
            errorMessage: nil,
            type: .action
        ))
    }

    func inAppMessageCloseAction(
        message: ExponeaSDK.InAppMessage,
        button: ExponeaSDK.InAppMessageButton?,
        interaction: Bool
    ) {
        onInAppAction(InAppMessageAction(
            message: message,
            button: button,
            interaction: interaction,
            errorMessage: nil,
            type: .close
        ))
    }

    @objc(onInAppMessageCallbackSet:trackActions:)
    func onInAppMessageCallbackSet(
        overrideDefaultBehavior: Bool,
        trackActions: Bool
    ) {
        inAppOverrideDefaultBehavior = overrideDefaultBehavior
        inAppTrackActions = trackActions
        inAppActionCallbackSet = true
        if let pending = pendingInAppAction {
            onInAppAction(pending)
            pendingInAppAction = nil
        }
    }

    @objc(onInAppMessageCallbackRemove)
    func onInAppMessageCallbackRemove() {
        inAppActionCallbackSet = false
        // Resets to default behavior
        inAppOverrideDefaultBehavior = false
        inAppTrackActions = true
    }

    func onInAppAction(_ action: InAppMessageAction) {
        if inAppActionCallbackSet {
            guard let data = try? JSONEncoder().encode(action),
                  let body = String(data: data, encoding: .utf8) else {
                return
            }
            sendEvent(withName: "inAppAction", body: body)
        } else {
            pendingInAppAction = action
        }
    }
}

struct InAppMessageAction: Codable {
    let message: InAppMessage?
    let button: InAppMessageButton?
    let interaction: Bool?
    let errorMessage: String?
    let type: InAppMessageActionType
}

enum InAppMessageActionType: String, Codable {
    case show = "SHOW"
    case action = "ACTION"
    case close = "CLOSE"
    case error = "ERROR"
}
