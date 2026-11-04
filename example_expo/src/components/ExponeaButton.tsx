import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface ExponeaButtonProps {
  compact?: boolean;
  disabled?: boolean;
  title: string;
  onPress: () => void;
  secondary?: boolean;
  warn?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export default function ExponeaButton(
  props: ExponeaButtonProps
): React.ReactElement {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      testID={props.testID}
      style={[
        styles.container,
        props.secondary ? styles.secondary : null,
        props.warn ? styles.warn : null,
        props.disabled ? styles.disabledContainer : null,
        props.compact ? styles.compactContainer : null,
        props.style,
      ]}
      onPress={props.onPress}
    >
      <Text
        style={[
          styles.label,
          props.disabled ? styles.disabledLabel : null,
          props.warn ? styles.warnText : null,
        ]}
      >
        {props.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    margin: 5,
    backgroundColor: '#ffd500',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    height: 30,
    margin: 5,
  },
  disabledContainer: {
    backgroundColor: '#0000001F',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledLabel: {
    color: '#00000061',
  },
  secondary: {
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
  },
  warn: {
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ba0404',
  },
  warnText: {
    color: '#ba0404',
  },
});
