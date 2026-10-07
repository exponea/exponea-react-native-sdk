---
title: Links for React Native SDK
slug: react-native-sdk-links
category:
  uri: /branches/2/categories/guides/Developers
parent:
  uri: react-native-sdk
content:
  excerpt: >-
    Track Android App Links and iOS Universal Links in your app using the React
    Native SDK
---

Android App Links and iOS Universal Links allow the links you send through {user.mkg} to open directly in your mobile application without any redirects that would hinder your users' experience.

For details on how App Links and Universal Links work and how they can improve your users' experience, refer to the [Universal Links](https://documentation.bloomreach.com/engagement/docs/universal-link) section in the Campaigns documentation.

This page describes the steps required to track incoming App Links and Universal Links in your app using the React Native SDK.

## Track App Links and Universal Links

Before you can track incoming links using the SDK, you must set up your application to be able to process said links. Follow the instructions in [Linking](https://reactnative.dev/docs/linking) in the official React Native documentation.

Once your app is able to process incoming links, you can use the SDK to track them to {user.mkg} following the instructions for [Android](#android) and [iOS](#ios) below.

> 👍
>
> When the application is opened by an App Link or Universal link while there is no session active, the newly started session will contain tracking parameters from the link.

### Android

To track Android App Links to {user.mkg}, you must add two methods to `android/app/src/main/java/com/exponea/example/MainActivity.java` that will respond to incoming intents:

```java
package com.exponea.example;

import android.content.Intent;
import android.os.Bundle;
import android.os.PersistableBundle;
import androidx.annotation.Nullable;
import com.exponea.ExponeaModule;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "example";
  }

 // Add following 2 methods:
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    ExponeaModule.Companion.handleCampaignIntent(getIntent(), getApplicationContext());
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onNewIntent(Intent intent) {
    ExponeaModule.Companion.handleCampaignIntent(intent, getApplicationContext());
    super.onNewIntent(intent);
  }
}
```

> ❗️
>
> NOTE: Calling `ExponeaModule.Companion.handleCampaignIntent` is allowed before SDK initialization in case the SDK was previously initialized. In such a case, `ExponeaModule.Companion.handleCampaignIntent` will track events with the configuration of the last initialization. Please consider to do SDK initialization in `ReactActivity::onCreate` before SDK initialization to apply a fresh configuration in case of an update of your application .

### iOS

To track iOS Universal Links to {user.mkg}, forward the `NSUserActivity` that the system delivers to the SDK. Which delegate receives it depends on your app's lifecycle:

- **UIScene lifecycle** (your `Info.plist` contains `UIApplicationSceneManifest`): UIKit delivers universal links and custom URL schemes to your `SceneDelegate`. It doesn't call `AppDelegate.application(_:continue:restorationHandler:)` for universal links. Apps built with the iOS 27 SDK must adopt this lifecycle.
- **Legacy AppDelegate lifecycle** (no scene manifest): UIKit delivers universal links and custom URL schemes to your `AppDelegate`.

> ❗️
>
> The SDK version 3.0.0 removes the `ExponeaRNAppDelegate` base class that handled this through a `super` call. Track the campaign click directly, as shown below.

For details about the native behavior, see the [native iOS SDK universal links documentation](https://documentation.bloomreach.com/engagement/docs/ios-sdk-universal-links).

#### UIScene lifecycle (recommended for iOS 27+)

Subclass `ExponeaSceneDelegate` from the native iOS SDK and call `super`. It tracks universal links on cold launch (from `connectionOptions.userActivities`) and on warm launch (`scene(_:continue:)`).

A React Native app also needs to:

- **Start React Native from the scene.** Create the window from the `UIWindowScene` and start React Native in `scene(_:willConnectTo:options:)` instead of `application(_:didFinishLaunchingWithOptions:)`.
- **Pass launch options rebuilt from `connectionOptions`.** Under UIScene, the `launchOptions` in `didFinishLaunchingWithOptions` don't contain the launch URL, so `Linking.getInitialURL()` returns `null` on cold launch. Use `ExponeaSceneHandler.launchOptions(from:)` to rebuild them.
- **Forward links to `RCTLinkingManager`.** Pass universal links from `scene(_:continue:)` and custom URL schemes from `scene(_:openURLContexts:)` so the JavaScript `Linking` API receives them.

```swift
import UIKit
import React
import ExponeaSDK
import class react_native_exponea_sdk.ExponeaSceneHandler

class SceneDelegate: ExponeaSceneDelegate {
  var window: UIWindow?

  override func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    super.scene(scene, willConnectTo: session, options: connectionOptions) // cold launch tracking

    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    factory.startReactNative(
      withModuleName: "YourAppName",
      in: window,
      launchOptions: ExponeaSceneHandler.launchOptions(from: connectionOptions)
    )
  }

  override func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    super.scene(scene, continue: userActivity) // warm launch tracking
    RCTLinkingManager.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
      if let sourceApplication = context.options.sourceApplication {
        options[.sourceApplication] = sourceApplication
      }
      RCTLinkingManager.application(UIApplication.shared, open: context.url, options: options)
    }
  }
}
```

Register the scene delegate in your `Info.plist`:

```xml
<key>UIApplicationSceneManifest</key>
<dict>
  <key>UIApplicationSupportsMultipleScenes</key>
  <false/>
  <key>UISceneConfigurations</key>
  <dict>
    <key>UIWindowSceneSessionRoleApplication</key>
    <array>
      <dict>
        <key>UISceneConfigurationName</key>
        <string>Default Configuration</string>
        <key>UISceneDelegateClassName</key>
        <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
      </dict>
    </array>
  </dict>
</dict>
```

Keep creating `RCTReactNativeFactory` and handling push notifications in your `AppDelegate`. For a complete implementation, see the example app's [`SceneDelegate.swift`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/ios/ExponeaExample/SceneDelegate.swift) and [`AppDelegate.swift`](https://github.com/exponea/exponea-react-native-sdk/blob/main/example/ios/ExponeaExample/AppDelegate.swift).

> 📘
>
> Use `import class react_native_exponea_sdk.ExponeaSceneHandler` instead of importing the whole module. Some of the module's public types, such as `ExponeaError`, share names with types in `ExponeaSDK`, which makes them ambiguous.

If you can't subclass `ExponeaSceneDelegate`, call `Exponea.shared.handleUniversalLink(_:)` manually in both callbacks:

```swift
func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
  if let userActivity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }) {
    Exponea.shared.handleUniversalLink(userActivity)
  }
  // ... start React Native as shown above
}

func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
  Exponea.shared.handleUniversalLink(userActivity)
  RCTLinkingManager.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
}
```

> ❗️
>
> If your scene delegate implements `scene(_:continue:)` for another reason, such as Handoff, it must still call `super` or `Exponea.shared.handleUniversalLink(_:)`. When your `AppDelegate` doesn't handle universal links, the SDK opens universal links from in-app messages and content blocks by calling your scene delegate's `scene(_:continue:)`. If that method doesn't forward the link to the SDK, the SDK doesn't track the click and the link doesn't open.

#### Legacy AppDelegate lifecycle

If your app doesn't use `UIApplicationSceneManifest`, implement `application(_:continue:restorationHandler:)` in your `AppDelegate.swift` file:

```swift
import ExponeaSDK

func application(
  _ application: UIApplication,
  continue userActivity: NSUserActivity,
  restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
) -> Bool {
  let tracked = Exponea.shared.handleUniversalLink(userActivity)
  let linked = RCTLinkingManager.application(
    application,
    continue: userActivity,
    restorationHandler: restorationHandler
  )
  return linked || tracked
}
```

`Exponea.shared.handleUniversalLink(_:)` tracks the campaign click only for `NSUserActivityTypeBrowsingWeb` activities that have a URL.

> ❗️
>
> If you keep this method after you migrate to UIScene, return `true` after your code handles the link. The SDK calls this method first when it opens a universal link from an in-app message or content block. If it returns `false`, the SDK also delivers the link to your scene delegate, which tracks the click a second time.
