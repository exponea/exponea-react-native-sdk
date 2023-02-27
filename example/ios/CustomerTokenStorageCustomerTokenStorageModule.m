//
//  RCTCustomerTokenStorageModule.m
//  example
//
//  Created by Adam Mihalik on 25/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_REMAP_MODULE(CustomerTokenStorage, CustomerTokenStorageModule, NSObject)

RCT_EXTERN_METHOD(configure:(NSDictionary *)configMap resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
