//
//  Exponea+Fetching.swift
//  Exponea
//
//  Created by Panaxeo on 23/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK
import AnyCodable

public struct AllRecommendationData: RecommendationUserData {
    public let data: [String: Any]

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: AnyKey.self)
        var data: [String: Any] = [:]
        for key in container.allKeys {
            data[key.stringValue] = (try container.decode(AnyCodable.self, forKey: key)).value
        }
        self.data = data
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: AnyKey.self)
        for key in data.keys {
            try container.encode(AnyCodable(data[key]), forKey: AnyKey(stringValue: key))
        }
    }

    public static func == (lhs: AllRecommendationData, rhs: AllRecommendationData) -> Bool {
        return AnyCodable(lhs.data) == AnyCodable(rhs.data)
    }

    struct AnyKey: CodingKey {
        var intValue: Int?

        init(intValue: Int) {
            self.stringValue = "\(intValue)"
            self.intValue = intValue
        }

        var stringValue: String
        init(stringValue: String) {
            self.stringValue = stringValue
        }
    }
}

extension Exponea {
    @objc(fetchConsents:reject:)
    func fetchConsents(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
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
                completion: {(result: Result<RecommendationResponse<AllRecommendationData>>) in
                    switch result {
                    case .success(let response):
                        guard let data = response.value else {
                            self.rejectPromise(reject, error: ExponeaError.fetchError(description: "Empty result."))
                            return
                        }
                        let mappedRecommendations: [[String: Any?]] = data.map { recommendation in
                            return recommendation.userData.data
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
