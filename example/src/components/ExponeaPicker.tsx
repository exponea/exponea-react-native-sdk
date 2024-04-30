import React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface ExponeaPickerProps<T> {
  value: T;
  setValue: (value: T) => void;
  width: number;
  options: Record<string, T>;
}

export default function ExponeaPicker<T>(
  props: ExponeaPickerProps<T>,
): React.ReactElement {
  const onValueChange = (value: T) => props.setValue(value);
  return (
    <View style={styles.container}>
      <RNPickerSelect
        style={{
          inputIOS: {...styles.inputIOS, width: props.width},
          inputAndroid: {...styles.inputAndroid, width: props.width},
        }}
        value={props.value}
        onValueChange={onValueChange}
        items={Object.keys(props.options).map((label) => ({
          label,
          value: props.options[label],
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    borderRadius: 5,
    borderColor: '#999',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  chevron: {
    height: 30,
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    color: '#999',
    fontSize: 12,
    marginRight: 10,
  },
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    height: 30,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
