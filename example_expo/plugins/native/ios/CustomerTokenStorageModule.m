//
//  RCTCustomerTokenStorageModule.m
//  example
//
//  Created by Adam Mihalik on 25/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

// Expo example helper: exports CustomerTokenStorageModule.swift to React Native (iOS).
//
// React Native discovers native modules through Objective-C macros, so a Swift
// module needs this small file. It publishes the module as
// NativeModules.CustomerTokenStorage with its configure method.
//
// Do integrators need it? No, only together with CustomerTokenStorageModule.swift.

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(CustomerTokenStorage, CustomerTokenStorageModule, NSObject)

RCT_EXTERN_METHOD(configure:(NSDictionary *)configMap resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
