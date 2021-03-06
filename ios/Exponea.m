#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>


@interface RCT_EXTERN_MODULE(Exponea, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSDictionary *)configuration resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isConfigured:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCustomerCookie:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkPushSetup:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getFlushMode:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setFlushMode:(NSString *)flushMode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getFlushPeriod:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setFlushPeriod:(NSNumber * _Nonnull)flushPeriod resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getLogLevel:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setLogLevel:(NSString *)logLevel resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getDefaultProperties:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setDefaultProperties:(NSDictionary *)properties resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(identifyCustomer:(NSDictionary *)ids properties:(NSDictionary *)properties resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(flushData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackEvent:(NSString *)eventType properties:(NSDictionary *)properties timestamp:(NSDictionary *)timestamp resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackSessionStart:(NSDictionary *)timestamp resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackSessionEnd:(NSDictionary *)timestamp resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(fetchConsents:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(fetchRecommendations:(NSDictionary *)optionsDictionary resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(anonymize:(NSDictionary *)exponeaProject projectMapping:(NSDictionary *)projectMapping resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(supportedEvents)

RCT_EXTERN_METHOD(onPushOpenedListenerSet)
RCT_EXTERN_METHOD(onPushOpenedListenerRemove)
RCT_EXTERN_METHOD(onPushReceivedListenerSet)
RCT_EXTERN_METHOD(onPushReceivedListenerRemove)
RCT_EXTERN_METHOD(requestPushAuthorization:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
