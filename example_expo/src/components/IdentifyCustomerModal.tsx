import React, { useState } from 'react';
import {
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { identifyCustomer } from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaModal from '@/components/ExponeaModal';
import PropertyEditor from '@/components/PropertyEditor';
import LocalJwtTokenGenerator from '@/util/LocalJwtTokenGenerator';
import SdkSetupState from '@/util/SdkSetupState';

interface IdentifyCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isStreamMode?: boolean;
}

export default function IdentifyCustomerModal(
  props: IdentifyCustomerModalProps
): React.ReactElement {
  const [ids, setIds] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<Record<string, string>>({});

  const handleIdentify = async (withAuthToken = false) => {
    try {
      if (withAuthToken) {
        if (!LocalJwtTokenGenerator.isConfigured()) {
          Alert.alert('Error', 'JWT generator is not configured');
          return;
        }
        const token = LocalJwtTokenGenerator.generateToken(ids);
        if (!token) {
          Alert.alert('Error', 'Failed to generate JWT token');
          return;
        }
        await identifyCustomer(
          { customerIds: ids, sdkAuthToken: token },
          properties
        );
      } else {
        await identifyCustomer({ customerIds: ids }, properties);
        NativeModules.CustomerTokenStorage.configure({ customerIds: ids });
      }
      SdkSetupState.setCustomerIds(ids);
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
    <ExponeaModal
      visible={props.visible}
      onClose={props.onClose}
      closeButtonTestID={AutomationIds.IDENTIFY_CANCEL}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Identify customer</Text>

        <Text style={styles.subtitle}>Hard Ids</Text>
        <PropertyEditor
          properties={ids}
          onChange={setIds}
          addButtonTestID={AutomationIds.IDENTIFY_HARD_ID_ADD}
          keyInputTestID={AutomationIds.IDENTIFY_HARD_ID_KEY}
          valueInputTestID={AutomationIds.IDENTIFY_HARD_ID_VALUE}
        />

        <Text style={styles.subtitle}>Properties</Text>
        <PropertyEditor
          properties={properties}
          onChange={setProperties}
          addButtonTestID={AutomationIds.IDENTIFY_ADD_ATTR}
          keyInputTestID={AutomationIds.IDENTIFY_ATTR_NAME}
          propertiesJsonTestID={AutomationIds.IDENTIFY_ATTRS_JSON}
          valueInputTestID={AutomationIds.IDENTIFY_ATTR_VALUE}
        />

        <ExponeaButton
          title="Identify customer"
          onPress={() => handleIdentify(false)}
          testID={AutomationIds.IDENTIFY}
        />
        {props.isStreamMode && (
          <ExponeaButton
            title="Identify with auth token"
            onPress={() => handleIdentify(true)}
            testID={AutomationIds.IDENTIFY_AUTH}
          />
        )}
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
