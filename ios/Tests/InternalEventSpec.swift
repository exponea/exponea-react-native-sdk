//
//  InternalEventSpec.swift
//  Tests
//
//  Created by Adam Mihalik on 13/08/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation
import Quick
import Nimble

@testable import Exponea

class InternalEventSpec: QuickSpec {
    override func spec() {
        context("definition of enum") {
            it("should be listed in supported events for all cases") {
                var caseCoverage = 0
                for event in InternalEvent.allCases {
                    switch event {
                    case .pushClick:
                        caseCoverage += 1
                    case .pushReceived:
                        caseCoverage += 1
                    case .inappAction:
                        caseCoverage += 1
                    case .segmentsUpdate:
                        caseCoverage += 1
                    }
                }
                // seems silly, but switch-exhaustion force to add +1, so update expected count as well
                expect(caseCoverage).to(equal(4))
            }
            it("should register all supported internal events") {
                var declaredEvents: [String] = Exponea().supportedEvents()
                for event in InternalEvent.allCases {
                    expect(declaredEvents).to(containElementSatisfying({ $0 == event.rawValue }))
                }
                let uniqueEvents = Set<String>(declaredEvents)
                expect(uniqueEvents.count).to(equal(declaredEvents.count))
            }
        }
    }
}
