jest.mock('../ContentBlockCarouselViewNativeComponent', () => ({
  __esModule: true,
  default: 'ContentBlockCarouselViewNativeComponent',
  Commands: {
    filterResponse: jest.fn(),
    sortResponse: jest.fn(),
  },
}));

jest.mock('react', () => ({
  ...jest.requireActual<typeof import('react')>('react'),
  useRef: () => ({ current: mockNativeViewRef }),
  useState: (initial: unknown) => [initial, jest.fn()],
  useCallback: (callback: unknown) => callback,
}));

import ContentBlockCarouselView, {
  type ContentBlockCarouselViewProps,
} from '../ContentBlockCarouselView';
import { Commands } from '../ContentBlockCarouselViewNativeComponent';
import type {
  InAppContentBlock,
  InAppContentBlockAction,
} from '../NativeExponea';

const mockNativeViewRef = {};
const contentBlock: InAppContentBlock = {
  id: 'block-1',
  name: 'Promo',
  placeholders: [],
};
const action: InAppContentBlockAction = {
  type: 'browser',
  name: 'Shop',
  url: 'https://example.com/offer',
};
const messages = [contentBlock, { ...contentBlock, id: 'block-2' }];
const serializedBlocks = JSON.stringify([JSON.stringify(contentBlock)]);

type NativeView = {
  props: {
    placeholderId: string;
    overrideDefaultBehavior: boolean;
    trackActions: boolean;
    customFilterActive: boolean;
    customSortActive: boolean;
    onContentBlockEvent: (event: unknown) => void;
    onContentBlockDataRequestEvent: (event: unknown) => void;
  };
};

// Mocked hooks allow testing wrapper dispatch, not mounting or rerender behavior.
function renderCarousel(props: ContentBlockCarouselViewProps): NativeView {
  return ContentBlockCarouselView(props) as unknown as NativeView;
}

function emitEvent(
  view: NativeView,
  nativeEvent: Record<string, unknown>
): void {
  view.props.onContentBlockEvent({ nativeEvent });
}

beforeEach(() => {
  jest.mocked(Commands.filterResponse).mockClear();
  jest.mocked(Commands.sortResponse).mockClear();
});

describe('native view flags', () => {
  test('uses documented behavior defaults when props are omitted', () => {
    const view = renderCarousel({ placeholderId: 'example_carousel' });

    expect(view.props).toMatchObject({
      overrideDefaultBehavior: false,
      trackActions: true,
      customFilterActive: false,
      customSortActive: false,
    });
  });

  test('forwards explicit behavior overrides to the native view', () => {
    const view = renderCarousel({
      placeholderId: 'example_carousel',
      overrideDefaultBehavior: true,
      trackActions: false,
    });

    expect(view.props).toMatchObject({
      overrideDefaultBehavior: true,
      trackActions: false,
    });
  });

  test('tells native which JS transformers are registered', () => {
    const withFilter = renderCarousel({
      placeholderId: 'example_carousel',
      filterContentBlocks: (blocks) => blocks,
    });
    expect(withFilter.props).toMatchObject({
      customFilterActive: true,
      customSortActive: false,
    });

    const withSort = renderCarousel({
      placeholderId: 'example_carousel',
      sortContentBlocks: (blocks) => blocks,
    });
    expect(withSort.props).toMatchObject({
      customFilterActive: false,
      customSortActive: true,
    });
  });
});

describe('onContentBlockEvent', () => {
  // Callback signatures follow documentation/in-app-content-blocks.md.
  test.each([
    ['onMessageShown', ['example_carousel', contentBlock, 1, 2]],
    ['onMessagesChanged', [2, messages]],
    ['onActionClicked', ['example_carousel', contentBlock, action]],
    ['onCloseClicked', ['example_carousel', contentBlock]],
    ['onNoMessageFound', ['example_carousel']],
    ['onError', ['example_carousel', contentBlock, 'load failed']],
  ] as const)(
    'routes %s once with decoded data in callback argument order',
    (eventType, expected) => {
      const callbacks = {
        onMessageShown: jest.fn(),
        onMessagesChanged: jest.fn(),
        onActionClicked: jest.fn(),
        onCloseClicked: jest.fn(),
        onNoMessageFound: jest.fn(),
        onError: jest.fn(),
      };
      const view = renderCarousel({
        placeholderId: 'example_carousel',
        ...callbacks,
      });

      emitEvent(view, {
        eventType,
        placeholderId: 'unrelated-native-id',
        contentBlock: JSON.stringify(contentBlock),
        contentBlockAction: JSON.stringify(action),
        contentBlocks: JSON.stringify(messages),
        index: 1,
        count: 2,
        errorMessage: 'load failed',
      });

      for (const [name, callback] of Object.entries(callbacks)) {
        expect(callback.mock.calls).toEqual(
          name === eventType ? [expected] : []
        );
      }
    }
  );

  test('reports an empty list when onMessagesChanged omits contentBlocks', () => {
    const onMessagesChanged = jest.fn();
    const view = renderCarousel({
      placeholderId: 'example_carousel',
      onMessagesChanged,
    });

    emitEvent(view, { eventType: 'onMessagesChanged', count: 0 });

    expect(onMessagesChanged.mock.calls).toEqual([[0, []]]);
  });

  test('reports a general error without an associated content block', () => {
    const onError = jest.fn();
    const view = renderCarousel({
      placeholderId: 'example_carousel',
      onError,
    });

    emitEvent(view, {
      eventType: 'onError',
      errorMessage: 'load failed',
    });

    expect(onError.mock.calls).toEqual([
      ['example_carousel', undefined, 'load failed'],
    ]);
  });
});

describe('onContentBlockDataRequestEvent', () => {
  // The existing resolver tests cover transformation/serialization. These cases
  // check wrapper wiring with both callbacks present, including command/ref order.
  test.each(['filter', 'sort'] as const)(
    'routes the %s response to its matching native command',
    (kind) => {
      const filtered = { ...contentBlock, id: 'filtered' };
      const sorted = { ...contentBlock, id: 'sorted' };
      const filterContentBlocks = jest.fn(() => [filtered]);
      const sortContentBlocks = jest.fn(() => [sorted]);
      const view = renderCarousel({
        placeholderId: 'example_carousel',
        filterContentBlocks,
        sortContentBlocks,
      });

      view.props.onContentBlockDataRequestEvent({
        nativeEvent: {
          requestType: `${kind}|request-token`,
          data: serializedBlocks,
        },
      });

      const command =
        kind === 'filter' ? Commands.filterResponse : Commands.sortResponse;
      const otherCommand =
        kind === 'filter' ? Commands.sortResponse : Commands.filterResponse;
      const transformer =
        kind === 'filter' ? filterContentBlocks : sortContentBlocks;
      const otherTransformer =
        kind === 'filter' ? sortContentBlocks : filterContentBlocks;
      expect(transformer.mock.calls).toEqual([[[contentBlock]]]);
      expect(otherTransformer).not.toHaveBeenCalled();
      expect(jest.mocked(command).mock.calls).toEqual([
        [
          mockNativeViewRef,
          JSON.stringify({
            token: 'request-token',
            data: [JSON.stringify(kind === 'filter' ? filtered : sorted)],
          }),
        ],
      ]);
      expect(jest.mocked(command).mock.calls[0]?.[0]).toBe(mockNativeViewRef);
      expect(otherCommand).not.toHaveBeenCalled();
    }
  );

  test('does not reply when JS has no matching transformer', () => {
    const view = renderCarousel({ placeholderId: 'example_carousel' });

    view.props.onContentBlockDataRequestEvent({
      nativeEvent: {
        requestType: 'filter|filter-token',
        data: serializedBlocks,
      },
    });

    expect(Commands.filterResponse).not.toHaveBeenCalled();
    expect(Commands.sortResponse).not.toHaveBeenCalled();
  });
});
