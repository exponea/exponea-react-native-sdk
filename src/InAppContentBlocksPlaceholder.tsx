import React, { useCallback } from 'react';
import { type ViewProps } from 'react-native';
import InAppContentBlocksPlaceholderNativeComponent from './InAppContentBlocksPlaceholderNativeComponent';
import type {
  InAppContentBlock,
  InAppContentBlockAction,
} from './NativeExponea';

export interface InAppContentBlocksPlaceholderProps extends ViewProps {
  placeholderId: string;
  overrideDefaultBehavior?: boolean;
  onMessageShown?: (
    placeholderId: string,
    contentBlock: InAppContentBlock
  ) => void;
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

export default function InAppContentBlocksPlaceholder(
  props: InAppContentBlocksPlaceholderProps
) {
  const {
    placeholderId,
    overrideDefaultBehavior = false,
    onMessageShown,
    onNoMessageFound,
    onError,
    onCloseClicked,
    onActionClicked,
    style,
    ...viewProps
  } = props;

  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  const handleEvent = useCallback(
    (event: any) => {
      const { eventType, contentBlock, contentBlockAction, errorMessage } =
        event.nativeEvent;

      switch (eventType) {
        case 'SHOWN':
          const shownCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          onMessageShown?.(placeholderId, shownCb);
          break;
        case 'NO_MESSAGE_FOUND':
          onNoMessageFound?.(placeholderId);
          break;
        case 'ERROR':
          const errorCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          onError?.(placeholderId, errorCb, errorMessage);
          break;
        case 'CLOSE_CLICKED':
          const closeCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          onCloseClicked?.(placeholderId, closeCb);
          break;
        case 'ACTION_CLICKED':
          const actionCb = contentBlock ? JSON.parse(contentBlock) : undefined;
          const action = contentBlockAction
            ? JSON.parse(contentBlockAction)
            : undefined;
          onActionClicked?.(placeholderId, actionCb, action);
          break;
      }
    },
    [
      placeholderId,
      onMessageShown,
      onNoMessageFound,
      onError,
      onCloseClicked,
      onActionClicked,
    ]
  );

  const handleDimensChanged = useCallback((event: any) => {
    const { width, height } = event.nativeEvent;
    setDimensions({ width, height });
  }, []);

  return (
    <InAppContentBlocksPlaceholderNativeComponent
      {...viewProps}
      style={[style, dimensions.height > 0 && { height: dimensions.height }]}
      placeholderId={placeholderId}
      overrideDefaultBehavior={overrideDefaultBehavior}
      onDimensChanged={handleDimensChanged}
      onInAppContentBlockEvent={handleEvent}
    />
  );
}
