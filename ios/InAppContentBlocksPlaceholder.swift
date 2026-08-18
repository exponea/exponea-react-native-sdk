//
//  InAppContentBlocksPlaceholder.swift
//  Exponea
//
//  Adapted for React Native New Architecture (Fabric)
//

import Foundation
import UIKit
import ExponeaSDK

// Protocol for communicating events back to the Fabric ComponentView
@objc public protocol InAppContentBlocksPlaceholderEventEmitter: AnyObject {
    func emitDimensChanged(width: Double, height: Double)
    func emitContentBlockEvent(data: NSDictionary)
}

@objc(InAppContentBlocksPlaceholder)
public class InAppContentBlocksPlaceholder: UIView, InAppContentBlockCallbackType {
    // Delegate to emit events to Fabric ComponentView
    @objc public weak var eventEmitter: InAppContentBlocksPlaceholderEventEmitter?

    @objc public var placeholderId: String? {
        didSet {
            self.setPlaceholderId(placeholderId)
        }
    }
    @objc public var overrideDefaultBehavior: Bool = false
    private var currentPlaceholderId: String?
    private var currentPlaceholderInstance: StaticInAppContentBlockView?
    private var currentOriginalBehavior: InAppContentBlockCallbackType?

    private func setPlaceholderId(_ newPlaceholderId: String?) {
        guard ExponeaSDK.Exponea.shared.isConfigured else {
            currentPlaceholderInstance = nil
            currentOriginalBehavior = nil
            currentPlaceholderId = nil
            self.subviews.forEach { $0.removeFromSuperview() }
            return
        }
        ExponeaSDK.Exponea.logger.log(
            .verbose,
            message: "InAppCB: Sets placeholder \(newPlaceholderId ?? "nil")"
        )
        if currentPlaceholderId == newPlaceholderId,
           let currentPlaceholderInstance = currentPlaceholderInstance {
            currentPlaceholderInstance.reload()
            return
        }
        currentPlaceholderId = newPlaceholderId
        if let newPlaceholderId = newPlaceholderId {
            currentPlaceholderInstance = StaticInAppContentBlockView(placeholder: newPlaceholderId, deferredLoad: true)
            currentPlaceholderInstance?.contentReadyCompletion = { [weak self] _ in
                guard let self,
                      let placeholderInstance = self.currentPlaceholderInstance
                else {
                    ExponeaSDK.Exponea.logger.log(
                        .error,
                        message: "InAppCB: Unable to update dimens for \(newPlaceholderId) with invalid View state"
                    )
                    return
                }
                self.notifyDimensChanged(
                    width: placeholderInstance.frame.width,
                    height: placeholderInstance.frame.height
                )
            }
            currentOriginalBehavior = currentPlaceholderInstance?.behaviourCallback
            currentPlaceholderInstance?.behaviourCallback = self
        } else {
            currentPlaceholderInstance = nil
            currentOriginalBehavior = nil
        }
        self.subviews.forEach { $0.removeFromSuperview() }
        ExponeaSDK.Exponea.logger.log(
            .verbose,
            message: "InAppCB: Going to set placeholder \(newPlaceholderId ?? "nil")"
        )
        if let newPlaceholderInstance = currentPlaceholderInstance {
            self.addSubview(newPlaceholderInstance)
            // !!! do not set bottomAnchor, it breaks internal `contentReady` flow due to non-relayout behaviour
            newPlaceholderInstance.translatesAutoresizingMaskIntoConstraints = false
            newPlaceholderInstance.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
            newPlaceholderInstance.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
            newPlaceholderInstance.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
            ExponeaSDK.Exponea.logger.log(
                .verbose,
                message: "InAppCB: Added placeholder \(newPlaceholderId ?? "nil")"
            )
            newPlaceholderInstance.reload()
        }
    }

    private func notifyDimensChanged(width: CGFloat, height: CGFloat) {
        // emitDimensChanged triggers a React Native layout pass — must be on the main thread.
        let w = Double(width), h = Double(height)
        onMain { [weak self] in
            self?.eventEmitter?.emitDimensChanged(width: w, height: h)
        }
    }

    private func notifyInAppContentBlockEvent(
        eventType: String,
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse?,
        action: ExponeaSDK.InAppContentBlockAction?,
        errorMessage: String?
    ) {
        // Serialise on the calling (potentially background) thread; the actual bridge
        // call is deferred to the main thread where RCTEventEmitter expects to run.
        let contentBlockJson: String? = contentBlock.flatMap { cb in
            guard let data = try? JSONEncoder().encode(cb),
                  let json = String(data: data, encoding: .utf8) else { return nil }
            return json
        }

        let actionJson: String? = action.flatMap { act in
            guard let data = try? JSONEncoder().encode(act),
                  let json = String(data: data, encoding: .utf8) else { return nil }
            return json
        }

        var payload: [String: Any] = [
            "eventType": eventType,
            "placeholderId": placeholderId
        ]
        if let contentBlockJson { payload["contentBlock"] = contentBlockJson }
        if let actionJson { payload["contentBlockAction"] = actionJson }
        if let errorMessage { payload["errorMessage"] = errorMessage }

        let dict = payload as NSDictionary
        onMain { [weak self] in
            self?.eventEmitter?.emitContentBlockEvent(data: dict)
        }
    }

    public func onMessageShown(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse) {
        notifyInAppContentBlockEvent(
            eventType: "SHOWN",
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: nil,
            errorMessage: nil
        )
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onMessageShown(placeholderId: placeholderId, contentBlock: contentBlock)
        }
    }

    public func onNoMessageFound(placeholderId: String) {
        notifyInAppContentBlockEvent(
            eventType: "NO_MESSAGE_FOUND",
            placeholderId: placeholderId,
            contentBlock: nil,
            action: nil,
            errorMessage: nil
        )
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onNoMessageFound(placeholderId: placeholderId)
        }
    }

    public func onError(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse?, errorMessage: String) {
        notifyInAppContentBlockEvent(
            eventType: "ERROR",
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: nil,
            errorMessage: errorMessage
        )
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onError(
                placeholderId: placeholderId,
                contentBlock: contentBlock,
                errorMessage: errorMessage
            )
        }
    }

    public func onCloseClicked(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse) {
        notifyInAppContentBlockEvent(
            eventType: "CLOSE_CLICKED",
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: nil,
            errorMessage: nil
        )
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onCloseClicked(placeholderId: placeholderId, contentBlock: contentBlock)
        }
    }

    public func onActionClicked(
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse,
        action: ExponeaSDK.InAppContentBlockAction
    ) {
        notifyInAppContentBlockEvent(
            eventType: "ACTION_CLICKED",
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: action,
            errorMessage: nil
        )
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onActionClicked(
                placeholderId: placeholderId,
                contentBlock: contentBlock,
                action: action
            )
        }
    }

    public func onActionClickedSafari(
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse,
        action: ExponeaSDK.InAppContentBlockAction
    ) {
        notifyInAppContentBlockEvent(
            eventType: "ACTION_CLICKED",
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: action,
            errorMessage: nil
        )
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onActionClickedSafari(
                placeholderId: placeholderId,
                contentBlock: contentBlock,
                action: action
            )
        }
    }
}
