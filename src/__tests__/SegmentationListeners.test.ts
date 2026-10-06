import Exponea, { SegmentationDataCallback } from '../index';
import NativeExponea, { type Segment } from '../NativeExponea';
import { emitNativeEvent } from './NativeEventTestUtils';

// documentation/segmentation.md: multiple callbacks may observe the same category and
// every registration owns one native callback so native can evaluate includeFirstLoad
// per instance. Native fetching itself is outside these JS tests; the bridge contract is
// that every `newSegments` event carries the callbackId of the registration it is for.
describe('segmentation listeners', () => {
  const segments: Segment[] = [{ id: 'segment-1', segmentation_id: 'group-1' }];
  const nativeRegister = jest.mocked(NativeExponea.onSegmentationCallbackSet);
  const nativeRemove = jest.mocked(NativeExponea.onSegmentationCallbackRemove);
  let registered: SegmentationDataCallback[];

  function register(
    category: string,
    includeFirstLoad: boolean,
    handler: jest.Mock = jest.fn()
  ) {
    const callback = new SegmentationDataCallback(
      category,
      includeFirstLoad,
      handler
    );
    registered.push(callback);
    const callsBefore = nativeRegister.mock.calls.length;
    Exponea.registerSegmentationDataCallback(callback);
    const call = nativeRegister.mock.calls[callsBefore];
    return { callback, handler, id: call ? call[0] : undefined };
  }

  function emit(
    callbackId: string | undefined,
    category: string,
    data = segments
  ) {
    emitNativeEvent(
      'newSegments',
      JSON.stringify({ callbackId, category, segments: data })
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    registered = [];
  });

  afterEach(() => {
    registered.forEach((callback) =>
      Exponea.unregisterSegmentationDataCallback(callback)
    );
    jest.restoreAllMocks();
  });

  test('every registration gets its own native callback id with its own flags', () => {
    const discovery = register('discovery', true);
    const content = register('content', false);

    expect(nativeRegister.mock.calls).toStrictEqual([
      [discovery.id, 'discovery', true],
      [content.id, 'content', false],
    ]);
    expect(typeof discovery.id).toBe('string');
    expect(discovery.id).not.toBe('');
    expect(discovery.id).not.toBe(content.id);
  });

  test('several callbacks for one category are registered natively and notified independently', () => {
    const firstLoad = register('discovery', true);
    const changesOnly = register('discovery', false);
    const content = register('content', false);

    // Three native callbacks: both discovery registrations and the content one.
    expect(nativeRegister).toHaveBeenCalledTimes(3);
    expect(nativeRegister.mock.calls.map((call) => call[1])).toStrictEqual([
      'discovery',
      'discovery',
      'content',
    ]);
    expect(new Set(nativeRegister.mock.calls.map((call) => call[0])).size).toBe(
      3
    );

    // A first-load notification is addressed only to the registration that asked for it.
    emit(firstLoad.id, 'discovery');
    expect(firstLoad.handler.mock.calls).toStrictEqual([[segments]]);
    expect(changesOnly.handler).not.toHaveBeenCalled();
    expect(content.handler).not.toHaveBeenCalled();

    // A change notification reaches the other registration through its own id.
    emit(changesOnly.id, 'discovery', []);
    expect(firstLoad.handler).toHaveBeenCalledTimes(1);
    expect(changesOnly.handler.mock.calls).toStrictEqual([[[]]]);

    emit(content.id, 'content');
    expect(content.handler.mock.calls).toStrictEqual([[segments]]);
    expect(firstLoad.handler).toHaveBeenCalledTimes(1);
    expect(changesOnly.handler).toHaveBeenCalledTimes(1);
  });

  test('ignores events for unknown ids, missing ids and mismatching categories', () => {
    const discovery = register('discovery', true);

    emit('unknown-id', 'discovery');
    emit(undefined, 'discovery');
    emit(discovery.id, 'content');
    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'discovery', segments })
    );

    expect(discovery.handler).not.toHaveBeenCalled();

    emit(discovery.id, 'discovery');
    expect(discovery.handler.mock.calls).toStrictEqual([[segments]]);
  });

  test('registering the same instance again has no effect', () => {
    const discovery = register('discovery', true);
    Exponea.registerSegmentationDataCallback(discovery.callback);

    expect(nativeRegister).toHaveBeenCalledTimes(1);

    emit(discovery.id, 'discovery');
    expect(discovery.handler).toHaveBeenCalledTimes(1);

    Exponea.unregisterSegmentationDataCallback(discovery.callback);
    expect(nativeRemove.mock.calls).toStrictEqual([[discovery.id]]);
    emit(discovery.id, 'discovery');
    expect(discovery.handler).toHaveBeenCalledTimes(1);
  });

  test('unregistering removes only that instance while others in the same category remain', () => {
    const first = register('discovery', true);
    const second = register('discovery', false);
    const content = register('content', false);

    Exponea.unregisterSegmentationDataCallback(first.callback);
    expect(nativeRemove.mock.calls).toStrictEqual([[first.id]]);

    emit(first.id, 'discovery');
    emit(second.id, 'discovery');
    emit(content.id, 'content');

    expect(first.handler).not.toHaveBeenCalled();
    expect(second.handler.mock.calls).toStrictEqual([[segments]]);
    expect(content.handler.mock.calls).toStrictEqual([[segments]]);

    // Unregistering again, or an instance that was never registered, touches nothing.
    Exponea.unregisterSegmentationDataCallback(first.callback);
    Exponea.unregisterSegmentationDataCallback(
      new SegmentationDataCallback('discovery', false, jest.fn())
    );
    expect(nativeRemove).toHaveBeenCalledTimes(1);
  });

  test('an instance can be registered again after unregistering and gets a fresh id', () => {
    const discovery = register('discovery', true);
    Exponea.unregisterSegmentationDataCallback(discovery.callback);

    Exponea.registerSegmentationDataCallback(discovery.callback);
    const newId = nativeRegister.mock.calls[1]![0];
    expect(nativeRegister).toHaveBeenCalledTimes(2);
    expect(newId).not.toBe(discovery.id);
    expect(nativeRegister).toHaveBeenLastCalledWith(newId, 'discovery', true);

    // Events queued for the stale id are dropped; the new id is delivered.
    emit(discovery.id, 'discovery');
    expect(discovery.handler).not.toHaveBeenCalled();
    emit(newId, 'discovery');
    expect(discovery.handler.mock.calls).toStrictEqual([[segments]]);
  });

  test('a failing native registration leaves the instance unregistered so it can be retried', () => {
    const handler = jest.fn();
    const callback = new SegmentationDataCallback('discovery', true, handler);
    registered.push(callback);
    nativeRegister.mockImplementationOnce(() => {
      throw new Error('native unavailable');
    });

    expect(() => Exponea.registerSegmentationDataCallback(callback)).toThrow(
      'native unavailable'
    );
    const failedId = nativeRegister.mock.calls[0]![0];
    emit(failedId, 'discovery');
    expect(handler).not.toHaveBeenCalled();

    Exponea.registerSegmentationDataCallback(callback);
    expect(nativeRegister).toHaveBeenCalledTimes(2);
    const retriedId = nativeRegister.mock.calls[1]![0];
    expect(retriedId).not.toBe(failedId);
    emit(retriedId, 'discovery');
    expect(handler.mock.calls).toStrictEqual([[segments]]);
  });

  test('drops malformed JSON and still delivers the next valid update', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const discovery = register('discovery', true);
    const content = register('content', false);

    expect(() => emitNativeEvent('newSegments', '{broken')).not.toThrow();
    expect(discovery.handler).not.toHaveBeenCalled();
    expect(content.handler).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);

    emit(discovery.id, 'discovery');
    expect(discovery.handler.mock.calls).toStrictEqual([[segments]]);
    expect(content.handler).not.toHaveBeenCalled();
  });

  test('a throwing handler does not break the delivery to other registrations', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const failing = register(
      'discovery',
      true,
      jest.fn(() => {
        throw new Error('handler failed');
      })
    );
    const healthy = register('discovery', false);

    expect(() => emit(failing.id, 'discovery')).not.toThrow();
    expect(errorSpy).toHaveBeenCalledTimes(1);

    emit(healthy.id, 'discovery');
    expect(healthy.handler.mock.calls).toStrictEqual([[segments]]);
  });
});
