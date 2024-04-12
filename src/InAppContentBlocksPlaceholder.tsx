import React, {useState} from 'react';
import {NativeSyntheticEvent, StyleProp, View, ViewProps, ViewStyle} from 'react-native';
import RNInAppContentBlocksPlaceholder, {DimensEvent, InAppContentBlockEvent} from "./RNInAppContentBlocksPlaceholder";
import { InAppContentBlock, InAppContentBlockAction } from './ExponeaType';

interface InAppContentBlocksPlaceholderProps extends ViewProps {
    placeholderId: string;
    overrideDefaultBehavior?: boolean;
    onMessageShown?: (placeholderId: string, contentBlock: InAppContentBlock) => void;
    onNoMessageFound?: (placeholderId: string, ) => void;
    onError?: (placeholderId: string, contentBlock: InAppContentBlock, errorMessage: string) => void;
    onCloseClicked?: (placeholderId: string, contentBlock: InAppContentBlock) => void;
    onActionClicked?: (placeholderId: string, contentBlock: InAppContentBlock, action: InAppContentBlockAction) => void;
}

interface DimensInfo {
    width: number | undefined;
    height: number | undefined;
}

export default function InAppContentBlocksPlaceholder(
    props: InAppContentBlocksPlaceholderProps,
): React.ReactElement {
    const {
        placeholderId,
        overrideDefaultBehavior,
        style: viewStyle,
        ...viewProps
    } = props
    const [dimens, setDimens] = useState(({} as DimensInfo))
    function _onDimensChanged(event: NativeSyntheticEvent<DimensEvent>) {
        setDimens({
            width: event.nativeEvent.width,
            height: event.nativeEvent.height,
        })
    }
    function _onInAppContentBlockEvent(event: NativeSyntheticEvent<InAppContentBlockEvent>) {
        const nativeEvent: InAppContentBlockEvent = event.nativeEvent 
        switch(nativeEvent.eventType) {
            case 'onMessageShown':
                props.onMessageShown && props.onMessageShown(nativeEvent.placeholderId!, nativeEvent.contentBlock!)
              break;
            case 'onNoMessageFound':
                props.onNoMessageFound && props.onNoMessageFound(nativeEvent.placeholderId!)
              break;
            case 'onError':
                props.onError && props.onError(nativeEvent.placeholderId!, nativeEvent.contentBlock!, nativeEvent.errorMessage!)
              break;
            case 'onCloseClicked':
                props.onCloseClicked && props.onCloseClicked(nativeEvent.placeholderId!, nativeEvent.contentBlock!)
                break;
            case 'onActionClicked':
                props.onActionClicked && props.onActionClicked(nativeEvent.placeholderId!, nativeEvent.contentBlock!, nativeEvent.contentBlockAction!)
                break;
          }
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
            <RNInAppContentBlocksPlaceholder
                placeholderId={placeholderId}
                overrideDefaultBehavior={overrideDefaultBehavior}
                {...viewProps}
                style={_mergeViewStyle()}
                onDimensChanged={_onDimensChanged}
                onInAppContentBlockEvent={_onInAppContentBlockEvent}
            />
        </View>
    );
}
