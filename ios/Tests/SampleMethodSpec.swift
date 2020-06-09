//
//  SampleMethodSpec.swift
//  SampleMethodSpec
//
//  Created by Panaxeo on 10/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import Quick
import Nimble

@testable import Exponea

class SampleMethodSpec: QuickSpec {
    override func spec() {
        it("should call callback") {
            waitUntil { done in
                Exponea().sampleMethod(stringParameter: "string", numberParameter: 123, callback: { data in
                    expect(data?[0] as? String).to(equal("Callback from Swift string 123"))
                    done()
                })
            }
        }
    }
}
