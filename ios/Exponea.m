#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Exponea, NSObject)

RCT_EXTERN_METHOD(configure:(NSDictionary *)configuration resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isConfigured:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getCustomerCookie:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
