//
//  RNContentBlockCarouselViewManager.swift
//  Exponea
//
//  Created by Adam Mihalik on 10/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import React
import UIKit
import ExponeaSDK

@objc(RNContentBlockCarouselViewManager)
class RNContentBlockCarouselViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    override func view() -> UIView! {
        return CarouselInAppContentBlockViewProxy()
    }
    @objc(filterResponse:args:)
    func filterResponse(tag: NSNumber, args: NSArray) {
        findNativeView(ofType: CarouselInAppContentBlockViewProxy.self, byTag: tag) { nativeView in
            nativeView.onFilterResponse(args)
        }
    }
    @objc(sortResponse:args:)
    func sortResponse(tag: NSNumber, args: NSArray) {
        findNativeView(ofType: CarouselInAppContentBlockViewProxy.self, byTag: tag) { nativeView in
            nativeView.onSortResponse(args)
        }
    }
}
