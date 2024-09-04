---
title: Links
excerpt: Track Android App Links and iOS Universal Links in your app using the React Native SDK
slug: react-native-sdk-links
categorySlug: integrations
parentDocSlug: react-native-sdk
---

Android App Links and iOS Universal Links allow the links you send through Engagement to open directly in your mobile application without any redirects that would hinder your users' experience.

For details on how App Links and Universal Links work and how they can improve your users' experience, refer to the [Universal Links](https://documentation.bloomreach.com/engagement/docs/universal-link) section in the Campaigns documentation.

This page describes the steps required to track incoming App Links and Universal Links in your app using the React Native SDK.

## Track App Links and Universal Links

Before you can track incoming links using the SDK, you must set up your application to be able to process said links. Follow the instructions in [Linking](https://reactnative.dev/docs/linking) in the official React Native documentation.

Once your app is able to process incoming links, you can use the SDK to track them to Engagement following the instructions for [Android](#android) and [iOS](#ios) below.

> 👍
>
> When the application is opened by an App Link or Universal link while there is no session active, the newly started session will contain tracking parameters from the link.

### Android

To track Android App Links to Engagement, you must add two methods to `android/app/src/main/java/com/exponea/example/MainActivity.java` that will respond to incoming intents:

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

To track iOS Universal Links to Engagement, you must add an `application:continueUserActivity:restorationHandler` function to your `AppDelegate.m` file.

#### With ExponeaRNAppDelegate

If you have [push notifications](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-push-notifications) set up and your `AppDelegate` already extends `ExponeaRNAppDelegate`, it is sufficient to call the super method and the SDK will take care of the rest.

```objc
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
[super application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [RCTLinkingManager
          application:application
          continueUserActivity:userActivity
          restorationHandler:restorationHandler];
}
```

#### Without ExponeaRNAppDelegate

If you don't use the `ExponeaRNAppDelegate`, you must call the processing method directly.

```objc
#import <ExponeaRNAppDelegate.h>

...
...

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [Exponea continueUserActivity:userActivity];
  return [RCTLinkingManager
          application:application
          continueUserActivity:userActivity
          restorationHandler:restorationHandler];
}
```

