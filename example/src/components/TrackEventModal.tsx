import React from 'react';
import {StyleSheet, Text, Alert, View} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from './ExponeaModal';
import ExponeaInput from './ExponeaInput';
import PropertyEditor from './PropertyEditor';
import Exponea from 'react-native-exponea-sdk';

interface TrackEventModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TrackEventModal(
  props: TrackEventModalProps,
): React.ReactElement {
  const [eventType, setEventType] = React.useState('custom_event');
  const [properties, setProperties] = React.useState({});

  const trackEvent = () => {
    console.log('Tracking event requested');
    Exponea.trackEvent(eventType, properties)
      .then(() => {
        console.log('Closing tracking event dialog');
        props.onClose();
        setProperties({});
      })
      .catch(error => {
        console.log(`Error occured while tracking event ${error.message}`);
        Alert.alert('Error tracking event', error.message);
      });
  };
  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <Text style={styles.title}>Track Event</Text>
      <Text style={styles.subtitle}>Event type</Text>
      <View style={styles.eventTypeContainer}>
        <ExponeaInput
          compact
          placeholder="Event type"
          value={eventType}
          onChangeText={setEventType}
        />
      </View>
      <Text style={styles.subtitle}>Properties</Text>
      <PropertyEditor properties={properties} onChange={setProperties} />
      <ExponeaButton title="Track event" onPress={trackEvent} />
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
  eventTypeContainer: {
    width: 200,
    marginLeft: -5,
  },
});
