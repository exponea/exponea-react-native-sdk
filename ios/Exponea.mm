#import "Exponea.h"
#import "react_native_exponea_sdk-Swift.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import "InAppContentBlocksPlaceholderComponentView.h"
#import "ContentBlockCarouselViewComponentView.h"
#import "AppInboxButtonComponentView.h"
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTComponentViewFactory.h>
#endif

#ifdef RCT_NEW_ARCH_ENABLED
@interface ExponeaComponentViewProvider : NSObject <RCTComponentViewFactoryComponentProvider>
@end

@implementation ExponeaComponentViewProvider
- (NSDictionary<NSString *, Class<RCTComponentViewProtocol>> *)thirdPartyFabricComponents
{
  return @{
    @"AppInboxButton" : AppInboxButtonComponentView.class,
    @"InAppContentBlocksPlaceholder" : InAppContentBlocksPlaceholderComponentView.class,
    @"ContentBlockCarouselView" : ContentBlockCarouselViewComponentView.class,
  };
}
@end

static ExponeaComponentViewProvider *ExponeaFabricProvider = nil;
#endif

@implementation Exponea {
  ExponeaBridge *_exponeaBridge;
}

#ifdef RCT_NEW_ARCH_ENABLED
+ (void)load
{
  [super load];
  if ([RCTComponentViewFactory currentComponentViewFactory].thirdPartyFabricComponentsProvider == nil) {
    ExponeaFabricProvider = [ExponeaComponentViewProvider new];
    [RCTComponentViewFactory currentComponentViewFactory].thirdPartyFabricComponentsProvider = ExponeaFabricProvider;
  }
}
#endif

// MARK: - Native-side class methods for AppDelegate forwarding

+ (void)handlePushNotificationToken:(NSData *)deviceToken
{
    [ExponeaPushHandler handlePushNotificationToken:deviceToken];
}

+ (void)handlePushNotificationOpenedWithResponse:(UNNotificationResponse *)response
{
    [ExponeaPushHandler handlePushNotificationOpenedWithResponse:response];
}

+ (void)handlePushNotificationOpenedWithUserInfo:(NSDictionary *)userInfo
{
    [ExponeaPushHandler handlePushNotificationOpenedWithUserInfo:userInfo];
}

+ (void)continueUserActivity:(NSUserActivity *)userActivity
{
    [ExponeaPushHandler continueUserActivity:userActivity];
}

- (instancetype)init
{
  self = [super init];
  if (self) {
    _exponeaBridge = [[ExponeaBridge alloc] init];
    _exponeaBridge.eventEmitter = self;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"pushOpened", @"pushReceived", @"inAppAction", @"newSegments"];
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeExponeaSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Exponea";
}

- (NSNumber *)isConfigured
{
    return @([_exponeaBridge isConfigured]);
}

- (void)configure:(NSDictionary *)configMap
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge configureWithConfigMap:configMap
                                   success:^{
        resolve([NSNull null]);
    } failure:^(NSError * error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)getCustomerCookie:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    NSString *cookie = [_exponeaBridge getCustomerCookie];
    if (cookie) {
        resolve(cookie);
    } else {
        reject(@"ExponeaError", @"SDK not configured or customer cookie unavailable", nil);
    }
}

- (void)checkPushSetup:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge checkPushSetup];
    resolve([NSNull null]);
}

- (void)getFlushMode:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
    NSString *mode = [_exponeaBridge getFlushMode];
    resolve(mode);
}

- (void)setFlushMode:(NSString *)flushMode
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge setFlushMode:flushMode];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Invalid flush mode", nil);
    }
}

- (void)getFlushPeriod:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    double period = [_exponeaBridge getFlushPeriod];
    resolve(@(period));
}

- (void)setFlushPeriod:(double)period
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge setFlushPeriod:period];
    resolve([NSNull null]);
}

- (void)getLogLevel:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    NSString *level = [_exponeaBridge getLogLevel];
    resolve(level);
}

- (void)setLogLevel:(NSString *)logLevel
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge setLogLevel:logLevel];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Invalid log level", nil);
    }
}

- (void)flushData:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge flushDataWithCompletion:^{
        resolve([NSNull null]);
    }];
}

- (void)getDefaultProperties:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject
{
    NSDictionary *properties = [_exponeaBridge getDefaultProperties];
    if (properties) {
        // Return JSON string for consistency with Android
        NSError *error;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:properties options:0 error:&error];
        if (jsonData && !error) {
            NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
            resolve(jsonString);
        } else {
            resolve(@"{}"); // Return empty JSON object on serialization error
        }
    } else {
        reject(@"ExponeaError", @"SDK not configured or default properties unavailable", nil);
    }
}

- (void)setDefaultProperties:(NSDictionary *)properties
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge setDefaultProperties:properties];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to set default properties. SDK may not be configured or properties are invalid.", nil);
    }
}

- (void)identifyCustomer:(NSDictionary *)customerIds
              properties:(NSDictionary *)properties
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge identifyCustomerWithCustomerIds:customerIds properties:properties];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to identify customer. SDK may not be configured or data is invalid.", nil);
    }
}

- (void)anonymize:(NSDictionary *)exponeaProject
   projectMapping:(NSDictionary *)projectMapping
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge anonymizeWithExponeaProject:exponeaProject
                                  projectMapping:projectMapping
                                         success:^{
        resolve([NSNull null]);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)trackEvent:(NSString *)eventName
        properties:(NSDictionary *)properties
         timestamp:(NSNumber *)timestamp
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackEventWithEventName:eventName
                                                properties:properties
                                                 timestamp:timestamp];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track event. SDK may not be configured or properties are invalid.", nil);
    }
}

- (void)trackSessionStart:(NSNumber *)timestamp
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackSessionStartWithTimestamp:timestamp];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track session start. SDK may not be configured.", nil);
    }
}

- (void)trackSessionEnd:(NSNumber *)timestamp
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackSessionEndWithTimestamp:timestamp];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track session end. SDK may not be configured.", nil);
    }
}

- (void)fetchConsents:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge fetchConsentsWithSuccess:^(NSArray<NSDictionary *> * consents) {
        resolve(consents);
    } failure:^(NSError * error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)fetchRecommendations:(JS::NativeExponea::RecommendationOptions &)options
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject
{
    // Convert C++ struct to NSDictionary for Swift bridge
    NSMutableDictionary *optionsDict = [NSMutableDictionary dictionary];

    // Required fields
    optionsDict[@"id"] = options.id_();
    optionsDict[@"fillWithRandom"] = @(options.fillWithRandom());

    // Optional fields
    if   (options.size().has_value()) {
        optionsDict[@"size"] = @(options.size().value());
    }

    if (options.items()) {
        optionsDict[@"items"] = options.items();
    }

    if (options.noTrack().has_value()) {
        optionsDict[@"noTrack"] = @(options.noTrack().value());
    }

    if (options.catalogAttributesWhitelist().has_value()) {
        auto whitelist = options.catalogAttributesWhitelist().value();
        NSMutableArray *array = [NSMutableArray array];
        for (size_t i = 0; i < whitelist.size(); i++) {
            [array addObject:whitelist[i]];
        }
        optionsDict[@"catalogAttributesWhitelist"] = array;
    }

    [_exponeaBridge fetchRecommendationsWithOptions:optionsDict success:^(NSArray<NSDictionary *> * recommendations) {
        if (resolve) {
            resolve(recommendations ?: @[]);
        }
    } failure:^(NSError * error) {
        if (reject) {
            reject(@"ExponeaError", error.localizedDescription ?: @"Unknown error", error);
        }
    }];
}

- (void)requestIosPushAuthorization:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge requestIosPushAuthorizationWithCompletion:^(BOOL granted) {
        resolve(@(granted));
    }];
}

- (void)requestPushAuthorization:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge requestPushAuthorizationWithCompletion:^(BOOL granted) {
        resolve(@(granted));
    }];
}

- (void)setAppInboxProvider:(JS::NativeExponea::AppInboxStyle &)withStyle
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
    @try {
        // Convert C++ AppInboxStyle struct to NSDictionary
        NSMutableDictionary *styleDict = [NSMutableDictionary dictionary];

        // Convert top-level optional nested structs
        if (withStyle.appInboxButton().has_value()) {
            styleDict[@"appInboxButton"] = [self convertButtonStyle:withStyle.appInboxButton().value()];
        }

        if (withStyle.detailView().has_value()) {
            styleDict[@"detailView"] = [self convertDetailViewStyle:withStyle.detailView().value()];
        }

        if (withStyle.listView().has_value()) {
            styleDict[@"listView"] = [self convertListViewStyle:withStyle.listView().value()];
        }

        // Pass to Swift bridge
        BOOL success = [_exponeaBridge setAppInboxProvider:styleDict];
        if (success) {
            resolve([NSNull null]);
        } else {
            reject(@"ExponeaError", @"Failed to set app inbox provider. SDK may not be configured or style is invalid.", nil);
        }
    } @catch (NSException *exception) {
        reject(@"STYLE_CONVERSION_ERROR", exception.reason ?: @"Failed to convert style", nil);
    }
}

// MARK: - Session Configuration Methods

- (void)setAutomaticSessionTracking:(BOOL)enabled
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge setAutomaticSessionTracking:enabled];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to set automatic session tracking", nil);
    }
}

- (void)setSessionTimeout:(double)timeout
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge setSessionTimeout:timeout];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to set session timeout", nil);
    }
}

- (void)setAutoPushNotification:(BOOL)enabled
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge setAutoPushNotification:enabled];
    resolve([NSNull null]);
}

- (void)setCampaignTTL:(double)seconds
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge setCampaignTTL:seconds];
    resolve([NSNull null]);
}

// MARK: - Push Tracking Methods

- (void)trackPushToken:(NSString *)token
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackPushToken:token];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track push token. SDK may not be configured.", nil);
    }
}

- (void)trackHmsPushToken:(NSString *)token
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    // HMS is Android-only (Huawei Mobile Services)
    reject(@"PlatformError", @"HMS push tokens are not supported on iOS", nil);
}

- (void)trackDeliveredPush:(NSDictionary *)params
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackDeliveredPush:params considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track delivered push", nil);
    }
}

- (void)trackDeliveredPushWithoutTrackingConsent:(NSDictionary *)params
                                         resolve:(RCTPromiseResolveBlock)resolve
                                          reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackDeliveredPush:params considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track delivered push without consent", nil);
    }
}

- (void)trackClickedPush:(NSDictionary *)params
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackClickedPush:params considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track clicked push", nil);
    }
}

- (void)trackClickedPushWithoutTrackingConsent:(NSDictionary *)params
                                       resolve:(RCTPromiseResolveBlock)resolve
                                        reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackClickedPush:params considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track clicked push without consent", nil);
    }
}

- (void)isExponeaPushNotification:(NSDictionary *)params
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject
{
    BOOL isExponea = [_exponeaBridge isExponeaPushNotification:params];
    resolve(@(isExponea));
}

- (void)trackPaymentEvent:(NSDictionary *)params
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge trackPaymentEventWithParams:params
                                        success:^{
        resolve([NSNull null]);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

// MARK: - Segmentation & Utilities

- (void)getSegments:(NSString *)exposingCategory
              force:(NSNumber *)force
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    BOOL forceValue = force ? [force boolValue] : NO;
    [_exponeaBridge getSegments:exposingCategory
                          force:forceValue
                        success:^(NSArray<NSDictionary *> *segments) {
        resolve(segments);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)stopIntegration:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge stopIntegrationWithSuccess:^{
        resolve([NSNull null]);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)clearLocalCustomerData:(NSString *)appGroup
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge clearLocalCustomerData:appGroup
                                   success:^{
        resolve([NSNull null]);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

// MARK: - App Inbox Methods

- (void)fetchAppInbox:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge fetchAppInboxWithSuccess:^(NSArray<NSDictionary *> *messages) {
        resolve(messages);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)fetchAppInboxItem:(NSString *)messageId
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    [_exponeaBridge fetchAppInboxItem:messageId
                              success:^(NSDictionary *message) {
        resolve(message);
    } failure:^(NSError *error) {
        reject(@"ExponeaError", error.localizedDescription, error);
    }];
}

- (void)markAppInboxAsRead:(NSDictionary *)message
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge markAppInboxAsRead:message];
    resolve(@(success));
}

- (void)trackAppInboxOpened:(NSDictionary *)message
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackAppInboxOpened:message considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track app inbox opened", nil);
    }
}

- (void)trackAppInboxOpenedWithoutTrackingConsent:(NSDictionary *)message
                                          resolve:(RCTPromiseResolveBlock)resolve
                                           reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackAppInboxOpened:message considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track app inbox opened without consent", nil);
    }
}

- (void)trackAppInboxClick:(NSDictionary *)action
                   message:(NSDictionary *)message
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackAppInboxClick:action
                                              message:message
                                       considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track app inbox click", nil);
    }
}

- (void)trackAppInboxClickWithoutTrackingConsent:(NSDictionary *)action
                                         message:(NSDictionary *)message
                                         resolve:(RCTPromiseResolveBlock)resolve
                                          reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackAppInboxClick:action
                                              message:message
                                       considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track app inbox click without consent", nil);
    }
}

// MARK: - In-App Message Tracking Methods

- (void)trackInAppMessageClick:(NSDictionary *)message
                    buttonText:(NSString *)buttonText
                     buttonUrl:(NSString *)buttonUrl
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppMessageClick:message
                                               buttonText:buttonText
                                                buttonUrl:buttonUrl
                                          considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaDataException", @"InApp message data are invalid. See logs", nil);
    }
}

- (void)trackInAppMessageClickWithoutTrackingConsent:(NSDictionary *)message
                                          buttonText:(NSString *)buttonText
                                           buttonUrl:(NSString *)buttonUrl
                                             resolve:(RCTPromiseResolveBlock)resolve
                                              reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppMessageClick:message
                                               buttonText:buttonText
                                                buttonUrl:buttonUrl
                                          considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaDataException", @"InApp message data are invalid. See logs", nil);
    }
}

- (void)trackInAppMessageClose:(NSDictionary *)message
                    buttonText:(NSString *)buttonText
                   interaction:(BOOL)interaction
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppMessageClose:message
                                               buttonText:buttonText
                                              interaction:interaction
                                          considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaDataException", @"InApp message data are invalid. See logs", nil);
    }
}

- (void)trackInAppMessageCloseWithoutTrackingConsent:(NSDictionary *)message
                                          buttonText:(NSString *)buttonText
                                         interaction:(BOOL)interaction
                                             resolve:(RCTPromiseResolveBlock)resolve
                                              reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppMessageClose:message
                                               buttonText:buttonText
                                              interaction:interaction
                                          considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaDataException", @"InApp message data are invalid. See logs", nil);
    }
}

// MARK: - In-App Content Block Tracking Methods

- (void)trackInAppContentBlockClick:(NSDictionary *)params
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockClick:params
                                               considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block click", nil);
    }
}

- (void)trackInAppContentBlockClickWithoutTrackingConsent:(NSDictionary *)params
                                                  resolve:(RCTPromiseResolveBlock)resolve
                                                   reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockClick:params
                                               considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block click without consent", nil);
    }
}

- (void)trackInAppContentBlockClose:(NSDictionary *)params
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockClose:params
                                               considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block close", nil);
    }
}

- (void)trackInAppContentBlockCloseWithoutTrackingConsent:(NSDictionary *)params
                                                  resolve:(RCTPromiseResolveBlock)resolve
                                                   reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockClose:params
                                               considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block close without consent", nil);
    }
}

- (void)trackInAppContentBlockShown:(NSDictionary *)params
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockShown:params
                                               considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block shown", nil);
    }
}

- (void)trackInAppContentBlockShownWithoutTrackingConsent:(NSDictionary *)params
                                                  resolve:(RCTPromiseResolveBlock)resolve
                                                   reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockShown:params
                                               considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block shown without consent", nil);
    }
}

- (void)trackInAppContentBlockError:(NSDictionary *)params
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockError:params
                                               considerConsent:YES];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block error", nil);
    }
}

- (void)trackInAppContentBlockErrorWithoutTrackingConsent:(NSDictionary *)params
                                                  resolve:(RCTPromiseResolveBlock)resolve
                                                   reject:(RCTPromiseRejectBlock)reject
{
    BOOL success = [_exponeaBridge trackInAppContentBlockError:params
                                               considerConsent:NO];
    if (success) {
        resolve([NSNull null]);
    } else {
        reject(@"ExponeaError", @"Failed to track content block error without consent", nil);
    }
}

// Listener lifecycle methods for JavaScript event emitter integration
- (void)onPushOpenedListenerSet
{
    [_exponeaBridge onPushOpenedListenerSet];
}

- (void)onPushOpenedListenerRemove
{
    [_exponeaBridge onPushOpenedListenerRemove];
}

- (void)onPushReceivedListenerSet
{
    [_exponeaBridge onPushReceivedListenerSet];
}

- (void)onPushReceivedListenerRemove
{
    [_exponeaBridge onPushReceivedListenerRemove];
}

- (void)onInAppMessageCallbackSet:(BOOL)overrideDefaultBehavior
                     trackActions:(BOOL)trackActions
{
    [_exponeaBridge onInAppMessageCallbackSet:overrideDefaultBehavior trackActions:trackActions];
}

- (void)onInAppMessageCallbackRemove
{
    [_exponeaBridge onInAppMessageCallbackRemove];
}

- (void)onSegmentationCallbackSet:(NSString *)category
                 includeFirstLoad:(BOOL)includeFirstLoad
{
    [_exponeaBridge onSegmentationCallbackSetWithCategory:category includeFirstLoad:includeFirstLoad];
}

- (void)onSegmentationCallbackRemove:(NSString *)category
{
    [_exponeaBridge onSegmentationCallbackRemoveWithCategory:category];
}

// MARK: - AppInboxStyle Conversion Helpers

- (NSDictionary *)convertTextViewStyle:(const JS::NativeExponea::TextViewStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    if (style.visible().has_value()) {
        dict[@"visible"] = @(style.visible().value());
    }
    if (style.textColor()) {
        dict[@"textColor"] = style.textColor();
    }
    if (style.textSize()) {
        dict[@"textSize"] = style.textSize();
    }
    if (style.textWeight()) {
        dict[@"textWeight"] = style.textWeight();
    }
    if (style.textOverride()) {
        dict[@"textOverride"] = style.textOverride();
    }

    return dict;
}

- (NSDictionary *)convertImageViewStyle:(const JS::NativeExponea::ImageViewStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    if (style.visible().has_value()) {
        dict[@"visible"] = @(style.visible().value());
    }
    if (style.backgroundColor()) {
        dict[@"backgroundColor"] = style.backgroundColor();
    }

    return dict;
}

- (NSDictionary *)convertButtonStyle:(const JS::NativeExponea::ButtonStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    // String fields
    if (style.textOverride()) {
        dict[@"textOverride"] = style.textOverride();
    }
    if (style.textColor()) {
        dict[@"textColor"] = style.textColor();
    }
    if (style.backgroundColor()) {
        dict[@"backgroundColor"] = style.backgroundColor();
    }
    if (style.textSize()) {
        dict[@"textSize"] = style.textSize();
    }
    if (style.borderRadius()) {
        dict[@"borderRadius"] = style.borderRadius();
    }
    if (style.textWeight()) {
        dict[@"textWeight"] = style.textWeight();
    }

    // Bool fields
    if (style.showIcon().has_value()) {
        dict[@"showIcon"] = @(style.showIcon().value());
    }
    if (style.enabled().has_value()) {
        dict[@"enabled"] = @(style.enabled().value());
    }

    return dict;
}

- (NSDictionary *)convertProgressBarStyle:(const JS::NativeExponea::ProgressBarStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    if (style.visible().has_value()) {
        dict[@"visible"] = @(style.visible().value());
    }
    if (style.progressColor()) {
        dict[@"progressColor"] = style.progressColor();
    }
    if (style.backgroundColor()) {
        dict[@"backgroundColor"] = style.backgroundColor();
    }

    return dict;
}

- (NSDictionary *)convertDetailViewStyle:(const JS::NativeExponea::DetailViewStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    // Recursive conversion of optional nested structs
    if (style.title().has_value()) {
        dict[@"title"] = [self convertTextViewStyle:style.title().value()];
    }
    if (style.content().has_value()) {
        dict[@"content"] = [self convertTextViewStyle:style.content().value()];
    }
    if (style.receivedTime().has_value()) {
        dict[@"receivedTime"] = [self convertTextViewStyle:style.receivedTime().value()];
    }
    if (style.image().has_value()) {
        dict[@"image"] = [self convertImageViewStyle:style.image().value()];
    }
    if (style.button().has_value()) {
        dict[@"button"] = [self convertButtonStyle:style.button().value()];
    }

    return dict;
}

- (NSDictionary *)convertAppInboxListItemStyle:(const JS::NativeExponea::AppInboxListItemStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    if (style.backgroundColor()) {
        dict[@"backgroundColor"] = style.backgroundColor();
    }

    if (style.readFlag().has_value()) {
        dict[@"readFlag"] = [self convertImageViewStyle:style.readFlag().value()];
    }
    if (style.receivedTime().has_value()) {
        dict[@"receivedTime"] = [self convertTextViewStyle:style.receivedTime().value()];
    }
    if (style.title().has_value()) {
        dict[@"title"] = [self convertTextViewStyle:style.title().value()];
    }
    if (style.content().has_value()) {
        dict[@"content"] = [self convertTextViewStyle:style.content().value()];
    }
    if (style.image().has_value()) {
        dict[@"image"] = [self convertImageViewStyle:style.image().value()];
    }

    return dict;
}

- (NSDictionary *)convertAppInboxListViewStyle:(const JS::NativeExponea::AppInboxListViewStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    if (style.backgroundColor()) {
        dict[@"backgroundColor"] = style.backgroundColor();
    }

    if (style.item().has_value()) {
        dict[@"item"] = [self convertAppInboxListItemStyle:style.item().value()];
    }

    return dict;
}

- (NSDictionary *)convertListViewStyle:(const JS::NativeExponea::ListViewStyle &)style
{
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];

    if (style.emptyTitle().has_value()) {
        dict[@"emptyTitle"] = [self convertTextViewStyle:style.emptyTitle().value()];
    }
    if (style.emptyMessage().has_value()) {
        dict[@"emptyMessage"] = [self convertTextViewStyle:style.emptyMessage().value()];
    }
    if (style.errorTitle().has_value()) {
        dict[@"errorTitle"] = [self convertTextViewStyle:style.errorTitle().value()];
    }
    if (style.errorMessage().has_value()) {
        dict[@"errorMessage"] = [self convertTextViewStyle:style.errorMessage().value()];
    }

    if (style.progress().has_value()) {
        dict[@"progress"] = [self convertProgressBarStyle:style.progress().value()];
    }

    // This goes 3 more levels deep: list -> item -> (readFlag/title/etc)
    if (style.list().has_value()) {
        dict[@"list"] = [self convertAppInboxListViewStyle:style.list().value()];
    }

    return dict;
}

@end
