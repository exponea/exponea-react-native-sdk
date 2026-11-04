# iOS adapter

Apply the root guide as well. Paths below are relative to the repository root.

- Native dependency/deployment owners: root podspec, `example/ios/Podfile{,.lock}` and example Xcode project. Ruby tools: `example/Gemfile{,.lock}`.
- Check the core SDK and both notification-extension pins together.
- The podspec minimum and example deployment target are separate settings. The Expo config plugin sets a third one for its extension targets (`IPHONEOS_DEPLOYMENT_TARGET` in `app.plugin.js`).
- For Expo apps, the config plugin adds its own notification-extension targets from `plugin/ios/` (with `ExponeaSDK-Notifications` pods pinned to the podspec's `ExponeaSDK` version) and patches the Expo-generated Swift `AppDelegate`. Changes to the `example/ios` extensions or push forwarding don't reach Expo apps; update `plugin/ios/` and `app.plugin.js` separately.

## Commands

There is no standalone `ios/Podfile` or Xcode project. Requires full Xcode, an installed simulator runtime, Node, Ruby/Bundler and root JS dependencies. From root:

```bash
(cd example && bundle install && cd ios && bundle exec pod install)
cd example/ios
xcodebuild -list -workspace ExponeaExample.xcworkspace
xcodebuild -showdestinations -workspace ExponeaExample.xcworkspace -scheme ExponeaExample
xcodebuild -workspace ExponeaExample.xcworkspace -scheme ExponeaExample -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
xcodebuild -workspace ExponeaExample.xcworkspace -scheme ExponeaExample -configuration Debug -destination 'platform=iOS Simulator,id=<SIMULATOR_UDID>' -only-testing:react-native-exponea-sdk-Unit-Tests CODE_SIGNING_ALLOWED=NO test
```

- Replace `<SIMULATOR_UDID>` with an available destination. For a focused suite, append `/ExponeaBridgeSegmentationTests` to the `-only-testing` value.
- Verify nonzero discovery; a build or placeholder app test does not establish wrapper coverage.
- No SwiftLint/Quick command or SPM package is configured for this wrapper. Native SDK SPM support does not change that.

## Change the owning adapter

- Trace `NativeExponea.ts` → `Exponea.h`/`Exponea.mm` → `ExponeaBridge.swift` → `ExponeaSDK`. Keep Objective-C selectors, nullability, errors and generated spec ABI aligned.
- Preserve `@objc(IsExponeaReactNativeSDK)` and `@objc(ExponeaRNVersion)`; native runtime lookup uses them for layout and wrapper diagnostics.
- `requiresMainQueueSetup` governs module initialization, not callback threading. Use existing `onMain` dispatch for delegate/UI events.
- Settle promises once and retain callback state until settlement.
- `flushDataWithRetry`:
  - Retries while a flush is in progress and preserves callback/timeout handling.
  - Existing offline/error cases resolve void; only timeout rejects, through `ExponeaFlushTimeoutError`.
  - Fulfillment does not prove backend delivery.
- Parse through `JsonDataParser`. Handle string dictionary keys, `NSNull` and `NSNumber` booleans explicitly.
- Events and `getDefaultProperties` cross as JSON text; check the TS consumer before changing encoding.
- `ConfigurationParser.parseConfiguration()` is the active configuration path.
  - It disables `automaticPushNotificationTracking` because hosts explicitly forward tokens/opens. Do not enable swizzling alongside explicit tracking.
  - Preserve project/stream branches, app group, authorization and token-frequency settings.
- Segmentation owns a `SegmentCallbackData` per JS `callbackId`, not per category:
  - `includeFirstLoad` is independent per callback.
  - Registering the same ID again replaces the callback.
  - Preserve removal and the `NSLock`.
  - Clean up only after a successful native stop.
- Pending push storage holds one opened and one received item, not every event.
- Preserve these platform gaps:
  - HMS token methods reject with `PlatformError`.
  - Session timestamps are ignored.
  - `setAutoPushNotification` logs without reconfiguration.
  - Logger registration/removal are no-ops. Keep `logger` in supported events so shared JS subscriptions are accepted.
- Runtime ICB calls:
  - Delegate to native.
  - Convert deadline milliseconds to seconds.
  - Preserve availability strings and stable error codes through `Exponea.mm`.
  - Timeout resolves a decision; prefetch snapshots can include `loading`.
  - Invalidation completion means accepted, not refreshed; rendering, cache and tracking remain native-owned.

## Fabric, lifecycle and packaging

- Keep Fabric specs, generated-protocol implementations, props/events and `package.json`/`Exponea.mm` registrations aligned.
- Regenerate through Pods; do not patch generated headers.
- Carousel:
  - Preserve tokens, separate filter/sort stage maps, timeout fallback, native-ID membership and stale-cycle guards.
  - Legacy replies resolve only one pending stage request.
  - Never block main awaiting JS.
- `BridgedContentBlockSelector`:
  - Serializes request maps on `stateQueue`.
  - Custom hooks are main-thread-only; completions return on main.
  - Teardown cancels pending work.
- Preserve the `_props` and Swift proxy resets in `prepareForRecycle` so identical props reload on remount.
- The carousel proxy omits a bottom anchor for native content-height flow.
- Do not open Safari actions twice when the native SDK handles them.
- Example scene and push handling:
  - `SceneDelegate` subclasses native `ExponeaSceneDelegate`, calls `super` for link tracking and forwards to React Native.
  - `ExponeaSceneHandler.launchOptions(from:)` restores cold-launch URLs/user activities.
  - Keep AppDelegate push forwarding and legacy link handling; `linked || tracked` prevents duplicate scene fallback.
  - `willPresent` chooses foreground presentation without tracking an open.
- `ExponeaPushHandler.continueUserActivity` delegates once to native `handleUniversalLink` and returns its Boolean. Preserve filtering and completion handlers.
- Keep static-framework podspec settings conditional, and merge inherited xcconfig/Swift-header/C++ settings.
- For packaging changes, repeat Pods setup and the simulator build with `USE_FRAMEWORKS=static`, inspect lockfile diffs and restore the intended local mode.

## Tests and native ownership

- `ios/Tests` uses XCTest, selected by the podspec `Tests` spec in `example/ios/Podfile`.
- The shared scheme includes `react-native-exponea-sdk-Unit-Tests` from the Pods project; `ExponeaExampleTests` is a separate placeholder.
- Preserve `CFBundleExecutable` and the selector tests' `react_native_exponea_sdk` import.
- Suites cover configuration, push forwarding, scene options, segmentation, carousel selection and JSON parsing.
- The segmentation test does not exercise async stop ordering. Runtime ICB has facade Jest coverage, not dedicated native controller tests.
- The example Podfile.lock wrapper version lags `package.json`/native diagnostics. Regenerate it during release/dependency work rather than treating the lock label as the current release.
- Native persistence/network/auth defects belong in [exponea-ios-sdk](https://github.com/exponea/exponea-ios-sdk) at the resolved pin: `ExponeaInternal`, configuration/tracking extensions, feature managers, `Flushing`, `Database`, `Repository`, `JWT`.
- The older `exponea-ios` repository is unsupported legacy code.
