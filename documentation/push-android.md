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

> ❗️
>
> Please note that the integration instructions assume your app uses "bare workflow". For Expo-based apps using "managed workflow", refer to [Expo managed apps](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#expo-managed-apps) for Android push notifications integration.

## Integration

Exponea Android SDK supports the following integrations:

- [Standard (Firebase) integration](#standard-firebase-integration)
- [Huawei integration](#huawei-integration)

### Standard (Firebase) integration

To be able to send [push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-push-notifications) from the Engagement platform and receive them in your app on Android devices, you must:

1. Set up a Firebase project.
2. Implement Firebase messaging in your app.
3. Configure the Firebase Cloud Messaging integration in the Engagement web app.

> 👍
>
> Please note that with Google deprecating and removing the FCM legacy API in June 2024, Bloomreach Engagement is now using Firebase HTTP v1 API. Refer to [Firebase upgrade to HTTP v1 API](https://support.bloomreach.com/hc/en-us/articles/18931691055133-Firebase-upgrade-to-HTTP-v1-API) at the Bloomreach Support Help Center for upgrade information.

#### Set up Firebase

First, you must set up a Firebase project. For step-by-step instructions, please refer to [Add Firebase to your Android project](https://firebase.google.com/docs/android/setup#console) in the official Firebase documentation.

> 📘
>
> When following the Firebase documentation, note that the root of your Android project is `/android`.

To summarize, you'll create a project using the Firebase console, download a generated `google-services.json` configuration file and add it to your app, and update the Gradle build scripts in your app.

In addition, you must add a dependency on Firebase messaging to `android/app/build.gradle`.

```groovy
dependencies {
    ...
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
    ...
}
```

#### Checklist:
- [ ] The `google-services.json` file downloaded from the Firebase console is in your **application** folder, for example, *my-project/app/google-services.json*.
- [ ] Your **application** Gradle build file (*android/app/build.gradle*) contains `apply plugin: 'com.google.gms.google-services'`.
- [ ] Your **top level** Gradle build file (*android/build.gradle*) has `classpath 'com.google.gms:google-services:X.X.X'` listed in the build script dependencies.

#### Implement Firebase messaging in your app

Next, you must create and register a service that extends `FirebaseMessagingService`. The service should call `handleRemoteMessage` in the `onMessageReceived` method and `handleNewToken` in the `onNewToken` method. The SDK's automatic tracking relies on your app providing this implementation.

1. Create the service:
   ```kotlin
   import android.app.NotificationManager;  
   import android.content.Context;  
   import androidx.annotation.NonNull;  
   import com.exponea.ExponeaModule;  
   import com.google.firebase.messaging.FirebaseMessagingService;  
   import com.google.firebase.messaging.RemoteMessage;  
    
   public class MessageService extends FirebaseMessagingService {  
    
       @Override  
       public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {  
           super.onMessageReceived(remoteMessage);  
           ExponeaModule.Companion.handleRemoteMessage(
               getApplicationContext(),
               remoteMessage.getData(),  
               (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)
           );  
       }  
    
       @Override  
       public void onNewToken(@NonNull String token) {  
           super.onNewToken(token);  
           ExponeaModule.Companion.handleNewToken(
               getApplicationContext(), 
               token
           );  
       }  
   }
   ```
2. Register the service in `AndroidManifest.xml`:
   ```xml
   ...
   <application>  
     <service android:name=".MessageService" android:exported="false" >  
       <intent-filter> 
         <action android:name="com.google.firebase.MESSAGING_EVENT" />  
       </intent-filter> 
     </service>
   </application>
   ...
   ```

> ❗️
>
> The methods `ExponeaModule.handleNewToken` and `ExponeaModule.handleRemoteMessage` can be used before SDK initialization if a previous initialization was done. In such a case, each method will track events with the configuration of the last initialization. Consider initializing the SDK in `Application::onCreate` to make sure a fresh configuration is applied in case of an application update.

#### Configure the Firebase Cloud Messaging integration in Engagement

Follow the instructions in [Configure the Firebase Cloud Messaging integration in Engagement](https://documentation.bloomreach.com/engagement/docs/android-sdk-firebase#configure-the-firebase-cloud-messaging-integration-in-engagement) for the Android SDK.

### Huawei integration

To be able to send [push notifications](https://documentation.bloomreach.com/engagement/docs/android-push-notifications) from the Engagement platform and receive them in your app on Huawei devices, you must:

1. Set up Huawei Mobile Services (HMS)
2. Implement HMS in your app.
3. Configure the Huawei Push Service integration in the Engagement web app.

#### Set up Huawei Mobile Services

Follow the instructions in [Set up Huawei Mobile Services](https://documentation.bloomreach.com/engagement/docs/android-sdk-huawei#set-up-huawei-mobile-services) for the Android SDK.

#### Implement HMS Message Service in your app

Next, you must create and register a service that extends `HmsMessagingService`. The service should call `handleRemoteMessage` in the `onMessageReceived` method and `handleNewHmsToken` in the `onNewToken` method. The SDK's automatic tracking relies on your app providing this implementation.

1. Create the service:
   ```kotlin
   import android.app.NotificationManager;  
   import android.content.Context;  
   import androidx.annotation.NonNull;  
   import com.exponea.ExponeaModule;  
   import com.huawei.hms.push.HmsMessageService;  
   import com.huawei.hms.push.RemoteMessage;  

   public class MessageService extends HmsMessageService {  

       @Override  
       public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {  
           super.onMessageReceived(remoteMessage);  
           ExponeaModule.Companion.handleRemoteMessage(  
               getApplicationContext(),  
               remoteMessage.getDataOfMap(),  
               (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)
           );  
       }  
    
       @Override  
       public void onNewToken(@NonNull String token) {  
           super.onNewToken(token);  
           ExponeaModule.Companion.handleNewHmsToken(  
               getApplicationContext(),  
               token
           );  
       }  
   }
   ```

2. Register the service in `AndroidManifest.xml`:
   ```xml
   ...
   <application>  
     <service android:name=".MessageService" android:exported="false">  
       <intent-filter> 
         <action android:name="com.huawei.push.action.MESSAGING_EVENT"/>  
       </intent-filter> 
     </service> 
     <meta-data  android:name="push_kit_auto_init_enabled"  android:value="true"/>  
   </application>
   ...
   ```

> ❗️
>
> The methods `ExponeaModule.handleNewHmsToken` and `ExponeaModule.handleRemoteMessage` can be used before SDK initialization if a previous initialization was done. In such a case, each method will track events with the configuration of the last initialization. Consider initializing the SDK in `Application::onCreate` to make sure a fresh configuration is applied in case of an application update.

#### Configure the Huawei Push Service integration in Engagement

Follow the instructions in [Configure the Huawei Push Service integration in Engagement](https://documentation.bloomreach.com/engagement/docs/android-sdk-huawei#configure-the-huawei-push-service-integration-in-engagement) for the Android SDK.

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

