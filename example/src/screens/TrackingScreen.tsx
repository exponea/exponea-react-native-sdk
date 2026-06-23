import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import Exponea, {
  AppInboxButton,
  setSdkAuthToken,
} from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';
import IdentifyCustomerModal from '../components/IdentifyCustomerModal';
import DefaultPropertiesModal from '../components/DefaultPropertiesModal';
import TrackEventModal from '../components/TrackEventModal';
import { AppStateContext } from '../App';
import LocalJwtTokenGenerator from '../util/LocalJwtTokenGenerator';
import SdkSetupState from '../util/SdkSetupState';

export default function TrackingScreen(): React.ReactElement {
  const { isStreamConfig } = useContext(AppStateContext);
  const [customerCookie, setCustomerCookie] = useState('?');
  const [identifyModalVisible, setIdentifyModalVisible] = useState(false);
  const [defPropsModalVisible, setDefPropsModalVisible] = useState(false);
  const [trackingEventModalVisible, setTrackingEventModalVisible] =
    useState(false);
  useEffect(() => {
    loadCustomerCookie();
  }, []);

  const loadCustomerCookie = async () => {
    try {
      const cookie = await Exponea.getCustomerCookie();
      setCustomerCookie(cookie);
    } catch (error) {
      setCustomerCookie(`Error: ${error}`);
    }
  };

  const handleSetAuthToken = async () => {
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
      Alert.alert('Success', 'Auth token updated');
    } catch (error) {
      Alert.alert('Error', `Failed to set auth token: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <IdentifyCustomerModal
        visible={identifyModalVisible}
        onClose={() => setIdentifyModalVisible(false)}
        onSuccess={loadCustomerCookie}
        isStreamMode={isStreamConfig}
      />
      <TrackEventModal
        visible={trackingEventModalVisible}
        onClose={() => setTrackingEventModalVisible(false)}
      />
      <DefaultPropertiesModal
        visible={defPropsModalVisible}
        onClose={() => setDefPropsModalVisible(false)}
      />

      <Text style={styles.label}>Customer cookie:</Text>
      <Text>{customerCookie}</Text>

      <ExponeaButton
        title="Identify customer"
        onPress={() => setIdentifyModalVisible(true)}
      />
      {isStreamConfig && (
        <ExponeaButton title="Set auth token" onPress={handleSetAuthToken} />
      )}
      <ExponeaButton
        title="Track event"
        onPress={() => setTrackingEventModalVisible(true)}
      />
      <ExponeaButton
        title="Default properties"
        onPress={() => setDefPropsModalVisible(true)}
      />
      <ExponeaButton
        title="Authorize push notifications"
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
      <AppInboxButton
        style={{
          width: '100%',
          height: 50,
        }}
        borderRadius="5px"
      />
      <ExponeaButton
        title="Inbox fetch test"
        onPress={() => {
          Exponea.fetchAppInbox()
            .then((list) => {
              console.log(`AppInbox loaded of size ${list.length}`);
              if (list.length > 0) {
                console.log(
                  `AppInbox first message: ${JSON.stringify(list[0])}`
                );
              }
            })
            .catch((error) => console.log(`AppInbox error: ${error}`));
        }}
      />
      <ExponeaButton
        title="Inbox fetch first message"
        onPress={() => {
          Exponea.fetchAppInbox()
            .then((list) => {
              if (list.length === 0) {
                console.log('AppInbox is empty, identifyCustomer!');
                return;
              }
              Exponea.fetchAppInboxItem(list[0].id)
                .then((message) =>
                  console.log(
                    `AppInbox first message: ${JSON.stringify(message)}`
                  )
                )
                .catch((error) =>
                  console.log(`AppInbox message error: ${error}`)
                );
            })
            .catch((error) => console.log(`AppInbox error: ${error}`));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
