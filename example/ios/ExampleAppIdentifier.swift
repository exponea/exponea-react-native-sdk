//
//  ExampleAppIdentifier.swift
//  example
//
//  Created by Adam Mihalik on 01/08/2025.
//

import Foundation

// This protocol is used queried using reflection by native iOS SDK to see if it's Example app
// This has not be implemented by developer; It is used for SDK to recognize environment
@objc(IsExponeaExampleApp)
protocol IsExponeaExampleApp {
}
