import NativeExponea from '../NativeExponea';
import { Exponea } from '../ExponeaImpl';
import { InAppMessageTestData } from './InAppMessageTestData';

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
