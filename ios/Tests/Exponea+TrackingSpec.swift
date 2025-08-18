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
import struct ExponeaSDK.InAppMessage
import struct ExponeaSDK.InAppMessageButton

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
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackEvent"))
                            let params = mockExponea.calls[0].params[0] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(true))
                            expect(mockExponea.calls[0].params[1] as? Double).to(equal(12345))
                            expect(mockExponea.calls[0].params[2] as? String).to(equal("mock-event"))
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
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackEvent"))
                            let params = mockExponea.calls[0].params[0] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(false))
                            expect(mockExponea.calls[0].params[1]).to(beNil())
                            expect(mockExponea.calls[0].params[2] as? String).to(equal("mock-event"))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should invoke track event when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackEvent(
                        eventType: "mock-event",
                        properties: ["key": "value", "otherKey": false],
                        timestamp: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackEvent"))
                            let params = mockExponea.calls[0].params[0] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(false))
                            expect(mockExponea.calls[0].params[1]).to(beNil())
                            expect(mockExponea.calls[0].params[2] as? String).to(equal("mock-event"))
                            done()
                        },
                        reject: { _, _, _ in }
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
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("identifyCustomer"))
                            let ids = mockExponea.calls[0].params[0] as? [String: JSONConvertible]
                            expect(ids?["id"] as? String).to(equal("some_id"))
                            let params = mockExponea.calls[0].params[1] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(false))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should invoke identify customer when exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.identifyCustomer(
                        customerIds: ["id": "some_id"],
                        properties: ["key": "value", "otherKey": false],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("identifyCustomer"))
                            let ids = mockExponea.calls[0].params[0] as? [String: JSONConvertible]
                            expect(ids?["id"] as? String).to(equal("some_id"))
                            let params = mockExponea.calls[0].params[1] as? [String: JSONConvertible]
                            expect(params?["key"] as? String).to(equal("value"))
                            expect(params?["otherKey"] as? Bool).to(equal(false))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                }
            }

            it("should reject when customer id is not a string") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.identifyCustomer(
                        customerIds: ["id": 1234],
                        properties: ["key": "value", "otherKey": false],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description)
                                .to(equal("Invalid type for customer id (only string values are supported)."))
                            expect(error?.localizedDescription)
                                .to(equal("Invalid type for customer id (only string values are supported)."))
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
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("flushData"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke flush data when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.flushData(
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("flushData"))
                            done()
                        },
                        reject: { _, _, _ in  }
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
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackSessionStart"))
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

            it("should invoke track session start when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackSessionStart(
                        timestamp: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackSessionStart"))
                            done()
                        },
                        reject: { _, _, _ in  }
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
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackSessionEnd"))
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

            it("should invoke track session end when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackSessionEnd(
                        timestamp: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackSessionEnd"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }

        context("push token tracking") {
            it("should track push token") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackPushToken(
                        token: "mock-push-token",
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushToken"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track push token when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackPushToken(
                        token: "mock-push-token",
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushToken"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }

        context("push delivered tracking") {
            it("should track") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackDeliveredPush(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushReceived"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackDeliveredPush(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushReceived"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackDeliveredPushWithoutTrackingConsent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushReceivedWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track when Exponea is not configured - ignore consent - afterInit") {
                waitUntil { done in
                    exponea.trackDeliveredPushWithoutTrackingConsent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushReceivedWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }

        context("push clicked tracking") {
            it("should track") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackClickedPush(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushOpened"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackClickedPush(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushOpened"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackClickedPushWithoutTrackingConsent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushOpenedWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track when Exponea is not configured - ignore consent - afterInit") {
                waitUntil { done in
                    exponea.trackClickedPushWithoutTrackingConsent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPushOpenedWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }

        context("payment tracking") {
            it("should track") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackPaymentEvent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPayment"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackPaymentEvent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackPayment"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }

        context("In-app tracking") {
            it("should track click - nonrich") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageClick(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClick"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track click when Exponea is not configured - nonrich - afterInit") {
                waitUntil { done in
                    exponea.trackInAppMessageClick(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClick"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track click - ignore consent - nonrich") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageClickWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClickWithoutTrackingConsent"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track click when Exponea is not configured - ignore consent - nonrich - afterInit") {
                waitUntil { done in
                    exponea.trackInAppMessageClickWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClickWithoutTrackingConsent"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track close - nonrich") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageClose(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClose"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track close when Exponea is not configured - nonrich - afterInit") {
                waitUntil { done in
                    exponea.trackInAppMessageClose(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClose"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track close - ignore consent - nonrich") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(
                                equal("trackInAppMessageCloseClickWithoutTrackingConsent")
                            )
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track close when Exponea is not configured - ignore consent - nonrich - afterInit") {
                waitUntil { done in
                    exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(
                                equal("trackInAppMessageCloseClickWithoutTrackingConsent")
                            )
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
            it("should track click - richstyle") {
                mockExponea.isConfiguredValue = true
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageClick(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClick"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track click when Exponea is not configured - richstyle - afterInit") {
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageClick(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClick"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track click - ignore consent - richstyle") {
                mockExponea.isConfiguredValue = true
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageClickWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClickWithoutTrackingConsent"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track click when Exponea is not configured - ignore consent - richstyle - afterInit") {
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageClickWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            type: .action
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClickWithoutTrackingConsent"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let buttonUrl = trackCall.params[2] as? String
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(buttonUrl).to(equal("https://example.com"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track close - richstyle") {
                mockExponea.isConfiguredValue = true
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageClose(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClose"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track close when Exponea is not configured - richstyle - afterInit") {
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageClose(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(equal("trackInAppMessageClose"))
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track close - ignore consent - richstyle") {
                mockExponea.isConfiguredValue = true
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(
                                equal("trackInAppMessageCloseClickWithoutTrackingConsent")
                            )
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track close when Exponea is not configured - ignore consent - richstyle - afterInit") {
                waitUntil(timeout: 10) { done in
                    exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        params: getInAppMessageActionAsDic(
                            message: InAppMessageTestData.buildInAppMessage(isRichText: true),
                            button: InAppMessageTestData.buildInAppMessageButton(),
                            interaction: true,
                            type: .close
                        ),
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            let trackCall = mockExponea.calls[0]
                            expect(trackCall.name).to(
                                equal("trackInAppMessageCloseClickWithoutTrackingConsent")
                            )
                            expect(trackCall.params.count).to(equal(3))
                            let message = trackCall.params[0] as? InAppMessage
                            let buttonText = trackCall.params[1] as? String
                            let isInteraction = trackCall.params[2] as? Bool
                            expect(message?.id).to(equal("5dd86f44511946ea55132f29"))
                            expect(buttonText).to(equal("Click me!"))
                            expect(isInteraction).to(equal(true))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            func getInAppMessageActionAsDic(
                message: InAppMessage? = nil,
                button: InAppMessageButton? = nil,
                interaction: Bool? = nil,
                errorMessage: String? = nil,
                type: InAppMessageActionType
            ) -> NSDictionary {
                let action = InAppMessageAction(
                    message: message,
                    button: button,
                    interaction: interaction,
                    errorMessage: errorMessage,
                    type: type
                )
                if let actionJson = try? JSONEncoder().encode(action),
                   let actionAsDic = try? JSONSerialization.jsonObject(with: actionJson) as? NSDictionary {
                    return actionAsDic
                }
                fatalError("Unable to build InAppMessageAction")
            }
        }

        context("In-app content block tracking") {

            func getContentBlockActionAsDic() -> NSDictionary {
                return [
                    "type": "browser",
                    "name": "action name",
                    "url": "https://example.com"
                ]
            }

            func getContentBlockMessageAsDic() -> NSDictionary {
                return [
                    "id": "1",
                    "name": "name",
                    "date_filter": [
                        "enabled": false
                    ],
                    "load_priority": 10,
                    "content_type": "html",
                    "content": [
                        "html": "<html></html>"
                    ],
                    "consent_category_tracking": "cat1",
                    "placeholders": ["placeholder1"],
                    "frequency": "always"
                ]
            }

            it("should track click") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockClick(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockAction": getContentBlockActionAsDic(),
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockClick"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track click when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockClick(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockAction": getContentBlockActionAsDic(),
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockClick"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track click - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockClickWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockAction": getContentBlockActionAsDic(),
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockClickWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track click when Exponea is not configured - ignore consent - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockClickWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockAction": getContentBlockActionAsDic(),
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockClickWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track close") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockClose(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockClose"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track close when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockClose(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockClose"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track close - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockCloseWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockCloseWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track close when Exponea is not configured - ignore consent - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockCloseWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockCloseWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track show") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockShown(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockShown"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track show when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockShown(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockShown"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track show - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockShownWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockShownWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track show when Exponea is not configured - ignore consent - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockShownWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockShownWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track error") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockError(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic(),
                            "errorMessage": "Something wrong"
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockError"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track error when Exponea is not configured - afterInit") {
                waitUntil { done in
                    exponea.trackInAppContentBlockError(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic(),
                            "errorMessage": "Something wrong"
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("trackInAppContentBlockError"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should track error - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppContentBlockErrorWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic(),
                            "errorMessage": "Something wrong"
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockErrorWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should invoke track error when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppContentBlockErrorWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic(),
                            "errorMessage": "Something wrong"
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 1 else {
                                expect(mockExponea.calls.count).to(equal(1))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(
                                equal("trackInAppContentBlockErrorWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }
        }
    }
}
