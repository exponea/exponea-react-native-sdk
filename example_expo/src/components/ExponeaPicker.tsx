import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface ExponeaPickerProps<T> {
  value: T;
  setValue: (value: T) => void;
  width: number;
  options: Record<string, T>;
}

export default function ExponeaPicker<T>({
  value,
  setValue,
  width,
  options,
}: ExponeaPickerProps<T>): React.ReactElement {
  const optionEntries = React.useMemo(
    () => Object.entries(options) as Array<[string, T]>,
    [options]
  );
  const selectedKey = React.useMemo(
    () => optionEntries.find(([, option]) => Object.is(option, value))?.[0],
    [optionEntries, value]
  );
  const items = React.useMemo(
    () =>
      optionEntries.map(([key]) => ({
        label: key,
        value: key,
      })),
    [optionEntries]
  );
  const selectedLabel = React.useMemo(
    () => selectedKey ?? optionEntries[0]?.[0] ?? '',
    [optionEntries, selectedKey]
  );

  const onValueChange = React.useCallback(
    (selectedOptionKey: string | null) => {
      if (
        selectedOptionKey !== null &&
        selectedOptionKey !== undefined &&
        Object.prototype.hasOwnProperty.call(options, selectedOptionKey)
      ) {
        setValue(options[selectedOptionKey]);
      }
    },
    [options, setValue]
  );

  const pickerStyle = React.useMemo(
    () => ({
      viewContainer: { width },
      headlessAndroidContainer: { width },
      inputIOSContainer: { width },
      inputAndroidContainer: { width },
      inputIOS: { ...styles.input, width },
      inputAndroid: { ...styles.input, width },
    }),
    [width]
  );

  const displayContainerStyle = React.useMemo(
    () => [styles.displayContainer, { width }],
    [width]
  );

  return (
    <RNPickerSelect
      value={selectedKey}
      onValueChange={onValueChange}
      items={items}
      placeholder={{}}
      useNativeAndroidPickerStyle={false}
      style={pickerStyle}
    >
      <View style={displayContainerStyle}>
        <Text style={styles.displayText}>{selectedLabel}</Text>
      </View>
    </RNPickerSelect>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 30,
    margin: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  displayContainer: {
    height: 30,
    margin: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  displayText: {
    color: '#111',
    fontSize: 14,
  },
});
