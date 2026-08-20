//
//  ContentBlockSelector.swift
//  Exponea
//
//  Created by Adam Mihalik on 11/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

class BridgedContentBlockSelector {

    typealias RequestFn = ([InAppContentBlockResponse], String) -> Void

    private enum Stage: String {
        case filter
        case sort
    }

    private struct PendingRequest {
        let input: [InAppContentBlockResponse]
        let startedAt: CFAbsoluteTime
        let completion: ([InAppContentBlockResponse]) -> Void
        let timeout: DispatchWorkItem
    }

    private let responseTimeout: TimeInterval = 2
    private let stateQueue = DispatchQueue(label: "com.exponea.bridged-selector.state")
    private var pendingFilterRequests: [String: PendingRequest] = [:]
    private var pendingSortRequests: [String: PendingRequest] = [:]

    var filterRequestFn: RequestFn?
    var sortRequestFn: RequestFn?

    // Must only be read and written on the main thread.
    // filterRequestFn / sortRequestFn are assigned via @objc property observers on
    // CarouselInAppContentBlockViewProxy, which React Native always calls on main.
    var isCustomSortActive: Bool {
        sortRequestFn != nil
    }

    func filterAndSortContentBlocksAsync(
        _ input: [InAppContentBlockResponse],
        completion: @escaping (_ result: [InAppContentBlockResponse], _ sortWasApplied: Bool) -> Void
    ) {
        filterContentBlocksAsync(input) { [weak self] filtered in
            guard let self, let sortRequestFn = self.sortRequestFn else {
                // Re-check after filter so a hook removed mid-flight falls back to native sort.
                completion(filtered, false)
                return
            }
            self.startRequest(stage: .sort, input: filtered, requestFn: sortRequestFn) { sorted in
                completion(sorted, true)
            }
        }
    }

    /// Cancels all in-flight filter/sort bridge requests without invoking completions.
    /// Used when the carousel view is destroyed so stale JS responses cannot resume work.
    func cancelPendingRequests() {
        let pending: [PendingRequest] = stateQueue.sync {
            let all = Array(pendingFilterRequests.values) + Array(pendingSortRequests.values)
            pendingFilterRequests.removeAll()
            pendingSortRequests.removeAll()
            return all
        }
        for request in pending {
            request.timeout.cancel()
        }
    }

    func filterContentBlocksAsync(
        _ input: [InAppContentBlockResponse],
        completion: @escaping ([InAppContentBlockResponse]) -> Void
    ) {
        guard let filterRequestFn else {
            completion(input)
            return
        }
        startRequest(stage: .filter, input: input, requestFn: filterRequestFn, completion: completion)
    }

    func sortContentBlocksAsync(
        _ input: [InAppContentBlockResponse],
        completion: @escaping ([InAppContentBlockResponse]) -> Void
    ) {
        guard let sortRequestFn else {
            completion(input)
            return
        }
        startRequest(stage: .sort, input: input, requestFn: sortRequestFn, completion: completion)
    }

    func onContentFilterResponse(_ responseData: [InAppContentBlockResponse], token: String?) {
        resolveRequest(stage: .filter, responseData: responseData, token: token)
    }

    func onContentSortResponse(_ responseData: [InAppContentBlockResponse], token: String?) {
        resolveRequest(stage: .sort, responseData: responseData, token: token)
    }

    private func startRequest(
        stage: Stage,
        input: [InAppContentBlockResponse],
        requestFn: RequestFn,
        completion: @escaping ([InAppContentBlockResponse]) -> Void
    ) {
        let token = UUID().uuidString
        let startedAt = CFAbsoluteTimeGetCurrent()
        let timeout = DispatchWorkItem { [weak self] in
            self?.resolveRequest(stage: stage, responseData: nil, token: token)
        }
        let pending = PendingRequest(
            input: input,
            startedAt: startedAt,
            completion: completion,
            timeout: timeout
        )
        stateQueue.sync {
            switch stage {
            case .filter:
                self.pendingFilterRequests[token] = pending
            case .sort:
                self.pendingSortRequests[token] = pending
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + responseTimeout, execute: timeout)
        requestFn(input, token)
    }

    private func resolveRequest(
        stage: Stage,
        responseData: [InAppContentBlockResponse]?,
        token: String?
    ) {
        let resolved: (token: String, request: PendingRequest)? = stateQueue.sync {
            if let token {
                return popPending(stage: stage, token: token)
            }
            let pendingCount = self.pendingCount(for: stage)
            guard pendingCount == 1, let only = self.oldestPending(stage: stage) else {
                if pendingCount > 1 {
                    ExponeaSDK.Exponea.logger.log(
                        .warning,
                        message: "InAppCbCarousel: Ignoring untokenized \(stage.rawValue) response with \(pendingCount) pending requests"
                    )
                }
                return nil
            }
            return popPending(stage: stage, token: only.token)
        }
        guard let resolved else {
            return
        }
        resolved.request.timeout.cancel()
        let outputSource = responseData ?? resolved.request.input
        let output = retrieveMatchingById(resolved.request.input, outputSource)

        DispatchQueue.main.async {
            resolved.request.completion(output)
        }
    }

    private func popPending(stage: Stage, token: String) -> (token: String, request: PendingRequest)? {
        switch stage {
        case .filter:
            guard let request = pendingFilterRequests.removeValue(forKey: token) else { return nil }
            return (token, request)
        case .sort:
            guard let request = pendingSortRequests.removeValue(forKey: token) else { return nil }
            return (token, request)
        }
    }

    private func pendingCount(for stage: Stage) -> Int {
        switch stage {
        case .filter:
            return pendingFilterRequests.count
        case .sort:
            return pendingSortRequests.count
        }
    }

    private func oldestPending(stage: Stage) -> (token: String, startedAt: CFAbsoluteTime)? {
        let map: [String: PendingRequest]
        switch stage {
        case .filter:
            map = pendingFilterRequests
        case .sort:
            map = pendingSortRequests
        }
        guard let oldest = map.min(by: { $0.value.startedAt < $1.value.startedAt }) else {
            return nil
        }
        return (oldest.key, oldest.value.startedAt)
    }

    private func retrieveMatchingById(
        _ source: [InAppContentBlockResponse],
        _ truth: [InAppContentBlockResponse]
    ) -> [InAppContentBlockResponse] {
        let idsToMatch = truth.map { $0.id }
        return source
            .filter { eachInSource in
                idsToMatch.contains(eachInSource.id)
            }
            .sorted {
                idsToMatch.firstIndex(of: $0.id) ?? -1 < idsToMatch.firstIndex(of: $1.id) ?? -1
            }
    }
}
