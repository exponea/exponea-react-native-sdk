//
//  JsonDataParser.swift
//  Exponea
//
//  Created by Panaxeo on 18/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

struct JsonDataParser {
    static func parse(dictionary: NSDictionary) throws -> [String: JSONConvertible] {
        var data: [String: JSONConvertible] = [:]
        try dictionary.forEach { key, value in
            guard let key = key as? String else {
                throw ExponeaDataError.invalidValue(for: "property key")
            }
            data[key] = try parseValue(value: value)
        }
        return data
    }

    static func parseDictionary(dictionary: NSDictionary) throws -> [String: JSONValue] {
        return try parse(dictionary: dictionary).mapValues { $0.jsonValue }
    }

    static func parseArray(array: NSArray) throws -> [JSONValue] {
        return try array.map { try parseValue(value: $0).jsonValue}
    }

    static func parseValue(value: Any) throws -> JSONConvertible {
        if let dictionary = value as? NSDictionary {
            return try parseDictionary(dictionary: dictionary)
        } else if let array = value as? NSArray {
            return try parseArray(array: array)
        } else if let number = value as? NSNumber {
            if number === kCFBooleanFalse {
                return false
            } else if number === kCFBooleanTrue {
                return true
            } else {
                return number.doubleValue
            }
        } else if let string = value as? NSString {
            return string
        }
        throw ExponeaDataError.invalidType(for: "value in data '\(type(of: value))'")
    }
}
