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
            
            // Convert Swift types to JSONConvertible
            if let stringValue = value as? String {
                result[keyString] = stringValue
            } else if let numberValue = value as? NSNumber {
                // Check if it's a boolean
                if CFGetTypeID(numberValue) == CFBooleanGetTypeID() {
                    result[keyString] = numberValue.boolValue
                } else if numberValue.doubleValue == floor(numberValue.doubleValue) {
                    result[keyString] = numberValue.intValue
                } else {
                    result[keyString] = numberValue.doubleValue
                }
            } else if let boolValue = value as? Bool {
                result[keyString] = boolValue
            } else if let doubleValue = value as? Double {
                result[keyString] = doubleValue
            } else if let intValue = value as? Int {
                result[keyString] = intValue
            } else if let floatValue = value as? Float {
                result[keyString] = Double(floatValue)
            } else {
                throw ExponeaDataError.invalidType(for: "value for key \(keyString)")
            }
        }
        
        return result
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
