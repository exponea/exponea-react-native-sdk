#import <React/RCTBridgeModule.h>
#if __has_include("RCTEventEmitter.h")
#import "RCTEventEmitter.h"
#else
#import <React/RCTEventEmitter.h>
#endif


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
RCT_EXTERN_METHOD(onInAppMessageCallbackSet:(BOOL)overrideDefaultBehavior trackActions:(BOOL)trackActions)
RCT_EXTERN_METHOD(onInAppMessageCallbackRemove)
RCT_EXTERN_METHOD(requestPushAuthorization:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(fetchAppInbox:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(fetchAppInboxItem:(NSString *)messageId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(markAppInboxAsRead:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackAppInboxClick:(NSDictionary *)action message:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackAppInboxOpened:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackAppInboxClickWithoutTrackingConsent:(NSDictionary *)action message:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackAppInboxOpenedWithoutTrackingConsent:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setAppInboxProvider:(NSDictionary *)configuration resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackPushToken:(NSString *)token resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackHmsPushToken:(NSString *)token resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackDeliveredPush:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackDeliveredPushWithoutTrackingConsent:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackClickedPush:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackClickedPushWithoutTrackingConsent:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackPaymentEvent:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackInAppMessageClick:(NSDictionary *)data resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackInAppMessageClickWithoutTrackingConsent:(NSDictionary *)data resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackInAppMessageClose:(NSDictionary *)message isUserInteraction(BOOL):isUserInteraction resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(trackInAppMessageCloseWithoutTrackingConsent:(NSDictionary *)message isUserInteraction(BOOL):isUserInteraction resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setSessionTimeout:(double)timeout resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setAutomaticSessionTracking:(BOOL)enabled resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setAutoPushNotification:(BOOL)enabled resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setCampaignTTL:(double)seconds resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isExponeaPushNotification:(NSDictionary *)params resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
