import React from 'react';
import {StyleSheet, Text, Alert, View} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from './ExponeaModal';
import ExponeaInput from './ExponeaInput';
import PropertyEditor from './PropertyEditor';
import Exponea from '../../../lib';

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
    Exponea.trackEvent(eventType, properties)
      .then(() => {
        props.onClose();
        setProperties({});
      })
      .catch((error) => Alert.alert('Error tracking event', error.message));
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
    fontSize: 20,
    fontStyle: 'italic',
    marginTop: 10,
  },
  eventTypeContainer: {
    width: 200,
  },
});
