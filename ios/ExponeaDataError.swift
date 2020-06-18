//
//  ExponeaDataError.swift
//  Exponea
//
//  Created by Panaxeo on 18/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation

enum ExponeaDataError: LocalizedError {
    case missingProperty(property: String)
    case invalidType(for: String)
    case invalidValue(for: String)

    public var errorDescription: String? {
        switch self {
        case .missingProperty(let property): return "Property \(property) is required."
        case .invalidType(let name): return "Invalid type for \(name)."
        case .invalidValue(let name): return "Invalid value for \(name)."
        }
    }
}
