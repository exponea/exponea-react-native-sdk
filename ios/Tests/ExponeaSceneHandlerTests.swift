import XCTest

@testable import react_native_exponea_sdk

final class ExponeaSceneHandlerTests: XCTestCase {

    func testLaunchOptionsContainURL() {
        let url = URL(string: "exponea://deeplink")!

        let launchOptions = ExponeaSceneHandler.launchOptions(url: url, userActivities: [])

        XCTAssertEqual(launchOptions[.url] as? URL, url)
        XCTAssertNil(launchOptions[.userActivityDictionary])
    }

    func testLaunchOptionsContainUniversalLinkActivity() {
        let activity = makeBrowsingWebActivity()

        let launchOptions = ExponeaSceneHandler.launchOptions(url: nil, userActivities: [activity])

        XCTAssertNil(launchOptions[.url])
        let dictionary = launchOptions[.userActivityDictionary] as? [String: Any]
        XCTAssertEqual(dictionary?["UIApplicationLaunchOptionsUserActivityTypeKey"] as? String, NSUserActivityTypeBrowsingWeb)
        XCTAssertEqual(dictionary?["UIApplicationLaunchOptionsUserActivityKey"] as? NSUserActivity, activity)
    }

    func testLaunchOptionsIgnoreNonUniversalLinkActivities() {
        let other = NSUserActivity(activityType: "com.example.other")
        other.webpageURL = URL(string: "https://example.com/other")
        let noUrl = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)

        XCTAssertTrue(ExponeaSceneHandler.launchOptions(url: nil, userActivities: [other, noUrl]).isEmpty)
        XCTAssertTrue(ExponeaSceneHandler.launchOptions(url: nil, userActivities: []).isEmpty)
    }

    private func makeBrowsingWebActivity() -> NSUserActivity {
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        activity.webpageURL = URL(string: "https://example.com/campaign?xnpe_cmp=cmp123")
        return activity
    }
}
