import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';

interface PropertyEditorProps {
  properties: Record<string, string>;
  onChange: (properties: Record<string, string>) => void;
}

export default function PropertyEditor(
  props: PropertyEditorProps,
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
      <PropertyList properties={props.properties} />
      <View style={styles.addRow}>
        <View style={styles.inputContainer}>
          <ExponeaInput
            compact
            placeholder="key"
            value={addingKey}
            onChangeText={setAddingKey}
          />
        </View>
        <View style={styles.inputContainer}>
          <ExponeaInput
            compact
            placeholder="value"
            value={addingValue}
            onChangeText={setAddingValue}
          />
        </View>
        <ExponeaButton
          compact
          disabled={addingKey === ''}
          title="Add"
          onPress={onAdd}
        />
      </View>
    </View>
  );
}

function PropertyList(props: {
  properties: Record<string, string>;
}): React.ReactElement {
  return (
    <View>
      {Object.keys(props.properties).map((key) => (
        <Property
          key={key}
          propertyKey={key}
          propertyValue={props.properties[key]}
        />
      ))}
    </View>
  );
}

function Property(props: {
  propertyKey: string;
  propertyValue: string;
}): React.ReactElement {
  return (
    <View style={styles.property}>
      <Text style={styles.propertyKey}>{props.propertyKey}:</Text>
      <Text style={styles.propertyValue}>{props.propertyValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
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
  propertyKey: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  propertyValue: {
    fontSize: 16,
  },
  inputContainer: {
    flex: 1,
  },
  property: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
