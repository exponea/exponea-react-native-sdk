import React from 'react';
import {StyleSheet, Text, Alert} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from './ExponeaModal';
import Exponea from '../../../lib';
import ExponeaProject from '../../../lib/ExponeaProject';
import ExponeaProjectEditor from './ExponeaProjectEditor';

interface AnonymizeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AnonymizeModal(
  props: AnonymizeModalProps,
): React.ReactElement {
  const [exponeaProject, setExponeaProject] = React.useState<
    ExponeaProject | undefined
  >(undefined);

  const anonymizeCustomer = async () => {
    try {
      const oldCookie = await Exponea.getCustomerCookie();
      await Exponea.anonymize(exponeaProject);
      const newCookie = await Exponea.getCustomerCookie();
      Alert.alert(
        'Customer anonymized',
        `Old customer cookie: ${oldCookie}\n\nNew customer cookie: ${newCookie}`,
      );
    } catch (error) {
      Alert.alert('Error anonymizing customer', error.message);
    }
  };

  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <Text style={styles.title}>Anonymize customer</Text>
      <Text style={styles.subtitle}>New Exponea project</Text>
      <ExponeaProjectEditor
        value={exponeaProject}
        onChange={setExponeaProject}
      />
      <ExponeaButton title="Anonymize customer" onPress={anonymizeCustomer} />
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
