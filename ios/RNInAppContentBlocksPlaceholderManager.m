//
//  RNInAppContentBlocksPlaceholderManager.m
//  Exponea
//
//  Created by Adam Mihalik on 21/11/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "React/RCTViewManager.h"

@interface RCT_EXTERN_MODULE(RNInAppContentBlocksPlaceholderManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(placeholderId, NSString)
RCT_EXPORT_VIEW_PROPERTY(overrideDefaultBehavior, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onDimensChanged, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onInAppContentBlockEvent, RCTDirectEventBlock)
@end
