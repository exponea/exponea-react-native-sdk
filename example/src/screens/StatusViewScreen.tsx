import React, { useContext } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppStateContext } from '@/App';
import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaContainer from '@/components/ExponeaContainer';
import clearIcon from '@/img/ic_clear.png';

interface StatusViewScreenProps {
  visible: boolean;
  onClose: () => void;
  topInset: number;
}
/*
            tokenTrackFrequency = formatTokenTrackFrequency(configuration.tokenTrackFrequency),
            regenerateDeviceIdOnAnonymize = configuration.regenerateDeviceIdOnAnonymize,
            applicationId = configuration.applicationId
 */

export default function StatusViewScreen(
  props: StatusViewScreenProps
): React.ReactElement {
  const { subConfig } = useContext(AppStateContext);

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: props.topInset + 8 }]}>
          <Text style={styles.title}>Exponea configuration</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              testID={AutomationIds.LOGS_CLOSE}
              onPress={props.onClose}
            >
              <Image source={clearIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        <ExponeaContainer title={'Application ID'}>
          <Text style={styles.data}>{subConfig.applicationId}</Text>
        </ExponeaContainer>
        <View style={styles.divider} />
        <ExponeaContainer title={'Regenerate Device ID On Anonymize'}>
          <Text style={styles.data}>
            {subConfig.regenerateDeviceIdOnAnonymize ? 'On' : 'Off'}
          </Text>
        </ExponeaContainer>
        <View style={styles.divider} />
        <ExponeaContainer title={'Push Token Tracking Frequency'}>
          <Text style={styles.data}>
            {subConfig.pushTokenTrackingFrequency
              ? subConfig.pushTokenTrackingFrequency.replace('_', ' ')
              : 'Default'}
          </Text>
        </ExponeaContainer>
        <View style={styles.divider} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#111111',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  data: {
    color: '#111111',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
  },
});
