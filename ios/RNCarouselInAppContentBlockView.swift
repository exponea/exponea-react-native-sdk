//
//  RNCarouselInAppContentBlockView.swift
//  Exponea
//
//  Created by Adam Mihalik on 11/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

class RNCarouselInAppContentBlockView: CarouselInAppContentBlockView {

    private let contentSelector: BridgedContentBlockSelector
    /// Monotonic id for each `filterContentBlocks` invocation so overlapping
    /// initial/full reload cycles cannot share sort-applied state.
    private var filterCycle = 0
    /// Sort-applied flag for the continuation currently running on the main stack.
    private var sortWasAppliedForContinuation = false

    init(
        placeholderId: String,
        maxMessagesCount: Int?,
        scrollDelay: TimeInterval?,
        behaviourCallback: DefaultContentBlockCarouselCallback,
        contentSelector: BridgedContentBlockSelector
    ) {
        self.contentSelector = contentSelector
        if let maxMessagesCount, let scrollDelay {
            super.init(
                placeholder: placeholderId,
                maxMessagesCount: maxMessagesCount,
                scrollDelay: scrollDelay,
                behaviourCallback: behaviourCallback
            )
        } else if let maxMessagesCount {
            super.init(
                placeholder: placeholderId,
                maxMessagesCount: maxMessagesCount,
                behaviourCallback: behaviourCallback
            )
        } else if let scrollDelay {
            super.init(
                placeholder: placeholderId,
                scrollDelay: scrollDelay,
                behaviourCallback: behaviourCallback
            )
        } else {
            super.init(
                placeholder: placeholderId,
                behaviourCallback: behaviourCallback
            )
        }
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func filterContentBlocks(
        placeholder: String,
        continueCallback: TypeBlock<[InAppContentBlockResponse]>?,
        expiredCompletion: EmptyBlock?
    ) {
        guard let continueCallback else {
            return
        }
        filterCycle += 1
        let cycle = filterCycle
        super.filterContentBlocks(
            placeholder: placeholder,
            continueCallback: { [weak self] loadedContentBlocks in
                guard let self else {
                    return
                }
                contentSelector.filterAndSortContentBlocksAsync(loadedContentBlocks) { [weak self] selectedContentBlocks, sortApplied in
                    guard let self else {
                        return
                    }
                    guard cycle == self.filterCycle else {
                        return
                    }
                    // `sortContentBlocks` runs synchronously inside `continueCallback`.
                    self.sortWasAppliedForContinuation = sortApplied
                    continueCallback(selectedContentBlocks)
                    self.sortWasAppliedForContinuation = false
                }
            },
            expiredCompletion: expiredCompletion
        )
    }

    override func sortContentBlocks(data: [StaticReturnData]) -> [StaticReturnData] {
        guard sortWasAppliedForContinuation else {
            return super.sortContentBlocks(data: data)
        }
        return data
    }
}
