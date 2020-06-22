import React from 'react';
import {StyleSheet, View, Picker} from 'react-native';

interface ExponeaPickerProps<T> {
  value: T;
  setValue: (value: T) => void;
  width: number;
  options: Record<string, T>;
}

export default function ExponeaPicker<T>(
  props: ExponeaPickerProps<T>,
): React.ReactElement {
  return (
    <View style={styles.container}>
      <Picker
        mode="dropdown"
        selectedValue={props.value}
        style={[styles.picker, {width: props.width}]}
        onValueChange={(itemValue: T) => props.setValue(itemValue)}>
        {Object.keys(props.options).map((optionLabel) => (
          <Picker.Item
            key={optionLabel}
            label={optionLabel}
            value={props.options[optionLabel]}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    borderColor: '#999',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  picker: {
    height: 30,
  },
});
