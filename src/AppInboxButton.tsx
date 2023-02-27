import React from 'react';
import {View, requireNativeComponent, ViewProps} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppInboxButtonProps extends ViewProps {
  style: {width: string; height: number};
}

export default function AppInboxButton(
  props: AppInboxButtonProps,
): React.ReactElement {
  return (
    <View {...props}>
      <RNAppInboxButton {...props} />
    </View>
  );
}
const RNAppInboxButton = requireNativeComponent('RNAppInboxButton');
