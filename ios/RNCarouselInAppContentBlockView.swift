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
        super.filterContentBlocks(
            placeholder: placeholder,
            continueCallback: { [weak self] loadedContentBlocks in
                guard let self else {
                    continueCallback(loadedContentBlocks)
                    return
                }
                let filteredContentBlocks = contentSelector.filterContentBlocks(loadedContentBlocks)
                continueCallback(filteredContentBlocks)
            },
            expiredCompletion: expiredCompletion
        )
    }
    override func sortContentBlocks(data: [StaticReturnData]) -> [StaticReturnData] {
        let contentBlocksToSort = data.compactMap { $0.message }
        let sortedContentBlocks = contentSelector.sortContentBlocks(contentBlocksToSort)
        let sortedStaticData = sortedContentBlocks.compactMap { sortedContentBlock in
            data.first { $0.message?.id == sortedContentBlock.id }
        }
        return sortedStaticData
    }
}
