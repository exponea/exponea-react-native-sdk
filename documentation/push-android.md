---
title: Android push notifications
excerpt: Enable push notifications on Android using the React Native SDK
slug: react-native-sdk-push-android
categorySlug: integrations
parentDocSlug: react-native-sdk-push-notifications
---

The React Native SDK relies on the [native Android SDK](https://documentation.bloomreach.com/engagement/docs/android-sdk) to handle push notifications on Android. This guide provides shortened instructions for Android within the context of the React Native SDK and refers to the [push notifications documentation for the Android SDK](https://documentation.bloomreach.com/engagement/docs/android-sdk-push-notification) for details.

> 👍
>
> The SDK provides a push setup self-check feature to help developers successfully set up push notifications. The self-check will try to track the push token, request the Engagement backend to send a silent push to the device, and check if the app is ready to open push notifications.
>
> To enable the setup check, call `Exponea.checkPushSetup()` **before** [initializing the SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk):

> ❗️
>
> The behaviour of push notification delivery and click tracking may be affected by the tracking consent feature, which, if enabled, requires explicit consent for tracking. Refer to the [tracking consent documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking-consent) for details.

## Integration

Exponea Android SDK supports the following integrations:

- [Standard (Firebase) integration](#standard-firebase-integration)
- [Huawei integration](#huawei-integration)

### Standard (Firebase) integration

To be able to send [push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-push-notifications) from the Engagement platform and receive them in your app on Android devices, you must:

1. Set up a Firebase project.
2. Implement Firebase messaging in your app.
3. Configure the Firebase Cloud Messaging integration in the Engagement web app.

> 📘
>
> Follow the instructions in [Firebase Cloud Messaging](https://documentation.bloomreach.com/engagement/docs/android-sdk-firebase) in the native Android SDK documentation.
>
> Note that the root of your Android project is `/android`.

> 👍
>
> Please note that with Google deprecating and removing the FCM legacy API in June 2024, Bloomreach Engagement is now using Firebase HTTP v1 API.

### Huawei integration

To be able to send [push notifications](https://documentation.bloomreach.com/engagement/docs/android-push-notifications) from the Engagement platform and receive them in your app on Huawei devices, you must:

1. Set up Huawei Mobile Services (HMS)
2. Implement HMS in your app.
3. Configure the Huawei Push Service integration in the Engagement web app.

> 📘
>
> Follow the instructions in [Huawei Mobile Services](https://documentation.bloomreach.com/engagement/docs/android-sdk-huawei) in the native Android SDK documentation.

### Request notification permission

As of Android 13 (API level 33), a new runtime notification permission `POST_NOTIFICATIONS` must be registered in your `AndroidManifest.xml` and must also be granted by the user for your application to be able to show push notifications.

The SDK already registers the `POST_NOTIFICATIONS` permission.

The runtime permission dialog to ask the user to grant the permission must be triggered from your application. You may use SDK API for that purpose:

```dart 
_plugin.requestPushAuthorization()
.then((accepted) => print("User has ${accepted ? 'accepted': 'rejected'} push notifications."))
.catchError((error) => print('Error: $error'));
```

The behavior of this callback is as follows:

* For Android API level <33:
  * Permission is not required, return `true` automatically.
* For Android API level 33+:
  * Show the dialog, return the user's decision (`true`/`false`).
  * In case of previously granted permission, don't show the dialog return `true`.

## Customization

### Enable deep linking

You can use `Exponea.setPushOpenedListener()` to define a [listener that will respond to push notification interactions(https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications#respond-to-push-notification-interactions). To enable deep linking, you must make some changes to `AndroidManifest` in `android/src/main`.

#### Set activity to single task launch mode

By default, Android will launch a new activity for your application when the user opens a deep link. You must override this behavior by setting `android:launchMode="singleTask"` for your main activity:

```xml
<activity
  android:name=".MainActivity"
  ...
  android:launchMode="singleTask"
>
```

### Define an intent filter

You must also define an intent filter that can respond to push notification's link. You can either use a custom scheme or a URL. Refer to the relevant official [Android documentation](https://developer.android.com/training/app-links/deep-linking#adding-filters) for more information.

```xml
<activity ...>
   ...
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

      <!-- Accepts URIs that begin with "exponea://action”-->
      <data android:scheme="exponea" android:host="action" />

      <!-- Accepts URIs that begin https://www.example.com -->
      <data android:scheme="https" android:host="www.example.com" />
  </intent-filter>
</activity>
```

## Troubleshooting

If push notifications aren't working as expected in your app, consider the following frequent issues and their possible solutions:

### Clicking on a push notification does not open the app on Xiaomi Redmi devices

Xiaomi MIUI handles battery optimization in its own way, which can sometimes affect the behavior of push notifications.

If battery optimization is on for devices running MIUI, it can make push notifications stop showing or not working after the click. Unfortunately, there is nothing we can do on our end to prevent this, but you can try this to solve the issues:

- Turn off any battery optimizations in `Settings` > `Battery & Performance`.
- Set the "No restrictions" option in the battery saver options for your app.
- And (probably) most important, turn off `Memory and MIUI Optimization` under `Developer Options`.

### Push notification token is missing after anonymization

Your app may be using `Exponea.anonymize()` as a sign out feature.

Keep in mind that invoking the `anonymize` method will remove the push notification token from storage. Your application should retrieve a valid token manually before using any push notification features. You may do this directly after `anonymize` or before or after `identifyCustomer`, depending on your push notifications usage.

```kotlin
import com.facebook.react.ReactActivity;
import com.exponea.sdk.Exponea
import com.huawei.hms.aaid.HmsInstanceId

class SomeActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val token = HmsInstanceId.getInstance(context).getToken("yourAppId", "HCM")
        ExponeaModule.Companion.trackHmsPushToken(token)
	}
}
```

