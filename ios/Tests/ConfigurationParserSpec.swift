//
//  ConfigurationParserSpec.swift
//  Tests
//
//  Created by Panaxeo on 18/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import Quick
import Nimble

@testable import Exponea
@testable import ExponeaSDK

class ConfigurationParserSpec: QuickSpec {
    override func spec() {
        context("parsing complete configuration") {
            let configurationDictionary = TestUtil.parseJson(
                jsonString: TestUtil.loadFile(relativePath: "/src/test_data/configurationComplete.json")
            )
            let parser = ConfigurationParser(configurationDictionary)
            it("should parse project settings") {
                guard let projectSettings = try? parser.parseProjectSettings() else {
                    XCTFail("Unable to parse project settings")
                    return
                }
                expect(projectSettings.projectToken).to(equal("mock-project-token"))
                expect(projectSettings.authorization).to(equal(.token("mock-authorization-token")))
                expect(projectSettings.baseUrl).to(equal("http://mock-base-url.xxx"))
                expect(projectSettings.projectMapping).to(equal([
                    EventType.banner: [
                        ExponeaSDK.ExponeaProject(
                            baseUrl: "http://mock-base-url.xxx",
                            projectToken: "other-project-token",
                            authorization: .token("other-auth-token")
                        )
                    ]
                ]))
            }
            it("should parse flushing setup") {
                guard let flushingSetup = try? parser.parseFlushingSetup() else {
                    XCTFail("Unable to parse flushing setup")
                    return
                }
                expect(flushingSetup.maxRetries).to(equal(10))
            }
            it("should parse session tracking") {
                guard let sessionTracking = try? parser.parseSessionTracking() else {
                    XCTFail("Unable to parse session tracking")
                    return
                }
                expect(sessionTracking.enabled).to(equal(true))
                expect(sessionTracking.timeout).to(equal(20))
            }
            it("should parse default properties") {
                guard let defaultProperties = try? parser.parseDefaultProperties() else {
                    XCTFail("Unable to parse default properties")
                    return
                }
                expect(defaultProperties["string"]?.jsonValue).to(equal(.string("value")))
                expect(defaultProperties["boolean"]?.jsonValue).to(equal(.bool(false)))
                expect(defaultProperties["number"]?.jsonValue).to(equal(.double(3.14159)))
                expect(defaultProperties["array"]?.jsonValue).to(equal(.array([.string("value1"), .string("value2")])))
                expect(defaultProperties["object"]?.jsonValue).to(equal(.dictionary(["key": .string("value")])))
            }
            it("should parse push notifications tracking") {
                guard let pushNotifications = try? parser.parsePushNotificationTracking() else {
                    XCTFail("Unable to parse push notification tracking")
                    return
                }
                expect(pushNotifications.enabled).to(equal(true))
                expect(pushNotifications.tokenTrackFrequency).to(equal(.daily))
                expect(pushNotifications.appGroup).to(equal("mock-app-group"))
                // once native SDK is update we'll also need this
                // expect(pushNotifications.requirePushAuthorization).to(equal(false))
                expect(pushNotifications.delegate).to(beNil())
            }
        }
        context("parsing minimal configuration") {
            let configurationDictionary = TestUtil.parseJson(
                jsonString: TestUtil.loadFile(relativePath: "/src/test_data/configurationMinimal.json")
            )
            let parser = ConfigurationParser(configurationDictionary)
            it("should parse project settings") {
                guard let projectSettings = try? parser.parseProjectSettings() else {
                    XCTFail("Unable to parse project settings")
                    return
                }
                expect(projectSettings.projectToken).to(equal("mock-project-token"))
                expect(projectSettings.authorization).to(equal(.token("mock-authorization-token")))
                expect(projectSettings.baseUrl).to(equal("https://api.exponea.com"))
                expect(projectSettings.projectMapping).to(beNil())
            }
            it("should parse flushing setup") {
                guard let flushingSetup = try? parser.parseFlushingSetup() else {
                    XCTFail("Unable to parse flushing setup")
                    return
                }
                expect(flushingSetup.maxRetries).to(equal(ExponeaSDK.Constants.Session.maxRetries))
            }
            it("should parse session tracking") {
                guard let sessionTracking = try? parser.parseSessionTracking() else {
                    XCTFail("Unable to parse session tracking")
                    return
                }
                expect(sessionTracking.enabled).to(equal(true))
                expect(sessionTracking.timeout).to(equal(ExponeaSDK.Constants.Session.defaultTimeout))
            }
            it("should parse default properties") {
                do {
                    let properties = try parser.parseDefaultProperties()
                    expect(properties).to(beNil())
                } catch {
                    XCTFail("Failed to parse default properties \(error.localizedDescription)")
                }
            }
            it("should parse push notifications tracking") {
                guard let pushNotifications = try? parser.parsePushNotificationTracking() else {
                    XCTFail("Unable to parse push notification tracking")
                    return
                }
                expect(pushNotifications.enabled).to(equal(true))
                expect(pushNotifications.tokenTrackFrequency).to(equal(.onTokenChange))
                expect(pushNotifications.appGroup).to(equal(""))
                // once native SDK is update we'll also need this
                // expect(pushNotifications.requirePushAuthorization).to(equal(false))
                expect(pushNotifications.delegate).to(beNil())
            }
        }
        context("invalid configuration") {
            it("should provide meaningful error on missing required property") {
                let configurationDictionary = TestUtil.parseJson(jsonString: "{}")
                do {
                    _ = try ConfigurationParser(configurationDictionary).parseProjectSettings()
                } catch {
                    expect(error.localizedDescription).to(equal("Property projectToken is required."))
                }
            }
            it("should provide meaningful error on incorrect property type") {
                let configurationDictionary = TestUtil.parseJson(jsonString: "{\"projectToken\": 123}")
                do {
                    _ = try ConfigurationParser(configurationDictionary).parseProjectSettings()
                } catch {
                    expect(error.localizedDescription).to(equal("Invalid type for projectToken."))
                }
            }
            it("should provide meaningful error on incorrect property value") {
                let configurationDictionary = TestUtil.parseJson(jsonString: "{\"pushTokenTrackingFrequency\": 123}")
                do {
                    _ = try ConfigurationParser(configurationDictionary).parsePushNotificationTracking()
                } catch {
                    expect(error.localizedDescription).to(equal("Invalid type for pushTokenTrackingFrequency."))
                }
            }
        }
    }
}
