import React, { useRef, useCallback } from 'react';
import { type ViewProps } from 'react-native';
import ContentBlockCarouselViewNativeComponent, {
  Commands,
} from './ContentBlockCarouselViewNativeComponent';
import type {
  InAppContentBlock,
  InAppContentBlockAction,
} from './NativeExponea';

export interface ContentBlockCarouselViewProps extends ViewProps {
  placeholderId: string;
  maxMessagesCount?: number;
  scrollDelay?: number;
  overrideDefaultBehavior?: boolean;
  trackActions?: boolean;
  filterContentBlocks?: (blocks: InAppContentBlock[]) => InAppContentBlock[];
  sortContentBlocks?: (blocks: InAppContentBlock[]) => InAppContentBlock[];
  onMessageShown?: (
    placeholderId: string,
    contentBlock: InAppContentBlock,
    index: number,
    count: number
  ) => void;
  onMessagesChanged?: (count: number, messages: InAppContentBlock[]) => void;
  onNoMessageFound?: (placeholderId: string) => void;
  onError?: (
    placeholderId: string,
    contentBlock: InAppContentBlock | undefined,
    errorMessage: string
  ) => void;
  onCloseClicked?: (
    placeholderId: string,
    contentBlock: InAppContentBlock
  ) => void;
  onActionClicked?: (
    placeholderId: string,
    contentBlock: InAppContentBlock,
    action: InAppContentBlockAction
  ) => void;
}

export default function ContentBlockCarouselView(
  props: ContentBlockCarouselViewProps
) {
  const {
    placeholderId,
    maxMessagesCount,
    scrollDelay,
    overrideDefaultBehavior = false,
    trackActions = false,
    filterContentBlocks,
    sortContentBlocks,
    onMessageShown,
    onMessagesChanged,
    onNoMessageFound,
    onError,
    onCloseClicked,
    onActionClicked,
    style,
    ...viewProps
  } = props;

  const componentRef = useRef(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  const handleEvent = useCallback(
    (event: any) => {
      const {
        eventType,
        contentBlock,
        contentBlockAction,
        errorMessage,
        index,
        count,
        contentBlocks,
      } = event.nativeEvent;

      switch (eventType) {
        case 'onMessageShown':
          const cb = contentBlock ? JSON.parse(contentBlock) : undefined;
          onMessageShown?.(placeholderId, cb, index, count);
          break;
        case 'onMessagesChanged':
          const blocks = contentBlocks ? JSON.parse(contentBlocks) : [];
          onMessagesChanged?.(count, blocks);
          break;
        case 'onNoMessageFound':
          console.log('[ContentBlockCarouselView] Calling onNoMessageFound');
          onNoMessageFound?.(placeholderId);
          break;
        case 'onError':
          const errorCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          onError?.(placeholderId, errorCb, errorMessage);
          break;
        case 'onCloseClicked':
          const closeCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          onCloseClicked?.(placeholderId, closeCb);
          break;
        case 'onActionClicked':
          const actionCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          const action = contentBlockAction
            ? JSON.parse(contentBlockAction)
            : undefined;
          onActionClicked?.(placeholderId, actionCb, action);
          break;
        default:
          console.warn(
            '[ContentBlockCarouselView] Unknown event type:',
            eventType
          );
      }
    },
    [
      placeholderId,
      onMessageShown,
      onMessagesChanged,
      onNoMessageFound,
      onError,
      onCloseClicked,
      onActionClicked,
    ]
  );

  const handleDataRequest = useCallback(
    (event: any) => {
      const { requestType, data } = event.nativeEvent;
      const dataArray: string[] = JSON.parse(data);
      const blocks: InAppContentBlock[] = dataArray.map((json: string) =>
        JSON.parse(json)
      );

      if (requestType === 'filter' && filterContentBlocks) {
        const filtered = filterContentBlocks(blocks);
        const jsonStrings = filtered.map((b) => JSON.stringify(b));
        if (componentRef.current) {
          Commands.filterResponse(
            componentRef.current,
            JSON.stringify(jsonStrings)
          );
        }
      } else if (requestType === 'sort' && sortContentBlocks) {
        const sorted = sortContentBlocks(blocks);
        const jsonStrings = sorted.map((b) => JSON.stringify(b));
        if (componentRef.current) {
          Commands.sortResponse(
            componentRef.current,
            JSON.stringify(jsonStrings)
          );
        }
      }
    },
    [filterContentBlocks, sortContentBlocks]
  );

  const handleDimensChanged = useCallback((event: any) => {
    const { width, height } = event.nativeEvent;
    setDimensions({ width, height });
  }, []);

  return (
    <ContentBlockCarouselViewNativeComponent
      ref={componentRef}
      {...viewProps}
      style={[style, dimensions.height > 0 && { height: dimensions.height }]}
      placeholderId={placeholderId}
      maxMessagesCount={maxMessagesCount}
      scrollDelay={scrollDelay}
      overrideDefaultBehavior={overrideDefaultBehavior}
      trackActions={trackActions}
      customFilterActive={!!filterContentBlocks}
      customSortActive={!!sortContentBlocks}
      onDimensChanged={handleDimensChanged}
      onContentBlockEvent={handleEvent}
      onContentBlockDataRequestEvent={handleDataRequest}
    />
  );
}
