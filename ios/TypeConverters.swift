import Foundation
import ExponeaSDK
import AnyCodable

// MARK: - AllRecommendationData
public struct AllRecommendationData: RecommendationUserData {
    public let data: [String: Any]

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: AnyKey.self)
        var data: [String: Any] = [:]
        for key in container.allKeys {
            data[key.stringValue] = (try container.decode(AnyCodable.self, forKey: key)).value
        }
        self.data = data
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: AnyKey.self)
        for key in data.keys {
            try container.encode(AnyCodable(data[key]), forKey: AnyKey(stringValue: key))
        }
    }

    public static func == (lhs: AllRecommendationData, rhs: AllRecommendationData) -> Bool {
        return AnyCodable(lhs.data) == AnyCodable(rhs.data)
    }

    struct AnyKey: CodingKey {
        var intValue: Int?

        init(intValue: Int) {
            self.stringValue = "\(intValue)"
            self.intValue = intValue
        }

        var stringValue: String
        init(stringValue: String) {
            self.stringValue = stringValue
        }
    }
}

@objcMembers public class TypeConverters: NSObject {

    // MARK: - Consent Converters
    public static func consentToDict(_ consent: ExponeaSDK.Consent) -> NSDictionary {
        return [
            "id": consent.id,
            "legitimateInterest": consent.legitimateInterest,
            "sources": consentSourcesToDict(consent.sources),
            "translations": consent.translations as NSDictionary
        ]
    }

    private static func consentSourcesToDict(_ sources: ExponeaSDK.ConsentSources) -> NSDictionary {
        return [
            "createdFromCRM": sources.isCreatedFromCRM,
            "imported": sources.isImported,
            "privateAPI": sources.privateAPI,
            "publicAPI": sources.publicAPI,
            "trackedFromScenario": sources.isTrackedFromScenario
        ]
    }

    // MARK: - Recommendation Converters
    public static func recommendationToDict(_ recommendation: ExponeaSDK.Recommendation<AllRecommendationData>) -> NSDictionary {
        return [
            "engineName": recommendation.systemData.engineName,
            "itemId": recommendation.systemData.itemId,
            "recommendationId": recommendation.systemData.recommendationId,
            "recommendationVariantId": recommendation.systemData.recommendationVariantId ?? "",
            "data": recommendation.userData.data as NSDictionary
        ]
    }

    // MARK: - RecommendationOptions Parser
    public static func parseRecommendationOptions(from dict: NSDictionary) throws -> ExponeaSDK.RecommendationOptions {
        // Required fields
        guard let id = dict["id"] as? String else {
            throw ExponeaError.invalidValue(for: "RecommendationOptions.id is required")
        }
        guard let fillWithRandom = dict["fillWithRandom"] as? Bool else {
            throw ExponeaError.invalidValue(for: "RecommendationOptions.fillWithRandom is required")
        }

        // Optional fields with defaults
        let size = dict["size"] as? Int ?? 10
        let items = dict["items"] as? [String: String]
        let noTrack = dict["noTrack"] as? Bool ?? false
        let catalogAttributesWhitelist = dict["catalogAttributesWhitelist"] as? [String]

        return ExponeaSDK.RecommendationOptions(
            id: id,
            fillWithRandom: fillWithRandom,
            size: size,
            items: items,
            noTrack: noTrack,
            catalogAttributesWhitelist: catalogAttributesWhitelist
        )
    }

    // MARK: - App Inbox Converters
    public static func appInboxMessageToDict(_ message: ExponeaSDK.MessageItem) -> NSDictionary {
        return [
            "id": message.id,
            "type": message.type,
            "is_read": message.read,
            "create_time": message.receivedTime ?? 0,
            "content": message.rawContent ?? [:]
        ]
    }

    public static func parseAppInboxMessage(from dict: NSDictionary) throws -> ExponeaSDK.MessageItem {
        // Convert NSDictionary to Data, then decode using JSONDecoder
        let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let message = try decoder.decode(ExponeaSDK.MessageItem.self, from: jsonData)
        return message
    }

    public static func parseAppInboxAction(from dict: NSDictionary) throws -> ExponeaSDK.MessageItemAction {
        let action = dict["action"] as? String
        let title = dict["title"] as? String
        let url = dict["url"] as? String

        return ExponeaSDK.MessageItemAction(
            action: action,
            title: title,
            url: url
        )
    }

    // MARK: - In-App Message Converters
    public static func parseInAppMessage(from dict: NSDictionary) throws -> ExponeaSDK.InAppMessage {
        // Convert NSDictionary to Data, then decode using JSONDecoder
        let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let message = try decoder.decode(ExponeaSDK.InAppMessage.self, from: jsonData)
        return message
    }

    public static func parseInAppMessageAction(from dict: NSDictionary) throws -> (buttonText: String?, buttonLink: String?) {
        let buttonText = dict["buttonText"] as? String
        let buttonLink = dict["buttonLink"] as? String
        return (buttonText, buttonLink)
    }

    // MARK: - In-App Content Block Converters
    public static func parseInAppContentBlockResponse(from dict: NSDictionary) throws -> ExponeaSDK.InAppContentBlockResponse {
        // Convert NSDictionary to Data, then decode using JSONDecoder
        let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let response = try decoder.decode(ExponeaSDK.InAppContentBlockResponse.self, from: jsonData)
        return response
    }

    public static func parseInAppContentBlockAction(from dict: NSDictionary) throws -> ExponeaSDK.InAppContentBlockAction {
        // Convert NSDictionary to Data, then decode using JSONDecoder
        let jsonData = try JSONSerialization.data(withJSONObject: dict, options: [])
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let action = try decoder.decode(ExponeaSDK.InAppContentBlockAction.self, from: jsonData)
        return action
    }

    // MARK: - Button Style Utilities

    /// Parses color strings in various formats
    /// Supports: #RGB, #RRGGBB, #AARRGGBB, rgba(r,g,b,a), rgb(r,g,b), named colors
    public static func parseColor(_ colorString: String?) -> UIColor? {
        guard let colorString = colorString, !colorString.isEmpty else {
            return nil
        }

        let trimmed = colorString.trimmingCharacters(in: .whitespaces)

        // Handle hex colors (#RGB, #RRGGBB, #AARRGGBB)
        if trimmed.hasPrefix("#") {
            return parseHexColor(trimmed)
        }

        // Handle rgba(r, g, b, a)
        if trimmed.hasPrefix("rgba(") {
            return parseRGBAColor(trimmed)
        }

        // Handle rgb(r, g, b)
        if trimmed.hasPrefix("rgb(") {
            return parseRGBColor(trimmed)
        }

        // Handle named colors (red, blue, etc.)
        return parseNamedColor(trimmed)
    }

    private static func parseHexColor(_ hex: String) -> UIColor? {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0

        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else {
            return nil
        }

        let length = hexSanitized.count
        let r, g, b, a: CGFloat

        if length == 3 {
            // #RGB format
            r = CGFloat((rgb & 0xF00) >> 8) / 15.0
            g = CGFloat((rgb & 0x0F0) >> 4) / 15.0
            b = CGFloat(rgb & 0x00F) / 15.0
            a = 1.0
        } else if length == 6 {
            // #RRGGBB format
            r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
            g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
            b = CGFloat(rgb & 0x0000FF) / 255.0
            a = 1.0
        } else if length == 8 {
            // #RRGGBBAA format (CSS style, convert to #AARRGGBB)
            r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
            g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
            b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
            a = CGFloat(rgb & 0x000000FF) / 255.0
        } else {
            return nil
        }

        return UIColor(red: r, green: g, blue: b, alpha: a)
    }

    private static func parseRGBAColor(_ rgba: String) -> UIColor? {
        let components = rgba
            .replacingOccurrences(of: "rgba(", with: "")
            .replacingOccurrences(of: ")", with: "")
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }

        guard components.count == 4,
              let r = Double(components[0]),
              let g = Double(components[1]),
              let b = Double(components[2]),
              let a = Double(components[3]) else {
            return nil
        }

        return UIColor(
            red: CGFloat(r) / 255.0,
            green: CGFloat(g) / 255.0,
            blue: CGFloat(b) / 255.0,
            alpha: CGFloat(a)
        )
    }

    private static func parseRGBColor(_ rgb: String) -> UIColor? {
        let components = rgb
            .replacingOccurrences(of: "rgb(", with: "")
            .replacingOccurrences(of: ")", with: "")
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }

        guard components.count == 3,
              let r = Double(components[0]),
              let g = Double(components[1]),
              let b = Double(components[2]) else {
            return nil
        }

        return UIColor(
            red: CGFloat(r) / 255.0,
            green: CGFloat(g) / 255.0,
            blue: CGFloat(b) / 255.0,
            alpha: 1.0
        )
    }

    private static func parseNamedColor(_ name: String) -> UIColor? {
        let lowercased = name.lowercased()
        switch lowercased {
        case "red": return .red
        case "blue": return .blue
        case "green": return .green
        case "yellow": return .yellow
        case "orange": return .orange
        case "purple": return .purple
        case "black": return .black
        case "white": return .white
        case "gray", "grey": return .gray
        case "clear": return .clear
        default: return nil
        }
    }

    /// Parses size strings like "14px", "16sp", "12pt"
    /// Returns size in points (iOS default unit)
    public static func parseSize(_ sizeString: String?) -> CGFloat? {
        guard let sizeString = sizeString, !sizeString.isEmpty else {
            return nil
        }

        let trimmed = sizeString.trimmingCharacters(in: .whitespaces)

        // Extract numeric value
        let numericString = trimmed.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        guard let value = Double(numericString) else {
            return nil
        }

        // iOS uses points by default, so convert if needed
        // For simplicity, treat px/pt/sp/dp all as points
        // (React Native handles DPI scaling automatically)
        return CGFloat(value)
    }

    /// Parses font weight strings ("normal", "bold", "100"-"900")
    /// Returns UIFont.Weight
    public static func parseFontWeight(_ weightString: String?) -> UIFont.Weight {
        guard let weightString = weightString?.trimmingCharacters(in: .whitespaces).lowercased() else {
            return .regular
        }

        switch weightString {
        case "normal", "400": return .regular
        case "bold", "700": return .bold
        case "100": return .ultraLight
        case "200": return .thin
        case "300": return .light
        case "500": return .medium
        case "600": return .semibold
        case "800": return .heavy
        case "900": return .black
        default: return .regular
        }
    }
}
