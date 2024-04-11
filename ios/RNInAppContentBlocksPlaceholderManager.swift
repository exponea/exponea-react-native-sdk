//
//  RNInAppCbManager.swift
//  Exponea
//
//  Created by Adam Mihalik on 21/11/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import React
import UIKit
import ExponeaSDK

@objc(RNInAppContentBlocksPlaceholderManager)
class RNInAppContentBlocksPlaceholderManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    override func view() -> UIView! {
        return InAppContentBlocksPlaceholder()
    }
}

class InAppContentBlocksPlaceholder: UIView, InAppContentBlockCallbackType {
    @objc var onDimensChanged: RCTDirectEventBlock?
    @objc var onInAppContentBlockEvent: RCTDirectEventBlock?
    @objc var placeholderId: String? {
        didSet {
            self.setPlaceholderId(placeholderId)
        }
    }
    @objc var overrideDefaultBehavior: Bool = false
    private var currentPlaceholderId: String?
    private var currentPlaceholderInstance: StaticInAppContentBlockView?
    
    private var currentOriginalBehavior: InAppContentBlockCallbackType?

    private func setPlaceholderId(_ newPlaceholderId: String?) {
        ExponeaSDK.Exponea.logger.log(
            .verbose,
            message: "InAppCB: Sets placeholder \(newPlaceholderId ?? "nil")"
        )
        if currentPlaceholderId == newPlaceholderId,
           let currentPlaceholderInstance = currentPlaceholderInstance {
            // placeholderContainer holds same currentPlaceholderInstance
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
        guard let onDimensChanged = onDimensChanged else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCB: Callback for dimensions change not registered")
            return
        }
        onDimensChanged([
            "width": width,
            "height": height
        ])
    }
    
    private func notifyInAppContentBlockEvent(eventType: String, placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse?, action: ExponeaSDK.InAppContentBlockAction?, errorMessage: String?) {
        guard let onInAppContentBlockEvent = onInAppContentBlockEvent else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCB: Callback for InApp content block event not registered")
            return
        }
        onInAppContentBlockEvent([
            "eventType": eventType,
            "placeholderId": placeholderId,
            "contentBlock": contentBlock,
            "action": action,
            "errorMessage": errorMessage,
        ])
    }

    func onMessageShown(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse) {
        notifyInAppContentBlockEvent(eventType: "onMessageShown", placeholderId: placeholderId, contentBlock: contentBlock, action: nil, errorMessage: nil)
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onMessageShown(placeholderId: placeholderId, contentBlock: contentBlock)
        }
    }

    func onNoMessageFound(placeholderId: String) {
        notifyInAppContentBlockEvent(eventType: "onNoMessageFound", placeholderId: placeholderId, contentBlock: nil, action: nil, errorMessage: nil)
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onNoMessageFound(placeholderId: placeholderId)
        }
    }

    func onError(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse?, errorMessage: String) {
        guard let contentBlock else {
            return
        }
        notifyInAppContentBlockEvent(eventType: "onError", placeholderId: placeholderId, contentBlock: contentBlock, action: nil, errorMessage: errorMessage)
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onError( placeholderId: placeholderId, contentBlock: contentBlock, errorMessage: errorMessage)
        }
    }

    func onCloseClicked(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse) {
        notifyInAppContentBlockEvent(eventType: "onCloseClicked", placeholderId: placeholderId, contentBlock: contentBlock, action: nil, errorMessage: nil)
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onCloseClicked(placeholderId: placeholderId, contentBlock: contentBlock)
        }
    }

    func onActionClicked(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse, action: ExponeaSDK.InAppContentBlockAction) {
        notifyInAppContentBlockEvent(eventType: "onActionClicked", placeholderId: placeholderId, contentBlock: contentBlock, action: action, errorMessage: nil)
        if !overrideDefaultBehavior {
            currentOriginalBehavior?.onActionClicked(placeholderId: placeholderId, contentBlock: contentBlock, action: action)
        }
    }
}
