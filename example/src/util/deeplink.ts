import { Screen } from '../screens/Screens';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Side-effect dependencies for handleDeeplinkDestination.
 * Passed explicitly so the function stays pure and easily testable.
 */
export type DeeplinkHandlerDeps = {
  /** Stop the Exponea SDK integration (async). */
  stopIntegration: () => Promise<void>;
  /** Navigate to an app screen. */
  navigate: (screen: Screen) => void;
  /** Return the user to the Auth / configuration screen. */
  returnToAuth: () => void;
};

// ---------------------------------------------------------------------------
// Link resolution
// ---------------------------------------------------------------------------

/**
 * Resolves a URL received from a push notification or deep link into the
 * corresponding app Screen to navigate to.
 *
 * Returns null when the URL does not match any known destination.
 */
export function resolveDeeplinkDestination(url: string): Screen | null {
  if (url.includes('flush')) {
    return Screen.Flushing;
  }
  if (url.includes('track')) {
    return Screen.Tracking;
  }
  if (url.includes('fetch')) {
    return Screen.Fetching;
  }
  if (url.includes('anonymize')) {
    return Screen.Anonymize;
  }
  if (url.includes('inappcb')) {
    return Screen.InAppCB;
  }
  if (url.includes('stopAndContinue')) {
    return Screen.StopAndContinue;
  }
  if (url.includes('stopAndRestart')) {
    return Screen.StopAndRestart;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Destination handler
// ---------------------------------------------------------------------------

/**
 * Executes the navigation action for a resolved deep link destination.
 *
 * StopAndContinue / StopAndRestart first stop the SDK, then either navigate
 * to the Fetching screen or return the user to the Auth screen respectively.
 * All other destinations are a plain navigation with no SDK side-effect.
 */
export function handleDeeplinkDestination(
  target: Screen,
  deps: DeeplinkHandlerDeps
): void {
  switch (target) {
    case Screen.StopAndContinue:
      deps.stopIntegration().then(() => deps.navigate(Screen.Fetching));
      break;
    case Screen.StopAndRestart:
      deps.stopIntegration().then(() => deps.returnToAuth());
      break;
    default:
      deps.navigate(target);
      break;
  }
}
