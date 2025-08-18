//
//  Exponea+Anonymize.swift
//  Exponea
//
//  Created by Panaxeo on 23/06/2020.
//  Copyright © 2020 Panaxeo. All rights reserved.
//

import Foundation
import ExponeaSDK

extension Exponea {
    @objc(anonymize:projectMapping:resolve:reject:)
    func anonymize(
        exponeaProjectDictionary: NSDictionary,
        projectMappingDictionary: NSDictionary,
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        do {
            var exponeaProject: ExponeaProject?
            var projectMapping: [EventType: [ExponeaProject]]?
            if let exponeaProjectValue: NSDictionary
                = try exponeaProjectDictionary.getOptionalSafely(property: "exponeaProject") {
                exponeaProject = try ConfigurationParser.parseExponeaProject(
                    dictionary: exponeaProjectValue,
                    defaultBaseUrl: Exponea.exponeaInstance.configuration?.baseUrl ?? Constants.Repository.baseUrl
                )
            }
            if let projectMappingValue: NSDictionary
                = try projectMappingDictionary.getOptionalSafely(property: "projectMapping") {
                projectMapping = try ConfigurationParser.parseProjectMapping(
                    dictionary: projectMappingValue,
                    defaultBaseUrl: Exponea.exponeaInstance.configuration?.baseUrl ?? Constants.Repository.baseUrl
                )
            }
            if let exponeaProject = exponeaProject {
                Exponea.exponeaInstance.anonymize(exponeaProject: exponeaProject, projectMapping: projectMapping)
            } else {
                if projectMapping != nil {
                    throw ExponeaError.notAvailableForPlatform(
                        name: "Changing project mapping in anonymize without changing project"
                    )
                } else {
                    Exponea.exponeaInstance.anonymize()
                }
            }
            resolve(nil)
        } catch {
            rejectPromise(reject, error: error)
        }
    }
}
