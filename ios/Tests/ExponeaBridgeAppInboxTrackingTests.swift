import XCTest
import ExponeaSDK
@testable import react_native_exponea_sdk

/// The JS `AppInboxMessage` carries no `customerIds`, and the native SDK refuses to track an
/// item without them. The bridge therefore tracks the item the native SDK resolves by id, never
/// one rebuilt from the dictionary, and reports failures instead of resolving silently.
final class ExponeaBridgeAppInboxTrackingTests: XCTestCase {
    private var bridge: ExponeaBridge!
    private var fake: FakeExponea!
    private var originalInstance: ExponeaType!

    /// What JavaScript sends for a message fetched through `fetchAppInbox`.
    private let jsMessage: [AnyHashable: Any] = ["id": "m-1", "type": "push", "is_read": false]
    private let jsAction: [AnyHashable: Any] = ["action": "browser", "title": "Open", "url": "https://example.com/offer"]
    private let nativeCustomerIds = ["cookie": "cookie-1"]

    override func setUp() {
        super.setUp()
        originalInstance = ExponeaBridge.exponeaInstance
        fake = FakeExponea()
        fake.appInboxItems["m-1"] = MessageItem(
            id: "m-1",
            type: "push",
            read: false,
            rawReceivedTime: nil,
            rawContent: nil,
            customerIds: nativeCustomerIds
        )
        ExponeaBridge.exponeaInstance = fake
        bridge = ExponeaBridge()
    }

    override func tearDown() {
        ExponeaBridge.exponeaInstance = originalInstance
        bridge = nil
        fake = nil
        super.tearDown()
    }

    // MARK: - Opened

    func testOpenedTracksTheItemResolvedByIdNotTheDictionary() {
        let outcome = trackOpened(jsMessage, considerConsent: true)

        XCTAssertNil(outcome, "expected success, got \(String(describing: outcome))")
        XCTAssertEqual(fake.fetchedAppInboxItemIds, ["m-1"])
        XCTAssertEqual(fake.openedMessages.map(\.id), ["m-1"])
        XCTAssertEqual(fake.openedMessages.first?.customerIds, nativeCustomerIds)
        XCTAssertTrue(fake.openedMessagesWithoutConsent.isEmpty)
    }

    func testOpenedWithoutConsentUsesTheConsentFreeNativeMethod() {
        let outcome = trackOpened(jsMessage, considerConsent: false)

        XCTAssertNil(outcome)
        XCTAssertEqual(fake.openedMessagesWithoutConsent.map(\.id), ["m-1"])
        XCTAssertEqual(fake.openedMessagesWithoutConsent.first?.customerIds, nativeCustomerIds)
        XCTAssertTrue(fake.openedMessages.isEmpty)
    }

    func testOpenedRejectsWhenTheNativeSdkDoesNotKnowTheMessage() {
        let outcome = trackOpened(["id": "missing", "type": "push"], considerConsent: true)

        XCTAssertNotNil(outcome)
        XCTAssertEqual(fake.fetchedAppInboxItemIds, ["missing"])
        XCTAssertTrue(fake.openedMessages.isEmpty)
        XCTAssertTrue(fake.openedMessagesWithoutConsent.isEmpty)
    }

    func testOpenedRejectsWithoutAskingTheNativeSdkWhenTheIdIsMissing() {
        let outcome = trackOpened(["type": "push"], considerConsent: true)

        XCTAssertNotNil(outcome)
        XCTAssertTrue(fake.fetchedAppInboxItemIds.isEmpty)
        XCTAssertTrue(fake.openedMessages.isEmpty)
    }

    func testOpenedRejectsWhenTheSdkIsNotConfigured() {
        fake.isConfigured = false

        let outcome = trackOpened(jsMessage, considerConsent: true)

        guard case .notConfigured? = outcome as? react_native_exponea_sdk.ExponeaError else {
            return XCTFail("expected ExponeaError.notConfigured, got \(String(describing: outcome))")
        }
        XCTAssertTrue(fake.fetchedAppInboxItemIds.isEmpty)
    }

    // MARK: - Click

    func testClickTracksTheResolvedItemWithTheParsedAction() {
        let outcome = trackClick(jsAction, message: jsMessage, considerConsent: true)

        XCTAssertNil(outcome, "expected success, got \(String(describing: outcome))")
        XCTAssertEqual(fake.fetchedAppInboxItemIds, ["m-1"])
        XCTAssertEqual(fake.clicks.count, 1)
        XCTAssertEqual(fake.clicks.first?.message.customerIds, nativeCustomerIds)
        XCTAssertEqual(fake.clicks.first?.action.action, "browser")
        XCTAssertEqual(fake.clicks.first?.action.title, "Open")
        XCTAssertEqual(fake.clicks.first?.action.url, "https://example.com/offer")
        XCTAssertTrue(fake.clicksWithoutConsent.isEmpty)
    }

    func testClickWithoutConsentUsesTheConsentFreeNativeMethod() {
        let outcome = trackClick(jsAction, message: jsMessage, considerConsent: false)

        XCTAssertNil(outcome)
        XCTAssertEqual(fake.clicksWithoutConsent.count, 1)
        XCTAssertEqual(fake.clicksWithoutConsent.first?.message.customerIds, nativeCustomerIds)
        XCTAssertTrue(fake.clicks.isEmpty)
    }

    func testClickRejectsWhenTheNativeSdkDoesNotKnowTheMessage() {
        let outcome = trackClick(jsAction, message: ["id": "missing", "type": "push"], considerConsent: true)

        XCTAssertNotNil(outcome)
        XCTAssertTrue(fake.clicks.isEmpty)
        XCTAssertTrue(fake.clicksWithoutConsent.isEmpty)
    }

    // MARK: - Helpers

    /// Returns the failure the bridge reported, or nil when it reported success.
    private func trackOpened(_ message: [AnyHashable: Any], considerConsent: Bool) -> Error? {
        var failure: Error?
        let settled = expectation(description: "trackAppInboxOpened settles")
        bridge.trackAppInboxOpened(message, considerConsent: considerConsent, success: {
            settled.fulfill()
        }, failure: { error in
            failure = error
            settled.fulfill()
        })
        wait(for: [settled], timeout: 1)
        return failure
    }

    private func trackClick(_ action: [AnyHashable: Any], message: [AnyHashable: Any], considerConsent: Bool) -> Error? {
        var failure: Error?
        let settled = expectation(description: "trackAppInboxClick settles")
        bridge.trackAppInboxClick(action, message: message, considerConsent: considerConsent, success: {
            settled.fulfill()
        }, failure: { error in
            failure = error
            settled.fulfill()
        })
        wait(for: [settled], timeout: 1)
        return failure
    }
}
