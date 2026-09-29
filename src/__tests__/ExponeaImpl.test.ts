import NativeExponea from '../NativeExponea';
import type { AppInboxAction, AppInboxMessage } from '../NativeExponea';
import { Exponea } from '../ExponeaImpl';
import { InAppMessageTestData } from './InAppMessageTestData';
import type { CustomerIdentity } from '../CustomerIdentity';

describe('identifyCustomer bridge wrapping', () => {
  beforeEach(() => {
    (NativeExponea as any).identifyCustomer = jest.fn().mockResolvedValue(null);
  });

  const mockIdentifyCustomer = () =>
    (NativeExponea as any).identifyCustomer as ReturnType<typeof jest.fn>;

  test('flat record is wrapped into CustomerIdentity', async () => {
    await Exponea.identifyCustomer(
      { email: 'jane.doe@example.com' },
      { first_name: 'Jane' }
    );
    expect(mockIdentifyCustomer()).toHaveBeenCalledWith(
      { customerIds: { email: 'jane.doe@example.com' } },
      { first_name: 'Jane' }
    );
  });

  test('CustomerIdentity with sdkAuthToken passes through unchanged', async () => {
    const identity: CustomerIdentity = {
      customerIds: { email: 'jane.doe@example.com' },
      sdkAuthToken: 'mock-jwt',
    };
    await Exponea.identifyCustomer(identity, { first_name: 'Jane' });
    expect(mockIdentifyCustomer()).toHaveBeenCalledWith(identity, {
      first_name: 'Jane',
    });
  });

  test('CustomerIdentity without sdkAuthToken passes through unchanged', async () => {
    const identity: CustomerIdentity = {
      customerIds: { email: 'jane.doe@example.com' },
    };
    await Exponea.identifyCustomer(identity, { first_name: 'Jane' });
    expect(mockIdentifyCustomer()).toHaveBeenCalledWith(identity, {
      first_name: 'Jane',
    });
  });

  test('wraps a legacy string identifier named customerIds', async () => {
    const ids = { customerIds: 'external-id', registered: 'customer-1' };

    await Exponea.identifyCustomer(ids, {});

    expect(mockIdentifyCustomer().mock.calls).toStrictEqual([
      [{ customerIds: ids }, {}],
    ]);
  });

  test('defaults omitted properties to {} and preserves the identity token', async () => {
    const identity: CustomerIdentity = {
      customerIds: { registered: 'customer-1' },
      sdkAuthToken: 'mock-jwt',
    };

    await Exponea.identifyCustomer(identity);

    expect(mockIdentifyCustomer().mock.calls).toStrictEqual([[identity, {}]]);
  });

  test('{ customerIds: null } is NOT treated as CustomerIdentity', async () => {
    await Exponea.identifyCustomer({ customerIds: null } as any);
    // should be wrapped as flat record, not passed through as-is
    expect(mockIdentifyCustomer()).toHaveBeenCalledWith(
      { customerIds: { customerIds: null } },
      {}
    );
  });
});

describe('ExponeaImpl normalization', () => {
  beforeEach(() => {
    (NativeExponea as any).trackInAppMessageClick = jest
      .fn()
      .mockResolvedValue(null);
    (NativeExponea as any).trackInAppMessageClickWithoutTrackingConsent = jest
      .fn()
      .mockResolvedValue(null);
    (NativeExponea as any).trackInAppMessageClose = jest
      .fn()
      .mockResolvedValue(null);
    (NativeExponea as any).trackInAppMessageCloseWithoutTrackingConsent = jest
      .fn()
      .mockResolvedValue(null);
  });

  test('trackInAppMessageClick normalizes undefined to null', async () => {
    const message = InAppMessageTestData.buildInAppMessage();
    await Exponea.trackInAppMessageClick(message, undefined, undefined);
    expect((NativeExponea as any).trackInAppMessageClick).toHaveBeenCalledWith(
      message,
      null,
      null
    );
  });

  test('trackInAppMessageClose normalizes undefined to null', async () => {
    const message = InAppMessageTestData.buildInAppMessage();
    await Exponea.trackInAppMessageClose(message, undefined, false);
    expect((NativeExponea as any).trackInAppMessageClose).toHaveBeenCalledWith(
      message,
      null,
      false
    );
  });

  // Legacy undefined inputs are normalized to the documented null values.
  test('normalizes missing click fields when bypassing consent', async () => {
    const message = InAppMessageTestData.buildInAppMessage();

    await Exponea.trackInAppMessageClickWithoutTrackingConsent(
      message,
      undefined,
      undefined
    );

    expect(
      jest.mocked(NativeExponea.trackInAppMessageClickWithoutTrackingConsent)
        .mock.calls
    ).toStrictEqual([[message, null, null]]);
    expect(NativeExponea.trackInAppMessageClick).not.toHaveBeenCalled();
  });

  test('normalizes missing close text and preserves false interaction when bypassing consent', async () => {
    const message = InAppMessageTestData.buildInAppMessage();

    await Exponea.trackInAppMessageCloseWithoutTrackingConsent(
      message,
      undefined,
      false
    );

    expect(
      jest.mocked(NativeExponea.trackInAppMessageCloseWithoutTrackingConsent)
        .mock.calls
    ).toStrictEqual([[message, null, false]]);
    expect(NativeExponea.trackInAppMessageClose).not.toHaveBeenCalled();
  });

  test.each([
    ['trackInAppMessageClick', 'trackInAppMessageClickWithoutTrackingConsent'],
    ['trackInAppMessageClickWithoutTrackingConsent', 'trackInAppMessageClick'],
  ] as const)(
    '%s preserves empty text and URLs in argument order',
    async (method, otherMethod) => {
      const message = InAppMessageTestData.buildInAppMessage();
      const url = 'https://example.com';

      await Exponea[method](message, '', url);
      await Exponea[method](message, 'Click me', '');

      expect(jest.mocked(NativeExponea[method]).mock.calls).toStrictEqual([
        [message, '', url],
        [message, 'Click me', ''],
      ]);
      expect(NativeExponea[otherMethod]).not.toHaveBeenCalled();
    }
  );

  test.each([
    ['trackInAppMessageClose', 'trackInAppMessageCloseWithoutTrackingConsent'],
    ['trackInAppMessageCloseWithoutTrackingConsent', 'trackInAppMessageClose'],
  ] as const)(
    '%s preserves empty text and false interaction',
    async (method, otherMethod) => {
      const message = InAppMessageTestData.buildInAppMessage();

      await Exponea[method](message, '', false);

      expect(jest.mocked(NativeExponea[method]).mock.calls).toStrictEqual([
        [message, '', false],
      ]);
      expect(NativeExponea[otherMethod]).not.toHaveBeenCalled();
    }
  );
});

describe('default properties decoding', () => {
  const mockGetDefaultProperties = jest.fn();

  beforeEach(() => {
    mockGetDefaultProperties.mockReset();
    NativeExponea.getDefaultProperties = mockGetDefaultProperties;
  });

  test('decodes nested properties and preserves falsy values', async () => {
    const properties = {
      enabled: false,
      count: 0,
      label: '',
      optional: null,
      nested: { values: ['app'] },
    };
    mockGetDefaultProperties.mockResolvedValue(JSON.stringify(properties));

    await expect(Exponea.getDefaultProperties()).resolves.toStrictEqual(
      properties
    );
  });

  test('propagates native errors', async () => {
    const error = new Error('SDK is not configured');
    mockGetDefaultProperties.mockRejectedValue(error);

    await expect(Exponea.getDefaultProperties()).rejects.toBe(error);
  });

  test('rejects malformed native JSON', async () => {
    mockGetDefaultProperties.mockResolvedValue('{broken');

    await expect(Exponea.getDefaultProperties()).rejects.toThrow();
  });
});

describe('configuration status', () => {
  test.each([false, true])(
    'resolves the native configured state %s',
    async (configured) => {
      NativeExponea.isConfigured = jest.fn().mockReturnValue(configured);

      const result = Exponea.isConfigured();

      await expect(result).resolves.toBe(configured);
      expect(jest.mocked(NativeExponea.isConfigured).mock.calls).toStrictEqual([
        [],
      ]);
    }
  );
});

describe('push tracking consent routing', () => {
  const methods = [
    'trackDeliveredPush',
    'trackDeliveredPushWithoutTrackingConsent',
    'trackClickedPush',
    'trackClickedPushWithoutTrackingConsent',
  ] as const;

  beforeEach(() => {
    for (const method of methods) {
      NativeExponea[method] = jest.fn().mockResolvedValue(undefined);
    }
  });

  test.each(methods)(
    '%s preserves the payload and selects only its native method',
    async (method) => {
      const params = {
        has_tracking_consent: 'false',
        campaign_id: 'campaign-1',
      };

      await Exponea[method](params);

      expect(jest.mocked(NativeExponea[method]).mock.calls).toStrictEqual([
        [params],
      ]);
      for (const otherMethod of methods) {
        if (otherMethod !== method) {
          expect(NativeExponea[otherMethod]).not.toHaveBeenCalled();
        }
      }
    }
  );
});

describe('App Inbox click tracking consent routing', () => {
  beforeEach(() => {
    NativeExponea.trackAppInboxClick = jest.fn().mockResolvedValue(undefined);
    NativeExponea.trackAppInboxClickWithoutTrackingConsent = jest
      .fn()
      .mockResolvedValue(undefined);
  });

  test.each([
    ['trackAppInboxClick', 'trackAppInboxClickWithoutTrackingConsent'],
    ['trackAppInboxClickWithoutTrackingConsent', 'trackAppInboxClick'],
  ] as const)(
    '%s forwards action before message to only the requested native method',
    async (method, otherMethod) => {
      const action: AppInboxAction = {
        action: 'browser',
        title: 'Open offer',
        url: 'https://example.com/offer',
      };
      const message: AppInboxMessage = {
        id: 'inbox-message-1',
        type: 'push',
        content: { has_tracking_consent: false },
      };

      await Exponea[method](action, message);

      expect(jest.mocked(NativeExponea[method]).mock.calls).toStrictEqual([
        [action, message],
      ]);
      expect(NativeExponea[otherMethod]).not.toHaveBeenCalled();
    }
  );
});
