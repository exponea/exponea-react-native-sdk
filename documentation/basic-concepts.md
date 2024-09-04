---
title: Basic concepts
excerpt: Basic concepts of the React Native SDK and some troubleshooting tips.
slug: react-native-sdk-basic-concepts
categorySlug: integrations
parentDocSlug: react-native-sdk
---

## Basic concepts

The Exponea React Native SDK is written as a wrapper around our native [Android](https://documentation.bloomreach.com/engagement/docs/android-sdk) and [iOS](https://documentation.bloomreach.com/engagement/docs/ios-sdk) SDKs using a React Native "bridge" - an interface between native code and React Native that is asynchronous. As a result, the SDK's interface is also asynchronous; there are no properties you can access synchronously.

### Promises

Functions of the SDK return promises that can reject in case of a data format error, the native SDK not being configured, or an error inside the native SDK itself. You should always handle the errors.

#### Examples

```typescript
function cookieLogger() {
  Exponea.getCustomerCookie()
    .then(cookie => console.log(cookie))
    .catch(error => console.log(error))
}
```

```typescript
async function cookieLogger() {
  try {
    const cookie = await Exponea.getCustomerCookie()
    console.log(cookie)
  } catch (error) {
    console.log(error)
  }
}
```

### Hot reload

React Native applications code can be reloaded without restarting the native application itself. This speeds up the development process but it also means that native code usually continues to run as if nothing happened. You should only configure the SDK once. When developing with hot reload enabled, you should check `Exponea.isConfigured()` before configuring the SDK.

#### Example

```typescript
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

## Troubleshooting

Below are some common compilation issues encountered while integrating the SDK, and their most likely solutions.

### Missing Swift standard libraries (iOS-specific)

If your log contains warnings like the following:

``` 
ld: warning: Could not find or use auto-linked library 'swiftFoundation'
ld: warning: Could not find or use auto-linked library 'swiftCompatibility51'
ld: warning: Could not find or use auto-linked library 'swiftMetal'
ld: warning: Could not find or use auto-linked library 'swiftDarwin'
ld: warning: Could not find or use auto-linked library 'swiftCloudKit'
ld: warning: Could not find or use auto-linked library 'swiftUIKit'
```

It means that Swift standard libraries are missing, causing the SDK's Swift files to produce various errors.

The solution is to add a Swift file into **\<project root dir\>/ios**, for example. `File.swift`, with the following content:

```swift
import Foundation
```

You must do this in Xcode (`File` -> `New` -> `File` -> `Swift File`).

When Xcode asks you if you want to create bridging headers, we recommend you do so, since a missing bridging header can lead to compilation errors when using Xcode 12.5 (for example, [in this GitHub issue](https://github.com/exponea/exponea-react-native-sdk/issues/19)).

After cleaning the project, a build should succeed.

> 📘
>
> [Check similar issue on GitHub](https://github.com/exponea/exponea-react-native-sdk/issues/12)

### SWIFT_VERSION not specified (iOS-specific)

If `SWIFT_VERSION` is not set, there may be some Swift compilation errors in the Exponea iOS SDK in the Swift files.

For example:

`Cannot convert value of type 'T??' to specified type 'NSDictionary?'`

The SWIFT_VERSION can be specified either in the `Podfile`:

`ENV['SWIFT_VERSION'] = '5'`

Or it can be specified in the **User Defined section** in Xcode.

`SWIFT_VERSION = 5`

> 📘
>
> [Check similar issue on GitHub](https://github.com/exponea/exponea-react-native-sdk/issues/12)
