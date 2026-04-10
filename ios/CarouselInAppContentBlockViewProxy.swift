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
                bridgedContentSelector.filterRequestFn = { data in
                    self.notifyContentFilterRequest(input: data)
                }
            } else {
                bridgedContentSelector.filterRequestFn = nil
            }
        }
    }
    @objc public var customSortActive: Bool = false {
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
              let jsonArray = try? JSONSerialization.jsonObject(with: data) as? [String] else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to parse filter response")
            return
        }
        let dataArray = parseInAppContentBlockResponses(jsonArray)
        bridgedContentSelector.onContentFilterResponse(dataArray)
    }

    // Called from ComponentView to handle sort response
    @objc public func handleSortResponse(_ jsonString: String) {
        guard let data = jsonString.data(using: .utf8),
              let jsonArray = try? JSONSerialization.jsonObject(with: data) as? [String] else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to parse sort response")
            return
        }
        let dataArray = parseInAppContentBlockResponses(jsonArray)
        bridgedContentSelector.onContentSortResponse(dataArray)
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
        print("[ExponeaSDK] Carousel onActionClickedSafari called")
        print("[ExponeaSDK] PlaceholderId: \(placeholderId)")
        print("[ExponeaSDK] Action URL: \(action.url ?? "nil")")
        print("[ExponeaSDK] Action type: \(action.type)")
        print("[ExponeaSDK] overrideDefaultBehavior: \(overrideDefaultBehavior)")

        notifyContentBlockCarouselEvent(.onActionClicked(
            placeholderId: placeholderId,
            contentBlock: contentBlock,
            action: action
        ))

        // Open URL if not overriding default behavior
        if !overrideDefaultBehavior {
            print("[ExponeaSDK] Not overriding default behavior, will attempt to open URL")
            if let urlString = action.url {
                print("[ExponeaSDK] URL string: \(urlString)")
                if let url = URL(string: urlString) {
                    print("[ExponeaSDK] Valid URL created: \(url)")
                    DispatchQueue.main.async {
                        let canOpen = UIApplication.shared.canOpenURL(url)
                        print("[ExponeaSDK] Can open URL: \(canOpen)")
                        if canOpen {
                            print("[ExponeaSDK] Opening URL...")
                            UIApplication.shared.open(url, options: [:]) { success in
                                print("[ExponeaSDK] URL opened successfully: \(success)")
                            }
                        } else {
                            print("[ExponeaSDK] Cannot open URL - may need URL scheme whitelist in Info.plist")
                        }
                    }
                } else {
                    print("[ExponeaSDK] Failed to create URL from string: \(urlString)")
                }
            } else {
                print("[ExponeaSDK] No URL in action")
            }
        } else {
            print("[ExponeaSDK] Default behavior is overridden, not opening URL")
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
        currentCarouselInstance?.release()
        currentCarouselInstance = nil
        self.subviews.forEach { $0.removeFromSuperview() }
    }

    private func notifyDimensChanged(width: CGFloat, height: CGFloat) {
        eventEmitter?.emitDimensChanged(
            width: Double(width),
            height: Double(height)
        )
    }

    private func notifyContentBlockCarouselEvent(_ event: ContentBlockCarouselEvent) {
        eventEmitter?.emitContentBlockEvent(data: event.toDictionary() as NSDictionary)
    }

    private func notifyContentFilterRequest(input: [ExponeaSDK.InAppContentBlockResponse]) {
        let jsonStrings = input.compactMap({ contentBlock in
            guard let data = try? JSONEncoder().encode(contentBlock),
                  let body = String(data: data, encoding: .utf8) else {
                return nil as String?
            }
            return body
        })

        // Serialize array to JSON string
        guard let jsonData = try? JSONSerialization.data(withJSONObject: jsonStrings),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to serialize filter request")
            return
        }

        eventEmitter?.emitDataRequest(data: ["requestType": "filter", "data": jsonString] as NSDictionary)
    }

    private func notifyContentSortRequest(input: [ExponeaSDK.InAppContentBlockResponse]) {
        let jsonStrings = input.compactMap({ contentBlock in
            guard let data = try? JSONEncoder().encode(contentBlock),
                  let body = String(data: data, encoding: .utf8) else {
                return nil as String?
            }
            return body
        })

        // Serialize array to JSON string
        guard let jsonData = try? JSONSerialization.data(withJSONObject: jsonStrings),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            ExponeaSDK.Exponea.logger.log(.error, message: "InAppCbCarousel: Failed to serialize sort request")
            return
        }

        eventEmitter?.emitDataRequest(data: ["requestType": "sort", "data": jsonString] as NSDictionary)
    }
}
