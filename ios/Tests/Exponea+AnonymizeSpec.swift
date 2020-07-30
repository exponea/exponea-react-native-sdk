//
//  Exponea+AnonymizeSpec.swift
//  Tests
//
//  Created by Panaxeo on 30/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import Quick
import Nimble

import protocol ExponeaSDK.JSONConvertible
import struct ExponeaSDK.ExponeaProject
import enum ExponeaSDK.EventType

@testable import Exponea

class ExponeaAnonymizeSpec: QuickSpec {
    override func spec() {
        var mockExponea: MockExponea!
        var exponea: Exponea!

        beforeEach {
            mockExponea = MockExponea()
            Exponea.exponeaInstance = mockExponea
            exponea = Exponea()
        }

        it("should anonymize without changing anything") {
            mockExponea.isConfiguredValue = true
            waitUntil { done in
                exponea.anonymize(
                    exponeaProjectDictionary: [:],
                    projectMappingDictionary: [:],
                    resolve: { result in
                        expect(result).to(beNil())
                        expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                        expect(mockExponea.calls[1].name).to(equal("anonymize"))
                        expect(mockExponea.calls[1].params.count).to(equal(0))
                        done()
                    },
                    reject: { _, _, _ in }
                )
            }
        }

        it("should anonymize and change project") {
            mockExponea.isConfiguredValue = true
            waitUntil { done in
                exponea.anonymize(
                    exponeaProjectDictionary: [
                        "exponeaProject": [
                            "baseUrl": "mock-url",
                            "authorizationToken": "mock-auth-token",
                            "projectToken": "mock-project-token"
                        ]
                    ],
                    projectMappingDictionary: [:],
                    resolve: { result in
                        expect(result).to(beNil())
                        expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                        expect(mockExponea.calls[1].name).to(equal("configuration:get"))
                        expect(mockExponea.calls[2].name).to(equal("anonymize"))
                        expect(mockExponea.calls[2].params[0] as? ExponeaProject)
                            .to(equal(ExponeaProject(
                                baseUrl: "mock-url",
                                projectToken: "mock-project-token",
                                authorization: .token("mock-auth-token")
                            )))
                        expect(mockExponea.calls[2].params[1]).to(beNil())
                        done()
                    },
                    reject: { _, _, _ in }
                )
            }
        }

        it("should anonymize and change project mapping") {
            mockExponea.isConfiguredValue = true
            waitUntil { done in
                exponea.anonymize(
                    exponeaProjectDictionary: [
                        "exponeaProject": [
                            "baseUrl": "mock-url",
                            "authorizationToken": "mock-auth-token",
                            "projectToken": "mock-project-token"
                        ]
                    ],
                    projectMappingDictionary: [
                        "projectMapping": [
                            "INSTALL": [[
                                "baseUrl": "install-mock-url",
                                "authorizationToken": "install-mock-auth-token",
                                "projectToken": "install-mock-project-token"
                            ]]
                        ]
                    ],
                    resolve: { result in
                        expect(result).to(beNil())
                        expect(mockExponea.calls[0].name).to(equal("isConfigured:get"))
                        expect(mockExponea.calls[1].name).to(equal("configuration:get"))
                        expect(mockExponea.calls[2].name).to(equal("configuration:get"))
                        expect(mockExponea.calls[3].name).to(equal("anonymize"))
                        expect(mockExponea.calls[3].params[0] as? ExponeaProject)
                            .to(equal(ExponeaProject(
                                baseUrl: "mock-url",
                                projectToken: "mock-project-token",
                                authorization: .token("mock-auth-token")
                            )))
                        expect(mockExponea.calls[3].params[1] as? [EventType: [ExponeaProject]])
                            .to(equal([
                                EventType.install: [
                                    ExponeaProject(
                                        baseUrl: "install-mock-url",
                                        projectToken: "install-mock-project-token",
                                        authorization: .token("install-mock-auth-token")
                                    )
                                ]
                            ]))
                        done()
                    },
                    reject: { _, _, _ in }
                )
            }

        }

        it("should not anonymize when Exponea is not configured") {
            waitUntil { done in
                exponea.anonymize(
                    exponeaProjectDictionary: [:],
                    projectMappingDictionary: [:],
                    resolve: { _ in },
                    reject: { errorCode, description, error in
                        expect(errorCode).to(equal("ExponeaSDK"))
                        expect(description).to(equal(ExponeaError.notConfigured.localizedDescription))
                        expect(error?.localizedDescription)
                            .to(equal(ExponeaError.notConfigured.localizedDescription))
                        done()
                    }
                )
            }
        }
    }
}
