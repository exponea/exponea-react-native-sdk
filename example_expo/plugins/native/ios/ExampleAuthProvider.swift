//
//  ExampleAuthProvider.swift
//  example
//
//  Created by Adam Mihalik on 25/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

// Expo example helper: the SDK's customer token provider (iOS).
//
// What it shows: how an app supplies customer tokens. The SDK calls
// getAuthorizationToken() whenever it needs a token, and the example returns
// one from CustomerTokenStorage. Returning nil means no token is available.
//
// How the SDK finds it: by the Objective-C class name, so the class must be
// exported as @objc(ExponeaAuthProvider), subclass NSObject and conform to
// AuthorizationProviderType. withExampleNativeHelpers.js adds this file to the
// app target during prebuild.
//
// Do integrators need it? Only if the project uses customer token
// authorization. Then write your own provider with the same class name, and add
// a config plugin that copies it into the generated Xcode project, like this
// example does. See
// https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#customer-token-authorization

import Foundation
import ExponeaSDK

@objc(ExponeaAuthProvider)
public class ExampleAuthProvider: NSObject, AuthorizationProviderType {
    required public override init() { }
    public func getAuthorizationToken() -> String? {
        // Receive and return JWT token here.
        return CustomerTokenStorage.shared.retrieveJwtToken()
        // NULL as returned value will be handled by SDK as 'no value'
    }
}
