import React from 'react';
import {View, requireNativeComponent, ViewProps} from 'react-native';

type AppInboxButtonProps = ViewProps

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
