import React, {useState} from 'react';
import {NativeSyntheticEvent, StyleProp, View, ViewProps, ViewStyle} from 'react-native';
import RNInAppContentBlocksPlaceholder, {DimensEvent} from "./RNInAppContentBlocksPlaceholder";

interface InAppContentBlocksPlaceholderProps extends ViewProps {
    placeholderId: string;
}

interface DimensInfo {
    width: number | undefined;
    height: number | undefined;
}

export default function InAppContentBlocksPlaceholder(
    props: InAppContentBlocksPlaceholderProps,
): React.ReactElement {
    const {placeholderId, style: viewStyle, ...viewProps} = props
    const [dimens, setDimens] = useState(({} as DimensInfo))
    function _onDimensChanged(event: NativeSyntheticEvent<DimensEvent>) {
        setDimens({
            width: event.nativeEvent.width,
            height: event.nativeEvent.height,
        })
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
                {...viewProps}
                style={_mergeViewStyle()}
                onDimensChanged={_onDimensChanged}
            />
        </View>
    );
}
