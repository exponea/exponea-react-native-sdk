# AGENTS.md: Bloomreach Marketing React Native SDK

## 1. Scope

This repository ships `react-native-exponea-sdk` through npm/Yarn, wrapping the native Android SDK (Maven) and iOS SDK (CocoaPods) for React Native integrators.

Nested instruction files add rules for their directory:

| File                                   | Covers                                                    |
| -------------------------------------- | --------------------------------------------------------- |
| [src/AGENTS.md](src/AGENTS.md)         | TypeScript API, TurboModule/Fabric contracts, Jest        |
| [android/AGENTS.md](android/AGENTS.md) | Kotlin adapter, push receiver, native views, Gradle tests |
| [ios/AGENTS.md](ios/AGENTS.md)         | Objective-C++/Swift adapter, Fabric, CocoaPods/XCTest     |
| [example/AGENTS.md](example/AGENTS.md) | Integration app, native build/test hosts, credentials     |

The wrapped native SDKs are pinned in `android/build.gradle` and `react-native-exponea-sdk.podspec`. Their behavior at those pins is the contract this wrapper exposes.

## 2. Commands

Run from the repo root. Native prerequisites and focused commands are in the nested guides.

```bash
yarn install --immutable
```

```bash
yarn build                                                     # ESM JavaScript and TypeScript declarations
(cd example/android && ./gradlew :app:assembleGmsDebug)          # Android example; use HmsDebug for Huawei
(cd example && bundle install && cd ios && bundle exec pod install)
(cd example/ios && xcodebuild -workspace ExponeaExample.xcworkspace -scheme ExponeaExample -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build)
```

```bash
yarn test --runInBand --watchman=false                          # root TypeScript suite
yarn test:examples --runInBand --watchman=false                 # example's separate Jest suite
(cd example/android && ./gradlew :react-native-exponea-sdk:testDebugUnitTest)
# iOS XCTest: use a concrete simulator and the wrapper test bundle; see ios/AGENTS.md.
```

```bash
yarn test --runInBand --watchman=false --runTestsByPath src/__tests__/Configuration.test.ts
yarn lint
yarn typecheck
yarn example exec tsc --noEmit
yarn exec prettier --check AGENTS.md                           # substitute changed Markdown/JS/TS paths
python3 scripts/check-agent-guides.py                           # local links and placeholders in agent guides
```

- Use Node from `.nvmrc`. Run `corepack enable` once so `yarn` resolves to the checked-in release (`yarnPath` in `.yarnrc.yml`).
- Node 25 and newer ship without corepack, so `yarn` is not on PATH. Switch to the `.nvmrc` version, or run `node .yarn/releases/yarn-*.cjs <args>` in place of `yarn <args>`. `engines` excludes Node 25, but nothing enforces it.
- `pod install` needs the Ruby and Bundler versions recorded in `example/Gemfile.lock`; there is no `.ruby-version`, and the macOS system Ruby fails. It rewrites `example/ios/Podfile.lock`: restore that file unless the task is a release or dependency update.
- No build/test CI is checked in: `.github/workflows` only uploads `documentation/` to ReadMe. Run the checks above locally.
- `yarn test` covers `src/` only. Both Jest configurations use `@react-native/jest-preset`; root TypeScript tests also use ts-jest.
- `yarn android`/`yarn ios` delegate to `example`; `yarn example start` starts Metro.
- `example` is the sole configured Yarn workspace. Do not infer support from an untracked sample directory.
- `yarn format` rewrites the whole repo. Format only changed files with `yarn exec prettier --write path/to/file`.
- Toolchain versions live in `.nvmrc`, `package.json`, `.yarnrc.yml`, `yarn.lock`, `example/package.json`, `example/Gemfile{,.lock}`, both Android Gradle projects and the example Gradle wrapper, root podspec and example Xcode project; read them there.

## 3. Public API stability

- Breaking changes need an entry in `documentation/version-update.md`.
- Export through `src/index.tsx` only when the contract requires it. `src/ExponeaType.ts` is a compatibility re-export.
- TypeScript declarations **and** the native bridge ABI are public. Change them together with the files listed in §7.
- Preserve enum strings, event names, JSON keys, nullability and time units.
- New JS may run against an older native binary. New native calls need a documented rebuild/minimum wrapper release or an agreed capability fallback.
- This checkout requires TurboModules and Fabric (New Architecture). Do not add an Old Architecture fallback based on historical release notes.
- No automated API/ABI baseline exists. Review generated declarations from `yarn build` and the spec/native diff; typechecking alone does not prove binary compatibility.

## 4. Architecture

- `src/index.tsx` owns `ExponeaType`, the singleton, named exports, components and public types; `ExponeaImpl.ts` adapts calls to `NativeExponea.ts`.
- `ExponeaListeners.ts` owns callback registration and native subscriptions: singleton push/in-app/auth slots, segmentation callback IDs and a logger callback set. Native registration can immediately replay a pending event.
- `RuntimeInAppContentBlockController.ts` is the runtime content-block facade. `ExponeaImpl` creates/restores it after configuration and deactivates it after successful stop; state/cache remain native-owned.
- `src/*NativeComponent.ts` declares Fabric props/events; `package.json#codegenConfig` binds generated Android code and iOS component providers.
- Android `ExponeaModule` and parsers delegate to `com.exponea.sdk.Exponea`; view managers own React Native UI integration.
- iOS `Exponea.h`/`Exponea.mm` implement the generated spec and delegate to `ExponeaBridge.swift`; component views delegate to Swift views/proxies.
- The example's iOS `SceneDelegate` owns React Native startup and universal links; `ExponeaSceneHandler` restores cold-launch options. `AppDelegate` retains push handling.
- Persistence, HTTP, retries, identity and campaign state belong to the native SDKs. Fix the owning layer instead of adding a competing JavaScript cache or transport.
- Before fixing a defect, check the pinned native SDK source and say whether it is a native defect or a wrapper adaptation defect.
- Native UI runs on the platform UI thread. Preserve existing dispatch; a JavaScript promise does not make native UI access safe.

## 5. Conventions

- Settle every promise exactly once.
- Preserve callback payloads and errors on both platforms.
- Validate malformed bridge input with the existing error wrappers. Never turn a rejection into success.
- Keep registration/removal paired and callback references stable.
- Hot reload does not recreate native singleton state; use `isConfigured()` before configuring again.
- Segmentation callbacks are per instance, not per category:
  - Preserve callback-ID routing and registration rollback.
  - A successful stop cleans up registrations.
  - A failed stop retains them.
- Logger callbacks deliver Android `logger` events; iOS registration/removal are no-ops. Preserve level normalization and first/last-listener registration.
- On iOS, `ConfigurationParser` disables automatic push tracking. Hosts explicitly forward tokens/opens; `willPresent` chooses foreground presentation only. Do not introduce duplicate tracking/actions.
- Keep consent-aware methods and `WithoutTrackingConsent` variants distinct, including default action handling.
- Preserve project/stream precedence, legacy configuration migration, JWT refresh, identity and anonymization semantics.
- Keep the established `Exponea` package/module names.
- Never log tokens, authorization headers or customer payloads in new diagnostics.

## 6. Testing and verification

- Frameworks: Jest/ts-jest, JUnit4 + MockK/Robolectric, XCTest.
- Shared mocks/fixtures live in `jest.setup.js`, `src/__tests__/`, `src/test_data/`, `android/src/test/` and `example/__mocks__/`.
- Stub SDK and network effects. Never configure a live customer project in automated tests.
- Add characterization tests before changing shared managers, lifecycle, identity or cache.

What to run before calling a change done:

| Change touches        | Run                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Docs only             | `git diff --check`; Prettier on changed files; changed links/front matter; `scripts/check-agent-guides.py` for agent guides |
| Internal TypeScript   | `yarn lint`, `yarn typecheck`, affected Jest tests                                                                          |
| Android / iOS adapter | Above if JS/spec affected; platform tests and example build from the nested guide                                           |
| Public API            | Full root + example Jest, lint/typecheck, `yarn build`, declaration/spec diff, both native builds and affected native tests |
| Build / packaging     | Above + `yarn pack --dry-run`; inspect the file list; GMS/HMS and iOS default/static-framework builds                       |

- Already failing on `develop`. Compare against these before and after your change; do not fix them in an unrelated task:
  - `yarn typecheck` reports errors only in `src/__tests__/` and `example/`, mostly untyped Jest globals and the example's `@/` alias, which the root `tsconfig.json` lacks. Compare per-file error counts before and after. SDK sources outside tests are clean: the library gate `yarn exec tsc -p tsconfig.build.json --noEmit` excludes `example/` and `src/__tests__/` and must pass.
  - `yarn example exec tsc --noEmit` reports errors in `example/__tests__/App.test.tsx`, `example/src/screens/InAppCbScreen.tsx` and two `src/*NativeComponent.ts` imports of `react-native/Libraries/Types/CodegenTypes`.
- For Android peer-version compatibility, run `yarn test:android-compat` (lowest supported minor) or pass a minor/exact version. This rewrites dependency/build inputs and installs packages before restoring them; use a clean checkout. See the Android guide for prerequisites and options.
- Verify nonzero native test discovery; a build alone is not test coverage.

## 7. Cross-platform parity

- When comparing platforms, check omitted versus null values, units, identity reset, consent, callback timing/order, errors and cleanup.
- Native fixes need a released native dependency before this wrapper relies on them.
- Files that change together for a native API: `src/index.tsx`, `ExponeaType.ts`, `ExponeaImpl.ts`, the `NativeExponea.ts` codegen spec, affected types/configuration, Android `ExponeaModule`/parsers, iOS `Exponea.h`/`Exponea.mm`/`ExponeaBridge`/parsers, fixtures, mocks, tests and feature docs.
- For UI APIs also check the Fabric spec, both native view implementations, `package.json#codegenConfig` and example screens.

## 8. Docs, changelog, release

- Docs live in lowercase `documentation/`, not `Documentation/` as in the native SDKs. The ReadMe workflows upload the whole directory: keep maintainer and agent notes out of it.
- Keep front matter (`title`, `slug`, `category`, `parent`, `content`) and `{user.*}` merge tags intact.
- Keep the runtime content-block semantics in `documentation/in-app-content-blocks.md` and the `RuntimeInAppContentBlockController.ts` JSDoc aligned with both native adapters.
- Keep `documentation/version-update.md`, `app-links.md` and `push-ios.md` aligned with `ExponeaSceneHandler`, `ConfigurationParser`, `ExponeaPushHandler` and the example delegates.
- The release script does not regenerate `example/ios/Podfile.lock`, which records the wrapper version. Regenerate it with `pod install` after the bump; never hand-edit it.
- Native upgrades touch `android/build.gradle`, `example/android/app/build.gradle`, the root podspec, `example/ios/Podfile` notification-extension pins and the regenerated lockfile.
- The npm `files` allowlist includes `src`, `android` and `ios`. `!**/AGENTS.md` keeps nested guides (and the copy `yarn build` writes to `lib/`) out of the package; check `yarn pack --dry-run` after adding files there.

## 9. Generated code

Never hand-edit generated or vendored output: `lib/`, `node_modules/`, `example/node_modules/`, `example/ios/Pods/`, `ios/generated/`, `android/generated/`, `**/build/`, `.gradle/`, `.yarn/releases/`.

## 10. Gotchas

- The shared iOS scheme must resolve `react-native-exponea-sdk-Unit-Tests` after pod regeneration. The placeholder `ExponeaExampleTests` alone does not cover the wrapper.
- Watchman may fail in headless/restricted sessions; use `--watchman=false` for Jest. Do not run `cleanCache.sh` routinely: it clears shared Xcode DerivedData and Watchman state.
- `README.md` advertises an Expo plugin and links `documentation/expo.md`, but neither is tracked in this branch. Check package exports/files before claiming Expo support; other task branches can differ.
- Root lint/format/tsconfig discovery can include extra local directories. Diagnose file discovery first; the example's `@/` aliases require its own `tsconfig.json` and TypeScript check.
