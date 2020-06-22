import React from 'react';
import {StyleSheet, Text, Alert} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from './ExponeaModal';
import PropertyEditor from './PropertyEditor';
import Exponea from '../../../lib';

interface IdentifyCustomerModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function IdentifyCustomerModal(
  props: IdentifyCustomerModalProps,
): React.ReactElement {
  const [ids, setIds] = React.useState({});
  const [properties, setProperties] = React.useState({});

  const identifyCustomer = () => {
    Exponea.identifyCustomer(ids, properties)
      .then(() => {
        props.onClose();
        setIds({});
        setProperties({});
      })
      .catch((error) =>
        Alert.alert('Error identifying customer', error.message),
      );
  };
  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <Text style={styles.title}>Identify customer</Text>
      <Text style={styles.subtitle}>Hard Ids</Text>
      <PropertyEditor properties={ids} onChange={setIds} />
      <Text style={styles.subtitle}>Properties</Text>
      <PropertyEditor properties={properties} onChange={setProperties} />
      <ExponeaButton title="Identify customer" onPress={identifyCustomer} />
    </ExponeaModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
