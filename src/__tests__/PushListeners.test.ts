import { emitNativeEvent } from './NativeEventTestUtils';
import Exponea from '../index';
import NativeExponea from '../NativeExponea';

// documentation/push-notifications.md: opened and received callbacks are separate.
// Native notification buffering and platform delivery are outside these JS tests.
describe.each([
  {
    event: 'pushOpened',
    otherEvent: 'pushReceived',
    register: Exponea.setPushOpenedListener,
    remove: Exponea.removePushOpenedListener,
    notify: NativeExponea.onPushOpenedListenerSet,
    notifyRemove: NativeExponea.onPushOpenedListenerRemove,
    otherNotify: NativeExponea.onPushReceivedListenerSet,
    otherNotifyRemove: NativeExponea.onPushReceivedListenerRemove,
  },
  {
    event: 'pushReceived',
    otherEvent: 'pushOpened',
    register: Exponea.setPushReceivedListener,
    remove: Exponea.removePushReceivedListener,
    notify: NativeExponea.onPushReceivedListenerSet,
    notifyRemove: NativeExponea.onPushReceivedListenerRemove,
    otherNotify: NativeExponea.onPushOpenedListenerSet,
    otherNotifyRemove: NativeExponea.onPushOpenedListenerRemove,
  },
])(
  '$event listener',
  ({
    event,
    otherEvent,
    register,
    remove,
    notify,
    notifyRemove,
    otherNotify,
    otherNotifyRemove,
  }) => {
    const payload = {
      action: 'deeplink',
      url: 'myapp://offer',
      additionalData: { count: 0, enabled: false, label: 'Offer' },
    };
    const serialized = JSON.stringify(payload);

    afterEach(() => {
      Exponea.removePushOpenedListener();
      Exponea.removePushReceivedListener();
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('registers with native and decodes notifications only from its own channel', () => {
      const listener = jest.fn();
      register(listener);

      expect(jest.mocked(notify).mock.calls).toEqual([[]]);
      expect(otherNotify).not.toHaveBeenCalled();
      emitNativeEvent(otherEvent, serialized);
      expect(listener).not.toHaveBeenCalled();
      emitNativeEvent(event, serialized);

      expect(listener.mock.calls).toEqual([[payload]]);
    });

    test('replaces the previous listener and stops delivery after removal', () => {
      const previous = jest.fn();
      const current = jest.fn();
      register(previous);
      register(current);
      emitNativeEvent(event, serialized);

      expect(previous).not.toHaveBeenCalled();
      expect(current.mock.calls).toEqual([[payload]]);
      remove();
      expect(jest.mocked(notifyRemove).mock.calls).toEqual([[]]);
      expect(otherNotifyRemove).not.toHaveBeenCalled();
      emitNativeEvent(event, serialized);
      expect(current.mock.calls).toEqual([[payload]]);
    });

    test('drops malformed JSON without preventing the next valid notification', () => {
      const listener = jest.fn();
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      register(listener);

      expect(() => emitNativeEvent(event, '{broken')).not.toThrow();
      expect(listener).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      emitNativeEvent(event, serialized);
      expect(listener.mock.calls).toEqual([[payload]]);
    });
  }
);
