import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearLocalCustomerData } from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';
import ExponeaSegmentedControl from '../components/ExponeaSegmentedControl';
import type { ProjectConfigParams, StreamConfigParams } from '../App';

interface AuthScreenProps {
  onStart: (params: ProjectConfigParams | StreamConfigParams) => void;
}

export default function AuthScreen(props: AuthScreenProps): React.ReactElement {
  const [mode, setMode] = useState<'project' | 'stream'>('project');

  const [projectToken, setProjectToken] = useState('');
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [advancedAuthKey, setAdvancedAuthKey] = useState('');

  const [streamId, setStreamId] = useState('');
  const [jwtKeyId, setJwtKeyId] = useState('');
  const [jwtSecret, setJwtSecret] = useState('');
  const [registeredId, setRegisteredId] = useState('');

  const [applicationId, setApplicationId] = useState('');

  const APP_GROUP = 'group.com.exponea.sdk.example';

  const buttonDisabled =
    mode === 'project'
      ? projectToken === '' || authorizationToken === '' || baseUrl === ''
      : streamId === '' ||
        baseUrl === '' ||
        (jwtKeyId === '') !== (jwtSecret === '');

  const handleStart = () => {
    if (mode === 'project') {
      props.onStart({
        type: 'project',
        projectToken,
        authorizationToken,
        baseUrl,
        advancedAuthKey,
        registeredId,
        applicationId: applicationId || 'default-application',
      });
    } else {
      props.onStart({
        type: 'stream',
        streamId,
        baseUrl,
        jwtKeyId,
        jwtSecret,
        registeredId,
        applicationId: applicationId || 'default-application',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.form}>
          <ExponeaSegmentedControl
            options={[
              { label: 'Project Config', value: 'project' },
              { label: 'Stream Config', value: 'stream' },
            ]}
            value={mode}
            onChange={setMode}
          />

          {mode === 'project' ? (
            <>
              <ExponeaInput
                value={projectToken}
                onChangeText={setProjectToken}
                placeholder="Project token"
              />
              <ExponeaInput
                value={authorizationToken}
                onChangeText={setAuthorizationToken}
                placeholder="Authorization token"
              />
              <ExponeaInput
                value={advancedAuthKey}
                onChangeText={setAdvancedAuthKey}
                placeholder="Advanced Auth key (optional)"
              />
            </>
          ) : (
            <>
              <ExponeaInput
                value={streamId}
                onChangeText={setStreamId}
                placeholder="Stream ID"
              />
              <ExponeaInput
                value={jwtKeyId}
                onChangeText={setJwtKeyId}
                placeholder="JWT Key ID (optional)"
              />
              <ExponeaInput
                value={jwtSecret}
                onChangeText={setJwtSecret}
                placeholder="JWT Secret (optional)"
              />
            </>
          )}

          <ExponeaInput
            value={registeredId}
            onChangeText={setRegisteredId}
            placeholder="Registered (optional)"
          />
          <ExponeaInput
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="Base URL"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  form: {
    padding: 10,
  },
});
