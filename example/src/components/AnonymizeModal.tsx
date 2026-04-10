import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import {
  anonymize,
  getCustomerCookie,
  type ExponeaProject,
} from 'react-native-exponea-sdk';
import ExponeaModal from './ExponeaModal';
import ExponeaButton from './ExponeaButton';
import ExponeaInput from './ExponeaInput';

interface AnonymizeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AnonymizeModal(
  props: AnonymizeModalProps
): React.ReactElement {
  const [projectToken, setProjectToken] = useState('');
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  const handleAnonymize = async () => {
    try {
      const oldCookie = await getCustomerCookie();

      let exponeaProject: ExponeaProject | undefined = undefined;
      if (projectToken && authorizationToken) {
        exponeaProject = {
          projectToken,
          authorizationToken,
          ...(baseUrl ? { baseUrl } : {}),
        };
      }

      await anonymize(exponeaProject);

      const newCookie = await getCustomerCookie();

      Alert.alert(
        'Success',
        `Customer anonymized\n\nOld cookie: ${oldCookie}\nNew cookie: ${newCookie}`
      );

      setProjectToken('');
      setAuthorizationToken('');
      setBaseUrl('');
      props.onClose();
      if (props.onSuccess) {
        props.onSuccess();
      }
    } catch (error) {
      Alert.alert('Error', `Failed to anonymize: ${error}`);
    }
  };

  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Anonymize customer</Text>

        <Text style={styles.subtitle}>New Exponea project (optional)</Text>
        <Text style={styles.description}>
          Leave empty to anonymize without switching projects
        </Text>

        <ExponeaInput
          placeholder="Project token"
          value={projectToken}
          onChangeText={setProjectToken}
        />
        <ExponeaInput
          placeholder="Authorization token"
          value={authorizationToken}
          onChangeText={setAuthorizationToken}
        />
        <ExponeaInput
          placeholder="Base URL (optional)"
          value={baseUrl}
          onChangeText={setBaseUrl}
        />

        <ExponeaButton title="Anonymize customer" onPress={handleAnonymize} />
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
});
