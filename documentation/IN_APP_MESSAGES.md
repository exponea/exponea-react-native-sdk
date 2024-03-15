## In-app messages
Exponea SDK allows you to display native in-app messages based on definitions set up on Exponea web application. You can find information on how to create your messages in [Exponea documentation](https://documentation.bloomreach.com/engagement/docs/in-app-messages).

No developer work is required for in-app messages, they work automatically after the SDK is configured.

> The behaviour of InApp messages tracking (action click and message close) may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](https://documentation.bloomreach.com/engagement/docs/configuration-of-tracking-consent).

### Troubleshooting
As with everything that's supposed works automatically, the biggest problem is what to do when it doesn't.

#### Logging
The SDK logs a lot of useful information about presenting in-app messages in `VERBOSE` mode. To see why each individual message was/wasn't displayed, set `Exponea.setLogLevel(LogLevel.VERBOSE)` before configuring the SDK.

#### Displaying in-app messages
In-app messages are triggered when an event is tracked based on conditions setup on Exponea backend. Once a message passes those filters, the SDK will try to present the message.

* On **iOS**, the message will be presented in the top-most `presentedViewController` (except for slide-in message that uses `UIWindow` directly).
* On **Android**, the message will be presented in a new activity(except for slide-in message that is injected into current activity).

If your application decides to present another UIViewController/start a new Activity right at the same time a race condition is created and the message might be displayed and immediately dismissed. Keep this in mind if the logs tell you your message was displayed but you don't see it.

> Show on `App load` displays in-app message when a `session_start` event is tracked. If you close and quickly reopen the app, it's possible that the session did not timeout and message won't be displayed. If you use manual session tracking, the message won't be displayed unless you track `session_start` event yourself.

Message is able to be shown only if it is loaded and also its image is loaded too. In case that message is not yet fully loaded (including its image) then the request-to-show is registered in SDK for that message so SDK will show it after full load.
Due to prevention of unpredicted behaviour (i.e. image loading takes too long) that request-to-show has timeout of 3 seconds.

> If message loading hits timeout of 3 seconds then message will be shown on 'next request'. For example the 'session_start' event triggers a showing of message that needs to be fully loaded but it timeouts, then message will not be shown. But it will be ready for next `session_start` event so it will be shown on next 'application run'.

### In-app images caching
To reduce the number of API calls and fetching time of in-app messages, SDK is caching the images displayed in messages. Therefore, once the SDK downloads the image, an image with the same URL may not be downloaded again, and will not change, since it was already cached. For this reason, we recommend always using different URLs for different images.

### In-app messages loading
In-app messages reloading is triggered by any case of:
- when `Exponea.identifyCustomer` is called
- when `Exponea.anonymize` is called
- when any event is tracked (except Push clicked, opened or session ends) and In-app messages cache is older then 30 minutes from last load
  Any In-app message images are preloaded too so message is able to be shown after whole process is finished. Please considers it while testing of In-app feature.
  It is common behaviour that if you change an In-app message data on platform then this change is reflected in SDK after 30 minutes due to usage of messages cache. Do call `Exponea.identifyCustomer` or `Exponea.anonymize` if you want to reflect changes immediately.

### Custom in-app message actions
If you want to override default SDK behavior, when in-app message action is performed (button is clicked, a message is closed), or you want to add your code to be performed along with code executed by the SDK, you can set up `inAppMessageActionCallback` on Exponea instance.

```typescript
// If overrideDefaultBehavior is set to true, default in-app action will not be performed ( e.g. deep link )
let overrideDefaultBehavior = false;
// If trackActions is set to false, click and close in-app events will not be tracked automatically
let trackActions = true;
Exponea.setInAppMessageCallback(false, true, (action) => {
    console.log('InApp action received - App.tsx');
    // Here goes your code
    // On in-app click, the button contains button text and button URL, and the interaction is true
    // On in-app close by user interaction, the button is null and the interaction is true
    // On in-app close by non-user interaction (i.e. timeout), the button is null and the interaction is false
});
```

If you set `trackActions` to **false** but you still want to track click/close event under some circumstances, you can call Exponea methods `trackInAppMessageClick` or `trackInAppMessageClose` in the action method:

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

Method `trackInAppMessageClose` will track a 'close' event with 'interaction' field of TRUE value by default. You are able to use a optional parameter 'interaction' of this method to override this value.

> The behaviour of `trackInAppMessageClick` and `trackInAppMessageClose` may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](./TRACKING_CONSENT.md).
