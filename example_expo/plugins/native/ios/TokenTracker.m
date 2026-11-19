// Expo example helper: exports TokenTracker.swift to React Native (iOS).
//
// Publishes the Swift module as NativeModules.TokenTracker with its trackToken
// method, used by the "Track push token" button.
//
// Do integrators need it? No, only together with TokenTracker.swift.

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TokenTracker, NSObject)
RCT_EXTERN_METHOD(trackToken)
@end
