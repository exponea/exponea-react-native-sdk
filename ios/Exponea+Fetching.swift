//
//  Exponea+Fetching.swift
//  Exponea
//
//  Created by Panaxeo on 23/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea {
    @objc(fetchConsents:reject:)
    func fetchConsents(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        Exponea.exponeaInstance.fetchConsents { result in
            switch result {
            case .success(let response):
                let mappedConsents = response.consents.map { consent in
                    return [
                        "id": consent.id,
                        "legitimateInterest": consent.legitimateInterest,
                        "sources": [
                            "createdFromCRM": consent.sources.isCreatedFromCRM,
                            "imported": consent.sources.isImported,
                            "privateAPI": consent.sources.privateAPI,
                            "publicAPI": consent.sources.publicAPI,
                            "trackedFromScenario": consent.sources.isTrackedFromScenario
                        ],
                        "translations": consent.translations
                    ]
                }
                do {
                    resolve(String(data: try JSONSerialization.data(withJSONObject: mappedConsents), encoding: .utf8))
                } catch {
                    self.rejectPromise(reject, error: error)
                }
            case .failure(let error):
                self.rejectPromise(reject, error: error)
            }
        }
    }

    @objc(fetchRecommendations:resolve:reject:)
    func fetchRecommendations(
        optionsDictionary: NSDictionary,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard Exponea.exponeaInstance.isConfigured else {
            rejectPromise(reject, error: ExponeaError.notConfigured)
            return
        }
        do {
            let options = RecommendationOptions(
                id: try optionsDictionary.getRequiredSafely(property: "id"),
                fillWithRandom: try optionsDictionary.getRequiredSafely(property: "fillWithRandom"),
                size: try optionsDictionary.getOptionalSafely(property: "size") ?? 10,
                items: try optionsDictionary.getOptionalSafely(property: "items"),
                noTrack: try optionsDictionary.getOptionalSafely(property: "noTrack") ?? false,
                catalogAttributesWhitelist: try optionsDictionary.getOptionalSafely(
                    property: "catalogAttributesWhitelist"
                )
            )
            Exponea.exponeaInstance.fetchRecommendation(
                with: options,
                completion: {(result: Result<RecommendationResponse<EmptyRecommendationData>>) in
                    switch result {
                    case .success(let response):
                        guard let data = response.value else {
                            self.rejectPromise(reject, error: ExponeaError.fetchError(description: "Empty result."))
                            return
                        }
                        let mappedRecommendations: [[String: Any?]] = data.map { recommendation in
                            return [
                                "engineName": recommendation.systemData.engineName,
                                "itemId": recommendation.systemData.itemId,
                                "recommendationId": recommendation.systemData.recommendationId,
                                "recommendationVariantId": recommendation.systemData.recommendationVariantId
                            ]
                        }
                        do {
                            resolve(
                                String(
                                    data: try JSONSerialization.data(withJSONObject: mappedRecommendations),
                                    encoding: .utf8
                                )
                            )
                        } catch {
                            self.rejectPromise(reject, error: error)
                        }
                    case .failure(let error):
                        self.rejectPromise(reject, error: error)
                    }
                }
            )
        } catch {
            rejectPromise(reject, error: error)
        }
    }
}
