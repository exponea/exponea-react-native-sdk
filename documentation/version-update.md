---
title: SDK version update guide
excerpt: Update Exponea React Native SDK in your app to a new version
slug: react-native-sdk-version-update
categorySlug: integrations
parentDocSlug: react-native-sdk-release-notes
---

This guide will help you upgrade your Exponea SDK to the new version.

## Update from version 0.x.x to 1.x.x

Updating the Exponea React Native SDK to version 1 and higher requires making some changes related to Firebase push notifications.

### Changes regarding FirebaseMessagingService

We decided not to include the implementation of FirebaseMessagingService in our SDK since we want to keep it as small as possible and avoid including libraries that are not essential for its functionality. The SDK no longer has a dependency on the firebase library. You will need to make the following changes:

1. Add Firebase messaging dependency.
2. Implement `FirebaseMessagingService` on your Android application side.
3. Call `ExponeaModule.Companion.handleRemoteMessage` when a message is received.
4. Call `ExponeaModule.Companion.handleNewToken` when a token is obtained.
5. Register this service in your `AndroidManifest.xml`.

Add the Firebase messaging dependency to `android/app/build.gradle`:

```groovy
dependencies {
    ...
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
    ...
}
```

Example of a registered `MessageService` that extends `FirebaseMessagingService`:

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

Register the `MessageService` in your `AndroidManifest.xml` as follows:
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
> **NOTE:** Calling `ExponeaModule.Companion.handleNewToken`, `ExponeaModule.Companion.handleNewHmsToken`, and `ExponeaModule.Companion.handleRemoteMessage` is allowed before SDK initialization in case the SDK was previously initialized. In such a case, the methods will track events with the configuration of the last initialization. Please consider to initialize the SDK in `Application::onCreate` or before these methods to apply a fresh configuration in case of an update of your application.
