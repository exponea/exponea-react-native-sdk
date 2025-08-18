//
//  Exponea+Segmentation.swift
//  Exponea
//
//  Created by Adam Mihalik on 26/04/2024.
//  Copyright © 2024 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea {
    @objc(registerSegmentationDataCallback:includeFirstLoad:resolve:reject:)
    func registerSegmentationDataCallback(
        exposingCategory: String,
        includeFirstLoad: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let callback: ReactNativeSegmentationDataCallback = .init(
            category: .init(type: exposingCategory, data: []),
            includeFirstLoad: includeFirstLoad
        ) { reactNativeCallback, segments in
            self.sendNewSegmentsData(reactNativeCallback, segments)
        }
        SegmentationManager.shared.addCallback(callbackData: callback.nativeCallback)
        segmentationDataCallbacks.append(callback)
        startObserving(for: .segmentsUpdate())
        resolve(callback.instanceId)
    }

    @objc(unregisterSegmentationDataCallback:resolve:reject:)
    func unregisterSegmentationDataCallback(
        callbackInstanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let segmentationCallbackToRemove = segmentationDataCallbacks
            .first(where: { regCallback in regCallback.instanceId == callbackInstanceId})
        else {
            rejectPromise(reject, error: ExponeaError.generalError(
                "Segmentation callback \(callbackInstanceId) has not been found"
            ))
            return
        }
        SegmentationManager.shared.removeCallback(callbackData: segmentationCallbackToRemove.nativeCallback)
        segmentationDataCallbacks.removeAll { $0.instanceId == callbackInstanceId }
        if segmentationDataCallbacks.isEmpty {
            stopObserving(for: .segmentsUpdate())
        }
        resolve(nil)
    }

    @objc(getSegments:resolve:reject:)
    func getSegments(
        params: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        do {
            let exposingCategory: String = try params.getRequiredSafely(property: "exposingCategory")
            let force: Bool = try params.getOptionalSafely(property: "force") ?? false
            Exponea.exponeaInstance.getSegments(
                force: force,
                category: .init(type: exposingCategory, data: [])
            ) { segments in
                guard let data = try? JSONEncoder().encode(segments),
                      let body = String(data: data, encoding: .utf8) else {
                    ExponeaSDK.Exponea.logger.log(.error, message: "Unable to serialize segments data.")
                    self.rejectPromise(reject, error: ExponeaError.generalError(
                        "Unable to serialize segments data."
                    ))
                    return
                }
                resolve(body)
            }
        } catch {
            rejectPromise(reject, error: error)
        }
    }

    private func sendNewSegmentsData(
        _ callbackInstance: ReactNativeSegmentationDataCallback,
        _ segments: [SegmentDTO]
    ) {
        sendEvent(withData: SegmentationDataWrapper.init(
            callbackId: callbackInstance.instanceId,
            data: segments
        ))
    }
}

class ReactNativeSegmentationDataCallback {
    let instanceId = UUID().uuidString

    let exposingCategory: SegmentCategory
    let includeFirstLoad: Bool
    let onNewData: (ReactNativeSegmentationDataCallback, [SegmentDTO]) -> Void

    lazy var nativeCallback: SegmentCallbackData = {
        return .init(category: exposingCategory, isIncludeFirstLoad: includeFirstLoad) { data in
            ExponeaSDK.Exponea.logger.log(
                .verbose,
                message: "Segments: New segments for '\(self.exposingCategory)' received: \(data)"
            )
            self.onNewData(self, data)
        }
    }()

    init(
        category: SegmentCategory,
        includeFirstLoad: Bool,
        onNewData: @escaping (ReactNativeSegmentationDataCallback, [SegmentDTO]) -> Void
    ) {
        self.exposingCategory = category
        self.includeFirstLoad = includeFirstLoad
        self.onNewData = onNewData
    }
}

struct SegmentationDataWrapper: Hashable, Codable {
    public let callbackId: String
    public let data: [SegmentDTO]

    public enum CodingKeys: String, CodingKey {
        case callbackId
        case data
    }
}
