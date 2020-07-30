//
//  Exponea+TrackingSpec.swift
//  Tests
//
//  Created by Panaxeo on 30/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import Quick
import Nimble

import protocol ExponeaSDK.JSONConvertible

@testable import Exponea

class ExponeaTrackingSpec: QuickSpec {
    override func spec() {
        var mockExponea: MockExponea!
        var exponea: Exponea!

        beforeEach {
            mockExponea = MockExponea()
            Exponea.exponeaInstance = mockExponea
            exponea = Exponea()
        }

        context("event tracking") {
            it("should track event with timestamp") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackEvent(
                        eventType: "mock-event",
                        properties: ["key": "value", "otherKey": true],
                        timestamp: ["timestamp": 12345],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackEvent"))
                            let params = mockExponea.calls[1].params[0] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(true))
                            expect(mockExponea.calls[1].params[1] as? Double).to(equal(12345))
                            expect(mockExponea.calls[1].params[2] as? String).to(equal("mock-event"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should track event without timestamp") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackEvent(
                        eventType: "mock-event",
                        properties: ["key": "value", "otherKey": false],
                        timestamp: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackEvent"))
                            let params = mockExponea.calls[1].params[0] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(false))
                            expect(mockExponea.calls[1].params[1]).to(beNil())
                            expect(mockExponea.calls[1].params[2] as? String).to(equal("mock-event"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should not track event when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackEvent(
                        eventType: "mock-event",
                        properties: ["key": "value", "otherKey": false],
                        timestamp: [:],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal(ExponeaError.notConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.notConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }
        }

        context("customer identification") {
            it("should identify customer") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.identifyCustomer(
                        customerIds: ["id": "some_id"],
                        properties: ["key": "value", "otherKey": false],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("identifyCustomer"))
                            let ids = mockExponea.calls[1].params[0] as? [String: JSONConvertible]
                            expect(ids?["id"] as? String).to(equal("some_id"))
                            let params = mockExponea.calls[1].params[1] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(false))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should not identify customer when exponea is not configured") {
                waitUntil { done in
                    exponea.identifyCustomer(
                        customerIds: ["id": "some_id"],
                        properties: ["key": "value", "otherKey": false],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal(ExponeaError.notConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.notConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }
        }

        context("data flushing") {
            it("should flush data") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.flushData(
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("flushData"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not flush data when Exponea is not configured") {
                waitUntil { done in
                    exponea.flushData(
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal(ExponeaError.notConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.notConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }
        }

        context("session tracking") {
            it("should track session start") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackSessionStart(
                        timestamp: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackSessionStart"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }

            }

            it("should fail to track session start with timestamp") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackSessionStart(
                        timestamp: ["timestamp": 1234],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description)
                                .to(equal("Setting session start timestamp is not available for iOS platform."))
                            expect(error?.localizedDescription)
                                .to(equal("Setting session start timestamp is not available for iOS platform."))
                            done()
                        }
                    )
                }
            }

            it("should not track session start when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackSessionStart(
                        timestamp: [:],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal(ExponeaError.notConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.notConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }

            it("should track session end") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackSessionEnd(
                        timestamp: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackSessionEnd"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }

            }

            it("should fail to track session end with timestamp") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackSessionEnd(
                        timestamp: ["timestamp": 1234],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description)
                                .to(equal("Setting session end timestamp is not available for iOS platform."))
                            expect(error?.localizedDescription)
                                .to(equal("Setting session end timestamp is not available for iOS platform."))
                            done()
                        }
                    )
                }
            }

            it("should not track session end when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackSessionEnd(
                        timestamp: [:],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal(ExponeaError.notConfigured.localizedDescription))
                            expect(error?.localizedDescription)
                                .to(equal(ExponeaError.notConfigured.localizedDescription))
                            done()
                        }
                    )
                }
            }
        }
    }
}
