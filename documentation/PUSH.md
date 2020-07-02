# Push notifications
Exponea allows you to easily create complex scenarios which you can use to send push notifications directly to your customers. The following section explains how to enable push notifications.

There is some setup required for each of the native platforms.
* [iOS Push notification setup](./PUSH_IOS.md)
* [Android Push notification setup](./PUSH_ANDROID.md)

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