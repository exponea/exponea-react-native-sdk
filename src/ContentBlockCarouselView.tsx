import React, { useRef, useState } from 'react';
import { findNodeHandle, NativeSyntheticEvent, StyleProp, UIManager, View, ViewProps, ViewStyle } from 'react-native';
import { InAppContentBlock, InAppContentBlockAction } from './ExponeaType';
import RNContentBlockCarouselView, { ContentBlockCarouselEvent, ContentBlockDataRequestEvent } from './RNContentBlockCarouselView';
import { DimensEvent } from './RNInAppContentBlocksPlaceholder';

interface ContentBlockCarouselProps extends ViewProps {
    placeholderId: string;
    maxMessagesCount?: number;
    scrollDelay?: number;
    overrideDefaultBehavior?: boolean;
    trackActions?: boolean;
    onMessageShown?: (placeholderId: string, contentBlock: InAppContentBlock, index: number, count: number) => void;
    onMessagesChanged?: (count: number, messages: InAppContentBlock[]) => void;
    onNoMessageFound?: (placeholderId: string) => void;
    onError?: (placeholderId: string, contentBlock: InAppContentBlock|undefined, errorMessage: string) => void;
    onCloseClicked?: (placeholderId: string, contentBlock: InAppContentBlock) => void;
    onActionClicked?: (placeholderId: string, contentBlock: InAppContentBlock, action: InAppContentBlockAction) => void;
    filterContentBlocks?: (blocks: InAppContentBlock[]) => InAppContentBlock[];
    sortContentBlocks?: (blocks: InAppContentBlock[]) => InAppContentBlock[];
    style?: StyleProp<ViewStyle> | undefined;
}

interface DimensInfo {
    width: number | undefined;
    height: number | undefined;
}

export default function ContentBlockCarouselView(
    props: ContentBlockCarouselProps,
): React.ReactElement {
    const ref = useRef(null);
    const {
        placeholderId,
        maxMessagesCount,
        scrollDelay,
        overrideDefaultBehavior,
        trackActions,
        filterContentBlocks: filterContentBlocksFn,
        sortContentBlocks: sortContentBlocksFn,
        style: viewStyle,
        ...viewProps
    } = props
    const [dimens, setDimens] = useState(({} as DimensInfo))
    function _onDimensChanged(event: NativeSyntheticEvent<DimensEvent>) {
        setDimens({
            width: dimens.width,
            height: event.nativeEvent.height,
        })
    }
    function _onContentBlockEvent(event: NativeSyntheticEvent<ContentBlockCarouselEvent>) {
        const nativeEvent: ContentBlockCarouselEvent = event.nativeEvent 
        switch(nativeEvent.eventType) {
            case 'onMessageShown':
                props.onMessageShown && nativeEvent.contentBlock && props.onMessageShown(
                    nativeEvent.placeholderId!,
                    JSON.parse(nativeEvent.contentBlock)!,
                    nativeEvent.index!,
                    nativeEvent.count!
                )
              break;
            case 'onMessagesChanged':
                props.onMessagesChanged && nativeEvent.contentBlocks && props.onMessagesChanged(
                    nativeEvent.count!,
                    JSON.parse(nativeEvent.contentBlocks)!
                )
                break;
            case 'onNoMessageFound':
                props.onNoMessageFound && props.onNoMessageFound(nativeEvent.placeholderId!)
                break;
            case 'onError':
                const contentBlock: InAppContentBlock | undefined = nativeEvent.contentBlock && JSON.parse(nativeEvent.contentBlock)
                props.onError && props.onError(
                    nativeEvent.placeholderId!,
                    contentBlock,
                    nativeEvent.errorMessage!
                )
                break;
            case 'onCloseClicked':
                props.onCloseClicked && nativeEvent.contentBlock && props.onCloseClicked(
                    nativeEvent.placeholderId!,
                    JSON.parse(nativeEvent.contentBlock)!
                )
                break;
            case 'onActionClicked':
                props.onActionClicked && nativeEvent.contentBlock && nativeEvent.contentBlockAction && props.onActionClicked(
                    nativeEvent.placeholderId!,
                    JSON.parse(nativeEvent.contentBlock)!,
                    JSON.parse(nativeEvent.contentBlockAction)!
                )
                break;
          }
    }
    function _onContentBlockDataRequestEvent(event: NativeSyntheticEvent<ContentBlockDataRequestEvent>) {
        const nativeEvent: ContentBlockDataRequestEvent = event.nativeEvent
        let response: InAppContentBlock[] = nativeEvent.data
        switch(nativeEvent.requestType) {
            case 'filter':
                response = (filterContentBlocksFn && filterContentBlocksFn(nativeEvent.data)) ?? nativeEvent.data
                break;
            case 'sort':
                response = (sortContentBlocksFn && sortContentBlocksFn(nativeEvent.data)) ?? nativeEvent.data
                break;
        }
        const viewId = findNodeHandle(ref.current);
        UIManager.dispatchViewManagerCommand(
            viewId,
            nativeEvent.requestType + 'Response',
            [response]
        )
    }
    function _mergeViewStyle(): StyleProp<ViewStyle> {
        return Object.assign(
          {},
          viewStyle,
          {
              width: dimens.width,
              height: dimens.height,
          }
        );
    }
    return (
        <View
            {...viewProps}
            style={_mergeViewStyle()}
        >
            <RNContentBlockCarouselView
                ref={ref}
                initProps={{
                    placeholderId: placeholderId,
                    maxMessagesCount: maxMessagesCount,
                    scrollDelay: scrollDelay
                }}
                overrideDefaultBehavior={overrideDefaultBehavior}
                trackActions={trackActions}
                {...viewProps}
                style={_mergeViewStyle()}
                onDimensChanged={_onDimensChanged}
                onContentBlockEvent={_onContentBlockEvent}
                customFilterActive={!!filterContentBlocksFn}
                customSortActive={!!sortContentBlocksFn}
                onContentBlockDataRequestEvent={_onContentBlockDataRequestEvent}
            />
        </View>
    );
}
