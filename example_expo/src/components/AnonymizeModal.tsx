import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import {
  anonymize,
  getCustomerCookie,
  type ProjectConfig,
} from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaInput from '@/components/ExponeaInput';
import ExponeaModal from '@/components/ExponeaModal';
import SdkSetupState from '@/util/SdkSetupState';

interface AnonymizeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AnonymizeModal({
  visible,
  onClose,
  onSuccess,
}: AnonymizeModalProps): React.ReactElement {
  const [projectToken, setProjectToken] = useState('');
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAnonymize = useCallback(async () => {
    try {
      const oldCookie = await getCustomerCookie();

      let integrationConfig: ProjectConfig | undefined;
      if (projectToken && authorizationToken) {
        integrationConfig = {
          projectToken,
          authorizationToken,
          ...(baseUrl ? { baseUrl } : {}),
        };
      }

      SdkSetupState.reset();
      await anonymize(integrationConfig);

      const newCookie = await getCustomerCookie();

      setSuccessMessage(
        `Customer anonymized\n\nOld cookie: ${oldCookie}\nNew cookie: ${newCookie}`
      );

      setProjectToken('');
      setAuthorizationToken('');
      setBaseUrl('');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Alert.alert('Error', `Failed to anonymize: ${error}`);
    }
  }, [authorizationToken, baseUrl, projectToken, onClose, onSuccess]);

  return (
    <>
      <ExponeaModal visible={visible} onClose={onClose}>
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
      <ExponeaModal
        visible={successMessage !== null}
        onClose={() => setSuccessMessage(null)}
      >
        <Text style={styles.title} testID={AutomationIds.ANONYMIZED_TITLE}>
          Success
        </Text>
        <Text style={styles.successMessage}>{successMessage}</Text>
        <ExponeaButton
          title="OK"
          testID={AutomationIds.ANONYMIZED_OK}
          onPress={() => setSuccessMessage(null)}
        />
      </ExponeaModal>
    </>
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
  successMessage: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});
