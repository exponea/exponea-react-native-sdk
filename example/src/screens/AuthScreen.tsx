import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { clearLocalCustomerData } from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';

interface AuthScreenProps {
  onStart: (
    projectToken: string,
    authorization: string,
    advancedAuthKey: string,
    baseUrl: string,
    applicationId: string
  ) => void;
}

export default function AuthScreen(props: AuthScreenProps): React.ReactElement {
  const [projectToken, setProjectToken] = useState('');
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  const [applicationId, setApplicationId] = useState('');
  const [advancedAuthKey, setAdvancedAuthKey] = useState('');

  const APP_GROUP = 'group.com.exponea.ExponeaSDK-Example2';

  const buttonDisabled =
    projectToken === '' || authorizationToken === '' || baseUrl === '';

  const handleStart = () => {
    props.onStart(
      projectToken,
      authorizationToken,
      advancedAuthKey,
      baseUrl,
      applicationId || 'default-application'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <ExponeaInput
          value={projectToken}
          onChangeText={setProjectToken}
          placeholder="Project token"
        />
        <ExponeaInput
          value={authorizationToken}
          placeholder="Authorization token"
          onChangeText={setAuthorizationToken}
        />
        <ExponeaInput
          value={advancedAuthKey}
          onChangeText={setAdvancedAuthKey}
          placeholder="Advanced Auth key"
        />
        <ExponeaInput
          value={baseUrl}
          placeholder="Base URL"
          onChangeText={setBaseUrl}
        />
        <ExponeaInput
          value={applicationId}
          placeholder="Application ID (optional)"
          onChangeText={setApplicationId}
        />
        <ExponeaButton
          disabled={buttonDisabled}
          title="Start"
          onPress={handleStart}
        />
        <ExponeaButton
          title="Clear local data"
          onPress={async () => {
            try {
              await clearLocalCustomerData(APP_GROUP);
              Alert.alert('Success', 'Local customer data has been cleared');
            } catch (error) {
              Alert.alert('Error', `Failed to clear data: ${error}`);
            }
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  form: {
    padding: 10,
    paddingTop: 30,
  },
});
