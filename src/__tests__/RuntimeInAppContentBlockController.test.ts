import NativeExponea from '../NativeExponea';
import { Exponea } from '../ExponeaImpl';
import {
  InAppContentBlockAvailability,
  InAppContentBlockInvalidateMode,
} from '../RuntimeInAppContentBlockController';
import type { RuntimeInAppContentBlockController } from '../RuntimeInAppContentBlockController';

jest.mock('../NativeExponea', () => ({
  __esModule: true,
  default: {
    isConfigured: jest.fn(() => false),
    configure: jest.fn(),
    identifyCustomer: jest.fn(),
    anonymize: jest.fn(),
    stopIntegration: jest.fn(),
    runtimeICBPrefetch: jest.fn(),
    runtimeICBAvailability: jest.fn(),
    runtimeICBInvalidate: jest.fn(),
    onSegmentationCallbackSet: jest.fn(),
    onSegmentationCallbackRemove: jest.fn(),
  },
}));

// Phase 1 of the Runtime ICB controller: a thin Promise facade over the native
// controller. These tests cover the bridge invocation contract (arguments, Promise
// resolve/reject) and the JS-side lifecycle (null before configure, fresh controller
// after configure, null after stopIntegration, stable across identify/anonymize).

const config = {
  integrationConfig: { projectToken: 'project', authorizationToken: 'token' },
};

const nativePrefetch = jest.mocked(NativeExponea.runtimeICBPrefetch);
const nativeAvailability = jest.mocked(NativeExponea.runtimeICBAvailability);
const nativeInvalidate = jest.mocked(NativeExponea.runtimeICBInvalidate);
const nativeConfigure = jest.mocked(NativeExponea.configure);
const nativeStop = jest.mocked(NativeExponea.stopIntegration);

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function configuredController(): Promise<RuntimeInAppContentBlockController> {
  await Exponea.configure(config);
  const controller = Exponea.inAppContentBlocksController;
  if (!controller) {
    throw new Error('configure() did not create a controller');
  }
  return controller;
}

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(NativeExponea.isConfigured).mockReturnValue(false);
  nativeConfigure.mockResolvedValue(undefined);
  nativeStop.mockResolvedValue(undefined);
  jest.mocked(NativeExponea.identifyCustomer).mockResolvedValue(undefined);
  jest.mocked(NativeExponea.anonymize).mockResolvedValue(undefined);
  nativePrefetch.mockResolvedValue({});
  nativeAvailability.mockResolvedValue({ status: 'timedOut' });
  nativeInvalidate.mockResolvedValue(undefined);
});

afterEach(async () => {
  // Leave no controller behind for the next test, even after a test that made
  // the native stop reject.
  if (Exponea.inAppContentBlocksController) {
    nativeStop.mockReset();
    nativeStop.mockResolvedValue(undefined);
    await Exponea.stopIntegration();
  }
});

describe('bridge invocation', () => {
  test('prefetch forwards ids and deadline and resolves the native availability map', async () => {
    const controller = await configuredController();
    nativePrefetch.mockResolvedValue({
      example_top: 'ready',
      example_list: 'empty',
      example_slow: 'loading',
    });

    const result = await controller.prefetch(
      ['example_top', 'example_list', 'example_slow'],
      2000
    );

    expect(nativePrefetch.mock.calls).toStrictEqual([
      [['example_top', 'example_list', 'example_slow'], 2000],
    ]);
    expect(result).toStrictEqual({
      example_top: InAppContentBlockAvailability.READY,
      example_list: InAppContentBlockAvailability.EMPTY,
      example_slow: InAppContentBlockAvailability.LOADING,
    });
  });

  test('prefetch without a deadline passes no deadline to native', async () => {
    const controller = await configuredController();

    await controller.prefetch(['example_top']);

    expect(nativePrefetch).toHaveBeenCalledTimes(1);
    expect(nativePrefetch.mock.calls[0]).toStrictEqual([
      ['example_top'],
      undefined,
    ]);
  });

  test('availability forwards id and deadline and resolves a resolved decision', async () => {
    const controller = await configuredController();
    nativeAvailability.mockResolvedValue({
      status: 'resolved',
      availability: 'ready',
    });

    const decision = await controller.availability('example_top', 1500);

    expect(nativeAvailability.mock.calls).toStrictEqual([
      ['example_top', 1500],
    ]);
    expect(decision).toStrictEqual({
      status: 'resolved',
      availability: InAppContentBlockAvailability.READY,
    });
  });

  test('availability resolves a timed-out decision without an availability value', async () => {
    const controller = await configuredController();
    nativeAvailability.mockResolvedValue({ status: 'timedOut' });

    await expect(
      controller.availability('example_top', 50)
    ).resolves.toStrictEqual({ status: 'timedOut' });
  });

  test('invalidate defaults to eager mode', async () => {
    const controller = await configuredController();

    await expect(
      controller.invalidate(['example_top'], 'cms update')
    ).resolves.toBeUndefined();

    expect(nativeInvalidate.mock.calls).toStrictEqual([
      [['example_top'], 'cms update', 'eager'],
    ]);
  });

  test('invalidate forwards an explicit lazy mode', async () => {
    const controller = await configuredController();

    await controller.invalidate(
      ['example_top', 'example_list'],
      'logout',
      InAppContentBlockInvalidateMode.LAZY
    );

    expect(nativeInvalidate.mock.calls).toStrictEqual([
      [['example_top', 'example_list'], 'logout', 'lazy'],
    ]);
  });

  test.each([
    [
      'prefetch',
      nativePrefetch,
      (controller: RuntimeInAppContentBlockController) =>
        controller.prefetch(['id'], 10),
    ],
    [
      'availability',
      nativeAvailability,
      (controller: RuntimeInAppContentBlockController) =>
        controller.availability('id', 10),
    ],
    [
      'invalidate',
      nativeInvalidate,
      (controller: RuntimeInAppContentBlockController) =>
        controller.invalidate(['id'], 'r'),
    ],
  ])('%s propagates a native rejection', async (_name, nativeMock, call) => {
    const controller = await configuredController();
    (nativeMock as jest.Mock).mockRejectedValue(
      new Error('Runtime ICB controller is unavailable')
    );

    await expect(call(controller)).rejects.toThrow(
      'Runtime ICB controller is unavailable'
    );
  });
});

describe('controller lifecycle', () => {
  test('is null before configure()', () => {
    expect(Exponea.inAppContentBlocksController).toBeNull();
  });

  test('is created after a successful configure()', async () => {
    const pending = deferred();
    nativeConfigure.mockReturnValue(pending.promise);

    const configuring = Exponea.configure(config);
    expect(Exponea.inAppContentBlocksController).toBeNull();

    pending.resolve();
    await configuring;
    expect(Exponea.inAppContentBlocksController).not.toBeNull();
  });

  test('stays null when native configure() rejects', async () => {
    nativeConfigure.mockRejectedValue(new Error('bad config'));

    await expect(Exponea.configure(config)).rejects.toThrow('bad config');

    expect(Exponea.inAppContentBlocksController).toBeNull();
  });

  test('stays null when JS-side configuration validation rejects', async () => {
    await expect(Exponea.configure({} as any)).rejects.toThrow();

    expect(nativeConfigure).not.toHaveBeenCalled();
    expect(Exponea.inAppContentBlocksController).toBeNull();
  });

  test('is the same instance across identifyCustomer() and anonymize()', async () => {
    const controller = await configuredController();

    await Exponea.identifyCustomer({ registered: 'jane' }, {});
    expect(Exponea.inAppContentBlocksController).toBe(controller);

    await Exponea.anonymize();
    expect(Exponea.inAppContentBlocksController).toBe(controller);

    await expect(controller.prefetch(['example_top'])).resolves.toStrictEqual(
      {}
    );
  });

  test('is null after a successful stopIntegration()', async () => {
    const pending = deferred();
    await configuredController();
    nativeStop.mockReturnValue(pending.promise);

    const stopping = Exponea.stopIntegration();
    expect(Exponea.inAppContentBlocksController).not.toBeNull();

    pending.resolve();
    await stopping;
    expect(Exponea.inAppContentBlocksController).toBeNull();
  });

  test('a controller reference kept across stopIntegration() rejects every call', async () => {
    const controller = await configuredController();
    await Exponea.stopIntegration();

    const expectedError =
      'This RuntimeInAppContentBlockController is no longer active after stopIntegration(). Obtain a new controller from Exponea.inAppContentBlocksController after configuring the SDK.';
    await expect(controller.prefetch(['example_top'])).rejects.toThrow(
      expectedError
    );
    await expect(controller.availability('example_top', 10)).rejects.toThrow(
      expectedError
    );
    await expect(controller.invalidate(['example_top'], 'r')).rejects.toThrow(
      expectedError
    );
    await expect(controller.prefetch(['example_top'])).rejects.toMatchObject({
      code: 'RuntimeInAppContentBlockControllerUnavailable',
    });
    expect(nativePrefetch).not.toHaveBeenCalled();
    expect(nativeAvailability).not.toHaveBeenCalled();
    expect(nativeInvalidate).not.toHaveBeenCalled();
  });

  test('a rejected stopIntegration() keeps the controller usable', async () => {
    const controller = await configuredController();
    nativeStop.mockRejectedValue(new Error('stop failed'));

    await expect(Exponea.stopIntegration()).rejects.toThrow('stop failed');

    expect(Exponea.inAppContentBlocksController).toBe(controller);
    await expect(controller.prefetch(['example_top'])).resolves.toStrictEqual(
      {}
    );
  });

  test('concurrent stopIntegration() calls share one Promise and clear the controller once', async () => {
    await configuredController();
    const pending = deferred();
    nativeStop.mockReturnValueOnce(pending.promise);

    const first = Exponea.stopIntegration();
    const second = Exponea.stopIntegration();
    expect(second).toBe(first);
    expect(nativeStop).toHaveBeenCalledTimes(1);

    pending.resolve();
    await Promise.all([first, second]);
    expect(Exponea.inAppContentBlocksController).toBeNull();
  });

  test('a repeated configure() while configured keeps the same instance and held references working', async () => {
    const first = await configuredController();

    // Android resolves a second configure() while the SDK is already running.
    const second = await configuredController();

    expect(second).toBe(first);
    expect(nativeConfigure).toHaveBeenCalledTimes(2);
    await expect(first.prefetch(['example_top'])).resolves.toStrictEqual({});
  });

  test('a configure() after stopIntegration() creates a fresh controller and the old one stays deactivated', async () => {
    const first = await configuredController();
    await Exponea.stopIntegration();

    const second = await configuredController();

    expect(second).not.toBe(first);
    await expect(second.prefetch(['example_top'])).resolves.toStrictEqual({});
    await expect(first.prefetch(['example_top'])).rejects.toThrow(
      'no longer active after stopIntegration()'
    );
  });

  test('exists at module load when the native SDK is already configured', () => {
    jest.isolateModules(() => {
      const native = require('../NativeExponea').default;
      native.isConfigured.mockReturnValue(true);
      const { Exponea: isolated } = require('../ExponeaImpl');

      expect(isolated.inAppContentBlocksController).not.toBeNull();
    });
  });

  test('is null at module load when the native SDK is not configured', () => {
    jest.isolateModules(() => {
      const native = require('../NativeExponea').default;
      native.isConfigured.mockReturnValue(false);
      const { Exponea: isolated } = require('../ExponeaImpl');

      expect(isolated.inAppContentBlocksController).toBeNull();
    });
  });

  test('importing the SDK does not call native isConfigured()', () => {
    jest.isolateModules(() => {
      const native = require('../NativeExponea').default;
      native.isConfigured.mockClear();
      require('../ExponeaImpl');

      expect(native.isConfigured).not.toHaveBeenCalled();
    });
  });

  test('appears once host code configures the native SDK after import', () => {
    jest.isolateModules(() => {
      const native = require('../NativeExponea').default;
      native.isConfigured.mockReturnValue(false);
      const { Exponea: isolated } = require('../ExponeaImpl');
      expect(isolated.inAppContentBlocksController).toBeNull();

      native.isConfigured.mockReturnValue(true);
      const controller = isolated.inAppContentBlocksController;
      expect(controller).not.toBeNull();
      expect(isolated.inAppContentBlocksController).toBe(controller);
    });
  });
});

describe('input validation', () => {
  const invalidIds: Array<[string, unknown]> = [
    ['a number element', ['ok', 123]],
    ['a null element', [null]],
    ['a non-array', 'example_top'],
  ];

  test.each(invalidIds)(
    'prefetch rejects ids with %s without calling native',
    async (_, ids) => {
      const controller = await configuredController();

      await expect(controller.prefetch(ids as string[])).rejects.toMatchObject({
        code: 'RuntimeInAppContentBlockControllerError',
      });
      expect(nativePrefetch).not.toHaveBeenCalled();
    }
  );

  test.each(invalidIds)(
    'invalidate rejects ids with %s without calling native',
    async (_, ids) => {
      const controller = await configuredController();

      await expect(
        controller.invalidate(ids as string[], 'reason')
      ).rejects.toMatchObject({
        code: 'RuntimeInAppContentBlockControllerError',
      });
      expect(nativeInvalidate).not.toHaveBeenCalled();
    }
  );

  test('prefetch rejects a NaN deadline without calling native', async () => {
    const controller = await configuredController();

    await expect(
      controller.prefetch(['example_top'], NaN)
    ).rejects.toMatchObject({
      code: 'RuntimeInAppContentBlockControllerError',
    });
    expect(nativePrefetch).not.toHaveBeenCalled();
  });

  test.each([
    ['NaN', NaN],
    ['a string', '200'],
    ['undefined', undefined],
  ])(
    'availability rejects a %s deadline without calling native',
    async (_, deadline) => {
      const controller = await configuredController();

      await expect(
        controller.availability('example_top', deadline as number)
      ).rejects.toMatchObject({
        code: 'RuntimeInAppContentBlockControllerError',
      });
      expect(nativeAvailability).not.toHaveBeenCalled();
    }
  );

  test.each([
    ['a number', 123],
    ['null', null],
  ])('availability rejects %s id without calling native', async (_, id) => {
    const controller = await configuredController();

    await expect(
      controller.availability(id as unknown as string, 200)
    ).rejects.toMatchObject({
      code: 'RuntimeInAppContentBlockControllerError',
    });
    expect(nativeAvailability).not.toHaveBeenCalled();
  });

  test('infinite deadlines are passed through', async () => {
    const controller = await configuredController();

    await controller.prefetch(['example_top'], Infinity);
    await controller.availability('example_top', Infinity);

    expect(nativePrefetch).toHaveBeenCalledWith(['example_top'], Infinity);
    expect(nativeAvailability).toHaveBeenCalledWith('example_top', Infinity);
  });
});
