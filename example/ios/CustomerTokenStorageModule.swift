//
//  CustomerTokenStorage.swift
//  example
//
//  Created by Adam Mihalik on 25/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import React

@objc(CustomerTokenStorageModule)
class CustomerTokenStorageModule: NSObject {
  override init() {
    super.init()
  }
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  @objc(configure:resolve:reject:)
  func configure(configMap: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    CustomerTokenStorage.shared.configure(
      host: getOptionalSafely(configMap, "host"),
      projectToken: getOptionalSafely(configMap, "projectToken"),
      publicKey: getOptionalSafely(configMap, "publicKey"),
      customerIds: parseCustomerIds(configMap),
      expiration: getOptionalSafely(configMap, "expiration")
    )
    resolve(nil)
  }
  private func parseCustomerIds(_ source: NSDictionary) -> [String: String]? {
    let customerIds = source["customerIds"]
    guard let customerIds = customerIds as? NSDictionary else {
      return nil
    }
    var result: [String: String] = [:]
    for each in customerIds.allKeys {
      let key = each as? String
      let value = customerIds[each] as? String
      if let key = key,
         let value = value {
        result[key] = value
      }
    }
    return result
  }
  private func getOptionalSafely<T>(_ source: NSDictionary, _ property: String) -> T? {
    if let value = source[property] {
        guard let value = value as? T else {
            return nil
        }
        return value
    }
    return nil
  }
}
