//
//  Extensions.swift
//  Exponea
//
//  Created by Adam Mihalik on 11/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK
import Combine
import UIKit

extension InAppContentBlockActionType {
    func description() -> String {
        switch self {
        case .deeplink:
            return "deeplink"
        case .browser:
            return "browser"
        case .close:
            return "close"
        case .unknown:
            return "unknown"
        }
    }
}

extension PassthroughSubject where PassthroughSubject.Failure == Never {
    func retrieveFirstOrNull(timeout: TimeInterval) -> Output? {
        let timedOutSem = DispatchSemaphore(value: 0)
        var cancallableTask: AnyCancellable?
        var value: Output?
        cancallableTask = self
            .timeout(.seconds(timeout), scheduler: DispatchQueue.global(qos: .background))
            .sink(receiveCompletion: { _ in
                // timeout
                timedOutSem.signal()
            }, receiveValue: {
                value = $0
                cancallableTask?.cancel()
                timedOutSem.signal()
            })
        timedOutSem.wait()
        return value
    }
}

extension RCTViewManager {
    func findNativeView<T: UIView>(ofType: T.Type, byTag tag: NSNumber, onViewFound: @escaping (T) -> Void) {
        if let uiView = self.bridge.uiManager.view(forReactTag: tag) {
            if let nativeView = uiView as? T {
                onViewFound(nativeView)
                return
            } else {
                ExponeaSDK.Exponea.logger.log(
                    .error,
                    message: "InAppCbCarousel: Native view for tag \(tag) found directly but is not \(T.self)"
                )
                // but continue with UIBlock
            }
        }
        // try to find UiView via UIBlock
        self.bridge.uiManager.addUIBlock { _, viewRegistry in
            guard let viewRegistry,
                  let uiView = viewRegistry[tag] else {
                ExponeaSDK.Exponea.logger.log(
                    .error,
                    message: "InAppCbCarousel: Native view for tag \(tag) not found"
                )
                return
            }
            guard let nativeView = uiView as? T else {
                ExponeaSDK.Exponea.logger.log(
                    .error,
                    message: "InAppCbCarousel: Native view for tag \(tag) found but is not \(T.self)"
                )
                return
            }
            onViewFound(nativeView)
        }
    }
}
