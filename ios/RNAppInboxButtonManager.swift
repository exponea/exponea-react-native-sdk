//
//  RNAppInboxButtonManager.swift
//  Exponea
//
//  Created by Adam Mihalik on 24/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import React
import UIKit

@objc(RNAppInboxButtonManager)
class RNAppInboxButtonManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    override func view() -> UIView! {
        return Exponea.exponeaInstance.getAppInboxButton()
    }
}
