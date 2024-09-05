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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
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

        context("push token tracking") {
            it("should track push token") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackPushToken(
                        token: "mock-push-token",
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackPushToken"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track push token when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackPushToken(
                        token: "mock-push-token",
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

        context("push delivered tracking") {
            it("should track") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackDeliveredPush(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackPushReceived"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackDeliveredPush(
                        params: [:],
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

            it("should track - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackDeliveredPushWithoutTrackingConsent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackPushReceivedWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackDeliveredPushWithoutTrackingConsent(
                        params: [:],
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

        context("push clicked tracking") {
            it("should track") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackClickedPush(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackPushOpened"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackClickedPush(
                        params: [:],
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

            it("should track - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackClickedPushWithoutTrackingConsent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackPushOpenedWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackClickedPushWithoutTrackingConsent(
                        params: [:],
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

        context("payment tracking") {
            it("should track") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackPaymentEvent(
                        params: [:],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackPayment"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackPaymentEvent(
                        params: [:],
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

        context("In-app tracking") {
            it("should track click") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageClick(
                        data: [
                            "message": getInAppMessageAsDic(),
                            "button": getInAppMessageActionAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppMessageClick"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track click when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackInAppMessageClick(
                        data: [
                            "message": getInAppMessageAsDic(),
                            "button": getInAppMessageActionAsDic()
                        ],
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

            it("should track click - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageClickWithoutTrackingConsent(
                        data: [
                            "message": getInAppMessageAsDic(),
                            "button": getInAppMessageActionAsDic()
                        ],
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppMessageClickWithoutTrackingConsent"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track click when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppMessageClickWithoutTrackingConsent(
                        data: [
                            "message": getInAppMessageAsDic(),
                            "button": getInAppMessageActionAsDic()
                        ],
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

            it("should track close") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageClose(
                        message: getInAppMessageAsDic(),
                        isUserInteraction: true,
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppMessageClose"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            func getInAppMessageAsDic() -> NSDictionary {
                return [
                    "id": "1",
                    "name": "in-app name",
                    "frequency": "always",
                    "variant_id": 1,
                    "variant_name": "Variant A",
                    "trigger": [
                        "event_type": "session_start",
                        "filter": []
                    ],
                    "date_filter": [
                        "enabled": false
                    ],
                    "load_priority": 10,
                    "load_delay": 0,
                    "close_timeout": 5000,
                    "payload_html": "<html></html>",
                    "is_html": true,
                    "has_tracking_consent": true,
                    "consent_category_tracking": "cat1"
                ]
            }

            func getInAppMessageActionAsDic() -> NSDictionary {
                return [
                    "text": "action name",
                    "url": "https://example.com"
                ]
            }

            it("should not track close when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackInAppMessageClose(
                        message: getInAppMessageAsDic(),
                        isUserInteraction: true,
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

            it("should track close - ignore consent") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        message: getInAppMessageAsDic(),
                        isUserInteraction: true,
                        resolve: { result in
                            expect(result).to(beNil())
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(
                                equal("trackInAppMessageCloseClickWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track close when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppMessageCloseWithoutTrackingConsent(
                        message: getInAppMessageAsDic(),
                        isUserInteraction: true,
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppContentBlockClick"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track click when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackInAppContentBlockClick(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockAction": getContentBlockActionAsDic(),
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(
                                equal("trackInAppContentBlockClickWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track click when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppContentBlockClickWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockAction": getContentBlockActionAsDic(),
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppContentBlockClose"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track close when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackInAppContentBlockClose(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(
                                equal("trackInAppContentBlockCloseWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track close when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppContentBlockCloseWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppContentBlockShown"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track show when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackInAppContentBlockShown(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(
                                equal("trackInAppContentBlockShownWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track show when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppContentBlockShownWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic()
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(equal("trackInAppContentBlockError"))
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track error when Exponea is not configured") {
                waitUntil { done in
                    exponea.trackInAppContentBlockError(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic(),
                            "errorMessage": "Something wrong"
                        ],
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
                            guard mockExponea.calls.count == 2 else {
                                expect(mockExponea.calls.count).to(equal(2))
                                return
                            }
                            expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                            expect(mockExponea.calls[1].name).to(
                                equal("trackInAppContentBlockErrorWithoutTrackingConsent")
                            )
                            done()
                        },
                        reject: { _, _, _ in  }
                    )
                }
            }

            it("should not track error when Exponea is not configured - ignore consent") {
                waitUntil { done in
                    exponea.trackInAppContentBlockErrorWithoutTrackingConsent(
                        data: [
                            "placeholderId": "placeholder1",
                            "inAppContentBlockResponse": getContentBlockMessageAsDic(),
                            "errorMessage": "Something wrong"
                        ],
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
