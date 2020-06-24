# Basic concepts
Exponea SDK is written as a wrapper around native SDKs using [native modules](https://reactnative.dev/docs/native-modules-setup). Native modules are implemented using React Native "Bridge" - an interface between native code and React Native that is asynchronous. The result is that our interface is also asynchronous, there are no properties that you can access synchronously.

## Promises
Functions of the SDK return promises that can reject in case of data format error, native SDK not being configured or error inside native SDK itself. You should always handle the errors.

### Examples
``` javascript
function cookieLogger() {
  Exponea.getCustomerCookie()
    .then(cookie => console.log(cookie))
    .catch(error => console.log(error))
}
```

``` javascript
async function cookieLogger() {
  try {
    const cookie = await Exponea.getCustomerCookie()
    console.log(cookie)
  } catch (error) {
    console.log(error)
  }
}
```

## Hot reload
React native applications code can be reloaded without restarting the native application itself, which speeds up the development process, but it also means that native code usually continues to run as if nothing happens. You should only configure the SDK once, when developing with hot reload enabled, you should check `Exponea.isConfigured()` before configuring Exponea SDK.

### Example
``` javascript
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
