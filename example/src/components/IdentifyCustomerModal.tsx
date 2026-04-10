import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { identifyCustomer } from 'react-native-exponea-sdk';
import ExponeaModal from './ExponeaModal';
import ExponeaButton from './ExponeaButton';
import PropertyEditor from './PropertyEditor';

interface IdentifyCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function IdentifyCustomerModal(
  props: IdentifyCustomerModalProps
): React.ReactElement {
  const [ids, setIds] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<Record<string, string>>({});

  const handleIdentify = async () => {
    try {
      await identifyCustomer(ids, properties);
      Alert.alert('Success', 'Customer identified successfully');
      setIds({});
      setProperties({});
      props.onClose();
      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      Alert.alert('Error', `Failed to identify customer: ${error}`);
    }
  };

  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Identify customer</Text>

        <Text style={styles.subtitle}>Hard Ids</Text>
        <PropertyEditor properties={ids} onChange={setIds} />

        <Text style={styles.subtitle}>Properties</Text>
        <PropertyEditor properties={properties} onChange={setProperties} />

        <ExponeaButton title="Identify customer" onPress={handleIdentify} />
      </ScrollView>
    </ExponeaModal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 5,
  },
});
