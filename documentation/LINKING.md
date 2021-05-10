# Tracking Campaigns (Android App Links/Universal links)
The official [React native documentation](https://reactnative.dev/docs/linking) describes how to set up your application and how to process incoming link, we just need to add tracking to Exponea.
> When the application is opened by App Link/Universal link and there is no session active, started session will contain tracking parameters from the link.

## iOS
React native linking requires you to add `application:continueUserActivity:restorationHandler` function to your `AppDelegate.m` file.

### With ExponeaAppDelegate
If you have [push notifications](./PUSH_IOS.md) set up and your `AppDelegate` already extends `ExponeaAppDelegate`, just call super method and the SDK will do the rest.
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

### Without ExponeaAppDelegate
If you don't use the ExponeaAppDelegate, you can call the processing method directly.
```objc
#import <ExponeaDelegate.h>

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

## Android
Android linking works automagically without any changes required. To enable Exponea tracking you need to add 2 methods to the `android/app/src/main/java/com/exponea/example/MainActivity.java` that will respond to incoming intents.
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
