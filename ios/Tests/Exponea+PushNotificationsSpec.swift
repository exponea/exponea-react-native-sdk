//
//  Exponea+PushNotificationsSpec.swift
//  Tests
//
//  Created by Panaxeo on 31/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//
import Foundation
import Quick
import Nimble

@testable import Exponea

class ExponeaPushNotificationsSpec: QuickSpec {
    override func spec() {
        var mockExponea: MockExponea!
        var exponea: Exponea!

        beforeEach {
            mockExponea = MockExponea()
            Exponea.exponeaInstance = mockExponea
            exponea = Exponea()
        }

        it("should hold of opened push until listener is set") {
            waitUntil { done in
                exponea.pushNotificationOpened(with: .openApp, value: nil, extraData: ["key": "value"])
                expect(exponea.pendingOpenedPush).notTo(beNil())
                exponea.sendEventOverride = { name, body in
                    expect(name).to(equal("pushOpened"))
                    guard let body = body as? String else {
                        XCTFail("Expected String body")
                        return
                    }
                    expect(TestUtil.getSortedKeysJson(body)).to(equal("""
                    {"action":"app","additionalData":{"key":"value"},"url":null}
                    """))
                    done()
                }
                exponea.onPushOpenedListenerSet()
            }
        }

        it("should fire event when push notification is opened and listener set") {
            waitUntil { done in
                exponea.sendEventOverride = { name, body in
                    expect(name).to(equal("pushOpened"))
                    guard let body = body as? String else {
                        XCTFail("Expected String body")
                        return
                    }
                    expect(TestUtil.getSortedKeysJson(body)).to(equal("""
                    {"action":"app","additionalData":{"key":"value"},"url":null}
                    """))
                    done()
                }
                exponea.onPushOpenedListenerSet()
                exponea.pushNotificationOpened(with: .openApp, value: nil, extraData: ["key": "value"])
                expect(exponea.pendingOpenedPush).to(beNil())
            }
        }

        it("should hold of received push until listener is set") {
            waitUntil { done in
                exponea.silentPushNotificationReceived(extraData: ["key": "value"])
                expect(exponea.pendingReceivedPushData).notTo(beNil())
                exponea.sendEventOverride = { name, body in
                    expect(name).to(equal("pushReceived"))
                    guard let body = body as? String else {
                        XCTFail("Expected String body")
                        return
                    }
                    expect(TestUtil.getSortedKeysJson(body)).to(equal("""
                    {"key":"value"}
                    """))
                    done()
                }
                exponea.onPushReceivedListenerSet()
            }
        }

        it("should fire event when push notification is received and listener set") {
            waitUntil { done in
                exponea.sendEventOverride = { name, body in
                    expect(name).to(equal("pushReceived"))
                    guard let body = body as? String else {
                        XCTFail("Expected String body")
                        return
                    }
                    expect(TestUtil.getSortedKeysJson(body)).to(equal("""
                    {"key":"value"}
                    """))
                    done()
                }
                exponea.onPushReceivedListenerSet()
                exponea.silentPushNotificationReceived(extraData: ["key": "value"])
                expect(exponea.pendingReceivedPushData).to(beNil())
            }
        }
    }
}
