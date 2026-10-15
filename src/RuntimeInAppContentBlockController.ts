import NativeExponea from './NativeExponea';

/**
 * Current runtime availability of an in-app content block placeholder.
 */
export enum InAppContentBlockAvailability {
  READY = 'ready',
  LOADING = 'loading',
  EMPTY = 'empty',
}

/**
 * Controls how invalidated content is refreshed.
 */
export enum InAppContentBlockInvalidateMode {
  /**
   * Evict cached content and immediately start warming it again.
   */
  EAGER = 'eager',

  /**
   * Evict cached content and wait until the next access before loading it.
   */
  LAZY = 'lazy',
}

/**
 * Result of a bounded availability request.
 *
 * `resolved` always represents a terminal availability result.
 * `timedOut` means only that this caller stopped waiting.
 * The native load may continue in the background.
 */
export type InAppContentBlockAvailabilityDecision =
  | {
      status: 'resolved';
      availability: InAppContentBlockAvailability;
    }
  | {
      status: 'timedOut';
    };

/**
 * Runtime control API for In-App Content Blocks.
 *
 * Rejections use `Error` objects. Known bridge error codes are
 * `RuntimeInAppContentBlockControllerUnavailable`, `RuntimeInAppContentBlockControllerInvalidMode`, and
 * `RuntimeInAppContentBlockControllerError` for unexpected native failures. Native error details
 * are preserved. Availability timeouts are decisions, not rejections.
 *
 * Rendering and tracking remain owned by
 * InAppContentBlocksPlaceholder and ContentBlockCarouselView.
 */
export interface RuntimeInAppContentBlockController {
  /**
   * Warm one or more placeholder IDs.
   *
   * When deadlineMs is omitted, waits until every ID reaches a terminal
   * state (`ready` or `empty`). With a deadline, the returned availability
   * is a snapshot taken when that caller's wait ends: IDs that have not
   * resolved yet are reported as `loading` on iOS and `empty` on Android.
   * Treat such a value as temporary, not as a final no-content decision;
   * the background load continues and warms the cache.
   *
   * A deadline of zero or less returns the snapshot immediately.
   */
  prefetch(
    ids: string[],
    deadlineMs?: number
  ): Promise<Record<string, InAppContentBlockAvailability>>;

  /**
   * Wait for one placeholder to become terminally available.
   *
   * Resolves with `ready`/`empty`, or `timedOut` when the deadline expires.
   * A resolved decision never carries `loading`. Timing out does not cancel
   * the underlying fetch; a later call or a placeholder mount can use content
   * that finishes loading afterwards. A deadline of zero or less resolves
   * `timedOut` immediately while still starting the load.
   */
  availability(
    id: string,
    deadlineMs: number
  ): Promise<InAppContentBlockAvailabilityDecision>;

  /**
   * Evict runtime ICB content for the supplied IDs.
   *
   * Use it for a known content change, not to acknowledge a successful
   * prefetch: invalidating right after a `ready` result discards the warmed
   * content and starts another request. `reason` is a local diagnostic label
   * written to verbose logs only. Unknown IDs are accepted and start loading.
   *
   * The Promise means the invalidation request was accepted by the
   * native controller. It does not mean an eager reload has finished.
   */
  invalidate(
    ids: string[],
    reason: string,
    mode?: InAppContentBlockInvalidateMode
  ): Promise<void>;
}

/**
 * JavaScript facade for the native Runtime ICB controller.
 *
 * It intentionally does not hold a native controller reference.
 * Every operation goes through NativeExponea so native lifecycle
 * handling remains authoritative.
 */
export class RuntimeInAppContentBlockControllerImpl implements RuntimeInAppContentBlockController {
  private active = true;

  /**
   * Invalidates this facade after stopIntegration().
   *
   * A later configure() creates a different facade.
   */
  deactivate(): void {
    this.active = false;
  }

  private assertActive(): void {
    if (!this.active) {
      throw Object.assign(
        new Error(
          'This RuntimeInAppContentBlockController is no longer active after stopIntegration(). Obtain a new controller from Exponea.inAppContentBlocksController after configuring the SDK.'
        ),
        { code: 'RuntimeInAppContentBlockControllerUnavailable' }
      );
    }
  }

  async prefetch(
    ids: string[],
    deadlineMs?: number
  ): Promise<Record<string, InAppContentBlockAvailability>> {
    this.assertActive();

    return (await NativeExponea.runtimeICBPrefetch(ids, deadlineMs)) as Record<
      string,
      InAppContentBlockAvailability
    >;
  }

  async availability(
    id: string,
    deadlineMs: number
  ): Promise<InAppContentBlockAvailabilityDecision> {
    this.assertActive();

    return (await NativeExponea.runtimeICBAvailability(
      id,
      deadlineMs
    )) as InAppContentBlockAvailabilityDecision;
  }

  async invalidate(
    ids: string[],
    reason: string,
    mode: InAppContentBlockInvalidateMode = InAppContentBlockInvalidateMode.EAGER
  ): Promise<void> {
    this.assertActive();

    await NativeExponea.runtimeICBInvalidate(ids, reason, mode);
  }
}
