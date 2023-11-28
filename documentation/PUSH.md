# Push notifications
Exponea allows you to easily create complex scenarios which you can use to send push notifications directly to your customers. The following section explains how to enable push notifications.

There is some setup required for each of the native platforms.
* [iOS Push notification setup](./PUSH_IOS.md)
* [Android Push notification setup](./PUSH_ANDROID.md)

> To test your push notification setup, send push notifications to your device from Exponea backend following [Sending Push notifications guide](./PUSH_SEND.md)

## Responding to push notifications
Once you perform platform setup, your application should be able to receive push notifications. To respond to push notification interaction, you can setup a listener using `Exponea.setPushOpenedListener()`. The SDK will hold last push notification and call the listener once it's set, but it's still recommended to set the listener as soon as possible to keep good flow of your application.
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

> There is additional setup required for deeplinking, see native platform push notification setup guides. You can always just use `Open App` action and put your payload to `Additional data`.

## Received push notifications
You can set up a listener for received push notifications using `Exponea.setPushReceivedListener`, which is mostly useful for silent push notifications. The SDK will hold last push notification and call the listener once it's set, but it's still recommended to set the listener as soon as possible.
> The listener is called for both regular and silent push notifications on Android and **only** for silent push notifications on iOS due to technical limitations.

``` typescript
Exponea.setPushReceivedListener((data) => {
  console.log(data)
})
```

## Custom push notification data processing

If using of native `ExponeaModule.Companion.handleRemoteMessage` (Android) or `ExponeaNotificationService().process` (iOS) does not fit requirements of your app, or you decide to deactivate the automatic push notification and want to use Bloomreach for push notifications delivery, you need to handle push notification payload yourself.

Notification payload is generated from complex scenarios created in Bloomreach platform. It contains all data for Android, iOS and Web platforms, therefore payload itself could be robust.
But payload itself is lightweight JSON with given structure:

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
