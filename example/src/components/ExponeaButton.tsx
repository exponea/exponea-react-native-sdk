import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

interface ExponeaButtonProps {
  disabled?: boolean;
  title: string;
  onPress: () => void;
}

export default function ExponeaButton(
  props: ExponeaButtonProps,
): React.ReactElement {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={[
        styles.container,
        props.disabled ? styles.disabledContainer : null,
      ]}
      onPress={props.onPress}>
      <Text
        style={[styles.label, props.disabled ? styles.disabledLabel : null]}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 45,
    margin: 10,
    padding: 10,
    backgroundColor: '#ffd500',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledContainer: {
    backgroundColor: '#ffd50080',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledLabel: {
    opacity: 0.5,
  },
});
