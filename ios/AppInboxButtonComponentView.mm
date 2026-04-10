#ifdef RCT_NEW_ARCH_ENABLED
#import "AppInboxButtonComponentView.h"

#import <react/renderer/components/ExponeaSpec/ComponentDescriptors.h>
#import <react/renderer/components/ExponeaSpec/EventEmitters.h>
#import <react/renderer/components/ExponeaSpec/Props.h>
#import <react/renderer/components/ExponeaSpec/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>

#import "react_native_exponea_sdk-Swift.h"

using namespace facebook::react;

@interface AppInboxButtonComponentView () <RCTAppInboxButtonViewProtocol>
@end

@implementation AppInboxButtonComponentView {
    AppInboxButtonView *_view;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const AppInboxButtonProps>();
        _props = defaultProps;

        _view = [[AppInboxButtonView alloc] init];

        self.contentView = _view;
    }

    return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<AppInboxButtonProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<AppInboxButtonProps const>(props);

    // Check and apply textOverride
    if (oldViewProps.textOverride != newViewProps.textOverride) {
        _view.textOverride = RCTNSStringFromStringNilIfEmpty(newViewProps.textOverride);
    }

    // Check and apply textColor
    if (oldViewProps.textColor != newViewProps.textColor) {
        _view.textColor = RCTNSStringFromStringNilIfEmpty(newViewProps.textColor);
    }

    // Check and apply backgroundColor
    if (oldViewProps.backgroundColor != newViewProps.backgroundColor) {
        _view.buttonBackgroundColor = RCTNSStringFromStringNilIfEmpty(newViewProps.backgroundColor);
    }

    // Check and apply textSize
    if (oldViewProps.textSize != newViewProps.textSize) {
        _view.textSize = RCTNSStringFromStringNilIfEmpty(newViewProps.textSize);
    }

    // Check and apply borderRadius
    if (oldViewProps.borderRadius != newViewProps.borderRadius) {
        _view.borderRadius = RCTNSStringFromStringNilIfEmpty(newViewProps.borderRadius);
    }

    // Check and apply textWeight
    if (oldViewProps.textWeight != newViewProps.textWeight) {
        _view.textWeight = RCTNSStringFromStringNilIfEmpty(newViewProps.textWeight);
    }

    // Check and apply showIcon
    if (oldViewProps.showIcon != newViewProps.showIcon) {
        _view.showIcon = newViewProps.showIcon;
    }

    // Check and apply enabled
    if (oldViewProps.enabled != newViewProps.enabled) {
        _view.enabled = newViewProps.enabled;
    }

    [super updateProps:props oldProps:oldProps];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<AppInboxButtonComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> AppInboxButtonCls(void)
{
    return AppInboxButtonComponentView.class;
}

#endif
