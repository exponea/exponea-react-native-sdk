
# Configuration
Before using most of the SDK functionality, you'll need to configure Exponea to connect it to backend application.

> You can find your credentials in [Exponea web application](./EXPONEA_CONFIGURATION.md)

Minimal required configuration is simple:
``` typescript
import Exponea from 'react-native-exponea-sdk'

Exponea.configure({
  projectToken: "your-project-token",
  authorizationToken: "your-authorization-token",
  // default baseUrl value is https://api.exponea.com
  baseUrl: "https://your-exponea-instance.com" 
}).catch(error => console.log(error))
```

## Only configure Exponea once
React native applications code can be reloaded without restarting the native application itself, which speeds up the development process, but it also means that native code usually continues to run as if nothing happens. You should only configure the SDK once, when developing with hot reload enabled, you should check Exponea.isConfigured() before configuring Exponea SDK.

Example
``` typescript
async function configureExponea(configuration: Configuration) {
  try {
    if (!await Exponea.isConfigured()) {
      Exponea.configure(configuration)
    } else {
      console.log("Exponea SDK already configured.")
    }
  } catch (error) {
    console.log(error)
  }
}
```

## Configuration object
You can see the Typescript definition for Configuration object at [src/Configuration.ts](../src/Configuration.ts)

* **projectToken** Default project token used for communication with Exponea backend.

* **authorizationToken** Default authorization token used for communication with Exponea backend. Make sure the token belongs to **public** group and that it has all permissions you need in your application.

* **baseUrl** Base url of your Exponea deployment. Default is https://api.exponea.com

* **projectMapping** In case you would like to track some events to a different Exponea project, you can define mapping between event types and Exponea projects. An event is always tracked to the default project + all projects based on this mapping.
  ``` typescript
  projectMapping: {
    [EventType.BANNER]: [
      {
        projectToken: 'other-project-token',
        authorizationToken: 'other-auth-token',
      },
    ],
  }
  ```
* **defaultProperties** You can define default properties that will be added to every event you track to Exponea. 
  Useful for constants like application settings.
  You can change these properties at runtime calling `Exponea.setDefaultProperties()`
  
* **flushMaxRetries** Events are tracked into Exponea SDK internal database and flushed once the device has internet connection. This process may still fail, this property allows you to set number of retries in case that happens.

* **sessionTimeout** When the application is closed, the SDK doesn't track end of session right away, but waits a bit for the user to come back before doing so. You can configure the timeout by setting this property.

* **automaticSessionTracking** By default, the SDK tracks sessions for you. You can opt-out and implement your own session tracking.

* **pushTokenTrackingFrequency** You can define your policy for tracking push notification token. Default value `ON_TOKEN_CHANGE` is recommended.

* **allowDefaultCustomerProperties** Flag to apply `defaultProperties` list to `identifyCustomer` tracking event. Default value `true` is used if is not defined.

* **advancedAuthEnabled** If true, Customer Token authentication is used for communication with BE for API listed in [Authorization](./AUTHORIZATION.md) document.

* **android** Specific configuration for Android

* **ios** Specific configuration for iOS

### Android specific configuration
* **automaticPushNotifications** By default Exponea SDK will setup a Firebase service and try to automatically process push notifications coming from Exponea backend. You can opt-out setting this to `false`.

* **pushIcon** Android resource id of the icon to be used for push notifications.

* **pushIconResourceName** Android resource name of the icon to be used for push notifications. For example, if file `push_icon.png` is placed in your drawable of mipmap resources folder, use the filename without extension as a value.

* **pushAccentColor** Accent color of push notification icon and buttons, specified as Color ARGB integer

* **pushAccentColorRGBA** Accent color of push notification icon and buttons, specified by RGBA channels separated by comma. For example, to use the colour blue, the string `"0, 0, 255, 255"` should be entered.

* **pushAccentColorName** Accent color of push notification icon and buttons, specified by resource name. Any color defined in R class can be used. For example, if you defined your color as a resource
`<color name="push_accent_color">#0000ff</color>`, use `push_accent_color` as a value for this parameter.

* **pushChannelName?** Channel name for push notifications. Only for API level 26+

* **pushChannelDescription** Channel description for push notifications. Only for API level 26+

* **pushChannelId** Channel ID for push notifications. Only for API level 26+

* **pushNotificationImportance** Notification importance for the notification channel. Only for API level 26+

* **httpLoggingLevel** Level of HTTP request/response logging

### iOS specific configuration
* **requirePushAuthorization** If true, push notification registration and push token tracking is only done if the device is authorized to display push notifications. Unless you're using silent notifications, keep the default value `true`.

* **appGroup** App group used for communication between main app and notification extensions. This is a required field for Rich push notification setup


## Exponea properties
  
### Logging
When debugging, it's useful to set Exponea SDK to `VERBOSE` logging. You can do so by setting `Exponea.setLogLevel(LogLevel.VERBOSE)`
  
### Flushing
Learn more about flushing setup in **Flushing data** section of [Tracking guide](./TRACKING.md#flushing-data)
