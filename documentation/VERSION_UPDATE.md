

# Version update

This guide will help you upgrade your Exponea SDK to the new version.

## Updating from version 0.x.x to 1.x.x
 Changes you will need to do when updating Exponea SDK to version 1 and higher are related to firebase push notifications.


### Changes regarding FirebaseMessagingService

 We decided not to include the implementation of FirebaseMessagingService in our SDK since we want to keep it as small as possible and avoid including the libraries that are not essential for its functionality. SDK no longer has a dependency on the firebase library. Changes you will need to do are as follows:

1. Add dependency of Firebase messaging into your dependencies
2. You will need to implement FirebaseMessagingService on your android application side.
3. Call `ExponeaModule.Companion.handleRemoteMessage` when a message is received
4. Call `ExponeaModule.Companion.handleNewToken` when a token is obtained
5. Register this service in your `AndroidManifest.xml`

Dependency of Firebase messaging has to be added into `android/app/build.gradle`

```groovy
dependencies {
    ...
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
    ...
}
```

Example of registered `MessageService` that has to extend `FirebaseMessagingService`:
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

Register your `MessageService` into your `AndroidManifest.xml` as:
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

> **NOTE:** Calling of `ExponeaModule.Companion.handleNewToken`, `ExponeaModule.Companion.handleNewHmsToken` and `ExponeaModule.Companion.handleRemoteMessage` is allowed before SDK initialization in case that previous initialization process was done. In such a case, methods will track events with configuration of last initialization. Please consider to do SDK initialization in `Application::onCreate` or before these methods in case of update of your application to apply a fresh new configuration.
