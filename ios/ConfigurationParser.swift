import Foundation
import ExponeaSDK

public class ConfigurationParser {

    private let dictionary: NSDictionary

    public init(_ dictionary: NSDictionary) {
        self.dictionary = dictionary
    }
    public static func parseExponeaProject(dictionary: NSDictionary) throws -> ExponeaProject {
        let projectToken: String = try dictionary.getRequiredSafely(property: "projectToken")
        let authorizationToken: String = try dictionary.getRequiredSafely(property: "authorizationToken")
        if let baseUrl: String = try dictionary.getOptionalSafely(property: "baseUrl") {
            return ExponeaProject(baseUrl: baseUrl, projectToken: projectToken, authorization: .token(authorizationToken))
        } else {
            return ExponeaProject(projectToken: projectToken, authorization: .token(authorizationToken))
        }
    }

    public static func parseIntegrationRouteMap(
        dictionary: NSDictionary
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
                    throw ExponeaDataError.invalidType(for: "project configuration in integrationRouteMap")
                }
                return try parseExponeaProject(dictionary: project)
            }
            mapping[eventType] = exponeaProjects
        }
        return mapping
    }

    public func parseStreamSettings(integrationConfigDict: NSDictionary) throws -> ExponeaSDK.Exponea.StreamSettings? {
        guard let streamId: String = try integrationConfigDict.getOptionalSafely(property: "streamId") else {
            return nil
        }
        let baseUrl: String? = try integrationConfigDict.getOptionalSafely(property: "baseUrl")
        return ExponeaSDK.Exponea.StreamSettings(streamId: streamId, baseUrl: baseUrl)
    }

    public func parseProjectSettings(integrationConfigDict: NSDictionary) throws -> ExponeaSDK.Exponea.ProjectSettings {
        // Reached only when parseStreamSettings returned nil (no streamId in integrationConfig).
        // If projectToken is also missing, neither mode was specified — surface the dual-mode hint.
        guard let projectToken: String = try integrationConfigDict.getOptionalSafely(property: "projectToken") else {
            throw ExponeaDataError.invalidValue(
                for: "integrationConfig requires either 'streamId' for StreamConfig, or 'projectToken' and 'authorizationToken' for ProjectConfig"
            )
        }
        let authorizationToken: String = try integrationConfigDict.getRequiredSafely(property: "authorizationToken")
        let baseUrl = try integrationConfigDict.getOptionalSafely(property: "baseUrl") ?? ExponeaSDK.Constants.Repository.baseUrl
        var projectMapping: [EventType: [ExponeaProject]]?
        if let mapping: NSDictionary = try dictionary.getOptionalSafely(property: "integrationRouteMap") {
            projectMapping = try ConfigurationParser.parseIntegrationRouteMap(dictionary: mapping)
        }
        return ExponeaSDK.Exponea.ProjectSettings(
            projectToken: projectToken,
            authorization: ExponeaSDK.Authorization.token(authorizationToken),
            baseUrl: baseUrl,
            projectMapping: projectMapping
        )
    }

    public func parsePushNotificationTracking() throws -> ExponeaSDK.Exponea.PushNotificationTracking {
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
        if let iosDictionary: NSDictionary = try? dictionary.getOptionalSafely(property: "ios"),
           let iosValue: Bool = try? iosDictionary.getOptionalSafely(property: "requirePushAuthorization") {
            requirePushAuthorization = iosValue
        } else if let rootValue: Bool = try? dictionary.getOptionalSafely(property: "requirePushAuthorization") {
            requirePushAuthorization = rootValue
        }
        // else keep default true
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

    public func parseSessionTracking() throws -> ExponeaSDK.Exponea.AutomaticSessionTracking {
        let automaticSessionTracking: Bool
            = try dictionary.getOptionalSafely(property: "automaticSessionTracking") ?? true
        let timeout = try dictionary.getOptionalSafely(property: "sessionTimeout")
            ?? ExponeaSDK.Constants.Session.defaultTimeout

        return automaticSessionTracking ? .enabled(timeout: timeout) : .disabled
    }

    public func parseDefaultProperties() throws -> [String: JSONConvertible]? {
        if let props: NSDictionary = try dictionary.getOptionalSafely(property: "defaultProperties") {
            return try JsonDataParser.parse(dictionary: props)
        }
        return nil
    }

    public func parseFlushingSetup() throws -> ExponeaSDK.Exponea.FlushingSetup {
        let maxRetries = try dictionary.getOptionalSafely(property: "flushMaxRetries")
            ?? ExponeaSDK.Constants.Session.maxRetries
        return ExponeaSDK.Exponea.FlushingSetup(mode: .immediate, maxRetries: maxRetries)
    }

    public func parseAllowDefaultCustomerProperties() throws -> Bool {
        return try dictionary.getOptionalSafely(property: "allowDefaultCustomerProperties") ?? true
    }

    public func parseAdvancedAuthEnabled() throws -> Bool? {
        return try dictionary.getOptionalSafely(property: "advancedAuthEnabled")
    }

    public func parseInAppContentBlocksPlaceholders() throws -> [String] {
        return try dictionary.getOptionalSafely(property: "inAppContentBlockPlaceholdersAutoLoad") ?? []
    }

    public func parseManualSessionAutoClose() throws -> Bool {
        return try dictionary.getOptionalSafely(property: "manualSessionAutoClose") ?? true
    }

    public func parseApplicationId() throws -> String? {
        try dictionary.getOptionalSafely(property: "applicationId")
    }

    public func parseRegenerateDeviceIdOnAnonymize() throws -> Bool? {
        try dictionary.getOptionalSafely(property: "regenerateDeviceIdOnAnonymize")
    }

    /// Builds a `Configuration` object suitable for `Exponea.configure(with:authContext:)`.
    /// Extracts push-notification, session, and flushing settings as flat values rather than
    /// the wrapped enum types used by the multi-arg configure overloads.
    public func parseConfiguration() throws -> Configuration {
        guard let integrationConfigDict: NSDictionary = try dictionary.getOptionalSafely(property: "integrationConfig") else {
            throw ExponeaDataError.invalidValue(for: "integrationConfig is required")
        }
        let streamSettings = try parseStreamSettings(integrationConfigDict: integrationConfigDict)
        let integrationConfig: any IntegrationType
        if let s = streamSettings {
            integrationConfig = s
        } else {
            integrationConfig = try parseProjectSettings(integrationConfigDict: integrationConfigDict)
        }

        // Push notification flat fields (mirrors parsePushNotificationTracking logic)
        var appGroup: String? = nil
        var requirePushAuthorization: Bool? = nil
        var tokenTrackFrequency: TokenTrackFrequency? = nil

        if let iosDictionary: NSDictionary = try? dictionary.getOptionalSafely(property: "ios") {
            appGroup = try iosDictionary.getOptionalSafely(property: "appGroup")
            requirePushAuthorization = try? iosDictionary.getOptionalSafely(property: "requirePushAuthorization")
        }
        if requirePushAuthorization == nil {
            requirePushAuthorization = try? dictionary.getOptionalSafely(property: "requirePushAuthorization")
        }
        if let frequencyString: String = try dictionary.getOptionalSafely(property: "pushTokenTrackingFrequency") {
            switch frequencyString {
            case "ON_TOKEN_CHANGE": tokenTrackFrequency = .onTokenChange
            case "EVERY_LAUNCH": tokenTrackFrequency = .everyLaunch
            case "DAILY": tokenTrackFrequency = .daily
            default: throw ExponeaDataError.invalidValue(for: "pushTokenTrackingFrequency")
            }
        }

        return try Configuration(
            integrationConfig: integrationConfig,
            appGroup: appGroup,
            defaultProperties: try parseDefaultProperties(),
            inAppContentBlocksPlaceholders: try parseInAppContentBlocksPlaceholders(),
            sessionTimeout: try dictionary.getOptionalSafely(property: "sessionTimeout"),
            automaticSessionTracking: try dictionary.getOptionalSafely(property: "automaticSessionTracking"),
            requirePushAuthorization: requirePushAuthorization,
            tokenTrackFrequency: tokenTrackFrequency,
            flushEventMaxRetries: try dictionary.getOptionalSafely(property: "flushMaxRetries"),
            allowDefaultCustomerProperties: try parseAllowDefaultCustomerProperties(),
            advancedAuthEnabled: streamSettings != nil ? nil : try parseAdvancedAuthEnabled(),
            manualSessionAutoClose: try parseManualSessionAutoClose(),
            applicationID: try parseApplicationId(),
            regenerateDeviceIdOnAnonymize: try parseRegenerateDeviceIdOnAnonymize()
        )
    }
}
