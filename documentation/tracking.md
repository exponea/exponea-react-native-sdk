---
title: Tracking for React Native SDK
slug: react-native-sdk-tracking
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk
content:
  excerpt: Track customers and events using the React Native SDK
---

You can track events in {user.mkg} to learn more about your app’s usage patterns and to segment your customers by their interactions.

By default, the SDK tracks certain events automatically, including:

- Installation (after app installation and after invoking [anonymize](#anonymize))
- User session start and end
- Banner event for showing an in-app message or content block
- `notification_state` event for push notification token tracking (SDK versions 2.5.0 and higher). [Learn more](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#token-tracking-via-notification_state-event).

Additionally, you can track any custom event relevant to your business.

> 📘
>
> Also see [Mobile SDK tracking FAQ](https://support.bloomreach.com/hc/en-us/articles/18153058904733-Mobile-SDK-tracking-FAQ) at {user.br} Support Help Center.

> ❗️ Protect the privacy of your customers
>
> Make sure you have obtained and stored tracking consent from your customer before initializing Exponea React Native SDK.
>
> To ensure you're not tracking events without the customer's consent, you can use `Exponea.clearLocalCustomerData(appGroup)` when a customer opts out from tracking (this applies to new users or returning customers who have previously opted out). This will bring the SDK to a state as if it was never initialized. This option also prevents reusing existing cookies for returning customers.
>
> Refer to [Clear local customer data](#clear-local-customer-data) for details.
>
> If customer denied tracking consent after Exponea React Native SDK is initialized, you can use `Exponea.stopIntegration()` to stop SDK integration and remove all locally stored data.
>
> Refer to [Stop SDK integration](#stop-sdk-integration) for details.

## Events

### Track event

Use the `trackEvent()` method to track any custom event type relevant to your business.

You can use any name for a custom event type. We recommended using a descriptive and human-readable name.

Refer to the [Custom events](https://documentation.bloomreach.com/engagement/docs/custom-events) documentation for an overview of commonly used custom events.

#### Arguments

| Name                     | Type       | Description                                                                                               |
|--------------------------|------------|-----------------------------------------------------------------------------------------------------------|
| eventName **(required)** | String     | Name of the event type, for example `screen_view`.                                                        |
| properties               | JsonObject | Dictionary of event properties.                                                                           |
| timestamp                | number     | Unix timestamp (in seconds) specifying when the event was tracked. The default value is the current time. |

#### Examples

Imagine you want to track which screens a customer views. You can create a custom event `screen_view` for this.

First, create a dictionary with properties you want to track with this event. In our example, you want to track the name of the screen, so you include a property `screen_name` along with any other relevant properties:

```typescript
let properties = {
  screen_name: 'dashboard',
  other_property: 123.45,
};
```

Pass the event object to `trackEvent()` as follows:

```typescript
Exponea.trackEvent('screen_view', properties);
```

The second example below shows how you can use a nested structure for complex properties if needed:

```typescript
let properties = {
  purchase_status: 'success',
  product_list: [
    {
      product_id: 'abc123',
      quantity: 2,
    },
    {
      product_id: 'abc456',
      quantity: 1,
    },
  ],
  total_price: 7.99,
};
Exponea.trackEvent('purchase', properties);
```

> 👍
>
> Optionally, provide a custom `timestamp` if the event happened at a different time. The current time is used by default.

## Customers

[Identifying your customers](https://documentation.bloomreach.com/engagement/docs/customer-identification) allows you to track them across devices and platforms, improving the quality of your customer data.

Without identification, events are tracked for an anonymous customer, only identified by a cookie. Once the customer is identified by a hard ID, these events will be transferred to a newly identified customer.

> 👍
>
> Keep in mind that, while an app user and a customer record can be related by a soft or hard ID, they are separate entities, each with their own lifecycle. Take a moment to consider how their lifecycles relate and when to use [identify](#identify) and [anonymize](#anonymize).

### Identify

Use the `identifyCustomer()` method to identify a customer using their unique [hard ID](https://documentation.bloomreach.com/engagement/docs/customer-identification#hard-id).

The default hard ID is `registered` and its value is typically the customer's email address. However, your {user.mkg} project may define a different hard ID.

Optionally, you can track additional customer properties such as first and last names, age, etc.

#### Customer identification and local data

The SDK stores customer data, including the hard ID, in a local cache on the device. If you need to remove the hard ID from local storage, call [anonymize](#anonymize) in your app.

Although you can use `identifyCustomer` with a [soft ID](https://documentation.bloomreach.com/engagement/docs/customer-identification#section-soft-id), use caution—especially after anonymization. In some cases, this can unintentionally associate the current user with the wrong customer profile.

> ❗️Warning
>
> If a customer profile is anonymized or deleted in the {user.mkg} web app, initializing the SDK again in the app can cause the profile to be reidentified or recreated from locally cached data. Always clear local data appropriately to prevent unintended profile recreation.

#### Arguments

`identifyCustomer` accepts either of two call signatures:

**Signature 1 (preferred): Using `CustomerIdentity`**

| Name                              | Type               | Description                                                     |
|-----------------------------------|--------------------|-----------------------------------------------------------------|
| `customerIdentity` **(required)** | `CustomerIdentity` | Object containing `customerIds` and an optional `sdkAuthToken`. |
| `properties`                      | `JsonObject`       | Dictionary of customer properties. Defaults to `{}`.            |

The `CustomerIdentity` type:

| Field          | Type                     | Description                                                                                                 |
|----------------|--------------------------|-------------------------------------------------------------------------------------------------------------|
| `customerIds`  | `Record<string, string>` | Dictionary of customer unique identifiers. Only identifiers defined in the {user.mkg} project are accepted. |
| `sdkAuthToken` | `string` (optional)      | Stream JWT. If provided, stored persistently. If omitted, clears any previously set auth token.             |

#### Examples

```typescript
Exponea.identifyCustomer(
  {
    customerIds: { registered: 'jane.doe@example.com' },
  },
  {
    first_name: 'Jane',
    last_name: 'Doe',
    age: 32,
  }
);
```

Without additional properties:

```typescript
Exponea.identifyCustomer({
  customerIds: { registered: 'jane.doe@example.com' },
});
```

To identify a customer and set the SDK auth token at the same time, include the token in `CustomerIdentity`:

```typescript
Exponea.identifyCustomer(
  {
    customerIds: { registered: 'jane.doe@example.com' },
    sdkAuthToken: 'your-jwt-token',
  },
);
```

### Anonymize

Use the `anonymize()` method to delete all information stored locally and reset the current SDK state. A typical use case for this is when the user signs out of the app.

Invoking this method causes the SDK to:

- Remove the push notification token for the current customer from local device storage and the customer profile in {user.mkg}.
- Clear local repositories and caches, excluding tracked events.
- Track a new session start if `automaticSessionTracking` is enabled.
- Create a new customer record in {user.mkg} (a new `cookie` soft ID is generated).
- Assign the previous push notification token to the new customer record.
- Preload in-app messages, in-app content blocks, and app inbox for the new customer.
- Track a new `installation` event for the new customer.

You can also use the `anonymize` method to switch to a different integration configuration. The SDK then tracks events to a new customer record in the new project or stream, as in the first session after a fresh install.

> 📘 Note
>
> When you configure the SDK with `StreamConfig` and set an SDK auth token, the SDK performs a best-effort flush of pending events before clearing local data. If you need to be notified when the anonymization process finishes, use the [promise returned by `anonymize()`](#anonymize-with-completion-callback).

> ❗️ Avoid anonymous events on logout
>
> `anonymize()` creates a new anonymous customer profile and tracks events against it. If your integration shouldn't generate events against unidentified customer profiles, use [`stopIntegration()`](#stop-sdk-integration) on logout instead. Unlike `anonymize()`, `stopIntegration()` doesn't create a new anonymous customer profile. This is particularly relevant for `StreamConfig` integrations with an [SDK auth token (JWT)](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#sdk-auth-token-authorization) on a stream configured with signed-only permissions.

#### Examples

```typescript
Exponea.anonymize();
```

Switch to a different project using `ProjectConfig`:

```typescript
Exponea.anonymize(
  {
    projectToken: 'new-project-token',
    authorizationToken: 'new-authorization-token',
  },
  {
    [EventType.PAYMENT]: [
      {
        projectToken: 'special-project-for-payments',
        authorizationToken: 'payment-authorization-token',
        baseUrl: 'https://api-payments.some-domain.com',
      },
    ],
  }
);
```

Switch to a different stream integration:

```typescript
Exponea.anonymize({
  streamId: 'new-stream-id',
  baseUrl: 'https://api.exponea.com',
});
```

> 📘
>
> If you switch to a `StreamConfig` with `anonymize()`, the SDK ignores the second argument (integration route map). If the new customer needs a Stream JWT, provide a new `CustomerIdentity` via `identifyCustomer()` after anonymization.

#### Anonymize with completion callback

`anonymize()` returns a Promise that resolves when the anonymization process is complete:

```typescript
Exponea.anonymize().then(() => {
  // Anonymization is complete
});
```

With a new integration configuration:

```typescript
Exponea.anonymize({ streamId: 'new-stream-id' }).then(() => {
  // Anonymization is complete, now using the new stream
});
```

> 📘 Note
>
> If you're using `StreamConfig` with an SDK auth token, the Promise resolves after the best-effort flush finishes. If no flush is needed (for example, with `ProjectConfig` or no SDK auth token), the Promise resolves immediately.

## Sessions

The SDK tracks sessions automatically by default, producing two events: `session_start` and `session_end`.

The session represents the actual time spent in the app. It starts when the application is launched and ends when it goes into the background. If the user returns to the app before the session times out, the application will continue the current session.

The default session timeout is 60 seconds. Set `sessionTimeout` in the [SDK configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) to specify a different timeout.

### Track session manually

To disable automatic session tracking, set `automaticSessionTracking` to `false` in the [SDK configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).

Use the `trackSessionStart()` and `trackSessionEnd()` methods to track sessions manually.

#### How tokens are removed during anonymization

The SDK removes push notification tokens differently depending on the version:

**SDK versions below 2.5.0:**

- Assigns an empty string to the `google_push_notification_id`, `huawei_push_notification_id`, or `apple_push_notification_id` customer property.

**SDK versions 2.5.0 and higher:**

- Tracks a `notification_state` event with `valid = false` and `description = Invalidated`

> 📘 Note
>
> Learn more about [Token tracking via notification_state event](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#token-tracking-via-notification_state-event).

#### Examples

```typescript
Exponea.trackSessionStart();
```

```typescript
Exponea.trackSessionEnd();
```

### Get the current customer cookie

Use `Exponea.getCustomerCookie()` to retrieve the cookie that identifies the current customer being tracked. The value is available only after the SDK is initialized.

By default, the SDK tracks events for an anonymous customer identified by a cookie. When you identify the customer with a hard ID, the SDK keeps using the same cookie alongside the hard ID. The cookie persists until you call:

* `Exponea.anonymize()` to generate a new cookie immediately.
* `Exponea.stopIntegration()` or `Exponea.clearLocalCustomerData(appGroup)` to remove the cookie. A new one is created only on the next SDK initialization.

Use this cookie value to work with the current anonymous identity in your app, for example, to synchronize identity with a webview.

#### Example

```typescript
Exponea.getCustomerCookie()
  .then((cookie) => console.log(cookie))
  .catch((error) => console.log(error));
```

## Push notifications

If developers [integrate push notification functionality](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#integration) in their app, the SDK automatically tracks push notifications by default.

On Android, you can disable automatic push notification tracking by setting the Boolean value of the `automaticPushNotification` property to `false` in the SDK's [Android-specific configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration#android-specific-configuration-parameters). It is then up to the developer to manually track push notifications.

> ❗️
>
> The React Native SDK currently doesn't support disabling automatic push notification tracking on iOS.

> ❗️
>
> The behavior of push notification tracking may be affected by the tracking consent feature, which in enabled mode requires explicit consent for tracking. Refer to the [consent documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent) for details.

### Track token manually

Use either the `trackPushToken()` (Firebase) or `trackHmsPushToken` (Huawei) method to manually track the token for receiving push notifications. The token is assigned to the currently logged-in customer (with the `identifyCustomer` method).

Invoking this method will track a push token immediately regardless of the value of the `tokenTrackFrequency` [configuration parameter](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).

Each time the app becomes active, the SDK calls `verifyPushStatusAndTrackPushToken` and tracks the token.

> 📘 Note
>
> SDK versions 2.5.0 and higher use event-based token tracking. Learn more about [Token tracking via notification_state event](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#token-tracking-via-notification_state-event).

#### Arguments

| Name                 | Type   | Description                                    |
| -------------------- | ------ | ---------------------------------------------- |
| token **(required)** | String | String containing the push notification token. |

#### Example

Firebase:

```typescript
Exponea.trackPushToken('value-of-push-token');
```

Huawei:

```typescript
Exponea.trackHmsPushToken('value-of-push-token');
```

> ❗️
>
> Make sure to detach the push notification token from the signed-out customer profile on logout. Otherwise, multiple customer profiles may share the same token, resulting in duplicate push notifications.
>
> Call [`anonymize()`](#anonymize) or [`stopIntegration()`](#stop-sdk-integration) on logout, depending on whether you want to create a new anonymous profile. On Android, if you use `stopIntegration()`, you must re-track the push token after each re-initialization—see [Push notification token after stopIntegration()](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-android#push-notification-token-is-missing-after-stopintegration).

### Track push notification delivery manually

Use the `trackDeliveredPush()` method to manually track push notification delivery.

#### Arguments

| Name   | Type                   | Description        |
| ------ | ---------------------- | ------------------ |
| params | Record<string, string> | Notification data. |

> ❗️
>
> The notification data type is determined by the React Native library used for retrieving and handling push notifications (Firebase, Expo, Signal, etc...).

#### Example

```typescript
const notificationData: Record<string, string> = {
      "platform": "android",
      "subject": "subject",
      "type": "push",
      "url_params": JSON.stringify({
        "utm_campaign": "Campaign name",
        "utm_medium": "mobile_push_notification",
        "utm_content": "en",
        ...
      }),
      ...
    };
Exponea.trackDeliveredPush(notificationData)
```

### Track push notification click manually

Use the `trackClickedPush()` method to manually track push notification clicks.

#### Arguments

| Name   | Type                   | Description        |
| ------ | ---------------------- | ------------------ |
| params | Record<string, string> | Notification data. |

> ❗️
>
> The notification data type is determined by the React Native library used for retrieving and handling push notifications (Firebase, Expo, Signal, etc...).

#### Example

```typescript
const notificationData: Record<string, string> = {
      "platform": "android",
      "subject": "subject",
      "type": "push",
      "actionType": "button",
      "actionName": "Click here",
      "url": "https://example.com",
      "url_params": JSON.stringify({
        "utm_campaign": "Campaign name",
        "utm_medium": "mobile_push_notification",
        "utm_content": "en",
        ...
      }),
      ...
    };
Exponea.trackClickedPush(notificationData)
```

## Clear local customer data

Your application should always ask customers for consent to track their app usage. If the customer consents to tracking events at the application level but not at the personal data level, using the `anonymize()` method is usually sufficient.

If the customer doesn't consent to any tracking, it's recommended not to initialize the SDK at all.

If the customer requests deletion of personalized data before the SDK is initialized, use the `clearLocalCustomerData(appGroup)` method to remove all locally stored information. For details on the appGroup parameter, see [Using the appGroup parameter on iOS](#using-the-appgroup-parameter-on-ios)

> ❗️
>
> `clearLocalCustomerData()` works only when the SDK **isn't** initialized. If the SDK is running, it ignores the call and logs an error. Use [stopIntegration](#stop-sdk-integration) instead.
>
> `clearLocalCustomerData()` requires a prior SDK initialization (a configuration must exist on the device). With no prior configuration, the call has no effect and there's nothing to remove.

The customer may also revoke all tracking consent after the SDK is fully initialized and tracking is enabled. In this case, you can stop SDK integration and remove all locally stored data using the [stopIntegration](#stop-sdk-integration) method.

Invoking this method causes the SDK to:

- Remove the push notification token for the current customer from local device storage.
- Clear local repositories and caches, including all previously tracked events that haven't been flushed yet.
- Clear all session start and end information.
- Remove the customer record stored locally.
- Clear any previously loaded in-app messages, in-app content blocks, and app inbox messages.
- Clear the SDK configuration from the last invoked initialization.
- Stop handling of received push notifications.
- Stop tracking of deep links and universal links (your app's handling of them isn't affected).

### Using the appGroup parameter on iOS

The `clearLocalCustomerData()` method includes an optional appGroup parameter:

- On iOS, set this parameter to match the application group identifier configured for your app.
- If your app uses multiple application groups, call the method separately for each group.
- If your app doesn't use an application group, you can omit this parameter.
- This parameter has no effect on Android.

## Stop SDK integration

Your application should always ask the customer for consent to track their app usage. If the customer consents to tracking of events at the application level but not at the personal data level, using the `anonymize()` method is normally sufficient.

If the customer doesn't consent to any tracking before the SDK is initialized, it's recommended that the SDK isn't initialized at all. For the case of deleting personalized data before SDK initialization, see more info in the usage of the [clearLocalCustomerData](#clear-local-customer-data) method.

The customer may also revoke all tracking consent later, after the SDK is fully initialized and tracking is enabled. In this case, you can stop SDK integration and remove all locally stored data by using the `Exponea.stopIntegration()` method.

> 📘 Preferred when avoiding anonymous events
>
> Use `stopIntegration()` instead of [`anonymize()`](#anonymize) on logout when your integration shouldn't generate events against an anonymous customer profile. Unlike `anonymize()`, `stopIntegration()` doesn't create a new anonymous customer profile. This applies to any SDK configuration; the typical example is a `StreamConfig` integration with an [SDK auth token (JWT)](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#sdk-auth-token-authorization) on a stream configured with signed-only permissions.

> ❗️
>
> `stopIntegration()` works only when the SDK is initialized and running. If the SDK isn't initialized, it ignores the call and logs an error. To clear locally stored data when the SDK is not running, use [clearLocalCustomerData](#clear-local-customer-data) instead.

Use `stopIntegration()` to flush all pending data to the server, delete all locally stored data, and stop the SDK.

Invoking this method causes the SDK to:

- Remove the push notification token for the current customer from local device storage.
- Clear local repositories and caches, including all previously tracked events that were not flushed yet.
- Clear all session start and end information.
- Remove the customer record stored locally.
- Clear any In-app messages, In-app content blocks, and App inbox messages previously loaded.
- Clear the SDK configuration from the last invoked initialization.
- Stop handling of received push notifications.
- Stop tracking of Deep links and Universal links (your app's handling of them is not affected).

If the SDK is already running, invoking of this method also:

- Stops and disables session start and session end tracking even if your application tries later on.
- Stops and disables any tracking of events even if your application tries later on.
- Stops and disables any flushing of tracked events even if your application tries later on.
- Stops displaying of In-app messages, In-app content blocks, and App inbox messages.
  - Already displayed messages are dismissed.
  - Please validate dismiss behaviour if you [customized](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-app-inbox#customize-app-inbox) the App Inbox UI layout.

After invoking the `stopIntegration()` method, the SDK will drop any API method invocation until you [initialize the SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize_the_sdk) again.

### Use cases

Correct usage of `stopIntegration()` method depends on the use case so consider all scenarios.

#### Request customer consent

Always respect user privacy—not only to comply with regulations like GDPR, but also to build trust and deliver ethical digital experiences.

When requesting permission in your mobile app, make sure your requests are clear, transparent, and relevant to the context. Clearly explain why you need the permission and ask for it only when necessary, so users can make an informed decision.

You may use system dialog or in-app messages for that purpose.

![](https://raw.githubusercontent.com/exponea/exponea-react-native-sdk/main/Documentation/images/gdpr-dialog-example.png)

In the case of the in-app message dialog, you can customize [In-app message action callback](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-in-app-messages#customize-in-app-message-actions) to handle the user's decision about allowing or denying tracking permission.

```typescript
Exponea.setInAppMessageCallback({
  inAppMessageClickAction(
    message: InAppMessage,
    button: InAppMessageButton
  ): void {
    if (messageIsForGdpr(message)) {
      handleGdprUserResponse(button);
    } else if (button.url != null) {
      openUrl(button);
    }
  },
  inAppMessageCloseAction(
    message: InAppMessage,
    button: InAppMessageButton | undefined,
    interaction: boolean
  ): void {
    if (messageIsForGdpr(message) && interaction) {
      // regardless from `button` nullability, parameter `interaction` tells that user closed message
      console.log(`Stopping SDK`);
      Exponea.stopIntegration();
    }
  },
  inAppMessageError(
    message: InAppMessage | undefined,
    errorMessage: string
  ): void {
    // Here goes your code
  },
  inAppMessageShown(message: InAppMessage): void {
    // Here goes your code
  },
  // set overrideDefaultBehavior to true to handle URL opening manually
  overrideDefaultBehavior: true,
  // set trackActions to true to keep tracking of click and close actions
  trackActions: true,
});
```

#### Stop the SDK but upload tracked data

`stopIntegration()` automatically flushes all pending data (sessions, events, customer properties) to the server before clearing local storage. No manual flush is needed.

If you need to wait for the flush and teardown to complete before proceeding, use the Promise returned by `stopIntegration()`:

```typescript
Exponea.stopIntegration().then(() => {
  // SDK is now fully stopped and all data cleared
});
```

#### Stop the SDK and wipe all tracked data

The SDK caches data (such as sessions, events, and customer properties) in an internal local database and periodically sends them to the {user.mkg} app. These data are kept locally if the device has no network, or if you configured SDK to upload them less frequently.

If a customer is removed from the {user.mkg} platform, you may also need to remove their data from local storage.

**Don't initialize the SDK after deleting the customer.** Depending on your configuration, initializing the SDK could trigger an upload of any locally stored events, which may unintentionally recreate the customer profile in {user.mkg} using the stored customer IDs.

To prevent this, call `clearLocalCustomerData()` without initializing the SDK:

```typescript
Exponea.clearLocalCustomerData();
```

This removes all previously stored data from the device without uploading it. The next SDK initialization is considered a fresh new start.

#### Stop the already running SDK

The method `stopIntegration()` can be invoked anytime on a configured and running SDK.

This is useful if a customer initially consented to tracking but later revokes their consent. When consent is withdrawn, invoke `stopIntegration()` immediately to stop all tracking activities.

```typescript
// User gave you permission to track
Exponea.configure({ ... });

// Later, user decides to stop tracking
Exponea.stopIntegration();
```

This results in the SDK flushing all pending events to the server, stopping all internal processes (such as session tracking and push notifications handling), and removing all locally stored data. You can use the Promise to confirm the process is complete.

> ❗️
>
> After calling `stopIntegration()`, the SDK doesn't track or upload any further data. `stopIntegration()` automatically flushes pending data before clearing local storage—no manual flush is needed beforehand.

#### Customer denies tracking consent

Ask for the customer’s tracking consent as early as possible in your application. If the customer denies consent, don't initialize the SDK. This prevents any tracking or data storage from occurring.

## Default properties

You can [configure](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) default properties to be tracked with every event. Note that the value of a default property will be overwritten if the tracking event has a property with the same key.

```typescript
Exponea.configure({
  projectToken: 'YOUR_PROJECT_TOKEN',
  authorizationToken: 'YOUR_API_KEY',
  baseUrl: 'YOUR_API_BASE_URL',
  defaultProperties: {
    thisIsADefaultStringProperty: 'This is a default string value',
    thisIsADefaultIntProperty: 1,
  },
}).catch((error) => console.log(error));
```

After initializing the SDK, you can change the default properties using the method `Exponea.setDefaultProperties()`.
