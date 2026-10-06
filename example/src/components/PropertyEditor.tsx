import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ExponeaButton from '@/components/ExponeaButton';
import ExponeaInput from '@/components/ExponeaInput';

interface PropertyEditorProps {
  properties: Record<string, string>;
  onChange: (properties: Record<string, string>) => void;
  addButtonTestID?: string;
  keyInputTestID?: string;
  propertiesJsonTestID?: string;
  valueInputTestID?: string;
}

export default function PropertyEditor(
  props: PropertyEditorProps
): React.ReactElement {
  const [addingKey, setAddingKey] = React.useState('');
  const [addingValue, setAddingValue] = React.useState('');

  const onAdd = () => {
    const properties = Object.assign({}, props.properties);
    properties[addingKey] = addingValue;
    setAddingKey('');
    setAddingValue('');
    props.onChange(properties);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addRow}>
        <ExponeaInput
          compact
          placeholder="key"
          value={addingKey}
          onChangeText={setAddingKey}
          testID={props.keyInputTestID}
        />
        <ExponeaInput
          compact
          placeholder="value"
          value={addingValue}
          onChangeText={setAddingValue}
          testID={props.valueInputTestID}
        />
        <ExponeaButton
          compact
          disabled={addingKey === ''}
          title="Add"
          onPress={onAdd}
          testID={props.addButtonTestID}
        />
        {props.properties && Object.keys(props.properties).length > 0 && (
          <PropertyList
            properties={props.properties}
            testID={props.propertiesJsonTestID}
          />
        )}
      </View>
    </View>
  );
}

function PropertyList(props: {
  properties: Record<string, string>;
  testID?: string;
}): React.ReactElement {
  return (
    <View style={styles.propertyView}>
      <Text testID={props.testID}>
        {JSON.stringify(props.properties, null, 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  addRow: {
    flexDirection: 'column',
  },
  propertyView: {
    backgroundColor: '#f4f4f4',
    padding: 5,
    marginHorizontal: 5,
    borderColor: '#d8d8d8',
    borderWidth: 1,
  },
});
