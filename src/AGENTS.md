# TypeScript layer

Apply the root guide as well. Paths below are relative to the repository root.

## Layout and ownership

- `src/index.tsx` owns the exported `ExponeaType`, singleton, named exports, components and public types. `ExponeaType.ts` is a compatibility re-export, not the canonical interface.
- Trace API changes through `index.tsx` → `ExponeaImpl.ts` → `NativeExponea.ts` → both native adapters. Update affected types, parsers, mocks, tests and docs in the same change.
- `NativeExponea.ts` is TurboModule codegen input and uses `TurboModuleRegistry.getEnforcing<Spec>('Exponea')`.
  - This checkout requires New Architecture; do not add an untested legacy fallback.
  - Preserve the module and method names.
- The three `*NativeComponent.ts` files are Fabric codegen inputs.
  - Keep names/props/events/commands aligned with `package.json#codegenConfig`, Android managers and iOS component views.
  - Preserve the documented `HostComponent` casts/codegen workaround until a native build proves a replacement.

## Bridge contract

- JSON encoding at the bridge:
  - `getDefaultProperties()` and listener events arrive as JSON text and are parsed here.
  - Fabric event fields can themselves contain JSON strings.
  - Preserve omitted versus null versus empty-map values, and `false`/`0` versus missing.
  - Tracking timestamps are Unix seconds.
- `configure()`:
  - Migrates legacy fields.
  - Rejects simultaneous legacy and new configuration.
  - Prefers `integrationRouteMap` over `projectMapping`.
  - Strips project routing and advanced auth from stream configuration.
  - Covered by `Configuration.test.ts`, `ExponeaImpl.test.ts` and `Anonymize.test.ts`.
- Preserve both `identifyCustomer` overloads and default properties.
- New JS may meet an older native binary. Do not call new native methods unconditionally at import; document a required native rebuild or implement/test the agreed fallback.
- `ExponeaListeners.ts` registration:
  - Assign the callback before native registration; pending events can arrive immediately.
  - Push, in-app and auth callbacks use singleton slots.
  - Segmentation callbacks use object identity and unique IDs, not category.
  - Registering the same segmentation instance twice is a no-op; removal is per instance.
  - Preserve stale-event filtering and registration rollback.
- Stop:
  - Concurrent stops share one promise.
  - A successful stop releases segmentation callbacks, including registrations created while stopping, and deactivates the runtime controller before resolving.
  - A failed stop retains all state.
  - After stop, segmentation needs explicit re-registration.
- Logger callbacks:
  - They form a set of function references; the first registration starts native forwarding and the last removal stops it.
  - Preserve JSON validation, Android `DEBUG` → public `DBG`, optional `throwable` and isolation of callback errors.
  - iOS registration/removal are no-ops.
- Keep consent-aware APIs distinct from `WithoutTrackingConsent`.
- Carousel filter/sort responses encode arrays of JSON strings. Preserve routing of concurrent responses.
- `ContentBlockDataRequest.ts` accepts token-bearing and legacy requests.

## Runtime content-block controller

- `RuntimeInAppContentBlockController.ts` is a thin facade, not a second cache.
- `Exponea.inAppContentBlocksController` lifecycle:
  - Null before configuration.
  - Created after a successful configure, or restored on module load from synchronous native `isConfigured()`. New native mocks must provide that synchronous function before import.
  - Retained across repeated successful configure and identify/anonymize.
  - A successful stop deactivates held references and clears the getter; reconfigure creates a fresh facade.
  - A failed stop retains the active facade.
  - `RuntimeInAppContentBlockController.test.ts` covers these boundaries.
- Deadlines are milliseconds.
- `availability()` resolves a terminal value or `{status: 'timedOut'}`. Timeout does not reject and does not cancel native loading.
- Bounded `prefetch()` returns a snapshot: pending iOS values can be `loading`, Android values `empty`. Do not treat these as final no-content decisions.
- `invalidate()`:
  - Defaults to eager and supports lazy.
  - Resolves when accepted, not when the reload finishes.
  - Does not refresh mounted views by itself; rendering and tracking remain owned by native views.
- Preserve the stable error codes `RuntimeInAppContentBlockControllerUnavailable`, `RuntimeInAppContentBlockControllerInvalidMode` and `RuntimeInAppContentBlockControllerError`.

## Tests and verification

```bash
yarn typecheck
yarn lint
yarn test --runInBand --watchman=false
yarn test --runInBand --watchman=false --runTestsByPath src/__tests__/RuntimeInAppContentBlockController.test.ts
yarn build
```

- Root `jest.config.js` uses ts-jest; `jest.setup.js` mocks TurboModuleRegistry/NativeEventEmitter before import.
- `NativeEventTestUtils.ts` drives real listener routing; use it instead of only asserting a mock against itself.
- Fixtures/helpers: `src/test_data/`, `src/__tests__/MockExponea.ts`, `TestUtils.ts`.
- Listener coverage: `SegmentationListeners.test.ts`, `SegmentationBindings.test.ts`, `LoggerCallback.test.ts`.
- Component tests mock hooks and verify dispatch/default props, not real mounting, layout or native rendering. UI lifecycle and generated ABI changes need native builds and example checks.
- `yarn build` generates ignored `lib/`; never edit it.
- The example has its own aliases/tsconfig: use `yarn example exec tsc --noEmit` and `yarn test:examples --runInBand --watchman=false`.
- No API dump gate exists; review declarations and codegen/native output.
