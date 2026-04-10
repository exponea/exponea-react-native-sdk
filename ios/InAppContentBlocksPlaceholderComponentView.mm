#ifdef RCT_NEW_ARCH_ENABLED
#import "InAppContentBlocksPlaceholderComponentView.h"

#import <react/renderer/components/ExponeaSpec/ComponentDescriptors.h>
#import <react/renderer/components/ExponeaSpec/EventEmitters.h>
#import <react/renderer/components/ExponeaSpec/Props.h>
#import <react/renderer/components/ExponeaSpec/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>

#import "react_native_exponea_sdk-Swift.h"

using namespace facebook::react;

@interface InAppContentBlocksPlaceholderComponentView () <RCTInAppContentBlocksPlaceholderViewProtocol, InAppContentBlocksPlaceholderEventEmitter>
@end

@implementation InAppContentBlocksPlaceholderComponentView {
    InAppContentBlocksPlaceholder *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const InAppContentBlocksPlaceholderProps>();
        _props = defaultProps;

        _view = [[InAppContentBlocksPlaceholder alloc] init];
        _view.eventEmitter = self;

        self.contentView = _view;
    }

    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<InAppContentBlocksPlaceholderProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<InAppContentBlocksPlaceholderProps const>(props);

    if (oldViewProps.placeholderId != newViewProps.placeholderId) {
        _view.placeholderId = RCTNSStringFromString(newViewProps.placeholderId);
    }

    if (oldViewProps.overrideDefaultBehavior != newViewProps.overrideDefaultBehavior) {
        _view.overrideDefaultBehavior = newViewProps.overrideDefaultBehavior;
    }

    [super updateProps:props oldProps:oldProps];
}

#pragma mark - InAppContentBlocksPlaceholderEventEmitter

- (void)emitDimensChangedWithWidth:(double)width height:(double)height
{
    if (_eventEmitter) {
        auto emitter = std::static_pointer_cast<InAppContentBlocksPlaceholderEventEmitter const>(_eventEmitter);
        InAppContentBlocksPlaceholderEventEmitter::OnDimensChanged event;
        event.width = width;
        event.height = height;
        emitter->onDimensChanged(event);
    }
}

- (void)emitContentBlockEventWithData:(NSDictionary *)data
{
    if (_eventEmitter) {
        auto emitter = std::static_pointer_cast<InAppContentBlocksPlaceholderEventEmitter const>(_eventEmitter);
        InAppContentBlocksPlaceholderEventEmitter::OnInAppContentBlockEvent event;

        NSString *eventType = data[@"eventType"];
        NSString *placeholderId = data[@"placeholderId"];
        id contentBlock = data[@"contentBlock"];
        id contentBlockAction = data[@"contentBlockAction"];
        NSString *errorMessage = data[@"errorMessage"];

        if (eventType) {
            event.eventType = std::string([eventType UTF8String]);
        }

        if (placeholderId) {
            event.placeholderId = std::string([placeholderId UTF8String]);
        }

        // Serialize contentBlock to JSON string if needed
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

        // Serialize contentBlockAction to JSON string if needed
        if (contentBlockAction && ![contentBlockAction isKindOfClass:[NSNull class]]) {
            if ([contentBlockAction isKindOfClass:[NSString class]]) {
                const char *utf8Str = [contentBlockAction UTF8String];
                if (utf8Str) {
                    event.contentBlockAction = std::string(utf8Str);
                }
            } else if ([contentBlockAction isKindOfClass:[NSDictionary class]] || [contentBlockAction isKindOfClass:[NSArray class]]) {
                NSError *error = nil;
                NSData *jsonData = [NSJSONSerialization dataWithJSONObject:contentBlockAction options:0 error:&error];
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

        if (errorMessage) {
            event.errorMessage = std::string([errorMessage UTF8String]);
        }

        emitter->onInAppContentBlockEvent(event);
    }
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<InAppContentBlocksPlaceholderComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> InAppContentBlocksPlaceholderCls(void)
{
    return InAppContentBlocksPlaceholderComponentView.class;
}

#endif
