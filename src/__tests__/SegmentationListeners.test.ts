import Exponea, { SegmentationDataCallback } from '../index';
import NativeExponea, { type Segment } from '../NativeExponea';
import { emitNativeEvent } from './NativeEventTestUtils';

// documentation/segmentation.md: each category has independent subscriptions.
// Native fetching and includeFirstLoad scheduling are outside these JS tests.
describe('segmentation listeners', () => {
  const segments: Segment[] = [{ id: 'segment-1', segmentation_id: 'group-1' }];
  const discoveryListener = jest.fn();
  const contentListener = jest.fn();
  const discoveryCallback = new SegmentationDataCallback(
    'discovery',
    true,
    discoveryListener
  );
  const contentCallback = new SegmentationDataCallback(
    'content',
    false,
    contentListener
  );

  beforeEach(() => {
    jest.clearAllMocks();
    Exponea.registerSegmentationDataCallback(discoveryCallback);
    Exponea.registerSegmentationDataCallback(contentCallback);
  });

  afterEach(() => {
    Exponea.unregisterSegmentationDataCallback(discoveryCallback);
    Exponea.unregisterSegmentationDataCallback(contentCallback);
    jest.restoreAllMocks();
  });

  test('forwards registration flags and delivers decoded updates only to their category', () => {
    expect(
      jest.mocked(NativeExponea.onSegmentationCallbackSet).mock.calls
    ).toStrictEqual([
      ['discovery', true],
      ['content', false],
    ]);

    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'discovery', segments })
    );
    expect(discoveryListener.mock.calls).toStrictEqual([[segments]]);
    expect(contentListener).not.toHaveBeenCalled();

    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'merchandising', segments })
    );
    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'content', segments: [] })
    );

    expect(discoveryListener.mock.calls).toStrictEqual([[segments]]);
    expect(contentListener.mock.calls).toStrictEqual([[[]]]);
  });

  test('unregistering a category stops its delivery while other subscriptions remain active', () => {
    Exponea.unregisterSegmentationDataCallback(discoveryCallback);

    expect(
      jest.mocked(NativeExponea.onSegmentationCallbackRemove).mock.calls
    ).toStrictEqual([['discovery']]);

    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'discovery', segments })
    );
    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'content', segments })
    );

    expect(discoveryListener).not.toHaveBeenCalled();
    expect(contentListener.mock.calls).toStrictEqual([[segments]]);
  });

  test('drops malformed JSON and still delivers the next valid update', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => emitNativeEvent('newSegments', '{broken')).not.toThrow();
    expect(discoveryListener).not.toHaveBeenCalled();
    expect(contentListener).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);

    emitNativeEvent(
      'newSegments',
      JSON.stringify({ category: 'discovery', segments })
    );

    expect(discoveryListener.mock.calls).toStrictEqual([[segments]]);
    expect(contentListener).not.toHaveBeenCalled();
  });
});
