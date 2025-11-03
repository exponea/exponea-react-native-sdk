---
title: Configuration
excerpt: Full configuration reference for the React Native SDK
slug: react-native-sdk-configuration
categorySlug: integrations
parentDocSlug: react-native-sdk-setup
---

This page provides an overview of all configuration parameters for the SDK. In addition to the universal parameters, there are Android-specific and iOS-specific parameters.

> 📘
>
> Refer to [Initialize the SDK](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-setup#initialize-the-sdk) for instructions.

## Configuration parameters

The following parameters are specified in an `Configuration` object. Refer to [src/Configuration.ts](https://github.com/exponea/exponea-react-native-sdk/blob/main/src/Configuration.ts) for the complete interface definition.

* `projectToken` **(required)**
   * Your project token. You can find this in the Engagement web app under `Project settings` > `Access management` > `API`.

* `authorizationToken` **(required)**
   * Your Engagement API key.
   * The token must be an Engagement **public** key. See [Mobile SDKs API Access Management](https://documentation.bloomreach.com/engagement/docs/mobile-sdks-api-access-management) for details.
   * For more information, refer to [Engagement API documentation](https://documentation.bloomreach.com/engagement/reference/welcome#access-keys).

* `baseUrl`
  * Your API base URL which can be found in the Engagement web app under `Project settings` > `Access management` > `API`.
  * Default value `https://api.exponea.com`.
  * If you have custom base URL, you must set this property.

* `projectMapping`
  * If you need to track some events to a different Engagement project, you can define a mapping between event types and Engagement projects.
  * An event is always tracked to the default project and any projects it is mapped to.
  * Example:
    ```typescript
    projectMapping: {
      [EventType.BANNER]: [
        {
          projectToken: 'other-project-token',
          authorizationToken: 'other-auth-token',
        },
      ],
    }
    ```
  
* `defaultProperties`
  * A list of properties to include in all tracking events.
  * You can change these properties at runtime by calling `Exponea.setDefaultProperties()`.

* `allowDefaultCustomerProperties`
  * Flag to apply the `defaultProperties` list to `identifyCustomer` tracking events.
  * Default value: `true`

* `automaticSessionTracking`
  * Flag to control the automatic tracking of `session_start` and `session_end` events.
  * Default value: `true`

* `sessionTimeout`
  * The session is the actual time spent in the app. It starts when the app is launched and ends when the app goes into the background.
  * When the application goes into the background, the SDK doesn't track the end of the session right away but waits a bit for the user to come back before doing so. You can configure the timeout by setting this property.
  * Read more about [tracking sessions](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-tracking#session).
  * Default value: `60`

* `pushTokenTrackingFrequency`
  * Indicates the frequency with which the SDK should track the push notification token to Engagement.
  * Default value: `ON_TOKEN_CHANGE`
  * Possible values:
    * `ON_TOKEN_CHANGE` - tracks push token if it differs from a previously tracked one
    * `EVERY_LAUNCH` - always tracks push token
    * `DAILY` - tracks push token once per day

* `flushMaxRetries`
  * Controls how many times the SDK should attempt to flush an event before aborting. Useful for example in case the API is down or some other temporary error happens.
  * The SDK will consider the data to be flushed if this number is exceeded and delete the data from the queue.
  * Default value: `10`

* `advancedAuthEnabled`
  * If set, advanced authorization is used for communication with the Engagement APIs listed in [Customer token authorization](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization#customer-token-authorization).
  * Refer to the [authorization documentation](https://documentation.bloomreach.com/engagement/docs/react-native-sdk-authorization) for details.

* `inAppContentBlockPlaceholdersAutoLoad`
  * Automatically load the contents of in-app content blocks assigned to these Placeholder IDs.

* `manualSessionAutoClose`
  * Determines whether the SDK automatically tracks `session_end` for sessions that remain open when `Exponea.trackSessionStart()` is called multiple times in manual session tracking mode.
  * Default value: `true`
  
* `applicationId`
  * This `applicationId` defines a unique identifier for the mobile app within the Engagement project. Change this value only if your Engagement project contains and supports multiple mobile apps.
  * This identifier distinguishes between different apps in the same project.
  * Your `applicationId` value must be the same as the one defined in your Engagement project settings.
  * If your Engagement project supports only one app, skip the `applicationId` configuration. The SDK will use the default value automatically.
  * Must be in a specific format, see rules:
    * Starts with one or more lowercase letters or digits
    * Additional words are separated by single hyphens or dots
    * No leading or trailing hyphens or dots
    * No consecutive hyphens or dots
    * Maximum length is 50 characters
    * E.g. `com.example.myapp`, `com-example-myapp`, `my-application1`
  * Default value: `default-application`

* `android`
  * `AndroidConfiguration` object containing [Android-specific configuration parameters](#android-specific-configuration-parameters).

* `ios`
  * `IOSConfiguration` object containing [iOS-specific configuration parameters](#ios-specific-configuration-parameters).

### Android-specific configuration parameters

The following parameters are specified in an `AndroidConfiguration` object. Refer to [src/Configuration.ts](https://github.com/exponea/exponea-react-native-sdk/blob/main/src/Configuration.ts) for the complete interface definition.

* `automaticPushNotifications`
  * By default, the SDK will set up a Firebase service and try to process push notifications sent from the Engagement platform automatically. You can opt out by setting this to `false`.
  * Default value: `true`

* `pushIcon`
  * Android resource ID of the icon to be used for push notifications.

* `pushIconResourceName`
  * Android resource name of the icon to be used for push notifications. For example, if file `push_icon.png` is placed in your drawable of mipmap resources folder, use the filename without extension as a value.

* `pushAccentColor`
  * Accent color of push notification icon and buttons, specified as Color ARGB integer.

* `pushAccentColorRGBA`
  * Accent color of push notification icon and buttons, specified by RGBA channels separated by comma.
  * For example, to use the color blue, the string `"0, 0, 255, 255"` should be entered.

* `pushAccentColorName`
  * Accent color of push notification icon and buttons, specified by resource name.
  * Any color defined in R class can be used.
  * For example, if you defined your color as a resource `<color name="push_accent_color">#0000ff</color>`, use `push_accent_color` as a value for this parameter.

* `pushChannelName`
  * Name of the channel to be created for the push notifications.
  * Only available for API level 26+. Refer to https://developer.android.com/training/notify-user/channels for details.

* `pushChannelDescription`
  * Description of the channel to be created for the push notifications.
  * Only available for API level 26+. Refer to https://developer.android.com/training/notify-user/channels for details.

* `pushChannelId`
  * Channel ID for push notifications.
  * Only available for API level 26+. Refer to https://developer.android.com/training/notify-user/channels for details.

* `pushNotificationImportance`
  * Notification importance for the notification channel.
  * Only available for API level 26+. Refer to https://developer.android.com/training/notify-user/channels for details.

* `httpLoggingLevel`
  * Level of HTTP request/response logging.

### iOS-specific configuration parameters

The following parameters are specified in an `IOSConfiguration` object. Refer to [src/Configuration.ts](https://github.com/exponea/exponea-react-native-sdk/blob/main/src/Configuration.ts) for the complete interface definition.

* `requirePushAuthorization`
  * The SDK can check push notification authorization status ([Apple documentation](https://developer.apple.com/documentation/usernotifications/unnotificationsettings/1648391-authorizationstatus)) and only track the push token if the user is authorized to receive push notifications.
  * When disabled, the SDK will automatically register for push notifications on app start and track the token to Engagement so your app can receive silent push notifications.
  * When enabled, the SDK will automatically register for push notifications if the app is authorized to show push notifications to the user.
  * Unless you're only using silent notifications, keep the default value `true`.

* `appGroup`
  * App group used for communication between the main app and notification extensions. This is a required field for rich push notification setup.
