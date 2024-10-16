---
title: SDK version update guide
excerpt: Update Exponea React Native SDK in your app to a new version
slug: react-native-sdk-version-update
categorySlug: integrations
parentDocSlug: react-native-sdk-release-notes
---

This guide will help you upgrade your Exponea SDK to the latest major version.

## Update from version 1.x.x to 2.x.x

Updating Exponea SDK to version 2 or higher requires making some changes related to in-app messages callback implementations.

The `Exponea.setInAppMessageCallback` API was changed and simplified, so you have to migrate your implementation of in-app message action and close handling. This migration requires to implement `InAppMessageCallback` interface.

Your implementation may have been similar to the following example:

```typescript
Exponea.setInAppMessageCallback(false, true, (action) => {
    if (action.button) {
        // is click action
        onMessageClick(message, button)
    } else {
        // is close action
        onMessageClose(message, interaction)
    }
});
```

To update to version 2 of the SDK, you must implement the `InAppMessageCallback` interface and refactor your code as follows:

```typescript
Exponea.setInAppMessageCallback({
    overrideDefaultBehavior: false,
    trackActions: true,
    inAppMessageClickAction(message: InAppMessage, button: InAppMessageButton): void {
        console.log(`InApp action ${button.url} received for message ${message.id}`);
        onMessageClick(message, button);
    },
    inAppMessageCloseAction(message: InAppMessage, button: InAppMessageButton | undefined, interaction: boolean): void {
        console.log(`InApp message ${message.id} closed by ${button?.text} with interaction: ${interaction}`);
        onMessageClose(message, interaction);
    },
    inAppMessageError(message: InAppMessage | undefined, errorMessage: string): void {
        console.log(`InApp error '${errorMessage}' occurred for message ${message?.id}`);
    },
    inAppMessageShown(message: InAppMessage): void {
        console.log(`InApp message ${message?.id} has been shown`);
    },
});
```

A benefit of the new behaviour is that the method `inAppMessageCloseAction` can be called with a non-null `button` parameter. This happens when a user clicks on the Cancel button and enables you to determine which button has been clicked by reading the button text.

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
