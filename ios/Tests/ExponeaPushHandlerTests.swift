import XCTest

@testable import react_native_exponea_sdk

final class ExponeaPushHandlerTests: XCTestCase {

    private var defaultHandler: ((NSUserActivity) -> Bool)!
    private var forwardedActivities: [NSUserActivity] = []

    override func setUp() {
        super.setUp()
        defaultHandler = ExponeaPushHandler.universalLinkHandler
        forwardedActivities = []
        ExponeaPushHandler.universalLinkHandler = { [unowned self] activity in
            self.forwardedActivities.append(activity)
            return true
        }
    }

    override func tearDown() {
        ExponeaPushHandler.universalLinkHandler = defaultHandler
        super.tearDown()
    }

    func testContinueUserActivityForwardsUniversalLinkOnce() {
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        activity.webpageURL = URL(string: "https://example.com/campaign?xnpe_cmp=cmp123")

        XCTAssertTrue(ExponeaPushHandler.continueUserActivity(activity))
        XCTAssertEqual(forwardedActivities, [activity])
    }

    // The ignore tests below use the real `Exponea.shared.handleUniversalLink(_:)`. It rejects these
    // activities in its guard before touching any SDK state, so no SDK configuration is needed.

    func testContinueUserActivityIgnoresNonBrowsingWebActivity() {
        ExponeaPushHandler.universalLinkHandler = defaultHandler
        let activity = NSUserActivity(activityType: "com.example.other")
        activity.webpageURL = URL(string: "https://example.com/campaign")

        XCTAssertFalse(ExponeaPushHandler.continueUserActivity(activity))
    }

    func testContinueUserActivityIgnoresActivityWithoutURL() {
        ExponeaPushHandler.universalLinkHandler = defaultHandler
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)

        XCTAssertFalse(ExponeaPushHandler.continueUserActivity(activity))
    }
}
