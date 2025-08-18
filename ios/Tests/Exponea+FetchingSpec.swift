//
//  Exponea+FetchingSpec.swift
//  Tests
//
//  Created by Panaxeo on 30/07/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//
import Foundation
import Quick
import Nimble

import enum ExponeaSDK.Result
import struct ExponeaSDK.ConsentsResponse
import struct ExponeaSDK.RecommendationResponse
import struct ExponeaSDK.EmptyRecommendationData

@testable import Exponea

@available(iOS 11.0, *)
class ExponeaFetchingSpec: QuickSpec {
    let consentsResponse = """
        {
            "results": [{
                "id": "TestCategory",
                "legitimate_interest": false,
                "sources": {
                    "crm": true,
                    "import": true,
                    "page": true,
                    "private_api": true,
                    "public_api": false,
                    "scenario": true
                },
                "translations": {
                    "en": {
                        "description": "test",
                        "name": "My Test Consents"
                    }
                }
            }],
            "success": true
        }
    """

    let recommendationsResponse = """
        {
          "success": true,
          "value": [
            {
              "description": "an awesome book",
              "engine_name": "random",
              "image": "no image available",
              "item_id": "1",
              "name": "book",
              "price": 19.99,
              "product_id": "1",
              "recommendation_id": "5dd6af3d147f518cb457c63c",
              "recommendation_variant_id": null
            },
            {
              "description": "super awesome off-brand phone",
              "engine_name": "random",
              "image": "just google one",
              "item_id": "3",
              "name": "mobile phone",
              "price": 499.99,
              "product_id": "3",
              "recommendation_id": "5dd6af3d147f518cb457c63c",
              "recommendation_variant_id": "mock id"
            }
          ]
        }
    """

    // swiftlint:disable line_length
    let consentsJSPayload = """
    [{"id":"TestCategory","legitimateInterest":false,"sources":{"createdFromCRM":true,"imported":true,"privateAPI":true,"publicAPI":false,"trackedFromScenario":true},"translations":{"en":{"description":"test","name":"My Test Consents"}}}]
    """

    let recommendationJSPayload = """
    [{"description":"an awesome book","engine_name":"random","image":"no image available","item_id":"1","name":"book","price":19.989999999999998,"product_id":"1","recommendation_id":"5dd6af3d147f518cb457c63c","recommendation_variant_id":null},{"description":"super awesome off-brand phone","engine_name":"random","image":"just google one","item_id":"3","name":"mobile phone","price":499.99000000000001,"product_id":"3","recommendation_id":"5dd6af3d147f518cb457c63c","recommendation_variant_id":"mock id"}]
    """
    // swiftlint:enable line_length

    override func spec() {
        var mockExponea: MockExponea!
        var exponea: Exponea!

        beforeEach {
            mockExponea = MockExponea()
            Exponea.exponeaInstance = mockExponea
            exponea = Exponea()
        }

        context("consents") {
            it("should fetch consents") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.fetchConsents(
                        resolve: { result in
                            guard let result = result as? String else {
                                XCTFail("Expected String result")
                                return
                            }
                            expect(TestUtil.getSortedKeysJson(result)).to(equal(self.consentsJSPayload))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                    expect(mockExponea.calls[0].name).to(equal("fetchConsents"))
                    let callback = mockExponea.calls[0].params[0] as? (Result<ConsentsResponse>) -> Void

                    let jsonDecoder = JSONDecoder()
                    jsonDecoder.dateDecodingStrategy = .secondsSince1970
                    guard let data = self.consentsResponse.data(using: .utf8),
                          let consents = try? jsonDecoder.decode(ConsentsResponse.self, from: data) else {
                        XCTFail("Unable to parse consents")
                        return
                    }
                    callback?(Result<ConsentsResponse>.success(consents))
                }
            }

            it("should forward error when fetching consents fails") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.fetchConsents(
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal("Data fetching failed: something"))
                            expect(error?.localizedDescription).to(equal("Data fetching failed: something"))
                            done()
                        }
                    )
                    let callback = mockExponea.calls[0].params[0] as? (Result<ConsentsResponse>) -> Void
                    callback?(Result<ConsentsResponse>.failure(ExponeaError.fetchError(description: "something")))
                }
            }

            it("should invoke fetch consents when Exponea is not configured - afterInit") {
                exponea.fetchConsents(
                    resolve: { _ in },
                    reject: { _, _, _ in }
                )
                expect(mockExponea.calls[0].name).to(equal("fetchConsents"))
            }
        }

        context("recommendations") {
            it("should fetch recommendations") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.fetchRecommendations(
                        optionsDictionary: ["id": "mock-id", "fillWithRandom": false],
                        resolve: { result in
                            guard let result = result as? String else {
                                XCTFail("Expected String result")
                                return
                            }
                            expect(TestUtil.getSortedKeysJson(result)).to(equal(self.recommendationJSPayload))
                            done()
                        },
                        reject: { _, _, _ in }
                    )
                    expect(mockExponea.calls[0].name).to(equal("fetchRecommendation"))
                    let callback = mockExponea.calls[0].params[1]
                        as? (Result<RecommendationResponse<AllRecommendationData>>) -> Void

                    let jsonDecoder = JSONDecoder()
                    jsonDecoder.dateDecodingStrategy = .secondsSince1970
                    guard let data = self.recommendationsResponse.data(using: .utf8),
                          let recommendations = try? jsonDecoder.decode(
                              RecommendationResponse<AllRecommendationData>.self,
                              from: data
                          ) else {
                        XCTFail("Unable to parse recommendations")
                        return
                    }
                    callback?(Result<RecommendationResponse<AllRecommendationData>>.success(recommendations))
                }
            }

            it("should not fetch recommendations without required properties") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.fetchRecommendations(
                        optionsDictionary: [:],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal("Property id is required."))
                            expect(error?.localizedDescription).to(equal("Property id is required."))
                            done()
                        }
                    )
                }
            }

            it("should forward error when fetching recommendations fails") {
                mockExponea.isConfiguredValue = true
                waitUntil { done in
                    exponea.fetchRecommendations(
                        optionsDictionary: ["id": "mock-id", "fillWithRandom": false],
                        resolve: { _ in },
                        reject: { errorCode, description, error in
                            expect(errorCode).to(equal("ExponeaSDK"))
                            expect(description).to(equal("Data fetching failed: something"))
                            expect(error?.localizedDescription).to(equal("Data fetching failed: something"))
                            done()
                        }
                    )
                    let callback = mockExponea.calls[0].params[1]
                        as? (Result<RecommendationResponse<AllRecommendationData>>) -> Void
                    callback?(Result.failure(ExponeaError.fetchError(description: "something")))
                }
            }

            it("should invoke fetch recommendations when Exponea is not configured - afterInit") {
                exponea.fetchRecommendations(
                    optionsDictionary: ["id": "mock-id", "fillWithRandom": false],
                    resolve: { _ in },
                    reject: { _, _, _ in }
                )
                expect(mockExponea.calls[0].name).to(equal("fetchRecommendation"))
            }
        }
    }
}
