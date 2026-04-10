import React from 'react';
import { StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface ExponeaPickerProps<T> {
  value: T;
  setValue: (value: T) => void;
  width: number;
  options: Record<string, T>;
}

export default function ExponeaPicker<T>(
  props: ExponeaPickerProps<T>
): React.ReactElement {
  const items = Object.keys(props.options).map((key) => ({
    label: key,
    value: props.options[key],
  }));

  return (
    <RNPickerSelect
      value={props.value}
      onValueChange={props.setValue}
      items={items}
      style={{
        inputIOS: { ...styles.input, width: props.width },
        inputAndroid: { ...styles.input, width: props.width },
      }}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 30,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
});
