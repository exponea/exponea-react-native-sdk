import Foundation

/// Error types for Exponea configuration
public enum ExponeaDataError: Error {
    case invalidType(for: String)
    case invalidValue(for: String)
}

/// Extensions to NSDictionary for safe value extraction
extension NSDictionary {
    
    /// Get a required value from the dictionary
    /// - Parameter property: The key to retrieve
    /// - Returns: The value cast to the specified type
    /// - Throws: ExponeaDataError if the key doesn't exist or is of wrong type
    public func getRequiredSafely<T>(property: String) throws -> T {
        guard let value = self[property] else {
            throw ExponeaDataError.invalidType(for: property)
        }
        guard let typedValue = value as? T else {
            throw ExponeaDataError.invalidType(for: property)
        }
        return typedValue
    }
    
    /// Get an optional value from the dictionary
    /// - Parameter property: The key to retrieve
    /// - Returns: The value cast to the specified type, or nil if not present
    /// - Throws: ExponeaDataError if the key exists but is of wrong type
    public func getOptionalSafely<T>(property: String) throws -> T? {
        guard let value = self[property] else {
            return nil
        }
        guard let typedValue = value as? T else {
            throw ExponeaDataError.invalidType(for: property)
        }
        return typedValue
    }
}
