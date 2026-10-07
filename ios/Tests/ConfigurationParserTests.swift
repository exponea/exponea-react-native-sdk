import XCTest
import ExponeaSDK
import react_native_exponea_sdk

final class ConfigurationParserTests: XCTestCase {
    func testParseConfigurationDisablesAutomaticPushNotificationTrackingForProjectConfig() throws {
        let configMap: NSDictionary = [
            "integrationConfig": [
                "projectToken": "mock-project-token",
                "authorizationToken": "mock-authorization-token"
            ]
        ]

        let configuration = try ConfigurationParser(configMap).parseConfiguration()

        XCTAssertFalse(configuration.automaticPushNotificationTracking)
    }

    func testParseConfigurationDisablesAutomaticPushNotificationTrackingForStreamConfig() throws {
        let configMap: NSDictionary = [
            "integrationConfig": [
                "streamId": "mock-stream-id"
            ]
        ]

        let configuration = try ConfigurationParser(configMap).parseConfiguration()

        XCTAssertFalse(configuration.automaticPushNotificationTracking)
    }

    func testParseConfigurationKeepsPushSettings() throws {
        let configMap: NSDictionary = [
            "integrationConfig": [
                "projectToken": "mock-project-token",
                "authorizationToken": "mock-authorization-token"
            ],
            "ios": [
                "appGroup": "group.com.example.app",
                "requirePushAuthorization": false
            ],
            "pushTokenTrackingFrequency": "DAILY"
        ]

        let configuration = try ConfigurationParser(configMap).parseConfiguration()

        XCTAssertFalse(configuration.automaticPushNotificationTracking)
        XCTAssertEqual(configuration.appGroup, "group.com.example.app")
        XCTAssertFalse(configuration.requirePushAuthorization)
        XCTAssertEqual(configuration.tokenTrackFrequency, .daily)
    }

    func testParseConfigurationRejectsInvalidPushTokenTrackingFrequency() {
        let configMap: NSDictionary = [
            "integrationConfig": [
                "projectToken": "mock-project-token",
                "authorizationToken": "mock-authorization-token"
            ],
            "pushTokenTrackingFrequency": "HOURLY"
        ]

        XCTAssertThrowsError(try ConfigurationParser(configMap).parseConfiguration())
    }
}
