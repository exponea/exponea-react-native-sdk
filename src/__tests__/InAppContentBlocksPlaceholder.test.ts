jest.mock('../InAppContentBlocksPlaceholderNativeComponent', () => ({
  __esModule: true,
  default: 'InAppContentBlocksPlaceholderNativeComponent',
}));

jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  useState: (initial: unknown) => [initial, jest.fn()],
  useCallback: (callback: unknown) => callback,
}));

import type React from 'react';
import InAppContentBlocksPlaceholder, {
  type InAppContentBlocksPlaceholderProps,
} from '../InAppContentBlocksPlaceholder';
import type {
  InAppContentBlock,
  InAppContentBlockAction,
} from '../NativeExponea';

const block: InAppContentBlock = {
  id: 'offer',
  name: 'Offer',
  placeholders: [],
};
const action: InAppContentBlockAction = {
  type: 'browser',
  name: 'Shop',
  url: 'https://example.com/offer',
};

type NativeProps = {
  overrideDefaultBehavior: boolean;
  onInAppContentBlockEvent: (event: {
    nativeEvent: Record<string, unknown>;
  }) => void;
};

// Mocked hooks allow testing wrapper dispatch, not mounting or rerender behavior.
function renderPlaceholder(
  props: Partial<InAppContentBlocksPlaceholderProps> = {}
): React.ReactElement<NativeProps> {
  return InAppContentBlocksPlaceholder({
    placeholderId: 'offers',
    ...props,
  }) as React.ReactElement<NativeProps>;
}

describe('InAppContentBlocksPlaceholder native events', () => {
  // Placeholder event names and callback signatures are defined by its wrapper/spec.
  test.each([
    ['SHOWN', 'onMessageShown', ['offers', block]],
    ['CLOSE_CLICKED', 'onCloseClicked', ['offers', block]],
    ['ACTION_CLICKED', 'onActionClicked', ['offers', block, action]],
    ['NO_MESSAGE_FOUND', 'onNoMessageFound', ['offers']],
    ['ERROR', 'onError', ['offers', block, 'Unable to load']],
  ] as const)(
    'routes %s once to %s with decoded data in callback argument order',
    (eventType, callbackName, expected) => {
      const callbacks = {
        onMessageShown: jest.fn(),
        onCloseClicked: jest.fn(),
        onActionClicked: jest.fn(),
        onNoMessageFound: jest.fn(),
        onError: jest.fn(),
      };
      const view = renderPlaceholder(callbacks);

      view.props.onInAppContentBlockEvent({
        nativeEvent: {
          eventType,
          placeholderId: 'unrelated-native-id',
          contentBlock: JSON.stringify(block),
          contentBlockAction: JSON.stringify(action),
          errorMessage: 'Unable to load',
        },
      });

      for (const [name, callback] of Object.entries(callbacks)) {
        expect(callback.mock.calls).toEqual(
          name === callbackName ? [expected] : []
        );
      }
    }
  );

  test.each([undefined, ''])(
    'reports an error without an associated block (%s)',
    (contentBlock) => {
      const onError = jest.fn();
      const view = renderPlaceholder({ onError });

      view.props.onInAppContentBlockEvent({
        nativeEvent: {
          eventType: 'ERROR',
          contentBlock,
          errorMessage: 'Offline',
        },
      });

      expect(onError.mock.calls).toEqual([['offers', undefined, 'Offline']]);
    }
  );

  test('defaults overrideDefaultBehavior to false and forwards an explicit true', () => {
    expect(renderPlaceholder().props.overrideDefaultBehavior).toBe(false);
    expect(
      renderPlaceholder({ overrideDefaultBehavior: true }).props
        .overrideDefaultBehavior
    ).toBe(true);
  });
});
