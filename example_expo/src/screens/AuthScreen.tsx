import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { clearLocalCustomerData } from 'react-native-exponea-sdk';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ProjectConfigParams, StreamConfigParams } from '@/App';
import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaInput from '@/components/ExponeaInput';
import ExponeaSegmentedControl from '@/components/ExponeaSegmentedControl';

interface AuthScreenProps {
  onStart: (params: ProjectConfigParams | StreamConfigParams) => void;
}

const AUTH_MODE_OPTIONS: Array<{
  label: string;
  testID: string;
  value: 'project' | 'stream';
}> = [
  {
    label: 'Project Config',
    testID: AutomationIds.AUTH_MODE_PROJECT,
    value: 'project',
  },
  {
    label: 'Stream Config',
    testID: AutomationIds.AUTH_MODE_STREAM,
    value: 'stream',
  },
];

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
      <Text style={styles.title} testID={AutomationIds.AUTH_TITLE}>
        Bloomreach
      </Text>
      <Text style={styles.subtext}>SDK Configuration</Text>
      <ScrollView>
        <View style={styles.form}>
          <ExponeaSegmentedControl
            options={AUTH_MODE_OPTIONS}
            value={mode}
            onChange={setMode}
          />

          {mode === 'project' ? (
            <>
              <ExponeaInput
                value={projectToken}
                onChangeText={setProjectToken}
                placeholder="Project token"
                testID={AutomationIds.AUTH_PROJECT_TOKEN}
              />
              <ExponeaInput
                value={authorizationToken}
                onChangeText={setAuthorizationToken}
                placeholder="Authorization token"
                testID={AutomationIds.AUTH_AUTHORIZATION_TOKEN}
              />
              <ExponeaInput
                value={advancedAuthKey}
                onChangeText={setAdvancedAuthKey}
                placeholder="Advanced Auth key (optional)"
                testID={AutomationIds.AUTH_ADVANCED_AUTH}
              />
            </>
          ) : (
            <>
              <ExponeaInput
                value={streamId}
                onChangeText={setStreamId}
                placeholder="Stream ID"
                testID={AutomationIds.AUTH_STREAM_ID}
              />
              <ExponeaInput
                value={jwtKeyId}
                onChangeText={setJwtKeyId}
                placeholder="JWT Key ID (optional)"
                testID={AutomationIds.AUTH_JWT_KEY_ID}
              />
              <ExponeaInput
                value={jwtSecret}
                onChangeText={setJwtSecret}
                placeholder="JWT Secret (optional)"
                testID={AutomationIds.AUTH_JWT_SECRET}
              />
            </>
          )}

          <ExponeaInput
            value={registeredId}
            onChangeText={setRegisteredId}
            placeholder="Registered (optional)"
            testID={AutomationIds.AUTH_REGISTERED_ID}
          />
          <ExponeaInput
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="Base URL"
            testID={AutomationIds.AUTH_API_URL}
          />
          <ExponeaInput
            value={applicationId}
            placeholder="Application ID (optional)"
            onChangeText={setApplicationId}
            testID={AutomationIds.AUTH_APPLICATION_ID}
          />
          <ExponeaButton
            disabled={buttonDisabled}
            title="Start"
            onPress={handleStart}
            testID={AutomationIds.AUTH_START}
          />
          <ExponeaButton
            title="Clear local data"
            secondary
            testID={AutomationIds.AUTH_CLEAR_LOCAL_DATA}
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
  },
  subtext: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 10,
  },
});
