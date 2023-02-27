//
//  ConfigurationParser.swift
//  Exponea
//
//  Created by Panaxeo on 17/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

class ConfigurationParser {

    private let dictionary: NSDictionary

    init(_ dictionary: NSDictionary) {
        self.dictionary = dictionary
    }
    static func parseExponeaProject(dictionary: NSDictionary, defaultBaseUrl: String) throws -> ExponeaProject {
        let projectToken: String = try dictionary.getRequiredSafely(property: "projectToken")
        let authorizationToken: String = try dictionary.getRequiredSafely(property: "authorizationToken")
        let baseUrl: String = try dictionary.getOptionalSafely(property: "baseUrl") ?? defaultBaseUrl
        return ExponeaProject(baseUrl: baseUrl, projectToken: projectToken, authorization: .token(authorizationToken))
    }

    static func parseProjectMapping(
        dictionary: NSDictionary,
        defaultBaseUrl: String
    ) throws -> [EventType: [ExponeaProject]]? {
        var mapping: [EventType: [ExponeaProject]]  = [:]
        try dictionary.allKeys.forEach { key in
            guard let eventTypeString = key as? String else {
                throw ExponeaDataError.invalidType(for: "eventType key")
            }
            guard let eventType = EventType(rawValue: eventTypeString) else {
                throw ExponeaDataError.invalidValue(for: "eventType key")
            }
            let projectArray: [Any] = try dictionary.getRequiredSafely(property: eventTypeString)
            let exponeaProjects: [ExponeaProject] = try projectArray.map { project in
                guard let project = project as? NSDictionary else {
                    throw ExponeaDataError.invalidType(for: "project in project list in project mapping")
                }
                return try parseExponeaProject(dictionary: project, defaultBaseUrl: defaultBaseUrl)
            }
            mapping[eventType] = exponeaProjects
        }
        return mapping
    }

    func parseProjectSettings() throws -> ExponeaSDK.Exponea.ProjectSettings {
        let projectToken: String = try dictionary.getRequiredSafely(property: "projectToken")
        let authorizationToken: String = try dictionary.getRequiredSafely(property: "authorizationToken")
        let baseUrl = try dictionary.getOptionalSafely(property: "baseUrl") ?? ExponeaSDK.Constants.Repository.baseUrl
        var projectMapping: [EventType: [ExponeaProject]]?
        if let mapping: NSDictionary = try dictionary.getOptionalSafely(property: "projectMapping") {
            projectMapping = try ConfigurationParser.parseProjectMapping(dictionary: mapping, defaultBaseUrl: baseUrl)
        }
        return ExponeaSDK.Exponea.ProjectSettings(
            projectToken: projectToken,
            authorization: ExponeaSDK.Authorization.token(authorizationToken),
            baseUrl: baseUrl,
            projectMapping: projectMapping
        )
    }

    func parsePushNotificationTracking() throws -> ExponeaSDK.Exponea.PushNotificationTracking {
        var appGroup = ""
        if let iosDictionary: NSDictionary = try? dictionary.getOptionalSafely(property: "ios") {
            appGroup = try iosDictionary.getOptionalSafely(property: "appGroup") ?? appGroup
        }
        var frequency: TokenTrackFrequency?
        if let frequencyString: String = try dictionary.getOptionalSafely(property: "pushTokenTrackingFrequency") {
            switch frequencyString {
            case "ON_TOKEN_CHANGE": frequency = .onTokenChange
            case "EVERY_LAUNCH": frequency = .everyLaunch
            case "DAILY": frequency = .daily
            default: throw ExponeaDataError.invalidValue(for: "pushTokenTrackingFrequency")
            }
        }
        var requirePushAuthorization = true
        if let iosDictionary: NSDictionary = try? dictionary.getOptionalSafely(property: "ios") {
            requirePushAuthorization = try iosDictionary.getOptionalSafely(property: "requirePushAuthorization") ?? true
        }
        if let frequency = frequency {
            return ExponeaSDK.Exponea.PushNotificationTracking.enabled(
                appGroup: appGroup,
                requirePushAuthorization: requirePushAuthorization,
                tokenTrackFrequency: frequency
            )
        } else {
            return ExponeaSDK.Exponea.PushNotificationTracking.enabled(
                appGroup: appGroup,
                requirePushAuthorization: requirePushAuthorization
            )
        }
    }

    func parseSessionTracking() throws -> ExponeaSDK.Exponea.AutomaticSessionTracking {
        let automaticSessionTracking: Bool
            = try dictionary.getOptionalSafely(property: "automaticSessionTracking") ?? true
        let timeout = try dictionary.getOptionalSafely(property: "sessionTimeout")
            ?? ExponeaSDK.Constants.Session.defaultTimeout

        return automaticSessionTracking ? .enabled(timeout: timeout) : .disabled
    }

    func parseDefaultProperties() throws -> [String: JSONConvertible]? {
        if let props: NSDictionary = try dictionary.getOptionalSafely(property: "defaultProperties") {
            return try JsonDataParser.parse(dictionary: props)
        }
        return nil
    }

    func parseFlushingSetup() throws -> ExponeaSDK.Exponea.FlushingSetup {
        let maxRetries = try dictionary.getOptionalSafely(property: "flushMaxRetries")
            ?? ExponeaSDK.Constants.Session.maxRetries
        return ExponeaSDK.Exponea.FlushingSetup(mode: .immediate, maxRetries: maxRetries)
    }

    func parseAllowDefaultCustomerProperties() throws -> Bool {
        return try dictionary.getOptionalSafely(property: "allowDefaultCustomerProperties") ?? true
    }

    func parseAdvancedAuthEnabled() throws -> Bool? {
        return try dictionary.getOptionalSafely(property: "advancedAuthEnabled")
    }
}
