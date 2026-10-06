import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ExponeaButton from '@/components/ExponeaButton';
import ExponeaInput from '@/components/ExponeaInput';

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
      <View style={styles.addRow}>
        <ExponeaInput
          compact
          placeholder="value"
          value={addingValue}
          onChangeText={setAddingValue}
        />
        <ExponeaButton compact title="Add" onPress={onAdd} />
        {props.values.length > 0 && (
          <View style={styles.propertyView}>
            {props.values.map((value) => (
              <Text key={value}>{value}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    borderColor: '#ddd',
  },
  addRow: {
    flexDirection: 'column',
    width: '100%',
  },
  propertyView: {
    backgroundColor: '#f4f4f4',
    padding: 5,
    marginHorizontal: 5,
    borderColor: '#d8d8d8',
    borderWidth: 1,
  },
});
