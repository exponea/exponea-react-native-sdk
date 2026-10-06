import React, { useCallback, useContext, useState } from 'react';
import {
  Alert,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Exponea, { setSdkAuthToken, trackEvent } from 'react-native-exponea-sdk';

import { AppStateContext } from '@/App';
import { AutomationIds } from '@/automation/AutomationIds';
import DefaultPropertiesModal from '@/components/DefaultPropertiesModal';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';
import IdentifyCustomerModal from '@/components/IdentifyCustomerModal';
import Snackbar from '@/components/Snackbar';
import TrackEventModal from '@/components/TrackEventModal';
import { LogLevel } from '@/logging/LogEntry';
import MemoryLogger from '@/logging/MemoryLogger';
import { inAppMessagePresets } from '@/util/InAppMessagesPreset';
import LocalJwtTokenGenerator from '@/util/LocalJwtTokenGenerator';
import SdkSetupState from '@/util/SdkSetupState';

export default function TrackingScreen(): React.ReactElement {
  const {
    customerCookie,
    isStreamConfig,
    refreshCustomerCookie,
    sdkConfigured,
  } = useContext(AppStateContext);
  const [identifyModalVisible, setIdentifyModalVisible] = useState(false);
  const [defPropsModalVisible, setDefPropsModalVisible] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null
  );

  const [trackingEventModalVisible, setTrackingEventModalVisible] =
    useState(false);

  const handleSetAuthToken = useCallback(async () => {
    if (Object.keys(SdkSetupState.customerIds).length === 0) {
      Alert.alert('Error', 'Customer must be identified first.');
      return;
    }
    const token = LocalJwtTokenGenerator.generateToken(
      SdkSetupState.customerIds
    );
    if (!token) {
      Alert.alert('Error', 'JWT generator is not configured');
      return;
    }
    try {
      await setSdkAuthToken(token);
      setSnackbarMessage('Success: Auth token updated');
    } catch (error) {
      Alert.alert('Error', `Failed to set auth token: ${error}`);
    }
  }, []);

  const trackFcmToken = useCallback(() => {
    NativeModules.TokenTracker.trackToken();
    MemoryLogger.INSTANCE.append(
      LogLevel.INFO,
      'TrackingScreen',
      `Tracked push token`
    );
    setSnackbarMessage('Push token tracked');
  }, []);

  const trackPushDelivered = useCallback(() => {
    Exponea.trackDeliveredPush({ campaign_id: 'demo' });
    MemoryLogger.INSTANCE.append(
      LogLevel.INFO,
      'TrackingScreen',
      'Delivered push tracked (campaign_id=demo)'
    );
    setSnackbarMessage('Delivered push tracked (campaign_id=demo)');
  }, []);

  const trackPushClicked = useCallback(() => {
    Exponea.trackClickedPush({ campaign_id: 'demo' });
    MemoryLogger.INSTANCE.append(
      LogLevel.INFO,
      'TrackingScreen',
      'Clicked push tracked (campaign_id=demo)'
    );
    setSnackbarMessage('Clicked push tracked (campaign_id=demo)');
  }, []);

  return (
    <View style={styles.container}>
      <IdentifyCustomerModal
        visible={identifyModalVisible}
        onClose={() => setIdentifyModalVisible(false)}
        onSuccess={refreshCustomerCookie}
        isStreamMode={isStreamConfig}
      />
      <TrackEventModal
        visible={trackingEventModalVisible}
        onClose={() => setTrackingEventModalVisible(false)}
        eventPresets={inAppMessagePresets}
      />
      <DefaultPropertiesModal
        visible={defPropsModalVisible}
        onClose={() => setDefPropsModalVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ExponeaContainer title={'Cookie ID'}>
          <Text testID={AutomationIds.COOKIE_ID}>{customerCookie}</Text>
        </ExponeaContainer>

        <ExponeaContainer title={'Customer'}>
          <ExponeaButton
            title="Identify customer"
            onPress={() => setIdentifyModalVisible(true)}
            testID={AutomationIds.IDENTIFY_CUSTOMER}
          />
          {isStreamConfig && (
            <ExponeaButton
              secondary
              title="Set auth token"
              onPress={handleSetAuthToken}
              testID={AutomationIds.SET_AUTH_TOKEN}
            />
          )}
        </ExponeaContainer>

        <ExponeaContainer title={'Events'}>
          <ExponeaButton
            title="Track Custom Event"
            testID={AutomationIds.TRACK_CUSTOM_EVENT}
            onPress={async () => {
              if (!sdkConfigured) return;
              setTrackingEventModalVisible(true);
            }}
          />
          <ExponeaButton
            title="Track Payment"
            testID={AutomationIds.TRACK_PAYMENT}
            onPress={async () => {
              if (!sdkConfigured) return;
              await trackEvent('payment', {});
              setSnackbarMessage('Payment Tracked');
            }}
          />
          <ExponeaButton
            title="Track Page View"
            testID={AutomationIds.TRACK_PAGE_VIEW}
            onPress={async () => {
              if (!sdkConfigured) return;
              await trackEvent('page_view', { name: 'Tracking' });
              setSnackbarMessage('Page View Tracked');
            }}
          />
        </ExponeaContainer>
        <ExponeaContainer title={'Push'}>
          <ExponeaButton
            title="Authorize push notifications"
            testID={AutomationIds.REQUEST_PUSH}
            onPress={() => {
              Exponea.requestPushAuthorization()
                .then((result) => {
                  console.log(`Authorization result: ${result}`);
                  Alert.alert(
                    'Push Notifications',
                    result
                      ? 'Notifications enabled successfully!'
                      : 'Notification permission was denied',
                    [{ text: 'OK' }]
                  );
                })
                .catch((error) => {
                  console.log(`Authorization error: ${error}`);
                  Alert.alert(
                    'Error',
                    `Failed to authorize notifications: ${error}`,
                    [{ text: 'OK' }]
                  );
                });
            }}
          />
          {Platform.OS === 'android' && (
            <ExponeaButton
              secondary
              title="Track FCM Token"
              onPress={trackFcmToken}
              testID={AutomationIds.TRACK_FCM_TOKEN}
            />
          )}
          <View style={styles.buttonRow}>
            <ExponeaButton
              secondary
              title="Track Delivered"
              onPress={trackPushDelivered}
              style={styles.buttons}
              testID={AutomationIds.TRACK_PUSH_DELIVERED}
            />
            <ExponeaButton
              secondary
              title="Track Clicked"
              onPress={trackPushClicked}
              style={styles.buttons}
              testID={AutomationIds.TRACK_PUSH_CLICKED}
            />
          </View>
        </ExponeaContainer>
      </ScrollView>
      <Snackbar
        message={snackbarMessage}
        onDismiss={() => {
          setSnackbarMessage(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  buttons: {
    flex: 1,
  },
});
