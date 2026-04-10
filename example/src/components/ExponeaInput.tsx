import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface ExponeaInputProps {
  compact?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function ExponeaInput(
  props: ExponeaInputProps
): React.ReactElement {
  return (
    <TextInput
      style={[styles.input, props.compact ? styles.compactInput : null]}
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
});
