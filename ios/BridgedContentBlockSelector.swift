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
        return responseData
    }

    func sortContentBlocks(_ input: [InAppContentBlockResponse]) -> [InAppContentBlockResponse] {
        guard let sortRequestFn else {
            return input
        }
        sortResponse = PassthroughSubject<[InAppContentBlockResponse], Never>()
        sortRequestFn(input)
        let responseData = sortResponse?.retrieveFirstOrNull(timeout: responseTimeout) ?? input
        sortResponse = nil
        return responseData
    }

    func onContentFilterResponse(_ responseData: [InAppContentBlockResponse]) {
        filterResponse?.send(responseData)
    }

    func onContentSortResponse(_ responseData: [InAppContentBlockResponse]) {
        sortResponse?.send(responseData)
    }
}
