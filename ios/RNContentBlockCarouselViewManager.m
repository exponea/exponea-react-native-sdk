//
//  RNContentBlockCarouselViewManager.m
//  Exponea
//
//  Created by Adam Mihalik on 10/02/2025.
//  Copyright © 2025 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "React/RCTViewManager.h"

@interface RCT_EXTERN_MODULE(RNContentBlockCarouselViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(initProps, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(overrideDefaultBehavior, BOOL)
RCT_EXPORT_VIEW_PROPERTY(trackActions, BOOL)
RCT_EXPORT_VIEW_PROPERTY(customFilterActive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(customSortActive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onDimensChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onContentBlockEvent, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onContentBlockDataRequestEvent, RCTDirectEventBlock)
RCT_EXTERN_METHOD(filterResponse:(nonnull NSNumber*)reactTag args:(NSArray *)args)
RCT_EXTERN_METHOD(sortResponse:(nonnull NSNumber*)reactTag args:(NSArray *)args)
@end
