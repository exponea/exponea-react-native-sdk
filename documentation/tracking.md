---
title: Tracking
excerpt: Track customers and events using the React Native SDK
slug: react-native-sdk-tracking
categorySlug: integrations
parentDocSlug: react-native-sdk
---

You can track events in Engagement to learn more about your app’s usage patterns and to segment your customers by their interactions.

By default, the SDK tracks certain events automatically, including:

* Installation (after app installation and after invoking [anonymize](#anonymize))
* User session start and end
* Banner event for showing an in-app message or content block

Additionally, you can track any custom event relevant to your business.

> 📘
>
> Also see [Mobile SDK tracking FAQ](https://support.bloomreach.com/hc/en-us/articles/18153058904733-Mobile-SDK-tracking-FAQ) at Bloomreach Support Help Center.

## Events

### Track event

Use the `trackEvent()` method to track any custom event type relevant to your business.

You can use any name for a custom event type. We recommended using a descriptive and human-readable name.

Refer to the [Custom events](https://documentation.bloomreach.com/engagement/docs/custom-events) documentation for an overview of commonly used custom events.

#### Arguments


| Name                     | Type       | Description |
| -------------------------| -----------| ----------- |
| eventName **(required)** | String     | Name of the event type, for example `screen_view`. |
| properties               | JsonObject | Dictionary of event properties. |
| timestamp                | number     | Unix timestamp (in seconds) specifying when the event was tracked. The default value is the current time. |

#### Examples

Imagine you want to track which screens a customer views. You can create a custom event `screen_view` for this.

First, create a dictionary with properties you want to track with this event. In our example, you want to track the name of the screen, so you include a property `screen_name` along with any other relevant properties:

```typescript
let properties = {
  screen_name: "dashboard",
  other_property: 123.45,
}
```

Pass the event object to `trackEvent()` as follows:

```typescript
Exponea.trackEvent("screen_view", properties)
```

The second example below shows how you can use a nested structure for complex properties if needed:

```typescript
let properties = {
  purchase_status: "success",
  product_list: [
    {
      product_id: "abc123",
      quantity: 2,
    },
    {
      product_id: "abc456",
      quantity: 1,
    },
  ],
  total_price: 7.99,
}
Exponea.trackEvent("purchase", properties)
```

> 👍
>
> Optionally, you can provide a custom `timestamp` if the event happened at a different time. By default the current time will be used.

## Customers

[Identifying your customers](https://documentation.bloomreach.com/engagement/docs/customer-identification) allows you to track them across devices and platforms, improving the quality of your customer data.

Without identification, events are tracked for an anonymous customer, only identified by a cookie. Once the customer is identified by a hard ID, these events will be transferred to a newly identified customer.

> 👍
>
> Keep in mind that, while an app user and a customer record can be related by a soft or hard ID, they are separate entities, each with their own lifecycle. Take a moment to consider how their lifecycles relate and when to use [identify](#identify) and [anonymize](#anonymize).

### Identify

Use the `identifyCustomer()` method to identify a customer using their unique [hard ID](https://documentation.bloomreach.com/engagement/docs/customer-identification#hard-id).

The default hard ID is `registered` and its value is typically the customer's email address. However, your Engagement project may define a different hard ID.

Optionally, you can track additional customer properties such as first and last names, age, etc.

#### Arguments

| Name                       | Type                   | Description |
| -------------------------- | ---------------------- | ----------- |
| customerIds **(required)** | Record<string, string> | Dictionary of customer unique identifiers. Only identifiers defined in the Engagement project are accepted. |
| properties                 | JsonObject             | Dictionary of customer properties. |

#### Examples

First, create a record containing at least the customer's hard ID:

```typescript
let customerIds = {
  registered: "jane.doe@example.com"
}
```

Optionally, create a dictionary with additional customer properties:

```typescript
let properties = {
  first_name: "Jane",
  last_name: "Doe",
  age: 32   
}
```

Pass the `customerIds` and `properties` dictionaries to `identifyCustomer()`:

```typescript
Exponea.identifyCustomer(customerIds, properties);
```

If you only want to update the customer ID without any additional properties, you can pass an empty dictionary into `properties`:

```typescript
Exponea.identifyCustomer(customerIds, {});
```

### Anonymize

Use the `anonymize()` method to delete all information stored locally and reset the current SDK state. A typical use case for this is when the user signs out of the app.

Invoking this method will cause the SDK to:

* Remove the push notification token for the current customer from local device storage and the customer profile in Engagement.
* Clear local repositories and caches, excluding tracked events.
* Track a new session start if `automaticSessionTracking` is enabled.
* Create a new customer record in Engagement (a new `cookie` soft ID is generated).
* Assign the previous push notification token to the new customer record.
* Preload in-app messages, in-app content blocks, and app inbox for the new customer.
* Track a new `installation` event for the new customer.

You can also use the `anonymize` method to switch to a different Engagement project. The SDK will then track events to a new customer record in the new project, similar to the first app session after installation on a new device.

#### Examples

```typescript
Exponea.anonymize()
```

Switch to a different project:

```typescript
Exponea.anonymize(
  {
    projectToken: "new-project-token",
    authorizationToken: "new-authorization-token"
  },
  {
    [EventType.PAYMENT]: [
      {
        projectToken: "special-project-for-payments",
        authorizationToken: "payment-authorization-token",
        baseUrl: "https://api-payments.some-domain.com"
      }
    ]
  }
)
```

## Sessions

The SDK tracks sessions automatically by default, producing two events: `session_start` and `session_end`.

The session represents the actual time spent in the app. It starts when the application is launched and ends when it goes into the background. If the user returns to the app before the session times out, the application will continue the current session.

The default session timeout is 60 seconds. Set `sessionTimeout` in the [SDK configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) to specify a different timeout.

### Track session manually

To disable automatic session tracking, set `automaticSessionTracking` to `false` in the [SDK configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration).

Use the `trackSessionStart()` and `trackSessionEnd()` methods to track sessions manually.

#### Examples

```typescript
Exponea.trackSessionStart()
```

```typescript
Exponea.trackSessionEnd()
```

## Default properties

You can [configure](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) default properties to be tracked with every event. Note that the value of a default property will be overwritten if the tracking event has a property with the same key.

```typescript
Exponea.configure({
  projectToken: "YOUR_PROJECT_TOKEN",
  authorizationToken: "YOUR_API_KEY",
  baseUrl: "YOUR_API_BASE_URL",
  defaultProperties: {
    thisIsADefaultStringProperty: "This is a default string value",
    thisIsADefaultIntProperty: 1
  } 
}).catch(error => console.log(error))
```

After initializing the SDK, you can change the default properties using the method `Exponea.setDefaultProperties()`.
