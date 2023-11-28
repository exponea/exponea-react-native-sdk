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

class InAppContentBlocksPlaceholder: UIView {
    @objc var onDimensChanged: RCTDirectEventBlock?
    @objc var placeholderId: String? {
        didSet {
            self.setPlaceholderId(placeholderId)
        }
    }
    private var currentPlaceholderId: String?
    private var currentPlaceholderInstance: StaticInAppContentBlockView?
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
        } else {
            currentPlaceholderInstance = nil
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
}
