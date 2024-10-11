---
title: Push notifications
excerpt: Enable push notifications in your app using the React Native SDK
slug: react-native-sdk-push-notifications
categorySlug: integrations
parentDocSlug: react-native-sdk
---

Engagement enables sending push notifications to your app users using [scenarios](https://documentation.bloomreach.com/engagement/docs/scenarios-1). The mobile application handles the push message using the SDK and renders the notification on the customer's device.

Push notifications can also be silent, used only to update the app’s interface or trigger some background task.

> 📘
>
> Refer to [Mobile push notifications](https://documentation.bloomreach.com/engagement/docs/mobile-push-notifications#creating-a-new-notification) to learn how to create push notifications in the Engagement web app.

> 📘
>
> Also see [Mobile push notifications FAQ](https://support.bloomreach.com/hc/en-us/articles/18152713374877-Mobile-Push-Notifications-FAQ) at Bloomreach Support Help Center.

## Integration

The React Native SDK relies on the underlying native Android and iOS platforms to handle push notifications.

The following pages describe the steps for each platform to add the minimum push notification functionality (receive alert notifications) to your app.

- [Android push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android)
- [iOS push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios)

## Customization

This section describes the customizations you can implement once you have integrated the minimum push notification functionality.

### Respond to push notification interactions

Once you have followed the integration steps for each platform, your app should be able to receive push notifications.

To respond to a push notification interaction, you can set up a listener using `Exponea.setPushOpenedListener()`:

```typescript
Exponea.setPushOpenedListener((openedPush) => {
  switch(openedPush.action) {
    case PushAction.APP:
      // last push directed user to your app with no link

      // log data defined on Exponea backend
      console.log(openedPush.additionalData) 
      break;
    case PushAction.DEEPLINK:
      // last push directed user to your app with deeplink
      console.log(openedPush.url)
      break;
    case PushAction.WEB:
      // last push directed user to web, nothing to do here
      break;
  }
})
```

We recommend registering the listener as soon as possible to ensure proper application flow. However, the SDK will hold the last push notification and call the listener once it's registered.

> ❗️
>
> To support deep links, additional set up steps are required. Refer to the documentation for the respective native platforms ([Android](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android), [iOS](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios)). Alternatively, use the `Open app` action instead and add your payload to `Additional data`.

### Respond to received push notifications

You can set up a listener for received push notifications using `Exponea.setPushReceivedListener`, which is especially useful for silent push notifications.

```typescript
Exponea.setPushReceivedListener((data) => {
  console.log(data)
})
```

We recommend registering the listener as soon as possible to ensure proper application flow. However, the SDK will hold the last push notification and call the listener once it's registered.

> ❗️
>
> The listener is called for both regular and silent push notifications on Android but **only** for silent push notifications on iOS due to technical limitations.

### Custom push notification data processing

If the provided native `ExponeaModule.Companion.handleRemoteMessage` (Android) and `ExponeaNotificationService().process` (iOS)  methods don't fit the requirements of your app, or you decide to disable automatic push notifications, you must handle push notifications and process their payload yourself.

Notification payloads are generated from (possibly complex) scenarios in the Engagement platform and contain all data for Android, iOS and web platforms. Therefore, the payload itself can be complex.

Notification payloads use a JSON data structure.

#### Payload example

```json
{
    "notification_id": 123,
    "url": "https://example.com/main_action",
    "title": "Notification title",
    "action": "app|browser|deeplink|self-check",
    "message": "Notification message",
    "image": "https://example.com/image.jpg",
    "actions": [
        {"title": "Action 1", "action": "app|browser|deeplink", "url": "https://example.com/action1"}
    ],
    "sound": "default",
    "aps": {
        "alert": {"title": "Notification title", "body": "Notification message"},
        "mutable-content": 1
    },
    "attributes": {
        "event_type": "campaign",
        "campaign_id": "123456",
        "campaign_name": "Campaign name",
        "action_id": 1,
        "action_type": "mobile notification",
        "action_name": "Action 1",
        "campaign_policy": "policy",
        "consent_category": "General consent",
        "subject": "Subject",
        "language": "en",
        "platform": "ios|android",
        "sent_timestamp": 1631234567.89,
        "recipient": "user@example.com"
    },
    "url_params": {"param1": "value1", "param2": "value2"},
    "source": "xnpe_platform",
    "silent": false,
    "has_tracking_consent": true,
    "consent_category_tracking": "Tracking consent name"
}
```