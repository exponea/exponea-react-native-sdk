# Example app

Apply the root guide as well. Commands run from the repository root unless noted. Paths in "Structure and lifecycle" are relative to `example/`; elsewhere they are relative to the repository root. Keep `example/README.md` and `documentation/example-app.md` aligned with screen/flow changes.

- `example` is a Yarn workspace and consumes the local SDK with `workspace:*`; Metro resolution lives in `example/metro.config.js`.
- `example/{src,__tests__,__mocks__,types}` are the source of truth for the mirrored copies in `example_expo/`. After changing them, run `yarn sync:expo-example` and `yarn verify:expo` (see [the Expo guide](../example_expo/AGENTS.md)). Port changes to the native helpers (`CustomerTokenStorage`, `TokenTracker`, `ExampleAuthProvider`) to `example_expo/plugins/native/` by hand.
- Do not switch to a published dependency to hide a local build failure, or treat untracked sample directories as supported workspaces.
- Install with root `yarn install --immutable`; there is one workspace lockfile. Do not create an example npm lockfile.
- Toolchain owners: `.nvmrc`, root Node engines, `example/package.json`, Android Gradle project, `example/Gemfile{,.lock}`, Podfile and Xcode project.
- Start Metro with `yarn example start`; `yarn android` uses GMS debug and `yarn ios` uses the available simulator/device.
- Running the app can contact the configured backend; automated tests use mocks.
- `@/` maps to `example/src/` in the Babel, TypeScript and Jest configs; update them together. Root tsconfig does not define that alias, so check the example separately.

## Structure and lifecycle

- `src/App.tsx` owns SDK setup, callbacks, deep links and configured/stopped state; `src/navigation/TabNavigation.tsx` owns the shell.
- `src/util/deeplink.ts` and `SdkSetupState.ts` distinguish stopped-but-browsing from returning to authentication.
- Keep callback references stable and unregister on cleanup.
- Segmentation is per instance; a successful stop releases registrations, so resume requires explicit re-registration.
- Preserve rejected-stop behavior and stop-link navigation after click tracking settles (`App.test.tsx`, `deeplink.test.ts`).
- Log viewer: `src/logging/MemoryLogger.ts`, `src/logging/NativeSdkLogger.ts` and `src/screens/LogViewScreen.tsx`.
  - Native forwarding works on Android only.
  - Preserve `App.tsx` registration/cleanup and `NativeSdkLogger.test.ts` coverage.
- `src/automation/AutomationIds.ts` defines accessibility/test IDs.
  - `AvailableAutomationIds` and `AutomationIdGaps` distinguish implemented controls from unavailable/native-owned controls.
  - Add a real control and update `__tests__/automationIds.test.ts`; a new constant alone is insufficient.
- `src/util/InAppMessagesPreset.ts` and `src/components/TrackEventModal.tsx` own event presets.
  - iOS queues the exact event until modal dismissal; Android submits immediately.
  - Preserve ordering with `TrackEventModal.test.tsx` and `InAppMessagesPreset.test.ts`.
- `InAppCbScreen.tsx` switches between Basic and Runtime Control tabs.
  - `InAppContentBlocksRuntimeControllerLab.tsx` exercises prefetch, availability, eager/lazy invalidation, timeout and identity/anonymize flows.
  - Reacquire the controller after stop/reconfigure.
  - Remount native views explicitly when testing refreshed content.
- iOS `SceneDelegate` starts React Native, restores cold-launch options through `ExponeaSceneHandler` and forwards warm links.
- AppDelegate retains push and the legacy universal-link path; preserve handled return values to avoid duplicate tracking.

## Tests

```bash
yarn test:examples --runInBand --watchman=false
yarn example exec tsc --noEmit
```

- `example/jest.config.js` selects `@react-native/jest-preset` and `example/__mocks__/react-native-exponea-sdk.js`.
- `yarn test:examples` runs this suite and its mirrored copy in `example_expo/`.
- Root Jest discovers only `src/`. Example tests do not prove native rendering or push delivery.

## Android checks

Requires Node on PATH, root JS dependencies and the selected JDK/Android SDK:

```bash
cd example/android
./gradlew :app:assembleGmsDebug
./gradlew :app:assembleHmsDebug
```

- Name the flavor: the app Gradle file chooses Google/Huawei plugins from requested task names.
- When changing push, check both flavor manifests/services and `example/android/app/src/{gms,hms}/java/exponea/example/push/TokenTracker.kt`; `example/android/app/src/main/java/exponea/example/module/TokenTrackerModule.java` exposes the manual token action.
- Keep the app's native SDK pin aligned with `android/build.gradle`.
- Adapter tests and peer-version compilation are in [the Android guide](../android/AGENTS.md).

## iOS checks

- Build/test through `example/ios` after root JS dependencies, `cd example && bundle install`, then `cd ios && bundle exec pod install`.
- See [the iOS guide](../ios/AGENTS.md) for exact simulator build and XCTest commands, prerequisites and static-framework checks.
- The Podfile selects the wrapper's `Tests` spec and the shared scheme includes `react-native-exponea-sdk-Unit-Tests`; verify that bundle actually runs.
- The placeholder app tests and a successful simulator build are not wrapper coverage.

## Credentials and manual checks

- `LocalJwtTokenGenerator` is demo-only signing. Never recommend embedded signing secrets for production or move this helper into the SDK; customers need a backend token provider.
- Keep service credentials, signing assets and entitlements out of incidental changes. Do not reuse sample credentials in tests or new docs.
- Use a suitable device/simulator for push, links, native UI and lifecycle checks; report untested scenarios.
- For content blocks/carousels exercise remount, callback replacement and custom selection.
- For identity/auth include anonymization, stop/reconfigure and token refresh.
