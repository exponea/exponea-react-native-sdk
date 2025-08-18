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
        sendEvent(withData: InAppMessageAction(
            message: message,
            button: nil,
            interaction: nil,
            errorMessage: nil,
            type: .show
        ))
    }

    func inAppMessageError(message: ExponeaSDK.InAppMessage?, errorMessage: String) {
        sendEvent(withData: InAppMessageAction(
            message: message,
            button: nil,
            interaction: nil,
            errorMessage: errorMessage,
            type: .error
        ))
    }

    func inAppMessageClickAction(message: ExponeaSDK.InAppMessage, button: ExponeaSDK.InAppMessageButton) {
        sendEvent(withData: InAppMessageAction(
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
        sendEvent(withData: InAppMessageAction(
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
        startObserving(for: .inappAction())
    }

    @objc(onInAppMessageCallbackRemove)
    func onInAppMessageCallbackRemove() {
        stopObserving(for: .inappAction())
        // Resets to default behavior
        inAppOverrideDefaultBehavior = false
        inAppTrackActions = true
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
