//
//  Exponea.swift
//  Exponea
//
//  Created by Panaxeo on 09/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation

@objc(Exponea)
class Exponea: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc(sampleMethod:numberParameter:callback:)
    func sampleMethod(stringParameter: String, numberParameter: NSNumber, callback: RCTResponseSenderBlock) {
        callback(["Callback from Swift \(stringParameter) \(numberParameter)"])
    }
}
