import XCTest
import ExponeaSDK
import react_native_exponea_sdk

/// Every JavaScript segmentation registration owns exactly one native callback identified
/// by the ID issued by JavaScript, so several registrations may share a category and the
/// native SDK evaluates `includeFirstLoad` for each of them independently.
final class ExponeaBridgeSegmentationTests: XCTestCase {
    private var bridge: ExponeaBridge!

    override func setUp() {
        super.setUp()
        SegmentationManager.shared.removeAll()
        bridge = ExponeaBridge()
    }

    override func tearDown() {
        bridge.removeAllSegmentationCallbacks()
        SegmentationManager.shared.removeAll()
        bridge = nil
        super.tearDown()
    }

    private var nativeCallbacksCount: Int {
        SegmentationManager.shared.getCallbacks().count
    }

    func testEachRegistrationOwnsOneNativeCallbackEvenForTheSameCategory() {
        bridge.onSegmentationCallbackSet(callbackId: "cb-1", category: "discovery", includeFirstLoad: true)
        bridge.onSegmentationCallbackSet(callbackId: "cb-2", category: "discovery", includeFirstLoad: false)
        bridge.onSegmentationCallbackSet(callbackId: "cb-3", category: "content", includeFirstLoad: false)

        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 3)
        XCTAssertEqual(nativeCallbacksCount, 3)
    }

    func testRegisteringTheSameIdAgainReplacesThePreviousNativeCallback() {
        bridge.onSegmentationCallbackSet(callbackId: "cb-1", category: "discovery", includeFirstLoad: true)
        bridge.onSegmentationCallbackSet(callbackId: "cb-1", category: "discovery", includeFirstLoad: false)

        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 1)
        XCTAssertEqual(nativeCallbacksCount, 1)
    }

    func testRemovingReleasesOnlyTheRequestedRegistration() {
        bridge.onSegmentationCallbackSet(callbackId: "cb-1", category: "discovery", includeFirstLoad: true)
        bridge.onSegmentationCallbackSet(callbackId: "cb-2", category: "discovery", includeFirstLoad: false)

        bridge.onSegmentationCallbackRemove(callbackId: "cb-1")
        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 1)
        XCTAssertEqual(nativeCallbacksCount, 1)

        bridge.onSegmentationCallbackRemove(callbackId: "cb-1")
        bridge.onSegmentationCallbackRemove(callbackId: "unknown")
        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 1)
        XCTAssertEqual(nativeCallbacksCount, 1)
    }

    func testStopCleanupReleasesEverythingAndAllowsRegisteringAgain() {
        bridge.onSegmentationCallbackSet(callbackId: "cb-1", category: "discovery", includeFirstLoad: true)
        bridge.onSegmentationCallbackSet(callbackId: "cb-2", category: "content", includeFirstLoad: false)

        // Invoked from the stopIntegration completion.
        bridge.removeAllSegmentationCallbacks()
        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 0)
        XCTAssertEqual(nativeCallbacksCount, 0)

        bridge.onSegmentationCallbackSet(callbackId: "cb-3", category: "discovery", includeFirstLoad: true)
        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 1)
        XCTAssertEqual(nativeCallbacksCount, 1)
    }

    func testStopCleanupIsSafeWhenTheNativeSdkAlreadyDroppedItsCallbacks() {
        bridge.onSegmentationCallbackSet(callbackId: "cb-1", category: "discovery", includeFirstLoad: true)

        // The native SDK clears its callbacks while stopping, before the bridge cleanup runs.
        SegmentationManager.shared.removeAll()
        bridge.removeAllSegmentationCallbacks()
        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 0)
        XCTAssertEqual(nativeCallbacksCount, 0)

        bridge.onSegmentationCallbackSet(callbackId: "cb-2", category: "discovery", includeFirstLoad: true)
        XCTAssertEqual(bridge.registeredSegmentationCallbacksCount(), 1)
        XCTAssertEqual(nativeCallbacksCount, 1)
    }
}
