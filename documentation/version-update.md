---
title: React Native SDK version update guide
slug: react-native-sdk-version-update
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk-release-notes
content:
  excerpt: Update Exponea React Native SDK in your app to a new version
---

This guide will help you upgrade your Exponea SDK to the latest major version.

## Update to version 4.2.0 or higher

Version 4.2.0 updates the native iOS SDK to version 5.0.0, which adds support for the UIKit scene-based lifecycle (UIScene). Apple requires the UIScene lifecycle for apps built with the iOS 27 SDK. Apps that don't adopt it won't launch. Apps built with an older SDK keep working without changes.

> ❗️
>
> If you add `UIApplicationSceneManifest` to your `Info.plist` without the changes below, your app launches, but the SDK no longer tracks universal link campaign clicks and the JavaScript `Linking` API doesn't receive links.

### 1. Native iOS SDK 5.0.0

The native iOS SDK 5.0.0 raises its minimum iOS deployment target to 15.0 for Xcode 27 compatibility. The React Native SDK still requires iOS 15.1 or higher. After you update, run `pod install` in your `ios` folder.

### 2. UIScene lifecycle adoption

To migrate your app to the UIScene lifecycle:

1. Add `UIApplicationSceneManifest` to your `Info.plist` with a `UIWindowSceneSessionRoleApplication` configuration that points to your `SceneDelegate` (`$(PRODUCT_MODULE_NAME).SceneDelegate`).
2. Create a `SceneDelegate` that subclasses `ExponeaSceneDelegate` from the native iOS SDK, and call `super` from `scene(_:willConnectTo:options:)` and `scene(_:continue:)`. This tracks universal links on cold and warm launch.
3. Move the `UIWindow` creation and `startReactNative(withModuleName:in:launchOptions:)` from `application(_:didFinishLaunchingWithOptions:)` to `scene(_:willConnectTo:options:)`. Pass `ExponeaSceneHandler.launchOptions(from: connectionOptions)` as `launchOptions` so that `Linking.getInitialURL()` returns the launch URL on cold launch.
4. Forward links to `RCTLinkingManager` from `scene(_:continue:)` (universal links) and `scene(_:openURLContexts:)` (custom URL schemes).
5. Keep push notification handling in your `AppDelegate`, including setting the `UNUserNotificationCenter` delegate in `application(_:didFinishLaunchingWithOptions:)`.
6. If you keep `application(_:continue:restorationHandler:)` in your `AppDelegate`, call `Exponea.shared.handleUniversalLink(_:)` and return `true` after your code handles the link. Otherwise, the SDK tracks universal links opened from in-app messages and content blocks twice.

For code samples, see [Universal links for iOS](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-links#ios). For a complete implementation, see the example app's [`SceneDelegate.swift`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/ios/ExponeaExample/SceneDelegate.swift).

### 3. iOS push notification tracking requires `AppDelegate` calls

The SDK no longer enables the native iOS SDK's automatic push notification tracking through method swizzling. In versions 4.0.0 to 4.1.0, swizzling ran alongside the required `AppDelegate` calls, so the SDK tracked every push notification open twice and ran the push notification action twice.

The SDK now tracks push notification tokens and opens only through the `Exponea.shared.handlePushNotificationToken` and `Exponea.shared.handlePushNotificationOpened` calls in your `AppDelegate`. These calls have been required since version 3.0.0. If your app doesn't make them yet, add them as described in [iOS push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-ios#step-2-implement-application-delegate-methods). Without them, the SDK doesn't track push notification tokens or opens.

## Update from version 2.x.x to 3.x.x

Version 3.0.0 is a major release that rewrites the SDK to use React Native's [TurboModules](https://reactnative.dev/docs/turbo-modules) architecture. The public API is almost fully compatible with version 2.x.x, with a few breaking changes that may require minor code adjustments. Before upgrading, review the following changes and requirements.

### 1. TurboModules (New Architecture) requirement

SDK 3.0.0 is built on TurboModules, the new standard that React Native has been transitioning to since version 0.82. The JavaScript Bridge approach is no longer supported in this version.

- **Your app already uses TurboModules (New Architecture):** You should be able to upgrade to SDK 3.0.0 with minimal changes. Review the breaking changes below for any required code adjustments.
- **Your app still uses the old architecture (JavaScript Bridge):** You must migrate your application to the New Architecture before upgrading to SDK 3.0.0. Refer to the [React Native New Architecture migration guide](https://reactnative.dev/docs/new-architecture-intro) for instructions.

### 2. React Native and Node.js version requirements

- **React Native:** 0.83.0 or higher (supported up to 0.85.2)
- **Node.js:** 20.19.4 or higher

### 3. LogLevel.DEBUG renamed to LogLevel.DBG

The `LogLevel.DEBUG` enum member has been renamed to `LogLevel.DBG` and its wire value changed from `'DEBUG'` to `'DBG'` to avoid a conflict with the iOS `#define DEBUG` preprocessor macro.

- Code referencing `LogLevel.DEBUG` **must be updated** to `LogLevel.DBG`.
- Code that **hardcodes the string** `'DEBUG'` (for example, storing it in a database or comparing against it) must be updated to `'DBG'`.
- On iOS, `'DBG'` maps to `.verbose` (the native iOS SDK has no separate debug level).

### 4. InAppMessageCallback type rename

The callback interface has been internally renamed from `InAppMessageCallback` to `InAppMessageCallbackImpl`. A backward-compatible type alias is exported:

```typescript
export type { InAppMessageCallbackImpl as InAppMessageCallback };
```

Existing imports of `InAppMessageCallback` continue to resolve. No code changes are required unless you reference the interface name directly in type declarations.

### 5. Method signature changes (null vs undefined)

The following in-app message tracking methods now accept `string | null` instead of `string | undefined` for `buttonText` and `buttonUrl` parameters, driven by TurboModule codegen requirements:

```typescript
// Before (2.x.x)
trackInAppMessageClick(message, buttonText: string | undefined, buttonUrl: string | undefined): Promise<void>
trackInAppMessageClose(message, buttonText: string | undefined, interaction: boolean): Promise<void>

// After (3.0.0)
trackInAppMessageClick(message, buttonText: string | null, buttonUrl: string | null): Promise<void>
trackInAppMessageClose(message, buttonText: string | null, interaction: boolean): Promise<void>
```

The same change applies to the `WithoutTrackingConsent` variants of these methods. Update any calls that pass `undefined` to pass `null` instead.

### 6. requestPushAuthorization replaces requestIosPushAuthorization

`requestIosPushAuthorization()` is deprecated. Replace it with the new cross-platform `requestPushAuthorization()` method, which works on both iOS and Android:

```typescript
// Before (2.x.x)
Exponea.requestIosPushAuthorization()
  .then((accepted) => console.log(`Push notifications ${accepted ? 'accepted' : 'rejected'}`));

// After (3.0.0)
Exponea.requestPushAuthorization()
  .then((accepted) => console.log(`Push notifications ${accepted ? 'accepted' : 'rejected'}`));
```

### Related documentation

- [SDK configuration](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration)
- [Push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications)
- [Tracking](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking)
- [Segmentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-segmentation)
- [In-app messages](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-in-app-messages)

## Update to version 2.5.0 or higher

SDK versions 2.5.0 and higher support multiple mobile applications within a single {user.mkg} project.

This update introduces two major changes:

### 1. **Application ID configuration**

Each mobile application integrated with the SDK can now have its own unique `applicationId`. This identifier distinguishes between different applications within the same project.

**When to configure Application ID:**

- **Multiple mobile apps:** You must specify a unique `applicationId` for each app in the SDK configuration. The value must match the Application ID configured in {user.mkg} under **Project Settings > Campaigns > Channels > Push Notifications.**
- **Single mobile app:** If you use only one mobile application, you don't need to set `applicationId`. The SDK uses the default value `default-application` automatically.

Learn more about [Configuration for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-configuration) and [Initial setup for React Native SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#configure-application-id).

## Update from version 1.x.x to 2.x.x

Updating Exponea SDK to version 2 or higher requires making some changes related to in-app messages callback implementations.

The `Exponea.setInAppMessageCallback` API was changed and simplified, so you have to migrate your implementation of in-app message action and close handling. This migration requires to implement `InAppMessageCallback` interface.

Your implementation may have been similar to the following example:

```typescript
Exponea.setInAppMessageCallback(false, true, (action) => {
  if (action.button) {
    // is click action
    onMessageClick(message, button);
  } else {
    // is close action
    onMessageClose(message, interaction);
  }
});
```

To update to version 2 of the SDK, you must implement the `InAppMessageCallback` interface and refactor your code as follows:

```typescript
Exponea.setInAppMessageCallback({
  overrideDefaultBehavior: false,
  trackActions: true,
  inAppMessageClickAction(
    message: InAppMessage,
    button: InAppMessageButton
  ): void {
    console.log(
      `InApp action ${button.url} received for message ${message.id}`
    );
    onMessageClick(message, button);
  },
  inAppMessageCloseAction(
    message: InAppMessage,
    button: InAppMessageButton | undefined,
    interaction: boolean
  ): void {
    console.log(
      `InApp message ${message.id} closed by ${button?.text} with interaction: ${interaction}`
    );
    onMessageClose(message, interaction);
  },
  inAppMessageError(
    message: InAppMessage | undefined,
    errorMessage: string
  ): void {
    console.log(
      `InApp error '${errorMessage}' occurred for message ${message?.id}`
    );
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
