#ifdef RCT_NEW_ARCH_ENABLED
#import "ContentBlockCarouselViewComponentView.h"

#import <react/renderer/components/ExponeaSpec/ComponentDescriptors.h>
#import <react/renderer/components/ExponeaSpec/EventEmitters.h>
#import <react/renderer/components/ExponeaSpec/Props.h>
#import <react/renderer/components/ExponeaSpec/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>

#import "react_native_exponea_sdk-Swift.h"

using namespace facebook::react;

@interface ContentBlockCarouselViewComponentView () <RCTContentBlockCarouselViewViewProtocol, CarouselContentBlockEventEmitter>
@end

@implementation ContentBlockCarouselViewComponentView {
    CarouselInAppContentBlockViewProxy *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const ContentBlockCarouselViewProps>();
        _props = defaultProps;

        _view = [[CarouselInAppContentBlockViewProxy alloc] init];
        _view.eventEmitter = self;

        self.contentView = _view;
    }

    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<ContentBlockCarouselViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<ContentBlockCarouselViewProps const>(props);

    if (oldViewProps.placeholderId != newViewProps.placeholderId) {
        [_view setPlaceholderId:RCTNSStringFromString(newViewProps.placeholderId)];
    }

    if (oldViewProps.maxMessagesCount != newViewProps.maxMessagesCount) {
        [_view setMaxMessagesCount:@(newViewProps.maxMessagesCount)];
    }

    if (oldViewProps.scrollDelay != newViewProps.scrollDelay) {
        [_view setScrollDelay:@(newViewProps.scrollDelay)];
    }

    if (oldViewProps.overrideDefaultBehavior != newViewProps.overrideDefaultBehavior) {
        _view.overrideDefaultBehavior = newViewProps.overrideDefaultBehavior;
    }

    if (oldViewProps.trackActions != newViewProps.trackActions) {
        _view.trackActions = newViewProps.trackActions;
    }

    if (oldViewProps.customFilterActive != newViewProps.customFilterActive) {
        _view.customFilterActive = newViewProps.customFilterActive;
    }

    if (oldViewProps.customSortActive != newViewProps.customSortActive) {
        _view.customSortActive = newViewProps.customSortActive;
    }

    [super updateProps:props oldProps:oldProps];
}

#pragma mark - RCTContentBlockCarouselViewNativeComponentViewProtocol (Commands)

- (void)handleCommand:(NSString const *)commandName args:(NSArray const *)args
{
    RCTContentBlockCarouselViewHandleCommand(self, commandName, args);
}

- (void)filterResponse:(NSString *)contentBlocks
{
    [_view handleFilterResponse:contentBlocks];
}

- (void)sortResponse:(NSString *)contentBlocks
{
    [_view handleSortResponse:contentBlocks];
}

#pragma mark - CarouselContentBlockEventEmitter

- (void)emitDimensChangedWithWidth:(double)width height:(double)height
{
    if (_eventEmitter) {
        auto emitter = std::static_pointer_cast<ContentBlockCarouselViewEventEmitter const>(_eventEmitter);
        ContentBlockCarouselViewEventEmitter::OnDimensChanged event;
        event.width = width;
        event.height = height;
        emitter->onDimensChanged(event);
    }
}

- (void)emitContentBlockEventWithData:(NSDictionary *)data
{
    if (_eventEmitter) {
        auto emitter = std::static_pointer_cast<ContentBlockCarouselViewEventEmitter const>(_eventEmitter);
        ContentBlockCarouselViewEventEmitter::OnContentBlockEvent event;

        // Extract event type
        if (NSString *eventType = data[@"eventType"]) {
            event.eventType = std::string([eventType UTF8String]);
        }

        // Extract placeholderId
        if (NSString *placeholderId = data[@"placeholderId"]) {
            event.placeholderId = std::string([placeholderId UTF8String]);
        }

        // Extract contentBlock (serialize to JSON string if needed)
        id contentBlock = data[@"contentBlock"];
        if (contentBlock && ![contentBlock isKindOfClass:[NSNull class]]) {
            if ([contentBlock isKindOfClass:[NSString class]]) {
                const char *utf8Str = [contentBlock UTF8String];
                if (utf8Str) {
                    event.contentBlock = std::string(utf8Str);
                }
            } else if ([contentBlock isKindOfClass:[NSDictionary class]] || [contentBlock isKindOfClass:[NSArray class]]) {
                NSError *error = nil;
                NSData *jsonData = [NSJSONSerialization dataWithJSONObject:contentBlock options:0 error:&error];
                if (jsonData && !error) {
                    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                    if (jsonString) {
                        const char *utf8Str = [jsonString UTF8String];
                        if (utf8Str) {
                            event.contentBlock = std::string(utf8Str);
                        }
                    }
                } else if (error) {
                    NSLog(@"[ExponeaSDK] Failed to serialize contentBlock: %@", error.localizedDescription);
                }
            }
        }

        // Extract contentBlockAction (serialize to JSON string if needed)
        id action = data[@"contentBlockAction"];
        if (action && ![action isKindOfClass:[NSNull class]]) {
            if ([action isKindOfClass:[NSString class]]) {
                const char *utf8Str = [action UTF8String];
                if (utf8Str) {
                    event.contentBlockAction = std::string(utf8Str);
                }
            } else if ([action isKindOfClass:[NSDictionary class]] || [action isKindOfClass:[NSArray class]]) {
                NSError *error = nil;
                NSData *jsonData = [NSJSONSerialization dataWithJSONObject:action options:0 error:&error];
                if (jsonData && !error) {
                    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                    if (jsonString) {
                        const char *utf8Str = [jsonString UTF8String];
                        if (utf8Str) {
                            event.contentBlockAction = std::string(utf8Str);
                        }
                    }
                } else if (error) {
                    NSLog(@"[ExponeaSDK] Failed to serialize contentBlockAction: %@", error.localizedDescription);
                }
            }
        }

        // Extract errorMessage
        if (NSString *errorMessage = data[@"errorMessage"]) {
            event.errorMessage = std::string([errorMessage UTF8String]);
        }

        // Extract index
        if (NSNumber *index = data[@"index"]) {
            event.index = [index intValue];
        }

        // Extract count
        if (NSNumber *count = data[@"count"]) {
            event.count = [count intValue];
        }

        // Extract contentBlocks (JSON string array)
        if (NSString *contentBlocks = data[@"contentBlocks"]) {
            event.contentBlocks = std::string([contentBlocks UTF8String]);
        }

        emitter->onContentBlockEvent(event);
    }
}

- (void)emitDataRequestWithData:(NSDictionary *)dataDict
{
    if (_eventEmitter) {
        auto emitter = std::static_pointer_cast<ContentBlockCarouselViewEventEmitter const>(_eventEmitter);
        ContentBlockCarouselViewEventEmitter::OnContentBlockDataRequestEvent event;

        if (NSString *requestType = dataDict[@"requestType"]) {
            event.requestType = std::string([requestType UTF8String]);
        }

        if (NSString *data = dataDict[@"data"]) {
            event.data = std::string([data UTF8String]);
        }

        emitter->onContentBlockDataRequestEvent(event);
    }
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<ContentBlockCarouselViewComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> ContentBlockCarouselViewCls(void)
{
    return ContentBlockCarouselViewComponentView.class;
}

#endif
