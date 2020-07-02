# Android Push notification setup
>We rely on our native SDK to do push tracking. For more complex scenarios(multiple push providers) please can check [native Android SDK Push notification documentation](https://github.com/exponea/exponea-android-sdk/blob/develop/Documentation/PUSH.md).

## Integrating Firebase to your project
To send/receive push notifications you have to setup Firebase project. [Official Firebase documentation](https://firebase.google.com/docs/android/setup#console) describes this process. You'll need to create a project in Firebase console, add generated `google-services.json` to your app and update gradle scripts.

> When following the Firebase documentation, the root of your Android project is `/android`

#### Checklist:
 - `google-services.json` file downloaded from Firebase console is in the **android/app** folder of your Android project e.g. *android/app/google-services.json*
 - your **android/app** folder gradle build file(*android/app/build.gradle*) contains `apply plugin: 'com.google.gms.google-services'`
 - your **android** folder gradle build file(*android/build.gradle*) has `classpath 'com.google.gms:google-services:X.X.X'` listed in build script dependencies.
 
## Setting the Firebase server key in the Exponea web app
You'll need to set the Firebase server key so Exponea can use it to send push notification to your application. Our native Android has a [guide describing how to do so](https://github.com/exponea/exponea-android-sdk/blob/develop/Guides/FIREBASE.md).

## That's it
After these steps you should be able to receive push notifications from Exponea. To learn how to send one, check a [Sending Push notifications guide](./PUSH_SEND.md).

## Deeplinking
You can use `Exponea.setPushOpenedListener()` to define a listener that will respond to push notifications. In case you'd like to use deeplinking, you'll need to update your `AndroidManifest` in `android/src/main` a bit.

### Set activity to to single task launch mode
By default Android will launch a new activity for your application when deeplink is opened, you want to override this by setting `android:launchMode="singleTask"` for your main activity.
``` xml
<activity
  android:name=".MainActivity"
  ...
  android:launchMode="singleTask"
>
```

### Define an intent filter
You'll have to define an intent filter that can respond to url you define when creating push notification. You can either use a custom scheme, or an URL. You can find more information in official [Android documentation](https://developer.android.com/training/app-links/deep-linking#adding-filters).
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