import NativeExponea from '../NativeExponea';
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
});
