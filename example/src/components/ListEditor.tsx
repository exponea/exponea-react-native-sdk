import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';

interface ListEditorProps {
  values: Array<string>;
  onChange: (values: Array<string>) => void;
}

export default function ListEditor(props: ListEditorProps): React.ReactElement {
  const [addingValue, setAddingValue] = React.useState('');
  const onAdd = () => {
    const values = [...props.values];
    values.push(addingValue);
    setAddingValue('');
    props.onChange(values);
  };
  return (
    <View style={styles.container}>
      {props.values.map((value) => (
        <Text key={value} style={styles.item}>
          {value}
        </Text>
      ))}
      <View style={styles.addRow}>
        <View style={styles.inputContainer}>
          <ExponeaInput
            compact
            placeholder="value"
            value={addingValue}
            onChangeText={setAddingValue}
          />
        </View>
        <ExponeaButton compact title="Add" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 10,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  addRow: {
    flexDirection: 'row',
    width: '100%',
  },
  inputContainer: {
    flex: 1,
  },
  item: {
    textAlign: 'center',
    fontSize: 16,
  },
});
