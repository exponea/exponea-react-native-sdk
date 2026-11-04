# Android adapter

Apply the root guide as well. Paths below are relative to the repository root.

- Native SDK/toolchain owners: `android/build.gradle`, `android/gradle.properties`, `example/android/build.gradle` and the example Gradle wrapper.
- The example pins the native SDK again in `example/android/app/build.gradle`; keep both dependency pins aligned on upgrade.
- Host `rootProject.ext` values override the library's `Exponea_` fallbacks.

## Commands

There is no Gradle wrapper in `android/`. Run root `yarn install --immutable`, then build/test through the example with Node on PATH, the selected JDK and Android SDK:

```bash
cd example/android
./gradlew projects
./gradlew :react-native-exponea-sdk:generateCodegenArtifactsFromSchema
./gradlew :react-native-exponea-sdk:assembleDebug
./gradlew :react-native-exponea-sdk:testDebugUnitTest
./gradlew :react-native-exponea-sdk:testDebugUnitTest --tests com.exponea.ConfigurationParserTest
./gradlew :app:assembleGmsDebug
./gradlew :app:assembleHmsDebug
```

- Confirm the autolinked module name with `projects` after resolution changes.
- Codegen normally runs before the build.
- Flavors exist in the example, not the library. Its Gradle file selects Google/Huawei plugins from task names, so name the flavor explicitly.
- Preserve conditional Kotlin plugin application: AGP can register the `kotlin` extension itself.

## Change the owning adapter

- Trace `src/NativeExponea.ts` → `ExponeaModule.kt` → native `Exponea`.
  - The adapter extends generated `NativeExponeaSpec`; `ExponeaPackage.kt` registers the module/managers.
  - Never hand-edit generated code.
- `ConfigurationParser.kt` receives JS-normalized `integrationConfig`.
  - Project configuration prefixes authorization with `Token `.
  - Stream configuration uses `streamId`.
  - Preserve routing, and keep customer-token auth separate from stream `sdkAuthToken`/`sdkAuthError`.
- Initialization guards are method-specific; do not impose blanket rejection.
  - Tracking can queue natively before init.
  - Getters and other methods use `requireInitialized`.
  - `configure` checks native state after init because failure can be logged rather than thrown.
- Settle promises once from native completion.
- `clearLocalCustomerData` requires uninitialized native stored-config state and ignores the iOS app-group argument.
- Clear, stop and anonymize are distinct operations.
- Conversion belongs in `Extensions.kt`:
  - Preserve nested maps/arrays, nulls and numeric conversion.
  - Keys are snake_case; timestamps are Unix seconds.
  - `toMapStringString()` JSON-encodes non-string values.
  - Events and `getDefaultProperties` cross as JSON text; inspect the TS consumer before changing encoding.
- Segmentation owns one callback per JS-issued `callbackId`, not per category:
  - Route payloads by `callbackId`.
  - Registering the same ID again replaces the callback.
  - Removal is idempotent.
  - Keep the locking.
  - Clean up only after a successful stop, including registrations made while the stop was pending.
- Logger forwarding owns one stable callback.
  - Registration, removal and `invalidate()` cleanup are idempotent.
  - Preserve native `DEBUG` → public `DBG` and optional throwable serialization.
  - Do not infer iOS log delivery from this API.
- `PushReceiver` and module storage each retain only the latest pending push, not a lossless queue.
  - Preserve background entry points and cold-start replay.
  - The example's flavor-specific `TokenTracker` helpers are host code, not library exports.
  - The `MessageService` that the Expo config plugin generates calls `ExponeaModule.Companion.handleRemoteMessage` and `handleNewToken` (see `app.plugin.js`). Keep their signatures; verify changes with `yarn example_expo prebuild --no-install` and `yarn verify:expo-prebuild`.
- Runtime ICB methods:
  - Use the native controller.
  - Convert millisecond deadlines to `Long`.
  - Return string-valued availability results and stable error codes.
  - Timeout is a decision, not a failure or cancellation.
  - Invalidation completion means accepted, not reloaded.
  - Keep async result conversion inside the error wrapper.
- Fabric managers use generated commands/props, surface/view IDs and DIP dimensions.
- Use `UIManagerHelper.getEventDispatcherForReactTag(context, viewId)` for peer-range compatibility; newer dispatcher overloads can fail on older supported React Native versions.
- `BridgedContentBlockCarouselSelector` waits for JS only on a worker, with timeout and native fallback.
  - Never move the wait to the UI or JS thread.
  - Preserve routing of concurrent and token-bearing responses, and disposal.
- Keep `overrideDefaultBehavior`, `trackActions` and consent overrides distinct.

## Tests and compatibility checks

- JUnit4/MockK/Robolectric tests live in `android/src/test/java/com/exponea/`.
  - Use `MockPromise`, parser fixtures and widget tests.
  - Assert payloads, invalid input and promise/callback lifecycle with native singleton/network effects stubbed.
- Focused classes include `ExponeaModuleSegmentationTest`, `ExponeaModuleLoggerTest` and `widget.InAppContentBlocksPlaceholderManagerTest`.
- Runtime ICB has root Jest coverage but no dedicated native controller test; do not claim native coverage from facade tests.
- From root, `yarn test:android-compat` compiles against the lowest supported peer minor. Pass a minor (latest patch) or exact version to select another. `--full` assembles GMS; `--keep` intentionally leaves the selected configuration in place.
- That script needs git, Node, npm, Yarn, `ANDROID_HOME` and network access, and is not read-only validation:
  - It rewrites `example/package.json`, `yarn.lock` and `example/android/{build.gradle,app/build.gradle,gradle/wrapper/gradle-wrapper.properties}`, then restores them via `git checkout` plus `yarn install`.
  - Keep those files clean in both index and worktree before running it; its guard checks only unstaged edits.
- Native lifecycle/storage/HTTP defects belong in [exponea-android-sdk](https://github.com/exponea/exponea-android-sdk) at the Gradle pin. Start with `Exponea.kt`, `ExponeaComponent.kt`, `services/ExponeaInitManager.kt` and the affected manager/repository; keep conversion/forwarding here.
