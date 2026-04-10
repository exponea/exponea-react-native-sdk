//
//  ExponeaError.swift
//  Exponea
//
//  Created by Panaxeo on 19/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation

public enum ExponeaError: LocalizedError {
    case notConfigured
    case alreadyConfigured
    case flushModeNotPeriodic
    case configurationError
    case notAvailableForPlatform(name: String)
    case fetchError(description: String)
    case generalError(_ message: String)
    case invalidValue(for: String)

    public var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "Exponea SDK is not configured. Call Exponea.configure() before calling functions of the SDK"
        case .alreadyConfigured:
            return "Exponea SDK was already configured."
        case .flushModeNotPeriodic:
            return "Flush mode is not periodic."
        case .notAvailableForPlatform(let name):
            return "\(name) is not available for iOS platform."
        case .fetchError(let description):
            return "Data fetching failed: \(description)"
        case .generalError(let message):
            return "Error: \(message)"
        case .configurationError:
            return "Exponea SDK is not configured. Check logs for details."
        case .invalidValue(let detail):
            return "Invalid value: \(detail)"
        }
    }
}
