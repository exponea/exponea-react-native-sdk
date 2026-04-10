//
//  ContentBlockSelector.swift
//  Exponea
//
//  Created by Adam Mihalik on 11/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK
import Combine

// Extension to retrieve first value from PassthroughSubject with timeout
extension PassthroughSubject where Failure == Never {
    func retrieveFirstOrNull(timeout: TimeInterval) -> Output? {
        var result: Output?
        let semaphore = DispatchSemaphore(value: 0)

        let cancellable = self.first()
            .timeout(.seconds(timeout), scheduler: DispatchQueue.global())
            .sink(
                receiveCompletion: { _ in
                    semaphore.signal()
                },
                receiveValue: { value in
                    result = value
                }
            )

        _ = semaphore.wait(timeout: .now() + timeout)
        cancellable.cancel()
        return result
    }
}

class BridgedContentBlockSelector {

    private let responseTimeout: TimeInterval = 2

    var filterRequestFn: (([InAppContentBlockResponse]) -> Void)?
    var sortRequestFn: (([InAppContentBlockResponse]) -> Void)?

    private var filterResponse: PassthroughSubject<[InAppContentBlockResponse], Never>?
    private var sortResponse: PassthroughSubject<[InAppContentBlockResponse], Never>?

    func filterContentBlocks(_ input: [InAppContentBlockResponse]) -> [InAppContentBlockResponse] {
        guard let filterRequestFn else {
            return input
        }
        filterResponse = PassthroughSubject<[InAppContentBlockResponse], Never>()
        filterRequestFn(input)
        let responseData = filterResponse?.retrieveFirstOrNull(timeout: responseTimeout) ?? input
        filterResponse = nil
        let filteredResponseData = retrieveMatchingById(input, responseData)
        return filteredResponseData
    }

    func sortContentBlocks(_ input: [InAppContentBlockResponse]) -> [InAppContentBlockResponse] {
        guard let sortRequestFn else {
            // Default sorting: priority descending, then name ascending
            return input.sorted { first, second in
                if first.loadPriority != second.loadPriority {
                    return first.loadPriority ?? 0 > second.loadPriority ?? 0
                }
                return first.name < second.name
            }
        }
        sortResponse = PassthroughSubject<[InAppContentBlockResponse], Never>()
        sortRequestFn(input)
        let responseData = sortResponse?.retrieveFirstOrNull(timeout: responseTimeout) ?? input
        sortResponse = nil
        let sortedResponseData = retrieveMatchingById(input, responseData)
        return sortedResponseData
    }

    func onContentFilterResponse(_ responseData: [InAppContentBlockResponse]) {
        filterResponse?.send(responseData)
    }

    func onContentSortResponse(_ responseData: [InAppContentBlockResponse]) {
        sortResponse?.send(responseData)
    }

    private func retrieveMatchingById(
        _ source: [InAppContentBlockResponse],
        _ truth: [InAppContentBlockResponse]
    ) -> [InAppContentBlockResponse] {
        let idsToMatch = truth.map { $0.id }
        return source
            .filter { eachInSource in
                return idsToMatch.contains(eachInSource.id)
            }
            .sorted {
                idsToMatch.firstIndex(of: $0.id) ?? -1 < idsToMatch.firstIndex(of: $1.id) ?? -1
            }
    }
}
