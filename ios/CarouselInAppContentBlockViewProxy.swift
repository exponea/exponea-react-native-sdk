//
//  CarouselInAppContentBlockViewProxy.swift
//  Exponea
//
//  Adapted for React Native New Architecture (Fabric)
//

import Foundation
import UIKit
import ExponeaSDK

// Protocol for communicating events back to the Fabric ComponentView
@objc public protocol CarouselContentBlockEventEmitter: AnyObject {
    func emitDimensChanged(width: Double, height: Double)
    func emitContentBlockEvent(data: NSDictionary)
    func emitDataRequest(data: NSDictionary)
}

@objc(CarouselInAppContentBlockViewProxy)
@objcMembers
public class CarouselInAppContentBlockViewProxy: UIView, DefaultContentBlockCarouselCallback {

    private var currentCarouselInstance: RNCarouselInAppContentBlockView?
    private var bridgedContentSelector = BridgedContentBlockSelector()

    // Delegate to emit events to Fabric ComponentView
    @objc public weak var eventEmitter: CarouselContentBlockEventEmitter?

    // Props
    private var placeholderId: String?
    private var maxMessagesCount: Int?
    private var scrollDelay: TimeInterval?

    public var overrideDefaultBehavior: Bool = false
    public var trackActions: Bool = true
    @objc public var customFilterActive: Bool = false {
        didSet {
            if customFilterActive {
                bridgedContentSelector.filterRequestFn = { data, token in
                    self.notifyContentFilterRequest(input: data, token: token)
                }
            } else {
                bridgedContentSelector.filterRequestFn = nil
            }
        }
    }
    @objc public var customSortActive: Bool = false {
        didSet {
            if customSortActive {
                bridgedContentSelector.sortRequestFn = { data, token in
                    self.notifyContentSortRequest(input: data, token: token)
                }
            } else {
                bridgedContentSelector.sortRequestFn = nil
            }
        }
    }

    @objc public func setPlaceholderId(_ newPlaceholderId: String?) {
        placeholderId = newPlaceholderId
        recreateCarouselViewIfNeeded()
    }

    @objc public func setMaxMessagesCount(_ count: NSNumber?) {
        maxMessagesCount = count?.intValue
        recreateCarouselViewIfNeeded()
    }

    @objc public func setScrollDelay(_ delay: NSNumber?) {
        scrollDelay = delay?.doubleValue
        recreateCarouselViewIfNeeded()
    }

    private func recreateCarouselViewIfNeeded() {
        guard ExponeaSDK.Exponea.shared.isConfigured else {
            destroyPreviousCarouselInstance()
            return
        }
        guard let placeholderId = placeholderId else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: placeholderId must be declared")
            return
        }
        recreateCarouselView(
            placeholderId: placeholderId,
            maxMessagesCount: maxMessagesCount,
            scrollDelay: scrollDelay
        )
    }

    // Called from ComponentView to handle filter response
    @objc public func handleFilterResponse(_ jsonString: String) {
        guard let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to parse filter response")
            return
        }
        var token: String?
        let jsonArray: [String]
        if let payload = json as? [String: Any], let data = payload["data"] as? [String] {
            token = payload["token"] as? String
            jsonArray = data
        } else if let array = json as? [String] {
            jsonArray = array
        } else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to parse filter response payload")
            return
        }
        let dataArray = parseInAppContentBlockResponses(jsonArray)
        bridgedContentSelector.onContentFilterResponse(dataArray, token: token)
    }

    // Called from ComponentView to handle sort response
    @objc public func handleSortResponse(_ jsonString: String) {
        guard let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to parse sort response")
            return
        }
        var token: String?
        let jsonArray: [String]
        if let payload = json as? [String: Any], let data = payload["data"] as? [String] {
            token = payload["token"] as? String
            jsonArray = data
        } else if let array = json as? [String] {
            jsonArray = array
        } else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to parse sort response payload")
            return
        }
        let dataArray = parseInAppContentBlockResponses(jsonArray)
        bridgedContentSelector.onContentSortResponse(dataArray, token: token)
    }

    private func parseInAppContentBlockResponses(_ source: [String]) -> [InAppContentBlockResponse] {
        return source
            .compactMap { $0.data(using: .utf8) }
            .compactMap { try? JSONDecoder().decode(InAppContentBlockResponse.self, from: $0) }
    }

    // MARK: - DefaultContentBlockCarouselCallback

    public func onMessageShown(
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

    public func onMessagesChanged(count: Int, messages: [ExponeaSDK.InAppContentBlockResponse]) {
        notifyContentBlockCarouselEvent(.onMessageChanged(
            count: count,
            contentBlocks: messages
        ))
    }

    public func onNoMessageFound(placeholderId: String) {
        notifyContentBlockCarouselEvent(.onNoMessageFound(
            placeholderId: placeholderId
        ))
    }

    public func onError(
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

    public func onCloseClicked(placeholderId: String, contentBlock: ExponeaSDK.InAppContentBlockResponse) {
        notifyContentBlockCarouselEvent(.onCloseClicked(
            placeholderId: placeholderId,
            contentBlock: contentBlock
        ))
    }

    public func onActionClickedSafari(
        placeholderId: String,
        contentBlock: ExponeaSDK.InAppContentBlockResponse,
        action: ExponeaSDK.InAppContentBlockAction
    ) {
        notifyContentBlockCarouselEvent(.onActionClicked(
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: action
        ))

        if !overrideDefaultBehavior, let urlString = action.url, let url = URL(string: urlString) {
            onMain {
                if UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url, options: [:])
                }
            }
        }
    }

    public func onHeightUpdate(placeholderId: String, height: CGFloat) {
        notifyDimensChanged(width: 0, height: height)
    }

    // MARK: - Private Methods

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
        bridgedContentSelector.cancelPendingRequests()
        currentCarouselInstance?.release()
        currentCarouselInstance = nil
        self.subviews.forEach { $0.removeFromSuperview() }
    }

    private func notifyDimensChanged(width: CGFloat, height: CGFloat) {
        // emitDimensChanged triggers a React Native layout pass — must be on the main thread.
        let w = Double(width), h = Double(height)
        onMain { [weak self] in
            self?.eventEmitter?.emitDimensChanged(width: w, height: h)
        }
    }

    private func notifyContentBlockCarouselEvent(_ event: ContentBlockCarouselEvent) {
        // emitContentBlockEvent crosses the JS bridge — must be on the main thread.
        let dict = event.toDictionary() as NSDictionary
        onMain { [weak self] in
            self?.eventEmitter?.emitContentBlockEvent(data: dict)
        }
    }

    private func notifyContentFilterRequest(input: [ExponeaSDK.InAppContentBlockResponse], token: String) {
        let jsonStrings = input.compactMap({ contentBlock in
            guard let data = try? JSONEncoder().encode(contentBlock),
                  let body = String(data: data, encoding: .utf8) else {
                return nil as String?
            }
            return body
        })

        guard let jsonData = try? JSONSerialization.data(withJSONObject: jsonStrings),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to serialize filter request")
            return
        }

        let payload: NSDictionary = ["requestType": "filter|\(token)", "data": jsonString]
        onMain { [weak self] in
            self?.eventEmitter?.emitDataRequest(data: payload)
        }
    }

    private func notifyContentSortRequest(input: [ExponeaSDK.InAppContentBlockResponse], token: String) {
        let jsonStrings = input.compactMap({ contentBlock in
            guard let data = try? JSONEncoder().encode(contentBlock),
                  let body = String(data: data, encoding: .utf8) else {
                return nil as String?
            }
            return body
        })

        guard let jsonData = try? JSONSerialization.data(withJSONObject: jsonStrings),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to serialize sort request")
            return
        }

        let payload: NSDictionary = ["requestType": "sort|\(token)", "data": jsonString]
        onMain { [weak self] in
            self?.eventEmitter?.emitDataRequest(data: payload)
        }
    }
}
