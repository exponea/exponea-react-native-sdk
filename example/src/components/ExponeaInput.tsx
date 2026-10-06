import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextStyle } from 'react-native';

interface ExponeaInputProps {
  compact?: boolean;
  editable?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export default function ExponeaInput(
  props: ExponeaInputProps
): React.ReactElement {
  return (
    <TextInput
      testID={props.testID}
      style={[
        styles.input,
        props.compact ? styles.compactInput : null,
        props.editable === false ? styles.disabledInput : null,
        props.style,
      ]}
      editable={props.editable}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 45,
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  compactInput: {
    height: 30,
    margin: 5,
    padding: 5,
  },
  disabledInput: {
    backgroundColor: '#f4f4f4',
    color: '#666',
  },
});
