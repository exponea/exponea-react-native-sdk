//
//  NSDictionary+getSafely.swift
//  Exponea
//
//  Created by Panaxeo on 18/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation

extension NSDictionary {
    func getOptionalSafely<T>(property: String) throws -> T? {
        if let value = self[property] {
            guard let value = value as? T else {
                throw ExponeaDataError.invalidType(for: property)
            }
            return value
        }
        return nil
    }

    func getRequiredSafely<T>(property: String) throws -> T {
        guard let anyValue = self[property] else {
            throw ExponeaDataError.missingProperty(property: property)
        }
        guard let value = anyValue as? T else {
            throw ExponeaDataError.invalidType(for: property)
        }
        return value
    }
}
