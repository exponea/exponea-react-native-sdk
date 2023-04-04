

# Android Push notification setup
We rely on our native SDK to do push tracking. For more complex scenarios(multiple push providers), please can check [native Android SDK Push notification documentation](https://github.com/exponea/exponea-android-sdk/blob/develop/Documentation/PUSH.md).

> Exponea Android SDK contains self-check functionality to help you successfully set up push notifications. Self-check will try to track push token, request Exponea backend to send a silent push to the device, and check the app is ready to open push notifications. To enable self-check call `Exponea.checkPushSetup()` **before** configuring the SDK.

> The behaviour of Push delivery and click tracking may be affected by the tracking consent feature, which in enabled mode considers the requirement of explicit consent for tracking. Read more in [tracking consent documentation](https://github.com/exponea/exponea-android-sdk/blob/develop/Documentation/TRACKING_CONSENT.md). 

## Push Integrations
Exponea Android SDK supports these integrations:

- [Standard (Firebase) integration](#firebase-integration)
- [Huawei integration](#huawei-integration)

## Firebase integration 

### Integrating Firebase into your project
To send/receive push notifications, you have to set up the Firebase project. [Official Firebase documentation](https://firebase.google.com/docs/android/setup#console) describes this process. You'll need to create a project in the Firebase console, add generated `google-services.json` to your app and update Gradle scripts.

> When following the Firebase documentation, the root of your Android project is `/android`.

#### Checklist:
 - `google-services.json` file downloaded from the Firebase console is in the **android/app** folder of your Android project e.g., *android/app/google-services.json*
 - your **android/app** folder gradle build file(*android/app/build.gradle*) contains `apply plugin: 'com.google.gms.google-services'`
 - your **android** folder gradle build file(*android/build.gradle*) has `classpath 'com.google.gms:google-services:X.X.X'` listed in build script dependencies.

### Passing token and messages to Exponea SDK
 To handle incomming push messages, you will have to create your FirebaseMessagingService implementation, and registered it in your `AndroidManifest.xml`. Then, call `handleRemoteMessage` in `onMessageReceived` method and `handleNewToken` in `onNewToken` method, like in example code below:

```java
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

Registering in AndroidManifest.xml
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

> **NOTE:** Calling of `ExponeaModule.Companion.handleNewToken` and `ExponeaModule.Companion.handleRemoteMessage` is allowed before SDK initialization in case that previous initialization process was done. In such a case, methods will track events with configuration of last initialization. Please consider to do SDK initialization in `Application::onCreate` or before these methods in case of update of your application to apply a fresh new configuration.
 
### Setting the Firebase server key in the Exponea web app
You'll need to set the Firebase server key so Exponea can use it to send push notifications to your application. Our native Android has a [guide describing how to do so](https://github.com/exponea/exponea-android-sdk/blob/develop/Guides/FIREBASE.md).

### That's it
After these steps, you should be able to receive push notifications from Exponea. To learn how to send one, check a [Sending Push notifications guide](./PUSH_SEND.md).

## Huawei integration
Newer phones manufactured by [Huawei](https://huaweimobileservices.com/)  come with Huawei Mobile Services (HMS). It's a service used to deliver push _instead of_ Google's Firebase Cloud Messaging (FCM).

### Integrating HMS into your project
To send/receive push notifications, you have to:
1. register and set up a [Huawei Developer account](https://developer.huawei.com/consumer/en/console)
2. create a project and App in AppGallery Connect
3. generate and configure a Signing Certificate
4. enable push kit in AppGallery Connect APIs
5. update Gradle scripts and add generated `agconnect-services.json` to your app
6. configure the Signing Information in your app

Steps 2-6 are described in detail in the official [Huawei documentation](https://developer.huawei.com/consumer/en/codelab/HMSPreparation/index.html#0)

### Passing token and messages to Exponea SDK
 To handle incomming push messages, you will have to create your HmsMessageService implementation, and registered it in your `AndroidManifest.xml`. Then, call `handleRemoteMessage` in `onMessageReceived` method and `handleNewToken` in `handleNewHmsToken` method, like in example code below:

```java
import android.app.NotificationManager;  
import android.content.Context;  
import androidx.annotation.NonNull;  
import com.exponea.ExponeaModule;  
import com.huawei.hms.push.HmsMessageService;  
import com.huawei.hms.push.RemoteMessage;  
  
public class MessageService extends FirebaseMessagingService {  
  
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
Registering in AndroidManifest.xml
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

> **NOTE:** Calling of `ExponeaModule.Companion.handleNewHmsToken` and `ExponeaModule.Companion.handleRemoteMessage` is allowed before SDK initialization in case that previous initialization process was done. In such a case, methods will track events with configuration of last initialization. Please consider to do SDK initialization in `Application::onCreate` or before these methods in case of update of your application to apply a fresh new configuration.

### That's it
After these steps, you should be able to receive push notifications from Exponea. To learn how to send one, check a [Sending Push notifications guide](./PUSH_SEND.md).

> **Quick Tip:** If you are integrating Exponea SDK to existing project, you may face an issue that your 'HmsMessageService' is not called automatically.
> To retrieve a fresh Push token, you should consider to request a token manually as soon as possible after application start init.
> Please read a HMS guide how to retrieve current Push token https://developer.huawei.com/consumer/en/doc/development/HMSCore-Guides/android-client-dev-0000001050042041

## Deeplinking
You can use `Exponea.setPushOpenedListener()` to define a listener that will respond to push notifications. If you'd like to use deep-linking, you'll need to update your `AndroidManifest` in `android/src/main` a bit.

### Set activity to single task launch mode
By default, Android will launch a new activity for your application when a deep link is opened. You want to override this by setting `android:launchMode="singleTask"` for your main activity.
``` xml
<activity
  android:name=".MainActivity"
  ...
  android:launchMode="singleTask"
>
```

### Define an intent filter
You'll have to define an intent filter that can respond to URL you define when creating a push notification. You can either use a custom scheme or an URL. You can find more information in the official [Android documentation](https://developer.android.com/training/app-links/deep-linking#adding-filters).
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
In case of push notifications not working for you, these are frequent issues with the most likely solutions.

### Push notifications do not open the app after clicking on the notification on Xiaomi Redmi devices

Xiaomi MIUI is handling battery optimization in its own way and can sometimes affect the behavior of push notifications. 
If battery optimization is on for devices with MIUI, it can make push notifications stop showing or not working after the click. Unfortunately, there is nothing we can do on our end to prevent this, but you can try this to solve the issues:

-   Turn off any battery optimizations in Settings->Battery & Performance you can
-   Set the "No restrictions" option in battery saver options for your app
-   And (probably) most important, turn off Memory and MIUI Optimization under Developer Options

### Push notification token is missing after anonymization

There is principal usage of `Exponea.anonymize()` as a sign-out feature in some applications. Keep in mind that invoking of `anonymize` will remove also a Push notification token from storage. To load a current token, your application should retrieve a valid token manually before using any Push notification feature. So it may be called right after `anonymize` or before/after `identifyCustomer`, it depends on your Push notifications usage.

```kotlin
import com.facebook.react.ReactActivity;
import com.exponea.sdk.Exponea
import com.google.firebase.installations.FirebaseMessaging

class SomeActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
	    FirebaseMessaging.getInstance().token.addOnSuccessListener {
                ExponeaModule.Companion.handleNewHmsToken(applicationContext, it)
            }
	}
}
```
