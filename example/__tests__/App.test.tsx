/**
 * @format
 */

import 'react-native';
jest.mock('react-native-gesture-handler', () =>
  require('react-native-gesture-handler/jestSetup')
);
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
// Note: import explicitly to use the types shipped with jest.
import '@jest/globals';

import { act, render } from '@testing-library/react-native';
import React from 'react';
import { type EmitterSubscription, Linking, StyleSheet } from 'react-native';
import * as ExponeaSdk from 'react-native-exponea-sdk';

import App from '@/App';
import { AutomationIds } from '@/automation/AutomationIds';
import { Screen } from '@/screens/Screens';
import * as RootNavigation from '@/util/RootNavigation';

const setInAppMessageCallback = jest.spyOn(
  ExponeaSdk,
  'setInAppMessageCallback'
);
const stopIntegration = jest
  .spyOn(ExponeaSdk, 'stopIntegration')
  .mockResolvedValue();
const trackInAppMessageClick = jest
  .spyOn(ExponeaSdk, 'trackInAppMessageClick')
  .mockResolvedValue();

beforeAll(() => {
  jest
    .spyOn(Linking, 'addEventListener')
    .mockImplementation(
      () => ({ remove: jest.fn() }) as unknown as EmitterSubscription
    );
  jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders correctly', async () => {
  render(<App />);
  await act(async () => {
    await Promise.resolve();
  });
});

describe('in-app message click actions', () => {
  type InAppMessageClickCallback = {
    inAppMessageClickAction: (message: any, button: any) => void;
    inAppMessageShown: (message: any) => void;
  };

  async function renderAndGetCallback(): Promise<InAppMessageClickCallback> {
    render(<App />);
    await act(async () => {
      await Promise.resolve();
    });
    return (setInAppMessageCallback as jest.Mock).mock.calls.at(-1)[0];
  }

  test('handles a recognized stop URL in-process without opening it externally', async () => {
    const openUrl = jest.spyOn(Linking, 'openURL');
    const navigate = jest.spyOn(RootNavigation, 'navigate');
    const callback = await renderAndGetCallback();

    callback.inAppMessageClickAction(
      { id: 'stop-message' },
      { text: 'Continue', url: 'exponea://stopAndContinue' }
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(trackInAppMessageClick).toHaveBeenCalledWith(
      { id: 'stop-message' },
      'Continue',
      'exponea://stopAndContinue'
    );
    expect(stopIntegration).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(Screen.Fetching);
    expect(openUrl).not.toHaveBeenCalled();
  });

  test('waits for click tracking before handling a recognized stop URL', async () => {
    let resolveTracking: (() => void) | undefined;
    trackInAppMessageClick.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveTracking = resolve;
        })
    );
    const navigate = jest.spyOn(RootNavigation, 'navigate');
    const callback = await renderAndGetCallback();

    callback.inAppMessageClickAction(
      { id: 'deferred-stop-message' },
      { text: 'Continue', url: 'exponea://stopAndContinue' }
    );

    expect(stopIntegration).not.toHaveBeenCalled();
    resolveTracking?.();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(stopIntegration).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(Screen.Fetching);
  });

  test('logs rejected click tracking and still handles a recognized stop URL', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    trackInAppMessageClick.mockRejectedValueOnce(new Error('click failed'));
    const navigate = jest.spyOn(RootNavigation, 'navigate');
    const callback = await renderAndGetCallback();

    callback.inAppMessageClickAction(
      { id: 'rejected-stop-message' },
      { text: 'Continue', url: 'exponea://stopAndContinue' }
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('click track has been rejected')
    );
    expect(stopIntegration).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(Screen.Fetching);
  });

  test('opens an unrecognized external URL', async () => {
    const callback = await renderAndGetCallback();
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    callback.inAppMessageClickAction(
      { id: 'external-message' },
      { text: 'Learn more', url: 'https://example.com/learn-more' }
    );

    expect(trackInAppMessageClick).toHaveBeenCalledWith(
      { id: 'external-message' },
      'Learn more',
      'https://example.com/learn-more'
    );
    expect(openUrl).toHaveBeenCalledWith('https://example.com/learn-more');
  });

  describe('StopSDK message timer', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test('stops after four seconds without navigating', async () => {
      const navigate = jest.spyOn(RootNavigation, 'navigate');
      jest.spyOn(ExponeaSdk, 'isConfigured').mockResolvedValueOnce(true);
      const view = render(<App />);
      await act(async () => Promise.resolve());
      expect(view.getByTestId(AutomationIds.OPEN_INBOX)).toBeTruthy();
      const callback = (setInAppMessageCallback as jest.Mock).mock.calls.at(
        -1
      )[0];
      callback.inAppMessageShown({
        id: 'timer-only',
        name: 'Campaign StopSDK',
      });

      await act(async () => jest.advanceTimersByTime(3999));
      expect(stopIntegration).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(1);
        await Promise.resolve();
      });
      expect(stopIntegration).toHaveBeenCalledTimes(1);
      expect(navigate).not.toHaveBeenCalled();
      expect(view.getByTestId(AutomationIds.FETCH_CONSENTS)).toBeTruthy();
      expect(view.queryByTestId(AutomationIds.OPEN_INBOX)).toBeNull();
      expect(
        StyleSheet.flatten(
          view.getByTestId(AutomationIds.STATUS_SDK_INDICATOR).props.style
        ).backgroundColor
      ).toBe('red');
    });

    test('does not schedule a stop for other message names', async () => {
      const callback = await renderAndGetCallback();
      callback.inAppMessageShown({ id: 'ordinary', name: 'Ordinary campaign' });
      await act(async () => jest.advanceTimersByTime(4000));
      expect(stopIntegration).not.toHaveBeenCalled();
    });

    test('cancels the timer when a stop URL is tapped first', async () => {
      let resolveTracking: (() => void) | undefined;
      trackInAppMessageClick.mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveTracking = resolve;
          })
      );
      const navigate = jest.spyOn(RootNavigation, 'navigate');
      const callback = await renderAndGetCallback();
      const message = { id: 'stop-button', name: 'Campaign StopSDK' };
      callback.inAppMessageShown(message);
      callback.inAppMessageClickAction(message, {
        text: 'Continue',
        url: 'exponea://stopAndContinue',
      });

      await act(async () => jest.advanceTimersByTime(4000));
      expect(stopIntegration).not.toHaveBeenCalled();
      resolveTracking?.();
      await act(async () => Promise.resolve());
      expect(stopIntegration).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(Screen.Fetching);
    });

    test('a stop URL navigates after the timer already stopped the SDK', async () => {
      const navigate = jest.spyOn(RootNavigation, 'navigate');
      const callback = await renderAndGetCallback();
      const message = { id: 'late-button', name: 'Campaign StopSDK' };
      callback.inAppMessageShown(message);
      await act(async () => {
        jest.advanceTimersByTime(4000);
        await Promise.resolve();
      });

      callback.inAppMessageClickAction(message, {
        text: 'Continue',
        url: 'exponea://stopAndContinue',
      });
      await act(async () => {
        await Promise.resolve();
      });
      expect(stopIntegration).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(Screen.Fetching);
    });

    test('clears the timer when the callback is removed', async () => {
      const { unmount } = render(<App />);
      await act(async () => Promise.resolve());
      const callback = (setInAppMessageCallback as jest.Mock).mock.calls.at(
        -1
      )[0];
      callback.inAppMessageShown({ id: 'unmounted', name: 'StopSDK' });
      unmount();
      await act(async () => jest.advanceTimersByTime(4000));
      expect(stopIntegration).not.toHaveBeenCalled();
    });
  });

  test('stopAndContinue keeps Fetching visible after a configured relaunch', async () => {
    jest.spyOn(ExponeaSdk, 'isConfigured').mockResolvedValueOnce(true);
    const view = render(<App />);
    await act(async () => Promise.resolve());
    expect(view.getByTestId(AutomationIds.OPEN_INBOX)).toBeTruthy();

    const callback = (setInAppMessageCallback as jest.Mock).mock.calls.at(
      -1
    )[0];
    callback.inAppMessageClickAction(
      { id: 'relaunched', name: 'Stop SDK' },
      { text: 'Continue', url: 'exponea://stopAndContinue' }
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(view.getByTestId(AutomationIds.FETCH_CONSENTS)).toBeTruthy();
    expect(view.queryByTestId(AutomationIds.OPEN_INBOX)).toBeNull();
    expect(view.queryByTestId(AutomationIds.AUTH_TITLE)).toBeNull();
  });
});
