

# Version update

This guide will help you upgrade your Exponea SDK to the new version.

## Updating from version 0.x.x to 1.x.x
 Changes you will need to do when updating Exponea SDK to version 1 and higher are related to firebase push notifications.


### Changes regarding FirebaseMessagingService

 We decided not to include the implementation of FirebaseMessagingService in our SDK since we want to keep it as small as possible and avoid including the libraries that are not essential for its functionality. SDK no longer has a dependency on the firebase library. Changes you will need to do are as follows:

1. You will need to implement FirebaseMessagingService on your android application side.
2. Call `ExponeaModule.Companion.handleRemoteMessage` when a message is received
3. Call `ExponeaModule.Companion.handleNewToken` when a token is obtained
4. Register this service in your `AndroidManifest.xml`

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