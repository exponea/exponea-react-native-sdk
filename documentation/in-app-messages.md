---
title: In-app messages
excerpt: Display native in-app messages based on definitions set up in Engagement using the React Native SDK
slug: react-native-sdk-in-app-messages
categorySlug: integrations
parentDocSlug: react-native-sdk-in-app-personalization
---

The SDK enables you to display native in-app messages in your app based on definitions set up in Engagement. 

In-app messages work out of the box once the [SDK is installed and configured](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup) in your app; no development work is required. However, you can customize the behavior to meet your specific requirements.

> 📘
>
> Refer to the [In-app messages](https://documentation.bloomreach.com/engagement/docs/in-app-messages) user guide for instructions on how to create in-app messages in the Engagement web app.

## Tracking

The SDK automatically tracks `banner` events for in-app messages with the following values for the `action` event property:

- `show`
  In-app message displayed to user.
- `click`
  User clicked on action button inside in-app message. The event also contains the corresponding `text` and `link` properties.
- `close`
  User clicked on close button inside in-app message.
- `error`
  Displaying in-app message failed. The event contains an `error` property with an error message.

> ❗️
>
> The behavior of in-app message tracking may be affected by the tracking consent feature, which in enabled mode requires explicit consent for tracking. Refer to the [consent documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent) documentation for details.


## Customization

### Customize in-app message actions

You can override the SDK's default behavior in response to an in-app message action (click button or close message) by setting up an `inAppMessageActionCallback` on the `Exponea` instance.

If the `overrideDefaultBehavior` parameter is `true`, the SDK will not perform the default in-app action (for example, resolving a deep link).

If the `trackActions` parameter is `false`, the SDK will not track click and close in-app message events automatically. The SDK will hold the last `inAppMessageAction` and call the listener as soon as it's registered. We recommend setting up the listener as early as possible.

```typescript
// If overrideDefaultBehavior is set to true, default in-app action will not be performed ( e.g. deep link )
let overrideDefaultBehavior = false;
// If trackActions is set to false, click and close in-app events will not be tracked automatically
let trackActions = true;
Exponea.setInAppMessageCallback(overrideDefaultBehavior, trackActions, (action) => {
    console.log('InApp action received - App.tsx');
    // Here goes your code
    // On in-app click, the button contains button text and button URL, and the interaction is true
    // On in-app close by user interaction, the button is null and the interaction is true
    // On in-app close by non-user interaction (i.e. timeout), the button is null and the interaction is false
});
```

If you set `trackActions` to `false` but you still want to track click or close events under some circumstances, you can call the `Exponea` methods `trackInAppMessageClick` or `trackInAppMessageClose` in the action method:

```typescript
Exponea.setInAppMessageCallback(false, false, (action) => {
    console.log('InApp action received - App.tsx');
    if (<your-special-condition>) {
        if (interaction) {
            Exponea.trackInAppMessageClick(action.message, action.button?.text, action.button?.url)
        } else {
            Exponea.trackInAppMessageClose(action.message)
        }
    }
});
```

The method `trackInAppMessageClose` will track a 'close' event with the 'interaction' field's value `true`  by default. You may use the optional parameter `interaction` of this method to override this value.

> The behaviour of `trackInAppMessageClick` and `trackInAppMessageClose` may be affected by the tracking consent feature, which in enabled mode requires explicit consent for tracking. Read more in the [tracking consent documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent).

## Troubleshooting

This section provides helpful pointers for troubleshooting in-app message issues.

> 👍 Set Verbose Log Level
> The SDK logs a lot of information in at `VERBOSE` level while loading in-app messages. When troubleshooting in-app message issues, ensure to [set the SDK's log level](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#log-level) at least to `VERBOSE`.

### In-app message not displayed

When troubleshooting why an in-app message did not display on your device, always first make sure that the in-app message was preloaded to the device, then troubleshoot message display.

#### Troubleshoot in-app messages preloading issues

- The SDK requests in-app messages from the Engagement platform any time one of the following occurs:
  - `Exponea.identifyCustomer` is called
  - `Exponea.anonymize` is called
  - Any event (except push notification clicked or opened, or session ends) is tracked **and** the in-app messages cache is older than 30 minutes
- The SDK should subsequently receive a response from the Engagement platform containing all available in-app messages targeted at the current customer. The SDK preloads these messages in a local cache.
- If you create or modify an in-app message in Engagement, typically any changes you made are reflected in the SDK after 30 minutes due to the SDK caching in-app messages. Call `Exponea.identifyCustomer` or `Exponea.anonymize` to trigger reloading so changes are reflected immediately.
- Analyze the [log messages](#log-messages) to determine whether the SDK requested and received in-app messages and preloaded your message.
- If the SDK requested and received in-app messages but didn't preload your message:
  - The local cache may be outdated. Wait for or trigger the next preload.
  - The current customer may not match the audience targeted by the in-app message. Verify the message's audience in Engagement.

> ❗️
>
> Invoking `Plugin.anonymize` triggers fetching in-app messages immediately but `Exponea.identifyCustomer` needs to be flushed to the backend successfully first. This is because the backend must know the customer so it can assign the in-app messages with matching audience. If you have set [flush mode](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-data-flushing#flushing-modes) to anything other then `FlushMode.immediate`, you must call `Exponea.flushData()` to finalize the `identifyCustomer` process and trigger an in-app messages fetch.

#### Troubleshoot in-app message display issues

If your app is successfully requesting and receiving in-app messages but they are not displayed, consider the following:

- In-app messages are triggered when an event is tracked based on conditions set up in Engagement. Once a message passes those filters, the SDK will try to present the message.

- The SDK hooks into the application lifecycle.
  - On iOS, the message will be presented in the top-most `presentedViewController` (except for slide-in messages that use `UIWindow` directly).
  - On Android, the message will be presented in a new Activity (except for slide-in messages which are directly injected into the currently running Activity).

- It's possible that your application decides to present another UIViewController (iOS) or start a new Activity (Android) right at the same time, creating a race condition. In this case, the message might be displayed and immediately dismissed because its parent leaves the screen. Keep this in mind if the [logs](#log-messages) tell you your message was displayed but you don't see it.

- In-app messages configured to show on `App load` are displayed when a `session_start` event is tracked. If you close and quickly reopen the app, it's possible that the session did not time out and the message won't be displayed. If you use manual session tracking, the message won't be displayed unless you track a `session_start` event yourself.

- An in-app message can only be displayed if it is loaded, including its images. If the message is not yet fully loaded, the SDK registers a request-to-show for that message so it will be displayed once it is fully loaded. The request-to-show has a timeout of 3 seconds. This means that in case of unpredicted behavior, such as image loading taking too long, the message may not be displayed directly.

- If in-app message loading hits the timeout of 3 seconds, the message will be displayed the next time its trigger event is tracked. For example, if a `session_start` event triggers an in-app message but loading that message times out, it will not be displayed directly. However, once loaded, it will display the next time a `session_start` event is tracked.

- Image downloads are limited to 10 seconds per image. If an in-app message contains a large image that cannot be downloaded within this time limit, the in-app message will not be displayed. For an HTML in-app message that contains multiple images, this restriction applies per image, but failure of any image download will prevent this HTML in-app message from being displayed.

### In-app message shows incorrect image

- To reduce the number of API calls and fetching time of in-app messages, the SDK caches the images contained in messages. Once the SDK downloads an image, an image with the same URL may not be downloaded again. If a message contains a new image with the same URL as a previously used image, the previous image is displayed since it was already cached. For this reason, we recommend always using different URLs for different images.

### In-app message actions not tracked

- If you have implemented a custom listener for `inAppMessageAction`, the SDK only tracks actions automatically if `trackActions` is `true`. If `trackActions` is `false`, you must manually track the actions. Refer to [Customize in-app message actions](#customize-in-app-message-actions) above for details.

### Log messages

While troubleshooting in-app message issues, you can follow the process of requesting, receiving, preloading, and displaying in-app messages through the information logged by the SDK at verbose log level.

Please refer to the [Android](https://documentation.bloomreach.com/engagement/docs/android-sdk-in-app-messages#log-messages) and [iOS](https://documentation.bloomreach.com/engagement/docs/ios-sdk-in-app-messages#log-messages) documentation for the relevant log messages for each platform.