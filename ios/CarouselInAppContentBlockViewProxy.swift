//
//  CarouselInAppContentBlockViewProxy.swift
//  Exponea
//
//  Created by Adam Mihalik on 11/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import ExponeaSDK

class CarouselInAppContentBlockViewProxy: UIView, DefaultContentBlockCarouselCallback {

    private var currentCarouselInstance: RNCarouselInAppContentBlockView?

    private var bridgedContentSelector = BridgedContentBlockSelector()

    @objc var initProps: NSDictionary? {
        didSet {
            guard let initPropsMap = initProps else {
                ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: initProps must be declared")
                return
            }
            guard let placeholderId: String = try? initPropsMap.getRequiredSafely(property: "placeholderId") else {
                ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: placeholderId must be declared")
                return
            }
            self.recreateCarouselView(
                placeholderId: placeholderId,
                maxMessagesCount: try? initPropsMap.getOptionalSafely(property: "maxMessagesCount"),
                scrollDelay: try? initPropsMap.getOptionalSafely(property: "scrollDelay")
            )
        }
    }
    @objc var overrideDefaultBehavior: Bool = false
    @objc var trackActions: Bool = true
    @objc var customFilterActive: Bool = false {
        didSet {
            if customFilterActive {
                bridgedContentSelector.filterRequestFn = { data in
                    self.notifyContentFilterRequest(input: data)
                }
            } else {
                bridgedContentSelector.filterRequestFn = nil
            }
        }
    }
    @objc var customSortActive: Bool = false {
        didSet {
            if customSortActive {
                bridgedContentSelector.sortRequestFn = { data in
                    self.notifyContentSortRequest(input: data)
                }
            } else {
                bridgedContentSelector.sortRequestFn = nil
            }
        }
    }
    @objc var onDimensChanged: RCTDirectEventBlock?
    @objc var onContentBlockEvent: RCTDirectEventBlock?
    @objc var onContentBlockDataRequestEvent: RCTDirectEventBlock?

    func onMessageShown(
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse,
        index: Int,
        count: Int
    ) {
        notifyContentBlockCarouselEvent(.onMessageShown(
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            index: index,
            count: count
        ))
    }

    func onMessagesChanged(count: Int, messages: [ExponeaSDK.InAppContentBlockResponse]) {
        notifyContentBlockCarouselEvent(.onMessageChanged(
            count: count,
            contentBlocks: messages
        ))
    }

    func onNoMessageFound(placeholderId: String) {
        notifyContentBlockCarouselEvent(.onNoMessageFound(
            placeholderId: placeholderId
        ))
    }

    func onError(
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse?,
        errorMessage: String
    ) {
        notifyContentBlockCarouselEvent(.onError(
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            errorMessage: errorMessage
        ))
    }

    func onCloseClicked(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse) {
        notifyContentBlockCarouselEvent(.onCloseClicked(
            placeholderId: placeholderId,
            contentBlock: contentBlock
        ))
    }

    func onActionClickedSafari(
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse,
        action: ExponeaSDK.InAppContentBlockAction
    ) {
        notifyContentBlockCarouselEvent(.onActionClicked(
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: action
        ))
    }

    func onHeightUpdate(placeholderId: String, height: CGFloat) {
        notifyDimensChanged(width: 0, height: height)
    }

    func onFilterResponse(_ args: NSArray) {
        let dataArray = parseInAppContentBlockResponses(args)
        bridgedContentSelector.onContentFilterResponse(dataArray)
    }

    func onSortResponse(_ args: NSArray) {
        let dataArray = parseInAppContentBlockResponses(args)
        bridgedContentSelector.onContentSortResponse(dataArray)
    }

    private func parseInAppContentBlockResponses(_ source: NSArray) -> [InAppContentBlockResponse] {
        return source
            .compactMap { $0 as? String }
            .compactMap { $0.data(using: .utf8) }
            .compactMap { try? JSONDecoder().decode(InAppContentBlockResponse.self, from: $0) }
    }

    private func recreateCarouselView(
        placeholderId: String,
        maxMessagesCount: Int?,
        scrollDelay: TimeInterval?
    ) {
        destroyPreviousCarouselInstance()
        currentCarouselInstance = RNCarouselInAppContentBlockView(
            placeholderId: placeholderId,
            maxMessagesCount: maxMessagesCount,
            scrollDelay: scrollDelay,
            behaviourCallback: self,
            contentSelector: bridgedContentSelector
        )
        if let currentCarouselInstance {
            self.addSubview(currentCarouselInstance)
            // !!! do not set bottomAnchor, it breaks internal `contentReady` flow due to non-relayout behaviour
            currentCarouselInstance.translatesAutoresizingMaskIntoConstraints = false
            currentCarouselInstance.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
            currentCarouselInstance.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
            currentCarouselInstance.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
            currentCarouselInstance.reload()
            currentCarouselInstance.continueWithTimer()
        }
    }

    private func destroyPreviousCarouselInstance() {
        currentCarouselInstance?.release()
        currentCarouselInstance = nil
        self.subviews.forEach { $0.removeFromSuperview() }
    }

    private func notifyDimensChanged(width: CGFloat, height: CGFloat) {
        guard let onDimensChanged = onDimensChanged else {
            ExponeaSDK.Exponea.logger.log(
                .error,
                message: "InAppCbCarousel: Callback for dimensions change not registered"
            )
            return
        }
        onDimensChanged([
            "width": width,
            "height": height
        ])
    }

    private func notifyContentBlockCarouselEvent(_ event: ContentBlockCarouselEvent) {
        guard let onContentBlockEvent else {
            ExponeaSDK.Exponea.logger.log(
                .error,
                message: "InAppCbCarousel: Callback for Carousel event not registered"
            )
            return
        }
        onContentBlockEvent(event.toDictionary())
    }

    private func notifyContentFilterRequest(input: [ExponeaSDK.InAppContentBlockResponse]) {
        guard let onContentBlockDataRequestEvent else {
            ExponeaSDK.Exponea.logger.log(
                .error,
                message: "InAppCbCarousel: Callback for Carousel data filter request not registered"
            )
            return
        }
        onContentBlockDataRequestEvent([
            "requestType": "filter",
            "data": input.compactMap({ contentBlock in
                guard let data = try? JSONEncoder().encode(contentBlock),
                      let body = String(data: data, encoding: .utf8) else {
                    return nil as String?
                }
                return body
            })
        ])
    }

    private func notifyContentSortRequest(input: [ExponeaSDK.InAppContentBlockResponse]) {
        guard let onContentBlockDataRequestEvent else {
            ExponeaSDK.Exponea.logger.log(
                .error,
                message: "InAppCbCarousel: Callback for Carousel data sort request not registered"
            )
            return
        }
        onContentBlockDataRequestEvent([
            "requestType": "sort",
            "data": input.compactMap({ contentBlock in
                guard let data = try? JSONEncoder().encode(contentBlock),
                      let body = String(data: data, encoding: .utf8) else {
                    return nil as String?
                }
                return body
            })
        ])
    }
}
