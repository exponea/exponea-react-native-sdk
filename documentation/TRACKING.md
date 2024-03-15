# Tracking
Exponea SDK allows you to track events that occur while using the app and add properties of your customer. When SDK is first initialized we generate a cookie for the customer that will be used for all the tracking. You can retrieve that cookie using `Exponea.getCustomerCookie()`.

> If you need to reset the tracking and start fresh with a new user, you can use [Anonymize](./ANONYMIZE.md) functionality.

## Track events
> Some events are tracked automatically. We track installation event once for every customer and when `automaticSessionTracking` is enabled in [Configuration](./CONFIGURATION.md) we automatically track session events.

You can define any event types for each of your projects based on your business model or your current goals. If you have product e-commerce website, your basic customer journey will probably/most likely be:

* Visiting your App
* Searching for specific product
* Product page
* Adding product to the cart
* Going through ordering process
* Payment

So the possible events for tracking will be: ‘search’, ‘product view’, ‘add product to cart’, ‘checkout’, ‘purchase’. Remember that you can define any event names you wish. Our recommendation is to make them self-descriptive and human understandable.

Once the SDK is configured, you can track your events using `trackEvent` function:

```typescript
Exponea.trackEvent(
  "purchase", // event name
  {
    item_name: "product",
    price: 123.45,
    onSale: false
  }
)
```

## Track customer properties
Some data can not be represented as an event, but rather a fact about your customer e.g. an email or country.

Save or update your customer data using `identifyCustomer` function:
```typescript
Exponea.identifyCustomer(
  {registered: "email@domain.com"}, // customer identifiers
  {payingCustomer: true} // customer properties
)
```
> You can find more information about identifying customers, soft vs. hard IDs in [Exponea documentation](https://documentation.bloomreach.com/engagement/docs/customer-identification)

## Default properties
In [Configuration](./CONFIGURATION.md), you can set values in the to be sent in every tracking event. You can use them to track e.g. your application settings. Keep in mind these values will be overwritten if the tracking event has properties with the same key name.

## Flushing data
Flushing is the process of uploading tracking events to Exponea servers. All tracked events and customer properties are stored in the internal database of the Exponea SDK and later flushed based on flushing settings. When an event is successfully sent to Exponea API, the object will be deleted from the local database.

> By default, Exponea SDK automatically takes care of flushing events to the Exponea API. This feature can be turned off by calling `Exponea.setFlushMode(FlushMode.MANUAL)`. Please be careful with turning automatic flushing off because if you turn it off, you need to manually call Exponea.flush() to flush the tracked events manually every time there is something to flush.

Exponea SDK will only flush data when the device has a stable internet connection. If a connection/server error occurs when flushing the data, it will keep the data stored until it can be flushed at a later time.

You can set your flush mode with `setFlushMode()` function to one of following values:
  * `FlushMode.IMMEDIATE` *(default and recommended setting)* - Events are flushed to Exponea backend immediately when they are tracked.
  * `FlushMode.PERIOD` - Events are flushed to Exponea backend periodically based on period set with `Exponea.setFlushPeriod(seconds)`.
  * `FlushMode.APP_CLOSE`- Events are flushed to Exponea backend when application is closed.
  * `FlushMode.MANUAL` - Events are flushed to Exponea when `flushData()` is manually called by the developer.

## Manual session tracking
If you decide to opt out of our `automaticSessionTracking`, you can track sessions manually with `Exponea.trackSessionStart()` and `Exponea.trackSessionEnd()`.

