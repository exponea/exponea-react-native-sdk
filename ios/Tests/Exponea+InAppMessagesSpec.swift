//
//  Exponea+InAppMessagesSpec.swift
//  Tests
//
//  Created by Adam Mihalik on 15/10/2024.
//  Copyright © 2024 Facebook. All rights reserved.
//

import Foundation

import Quick
import Nimble
import struct ExponeaSDK.InAppMessage
import struct ExponeaSDK.InAppMessageButton

import protocol ExponeaSDK.JSONConvertible

@testable import Exponea

class ExponeaInAppMessageSpec: QuickSpec {
    override func spec() {
        var mockExponea: MockExponea!
        var exponea: Exponea!
        beforeEach {
            mockExponea = MockExponea()
            mockExponea.isConfiguredValue = true
            Exponea.exponeaInstance = mockExponea
            exponea = Exponea()
        }
        afterEach {
            exponea.onInAppMessageCallbackRemove()
        }
        context("InApp callback") {
            it("should notify listener when in app message shown is pending") {
                waitUntil { done in
                    exponea.pendingInAppAction = InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: nil,
                        interaction: nil,
                        errorMessage: nil,
                        type: .show
                    )
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-shown.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                }
            }
            it("should notify listener when in app message is shown") {
                waitUntil { done in
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-shown.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                    exponea.onInAppAction(InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: nil,
                        interaction: nil,
                        errorMessage: nil,
                        type: .show
                    ))
                }
            }
            it("should notify listener when in app message click is pending") {
                waitUntil { done in
                    exponea.pendingInAppAction = InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: InAppMessageTestData.buildInAppMessageButton(),
                        interaction: nil,
                        errorMessage: nil,
                        type: .action
                    )
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-click-minimal.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                }
            }
            it("should notify listener when in app message is clicked") {
                waitUntil { done in
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-click-minimal.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                    exponea.onInAppAction(InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: InAppMessageTestData.buildInAppMessageButton(),
                        interaction: nil,
                        errorMessage: nil,
                        type: .action
                    ))
                }
            }
            it("should notify listener when in app message closed by user is pending") {
                waitUntil { done in
                    exponea.pendingInAppAction = InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: InAppMessageTestData.buildInAppMessageButton(
                            url: nil
                        ),
                        interaction: true,
                        errorMessage: nil,
                        type: .close
                    )
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-close-complete.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                }
            }
            it("should notify listener when in app message is closed by user") {
                waitUntil { done in
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-close-complete.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                    exponea.onInAppAction(InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: InAppMessageTestData.buildInAppMessageButton(
                            url: nil
                        ),
                        interaction: true,
                        errorMessage: nil,
                        type: .close
                    ))
                }
            }
            it("should notify listener when in app message closed without button is pending") {
                waitUntil { done in
                    exponea.pendingInAppAction = InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: nil,
                        interaction: false,
                        errorMessage: nil,
                        type: .close
                    )
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-close-minimal.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                }
            }
            it("should notify listener when in app message is closed without button") {
                waitUntil { done in
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-close-minimal.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                    exponea.onInAppAction(InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: nil,
                        interaction: false,
                        errorMessage: nil,
                        type: .close
                    ))
                }
            }
            it("should notify listener when in app message process faced error is pending") {
                waitUntil { done in
                    exponea.pendingInAppAction = InAppMessageAction(
                        message: nil,
                        button: nil,
                        interaction: nil,
                        errorMessage: "Something goes wrong",
                        type: .error
                    )
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-error-minimal.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                }
            }
            it("should notify listener when in app message process faced error") {
                waitUntil { done in
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-error-minimal.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                    exponea.onInAppAction(InAppMessageAction(
                        message: nil,
                        button: nil,
                        interaction: nil,
                        errorMessage: "Something goes wrong",
                        type: .error
                    ))
                }
            }
            it("should notify listener when in app message faced error is pending") {
                waitUntil { done in
                    exponea.pendingInAppAction = InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: nil,
                        interaction: nil,
                        errorMessage: "Something goes wrong",
                        type: .error
                    )
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-error-complete.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                }
            }
            it("should notify listener when in app message faced error") {
                waitUntil { done in
                    exponea.sendEventOverride = { name, body in
                        validateInAppAction(name, body, TestUtil.loadFileAsJson(
                            relativePath: "/src/test_data/in-app-error-complete.json"
                        ))
                        done()
                    }
                    exponea.onInAppMessageCallbackSet(overrideDefaultBehavior: false, trackActions: true)
                    exponea.onInAppAction(InAppMessageAction(
                        message: InAppMessageTestData.buildInAppMessage(),
                        button: nil,
                        interaction: nil,
                        errorMessage: "Something goes wrong",
                        type: .error
                    ))
                }
            }
        }
        func validateInAppAction(
            _ eventName: String,
            _ eventBody: Any,
            _ expectedInAppActionBody: NSDictionary
        ) {
            expect(eventName).to(equal("inAppAction"))
            guard let body = eventBody as? String else {
                XCTFail("Expected String body")
                return
            }
            expect(TestUtil.parseJson(jsonString: body)).to(equal(expectedInAppActionBody))
        }
    }
}
