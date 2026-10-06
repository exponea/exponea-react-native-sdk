import Exponea, { SegmentationDataCallback } from '../index';
import NativeExponea from '../NativeExponea';
import { emitNativeEvent } from './NativeEventTestUtils';

jest.mock('../NativeExponea', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    stopIntegration: jest.fn(),
    onSegmentationCallbackSet: jest.fn(),
    onSegmentationCallbackRemove: jest.fn(),
  },
}));

// The native SDKs drop all segmentation callbacks when the integration stops. These
// tests cover the matching JS lifecycle through the public API, with native mocked:
// a successful stop releases every registration, a failed stop keeps them, and the
// same callback objects can be registered again afterwards.
const config = {
  integrationConfig: { projectToken: 'project', authorizationToken: 'token' },
};
const segments = [{ id: 'segment-1', segmentation_id: 'group-1' }];
const nativeRegister = jest.mocked(NativeExponea.onSegmentationCallbackSet);
const nativeRemove = jest.mocked(NativeExponea.onSegmentationCallbackRemove);
const nativeStop = jest.mocked(NativeExponea.stopIntegration);
const nativeConfigure = jest.mocked(NativeExponea.configure);
let callbacks: SegmentationDataCallback[];

function register(includeFirstLoad: boolean, category = 'discovery') {
  const handler = jest.fn();
  const callback = new SegmentationDataCallback(
    category,
    includeFirstLoad,
    handler
  );
  callbacks.push(callback);
  Exponea.registerSegmentationDataCallback(callback);
  return { callback, handler, id: latestId() };
}

function latestId() {
  return nativeRegister.mock.calls[nativeRegister.mock.calls.length - 1]![0];
}

function emit(callbackId: string, category = 'discovery') {
  emitNativeEvent(
    'newSegments',
    JSON.stringify({ callbackId, category, segments })
  );
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function removedIds() {
  return nativeRemove.mock.calls.map((call) => call[0]).sort();
}

beforeEach(() => {
  jest.resetAllMocks();
  nativeStop.mockResolvedValue(undefined);
  nativeConfigure.mockResolvedValue(undefined);
  callbacks = [];
});

afterEach(async () => {
  // Leave no registrations behind for the next test.
  callbacks.forEach((callback) =>
    Exponea.unregisterSegmentationDataCallback(callback)
  );
});

test('a successful stop releases all registrations on JS and native before resolving', async () => {
  const a = register(true);
  const b = register(false);
  const c = register(false, 'content');

  await Exponea.stopIntegration();

  expect(nativeStop).toHaveBeenCalledTimes(1);
  // Native removal is repeated per id so registrations racing the native cleanup are
  // released too; native treats already removed ids as no-ops.
  expect(removedIds()).toStrictEqual([a.id, b.id, c.id].sort());
  emit(a.id);
  emit(b.id);
  emit(c.id, 'content');
  expect(a.handler).not.toHaveBeenCalled();
  expect(b.handler).not.toHaveBeenCalled();
  expect(c.handler).not.toHaveBeenCalled();

  // Released instances are unknown to JS now, so unregistering them is a no-op.
  Exponea.unregisterSegmentationDataCallback(a.callback);
  expect(nativeRemove).toHaveBeenCalledTimes(3);
});

test('configure does not restore released callbacks; explicit re-registration gets fresh ids', async () => {
  const a = register(true);
  await Exponea.stopIntegration();

  await Exponea.configure(config);
  expect(nativeConfigure).toHaveBeenCalledTimes(1);
  expect(nativeRegister).toHaveBeenCalledTimes(1);

  Exponea.registerSegmentationDataCallback(a.callback);
  const newId = latestId();
  expect(nativeRegister).toHaveBeenCalledTimes(2);
  expect(newId).not.toBe(a.id);
  expect(nativeRegister).toHaveBeenLastCalledWith(newId, 'discovery', true);

  emit(a.id);
  expect(a.handler).not.toHaveBeenCalled();
  emit(newId);
  expect(a.handler).toHaveBeenCalledTimes(1);
});

test('a rejected stop keeps registrations, their ids and explicit unregistration', async () => {
  const a = register(true);
  const b = register(false);
  const pending = deferred();
  nativeStop.mockReturnValueOnce(pending.promise);

  const stopping = Exponea.stopIntegration();
  const failure = new Error('Not configured');
  // Callbacks keep working while the stop is in flight.
  emit(a.id);
  expect(a.handler).toHaveBeenCalledTimes(1);
  pending.reject(failure);
  await expect(stopping).rejects.toBe(failure);

  expect(nativeRemove).not.toHaveBeenCalled();
  Exponea.registerSegmentationDataCallback(a.callback);
  expect(nativeRegister).toHaveBeenCalledTimes(2);
  emit(a.id);
  emit(b.id);
  expect(a.handler).toHaveBeenCalledTimes(2);
  expect(b.handler).toHaveBeenCalledTimes(1);

  Exponea.unregisterSegmentationDataCallback(a.callback);
  expect(nativeRemove.mock.calls).toStrictEqual([[a.id]]);
});

test('a synchronous native failure rejects, keeps callbacks and allows a later stop', async () => {
  const a = register(true);
  nativeStop.mockImplementationOnce(() => {
    throw new Error('Native stop failed');
  });

  await expect(Exponea.stopIntegration()).rejects.toThrow('Native stop failed');
  emit(a.id);
  expect(a.handler).toHaveBeenCalledTimes(1);

  await Exponea.stopIntegration();
  expect(nativeStop).toHaveBeenCalledTimes(2);
  emit(a.id);
  expect(a.handler).toHaveBeenCalledTimes(1);
});

test('concurrent stop calls share one native stop and one cleanup', async () => {
  const a = register(true);
  const pending = deferred();
  nativeStop.mockReturnValueOnce(pending.promise);

  const first = Exponea.stopIntegration();
  const second = Exponea.stopIntegration();
  expect(second).toBe(first);
  expect(nativeStop).toHaveBeenCalledTimes(1);

  pending.resolve();
  await Promise.all([first, second]);
  expect(removedIds()).toStrictEqual([a.id]);
  emit(a.id);
  expect(a.handler).not.toHaveBeenCalled();

  // Once settled, a new stop starts a new native stop.
  await Exponea.stopIntegration();
  expect(nativeStop).toHaveBeenCalledTimes(2);
});

test('registrations made while a stop is pending are released with the others', async () => {
  const before = register(true);
  const pending = deferred();
  nativeStop.mockReturnValueOnce(pending.promise);
  const stopping = Exponea.stopIntegration();

  // Registration during the pending stop is accepted and forwarded to native…
  const during = register(false);
  expect(nativeRegister).toHaveBeenCalledTimes(2);
  emit(during.id);
  expect(during.handler).toHaveBeenCalledTimes(1);

  // …but, as on native, it does not survive the stop.
  pending.resolve();
  await stopping;
  expect(removedIds()).toStrictEqual([before.id, during.id].sort());
  emit(before.id);
  emit(during.id);
  expect(before.handler).not.toHaveBeenCalled();
  expect(during.handler).toHaveBeenCalledTimes(1);

  // Registration after the stop settled is kept.
  const after = register(true);
  expect(nativeRegister).toHaveBeenCalledTimes(3);
  emit(after.id);
  expect(after.handler).toHaveBeenCalledTimes(1);
  expect(nativeRemove).toHaveBeenCalledTimes(2);
});

test('explicit unregister stays available while a stop is pending', async () => {
  const a = register(true);
  const b = register(false);
  const pending = deferred();
  nativeStop.mockReturnValueOnce(pending.promise);
  const stopping = Exponea.stopIntegration();

  Exponea.unregisterSegmentationDataCallback(a.callback);
  expect(nativeRemove.mock.calls).toStrictEqual([[a.id]]);
  emit(a.id);
  emit(b.id);
  expect(a.handler).not.toHaveBeenCalled();
  expect(b.handler).toHaveBeenCalledTimes(1);

  pending.resolve();
  await stopping;
  expect(removedIds()).toStrictEqual([a.id, b.id].sort());
  emit(b.id);
  expect(b.handler).toHaveBeenCalledTimes(1);
});

test('repeated stop, re-register and configure cycles issue unique ids and deliver only to the live one', async () => {
  const a = register(true);
  const ids = [a.id];
  for (let cycle = 0; cycle < 3; cycle++) {
    await Exponea.stopIntegration();
    ids.forEach((id) => emit(id));
    expect(a.handler).not.toHaveBeenCalled();
    // As with the initial startup, registration is permitted before configuration.
    Exponea.registerSegmentationDataCallback(a.callback);
    ids.push(latestId());
    await Exponea.configure(config);
  }
  expect(new Set(ids).size).toBe(4);
  expect(nativeRegister).toHaveBeenCalledTimes(4);
  ids.forEach((id) => emit(id));
  expect(a.handler).toHaveBeenCalledTimes(1);
});

test('stopIntegration keeps returning a Promise<void> like the native call', async () => {
  await expect(Exponea.stopIntegration()).resolves.toBeUndefined();
});
