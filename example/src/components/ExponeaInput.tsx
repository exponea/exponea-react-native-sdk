import React from 'react';
import {StyleSheet, TextInput} from 'react-native';

interface ExponeaInputProps {
  compact?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function ExponeaButton(
  props: ExponeaInputProps,
): React.ReactElement {
  return (
    <TextInput
      style={[styles.input, props.compact ? styles.inputCompact : null]}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 10,
    margin: 10,
    height: 45,
    borderRadius: 5,
    borderColor: '#999',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  inputCompact: {
    padding: 5,
    margin: 5,
    height: 30,
  },
});
