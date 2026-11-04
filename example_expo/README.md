# Expo 57 example

This is a source-only Expo development-build mirror of `../example`. Expo Go is
not supported because the Bloomreach SDK contains native modules. Expo support,
including the SDK's config plugin, is experimental.

This app pins React Native 0.86.3 for Expo SDK 57; `../example` pins 0.87.0
for bare React Native. Run `npx expo install --check` to check Expo dependency
alignment. See [Expo setup](../documentation/expo.md) for build requirements.

`src`, `__tests__`, `__mocks__` and `types` are generated copies of the same
folders in `../example`; only the iOS app group in `src/App.tsx` differs. Don't
edit them here: change `../example`, then run `yarn sync:expo-example` from the
repository root. `node scripts/verify-expo-package.js` fails if they drift.

## Intentional differences

`src`, `__tests__`, `__mocks__` and `types` mirror `../example`. Everything else in
this folder belongs to the Expo app and is never synced. Inside the mirrored
folders, an intentional difference must be declared in
`scripts/sync-expo-example.js`, or the sync and the drift check treat it as a
mistake:

- **Small text difference** in a shared file: add an entry to `SUBSTITUTIONS`.
  The iOS app group in `src/App.tsx` is the only one today.
- **Expo-only file, or an Expo variant of a whole file**: add its path, relative
  to this folder, to `EXPO_OWNED_FILES`. The sync never overwrites or deletes
  it, and the drift check skips it.

The sync refuses to overwrite or delete a file it didn't write and that Git
can't restore, such as an untracked file or one with uncommitted changes. It
lists those files and changes nothing. Move the change to `../example`, declare
it as above, or rerun with `yarn sync:expo-example --force` to discard it.

## Run

From the repository root:

1. Run `yarn` to install dependencies.
2. Optionally configure push notifications as described below.
3. Run `yarn example_expo prebuild` to generate the native projects.
4. Run `yarn example_expo android` or `yarn example_expo ios`.
5. For later launches, run `yarn example_expo start`.

The generated `android/` and `ios/` folders are ignored by Git. Keep native
changes in the config plugins and re-run prebuild after changing configuration.

## Push notifications

The app can run without push credentials. To test push on a physical device:

- **Android:** put `google-services.json` in this folder, registered for package
  `com.bloomreach.sdk.example.expo`. The bare example's file is registered for
  a different package and cannot be reused. `app.config.js` sets
  `android.googleServicesFile` when the file exists. Without it, Android push
  will not work.
- **iOS:** configure Apple signing and APNs for bundle identifier
  `com.bloomreach.sdk.example.expo`, including the notification extensions and
  app group `group.com.bloomreach.sdk.example.expo`. A `GoogleService-Info.plist`
  is only needed for Firebase on iOS; it is not required for APNs token
  registration.

Configure the matching [Firebase](https://documentation.bloomreach.com/engagement/docs/android-sdk-firebase#configure-the-firebase-cloud-messaging-integration-in-usermkg)
or [APNs](https://documentation.bloomreach.com/engagement/docs/ios-sdk-configure-apns)
integration in Bloomreach. Supply build files locally or through your build
service's file storage. For EAS extension signing, follow [Expo setup](../documentation/expo.md#eas-signing-for-rich-push).

## Native helpers

`plugins/withExampleNativeHelpers.js` copies `plugins/native/android` into the
generated Android project and `plugins/native/ios` into
`ios/ExponeaExampleHelpers`. These are the example app's own native modules
(`CustomerTokenStorage`, `TokenTracker`) and the `ExampleAuthProvider`,
mirrored from `../example` with the Expo package name applied. Change them
there, then re-run prebuild.
