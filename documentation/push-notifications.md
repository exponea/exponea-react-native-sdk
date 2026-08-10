---
title: Push notifications for React Native SDK
slug: react-native-sdk-push-notifications
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk
content:
  excerpt: Enable push notifications in your app using the React Native SDK
---

{user.mkg} enables sending push notifications to your app users using [scenarios](https://documentation.bloomreach.com/engagement/docs/scenarios-1). The mobile application handles the push message using the SDK and renders the notification on the customer's device.

Push notifications can also be silent, used only to update the app’s interface or trigger some background task.

> 📘
>
> Refer to [Mobile push notifications](https://documentation.bloomreach.com/engagement/docs/mobile-push-notifications#creating-a-new-notification) to learn how to create push notifications in the {user.mkg} web app.

> 📘
>
> Also see [Mobile push notifications FAQ](https://support.bloomreach.com/hc/en-us/articles/18152713374877-Mobile-Push-Notifications-FAQ) at {user.br} Support Help Center.

## Integration

The React Native SDK relies on the underlying native Android and iOS platforms to handle push notifications.

The following pages describe the steps for each platform to add the minimum push notification functionality (receive alert notifications) to your app.

- [Android push notifications for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android)
- [iOS push notifications for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios)

## Customization

This section describes the customizations you can implement once you have integrated the minimum push notification functionality.

> ❗️Important
>
> - SDK versions 2.5.0 and higher use event-based token tracking to support multiple mobile applications per project. Learn more about [Token tracking via notification_state event](#token-tracking-via-notification_state-event).

### Respond to push notification interactions

Once you have followed the integration steps for each platform, your app should be able to receive push notifications.

To respond to a push notification interaction, you can set up a listener using `Exponea.setPushOpenedListener()`:

```typescript
Exponea.setPushOpenedListener((openedPush) => {
  switch (openedPush.action) {
    case PushAction.APP:
      // last push directed user to your app with no link

      // log data defined on Exponea backend
      console.log(openedPush.additionalData);
      break;
    case PushAction.DEEPLINK:
      // last push directed user to your app with deeplink
      console.log(openedPush.url);
      break;
    case PushAction.WEB:
      // last push directed user to web, nothing to do here
      break;
  }
});
```

We recommend registering the listener as soon as possible to ensure proper application flow. However, the SDK will hold the last push notification and call the listener once it's registered.

> ❗️
>
> To support deep links, additional set up steps are required. Refer to the documentation for the respective native platforms ([Android push notifications for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android), [iOS push notifications for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios)). Alternatively, use the `Open app` action instead and add your payload to `Additional data`.

### Respond to received push notifications

You can set up a listener for received push notifications using `Exponea.setPushReceivedListener`, which is especially useful for silent push notifications.

```typescript
Exponea.setPushReceivedListener((data) => {
  console.log(data);
});
```

We recommend registering the listener as soon as possible to ensure proper application flow. However, the SDK will hold the last push notification and call the listener once it's registered.

> ❗️
>
> The listener is called for both regular and silent push notifications on Android but **only** for silent push notifications on iOS due to technical limitations.

### Custom push notification data processing

If the provided native `ExponeaModule.Companion.handleRemoteMessage` (Android) and `ExponeaNotificationService().process` (iOS) methods don't fit the requirements of your app, or you decide to disable automatic push notifications, you must handle push notifications and process their payload yourself.

Notification payloads are generated from (possibly complex) scenarios in the {user.mkg} platform and contain all data for Android, iOS and web platforms. Therefore, the payload itself can be complex.

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
    {
      "title": "Action 1",
      "action": "app|browser|deeplink",
      "url": "https://example.com/action1"
    }
  ],
  "sound": "default",
  "aps": {
    "alert": { "title": "Notification title", "body": "Notification message" },
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
  "url_params": { "param1": "value1", "param2": "value2" },
  "source": "xnpe_platform",
  "silent": false,
  "has_tracking_consent": true,
  "consent_category_tracking": "Tracking consent name"
}
```

## Token tracking via notification_state event

Starting with SDK version 2.5.0, push notification tokens are tracked using `notification_state` events instead of customer
profile properties. This change enables support for multiple mobile applications per project,
allowing you to track multiple push tokens for the same customer across different apps and devices.

### Token storage by SDK version

#### SDK versions below 2.5.0:

- Tokens are stored in customer profile properties: `google_push_notification_id`, `huawei_push_notification_id`, or `apple_push_notification_id`
- One token per customer profile
- Single application per project

#### SDK versions 2.5.0 and higher:

- Tokens are stored as `notification_state` events
- Multiple tokens per customer (grouped by Application ID)
- Multiple applications per project supported
- Backward compatibility maintained for Application ID `default-application`

### When notification_state events are tracked

The SDK automatically tracks `notification_state` events in the following scenarios:

- SDK initialization
- App transitions from background to foreground (only if notification permission status has changed since last tracking)
- New token received from Firebase, Huawei, or APNs
- Manual token tracking using `Exponea.trackPushToken(...)` (Android, iOS) or `Exponea.trackHmsPushToken(...)` (Huawei)
- User anonymization via `Exponea.anonymize()` or `Exponea.stopIntegration()`
- Notification permission requested via `Exponea.requestPushAuthorization()`
- OS push authorization status flips (granted ↔ denied) since the last `notification_state` event—this happens regardless of your `pushTokenTrackingFrequency` setting, so the `valid` flag always stays in sync with the user's actual permission state.
- 30 days have passed since the last successful `notification_state` track (applies to `ON_TOKEN_CHANGE` frequency, ensuring the token stays within the validity window even when it hasn't changed).

```typescript
Exponea.requestPushAuthorization()
  .then((result) => console.log(`Authorization result: ${result}`))
  .catch((error) => console.log(`Authorization error: ${error}`));
```

> 📘 Note
>
> **SDK version 3.0.0 change:** `requestPushAuthorization()` is a cross-platform method available since SDK version 3.0.0 that works on both iOS and Android. It replaces the deprecated `requestIosPushAuthorization()`, which was iOS-only. If you are upgrading from SDK 2.x.x, replace any calls to `requestIosPushAuthorization()` with `requestPushAuthorization()`.

The frequency of `notification_state` event tracking depends on the `pushTokenTrackingFrequency` configuration property. [See SDK configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).

> 📘 Note
>
> When `pushTokenTrackingFrequency` is set to `ON_TOKEN_CHANGE` (the default), the SDK also automatically refreshes the `notification_state` event every 30 days, even when the token hasn't changed.

> 📘 Note
>
> When `pushTokenTrackingFrequency` is set to `EVERY_LAUNCH`, the SDK tracks the push token once per app launch (process start). All other SDK operations during that launch reuse this tracking, so each launch produces a single `notification_state` event.
>
> Some operations bypass this limit and always trigger tracking:
> - Calling `trackPushToken()` manually.
> - Receiving a new token from FCM, HMS, or APNs.
> - Calling `anonymize()` or `stopIntegration()`.

### notification_state event properties

| Property                  | Description                                   | Example values                                              |
| ------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `push_notification_token` | Current push notification token               | Token string                                                |
| `platform`                | Mobile platform                               | `android`, `huawei`, or `ios`                               |
| `valid`                   | Token validity status                         | `true` or `false`                                           |
| `description`             | Token state description                       | `Permission granted`, `Permission denied`, or `Invalidated` |
| `application_id`          | Application identifier from SDK configuration | Custom ID or `default-application` (default)                |
| `device_id`               | Unique device identifier                      | UUID string                                                 |
| `sdk_version`             | Version of the {user.br} SDK                 | `4.1.0`                                                     |
| `os_name`                 | Operating-system name                         | `iOS`, `Android`                                            |
| `os_version`              | Operating-system version                      | `17.4`, `14`                                                |
| `device_model`            | Device model name                             | `iPhone 15 Pro`, `Samsung Galaxy S21`                       |
| `device_type`             | Device form factor                            | `mobile` or `tablet`                                        |
| `app_version`             | Host app version                              | `1.0`, `2.3.1`                                              |
| `sdk`                     | SDK identifier                                | `Exponea Android SDK`, `Exponea iOS SDK`                    |

> 📘 Note
>
> If you don't specify an `application_id` in your SDK configuration, the default value `default-application` is used. [Configuration for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).

### Understanding token states

The combination of `valid` and `description` properties indicates the token's current state:

| Valid   | Description          | When this occurs                                                                                                                                                                                        |
|---------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `false` | `Invalidated`        | New token received \(old token becomes invalid\) or `Exponea.anonymize()` / `Exponea.stopIntegration()` called                                                                                          |
| `false` | `Permission denied`  | User denied notification permission or the user disabled notifications in system settings. The `valid` flag reflects the actual OS permission state directly, regardless of `requirePushAuthorization`. |
| `true`  | `Permission granted` | User has granted notification permission and notifications are enabled                                                                                                                                  |

### Configuring Application ID

> 📘 Note
>
> See this section to configure `application_id`. [Initial setup for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#configure-application-id).

> ❗️Important
>
> The SDK can automatically generate `notification_state` events,
> but your {user.mkg} project must have event creation enabled. If your project uses custom event schemas
> or restricts event creation, add `notification_state` to the list of allowed events. Otherwise, push token registration will fail silently.

### Verifying token tracking

You can verify that tokens are being tracked correctly in the {user.mkg} web application:

1. Navigate to Data & Assets > Customers
2. Locate the customer profile
3. Check for `notification_state` events in the customer's event history
4. Verify the `push_notification_token` property contains a valid token value

For SDK versions below 2.5.0, check the customer profile properties `google_push_notification_id`, `huawei_push_notification_id`, or `apple_push_notification_id`.
