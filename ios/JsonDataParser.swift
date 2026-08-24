import Foundation
import ExponeaSDK

/// Parser for JSON data structures
public class JsonDataParser {
    
    /// Parse a dictionary into JSON-convertible format
    /// - Parameter dictionary: The dictionary to parse
    /// - Returns: A dictionary of JSON-convertible values
    /// - Throws: ExponeaDataError if parsing fails
    public static func parse(dictionary: NSDictionary) throws -> [String: JSONConvertible] {
        var result: [String: JSONConvertible] = [:]
        
        for (key, value) in dictionary {
            guard let keyString = key as? String else {
                throw ExponeaDataError.invalidType(for: "key in properties dictionary")
            }
            
            do {
                result[keyString] = try parseValue(value)
            } catch {
                throw ExponeaDataError.invalidType(for: "value for key \(keyString)")
            }
        }
        
        return result
    }

    private static func parseValue(_ value: Any) throws -> JSONConvertible {
        if let stringValue = value as? String {
            return stringValue
        } else if let numberValue = value as? NSNumber {
            // Check if it's a boolean
            if CFGetTypeID(numberValue) == CFBooleanGetTypeID() {
                return numberValue.boolValue
            } else if numberValue.doubleValue == floor(numberValue.doubleValue) {
                return numberValue.intValue
            } else {
                return numberValue.doubleValue
            }
        } else if let boolValue = value as? Bool {
            return boolValue
        } else if let doubleValue = value as? Double {
            return doubleValue
        } else if let intValue = value as? Int {
            return intValue
        } else if let floatValue = value as? Float {
            return Double(floatValue)
        } else if let nullValue = value as? NSNull {
            return nullValue
        } else if let arrayValue = value as? NSArray {
            return try arrayValue.map { try parseValue($0) }
        } else if let dictionaryValue = value as? NSDictionary {
            return try parse(dictionary: dictionaryValue)
        } else {
            throw ExponeaDataError.invalidType(for: "value")
        }
    }

    /// Convert an encodable value to JSON dictionary
    /// - Parameter value: The value to convert to JSON
    /// - Returns: A dictionary representation of the value
    /// - Throws: Error if encoding fails
    public static func toJson<T: Encodable>(value: T) throws -> [String: Any] {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        let data = try encoder.encode(value)
        let json = try JSONSerialization.jsonObject(with: data, options: [])
        guard let dictionary = json as? [String: Any] else {
            throw ExponeaDataError.invalidType(for: "JSON encoding result")
        }
        return dictionary
    }
}
