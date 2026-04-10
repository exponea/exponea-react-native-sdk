/**
 * Tests for push notification / deep link URL resolution and handling.
 *
 * The app receives URLs from push notification open actions and from the
 * system Linking API. resolveDeeplinkDestination maps each URL to the
 * Screen the app should navigate to (or null when unrecognised).
 * handleDeeplinkDestination executes the side-effects for a resolved Screen.
 */

import {
  resolveDeeplinkDestination,
  handleDeeplinkDestination,
  type DeeplinkHandlerDeps,
} from '../src/util/deeplink';
import { Screen } from '../src/screens/Screens';

// ---------------------------------------------------------------------------
// Shared helper: build a fresh set of mocked deps for each test
// ---------------------------------------------------------------------------
function makeDeps(
  stopResult: 'resolve' | 'reject' = 'resolve'
): DeeplinkHandlerDeps {
  return {
    stopIntegration: jest.fn(() =>
      stopResult === 'resolve'
        ? Promise.resolve()
        : Promise.reject(new Error('stop failed'))
    ),
    navigate: jest.fn(),
    returnToAuth: jest.fn(),
  };
}

describe('resolveDeeplinkDestination', () => {
  // -------------------------------------------------------------------------
  // Each keyword → expected Screen
  // -------------------------------------------------------------------------

  describe('known destinations', () => {
    const cases: [string, string, Screen][] = [
      ['flush keyword', 'exponea://flush', Screen.Flushing],
      ['track keyword', 'exponea://track', Screen.Tracking],
      ['fetch keyword', 'exponea://fetch', Screen.Fetching],
      ['anonymize keyword', 'exponea://anonymize', Screen.Anonymize],
      ['inappcb keyword', 'exponea://inappcb', Screen.InAppCB],
      [
        'stopAndContinue keyword',
        'exponea://stopAndContinue',
        Screen.StopAndContinue,
      ],
      [
        'stopAndRestart keyword',
        'exponea://stopAndRestart',
        Screen.StopAndRestart,
      ],
    ];

    test.each(cases)('%s → %s', (_label, url, expected) => {
      expect(resolveDeeplinkDestination(url)).toBe(expected);
    });
  });

  // -------------------------------------------------------------------------
  // URL format variations — keyword can appear anywhere in the URL
  // -------------------------------------------------------------------------

  describe('URL format variations', () => {
    test('custom scheme with path', () => {
      expect(resolveDeeplinkDestination('myapp://push/track')).toBe(
        Screen.Tracking
      );
    });

    test('https universal link', () => {
      expect(resolveDeeplinkDestination('https://example.com/fetch')).toBe(
        Screen.Fetching
      );
    });

    test('keyword embedded in longer path segment', () => {
      expect(resolveDeeplinkDestination('exponea://action/flush/now')).toBe(
        Screen.Flushing
      );
    });

    test('keyword as query parameter value', () => {
      expect(
        resolveDeeplinkDestination('exponea://open?screen=anonymize')
      ).toBe(Screen.Anonymize);
    });

    test('stopAndContinue with extra path', () => {
      expect(
        resolveDeeplinkDestination('exponea://deeplink/stopAndContinue/confirm')
      ).toBe(Screen.StopAndContinue);
    });

    test('stopAndRestart with query string', () => {
      expect(
        resolveDeeplinkDestination('exponea://action?type=stopAndRestart')
      ).toBe(Screen.StopAndRestart);
    });
  });

  // -------------------------------------------------------------------------
  // Priority — first matching rule wins (same order as the switch logic)
  // -------------------------------------------------------------------------

  describe('keyword match priority', () => {
    test('flush takes priority over track when both present', () => {
      // "flush" keyword appears before "track" in the resolution logic
      expect(resolveDeeplinkDestination('exponea://flush/track')).toBe(
        Screen.Flushing
      );
    });

    test('stopAndContinue takes priority over stopAndRestart when both are substrings', () => {
      // stopAndContinue is checked before stopAndRestart
      expect(resolveDeeplinkDestination('exponea://stopAndContinue')).toBe(
        Screen.StopAndContinue
      );
    });

    test('stopAndRestart does not match stopAndContinue URL', () => {
      expect(resolveDeeplinkDestination('exponea://stopAndContinue')).not.toBe(
        Screen.StopAndRestart
      );
    });
  });

  // -------------------------------------------------------------------------
  // Unknown / unrecognised URLs → null
  // -------------------------------------------------------------------------

  describe('unknown destinations return null', () => {
    test('empty string', () => {
      expect(resolveDeeplinkDestination('')).toBeNull();
    });

    test('unrelated URL', () => {
      expect(resolveDeeplinkDestination('https://example.com/home')).toBeNull();
    });

    test('URL with no matching keyword', () => {
      expect(resolveDeeplinkDestination('exponea://settings')).toBeNull();
    });

    test('partial keyword match (case-sensitive)', () => {
      // "Flush" (capital F) should NOT match "flush"
      expect(resolveDeeplinkDestination('exponea://Flush')).toBeNull();
    });

    test('partial keyword match (Track vs track)', () => {
      expect(resolveDeeplinkDestination('exponea://Track')).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// handleDeeplinkDestination
// ---------------------------------------------------------------------------

describe('handleDeeplinkDestination', () => {
  // -------------------------------------------------------------------------
  // Plain navigation screens — no SDK stop, just navigate
  // -------------------------------------------------------------------------

  describe('plain navigation (no SDK stop)', () => {
    const plainScreens: Screen[] = [
      Screen.Tracking,
      Screen.Fetching,
      Screen.Flushing,
      Screen.Anonymize,
      Screen.InAppCB,
    ];

    test.each(plainScreens)(
      '%s → navigate called immediately, SDK not stopped',
      (screen) => {
        const deps = makeDeps();
        handleDeeplinkDestination(screen, deps);

        expect(deps.navigate).toHaveBeenCalledWith(screen);
        expect(deps.stopIntegration).not.toHaveBeenCalled();
        expect(deps.returnToAuth).not.toHaveBeenCalled();
      }
    );
  });

  // -------------------------------------------------------------------------
  // StopAndContinue — stops the SDK then navigates to Fetching
  // -------------------------------------------------------------------------

  describe('StopAndContinue', () => {
    test('calls stopIntegration then navigates to Fetching', async () => {
      const deps = makeDeps();
      handleDeeplinkDestination(Screen.StopAndContinue, deps);

      expect(deps.stopIntegration).toHaveBeenCalledTimes(1);
      // navigate is called only after the promise resolves
      expect(deps.navigate).not.toHaveBeenCalled();

      await Promise.resolve(); // flush microtask queue

      expect(deps.navigate).toHaveBeenCalledWith(Screen.Fetching);
      expect(deps.returnToAuth).not.toHaveBeenCalled();
    });

    test('does not navigate to the StopAndContinue screen itself', async () => {
      const deps = makeDeps();
      handleDeeplinkDestination(Screen.StopAndContinue, deps);
      await Promise.resolve();

      expect(deps.navigate).not.toHaveBeenCalledWith(Screen.StopAndContinue);
    });

    test('does not call returnToAuth', async () => {
      const deps = makeDeps();
      handleDeeplinkDestination(Screen.StopAndContinue, deps);
      await Promise.resolve();

      expect(deps.returnToAuth).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // StopAndRestart — stops the SDK then returns to Auth screen
  // -------------------------------------------------------------------------

  describe('StopAndRestart', () => {
    test('calls stopIntegration then calls returnToAuth', async () => {
      const deps = makeDeps();
      handleDeeplinkDestination(Screen.StopAndRestart, deps);

      expect(deps.stopIntegration).toHaveBeenCalledTimes(1);
      expect(deps.returnToAuth).not.toHaveBeenCalled();

      await Promise.resolve();

      expect(deps.returnToAuth).toHaveBeenCalledTimes(1);
      expect(deps.navigate).not.toHaveBeenCalled();
    });

    test('does not navigate to any screen', async () => {
      const deps = makeDeps();
      handleDeeplinkDestination(Screen.StopAndRestart, deps);
      await Promise.resolve();

      expect(deps.navigate).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // StopAndContinue vs StopAndRestart — distinct behaviour
  // -------------------------------------------------------------------------

  describe('StopAndContinue vs StopAndRestart are distinct', () => {
    test('StopAndContinue navigates; StopAndRestart calls returnToAuth', async () => {
      const continDeps = makeDeps();
      const restartDeps = makeDeps();

      handleDeeplinkDestination(Screen.StopAndContinue, continDeps);
      handleDeeplinkDestination(Screen.StopAndRestart, restartDeps);
      await Promise.resolve();

      expect(continDeps.navigate).toHaveBeenCalledWith(Screen.Fetching);
      expect(continDeps.returnToAuth).not.toHaveBeenCalled();

      expect(restartDeps.returnToAuth).toHaveBeenCalledTimes(1);
      expect(restartDeps.navigate).not.toHaveBeenCalled();
    });
  });
});
