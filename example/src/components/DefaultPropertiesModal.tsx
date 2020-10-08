import React from 'react';
import {StyleSheet, Text, Alert, ActivityIndicator} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from './ExponeaModal';
import PropertyEditor from './PropertyEditor';
import Exponea from 'react-native-exponea-sdk';
import {JsonObject} from '../../../lib/Json';

interface DefaultPropertiesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DefaultPropertiesModal(
  props: DefaultPropertiesModalProps,
): React.ReactElement {
  const [currentPropertiesLoaded, setCurrentPropertiesLoaded] = React.useState(
    false,
  );
  const [
    currentProperties,
    setCurrentProperties,
  ] = React.useState<JsonObject | null>(null);
  const [newProperties, setNewProperties] = React.useState({});

  React.useEffect(() => {
    Exponea.getDefaultProperties()
      .then((properties) => {
        setCurrentPropertiesLoaded(true);
        setCurrentProperties(properties);
      })
      .catch((error) =>
        Alert.alert('Error getting default properties', error.message),
      );
  }, [props]);
  const setDefaultProperties = () => {
    Exponea.setDefaultProperties(newProperties)
      .then(() => {
        props.onClose();
        setNewProperties({});
      })
      .catch((error) =>
        Alert.alert('Error setting default properties', error.message),
      );
  };
  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <Text style={styles.title}>Default Properties</Text>
      <Text style={styles.subtitle}>Current default properties</Text>
      {currentPropertiesLoaded ? (
        <Text style={styles.defaultProperties}>
          {JSON.stringify(currentProperties, null, 2)}
        </Text>
      ) : (
        <ActivityIndicator size="large" />
      )}
      <Text style={styles.subtitle}>Update default properties</Text>
      <PropertyEditor properties={newProperties} onChange={setNewProperties} />
      <ExponeaButton
        title="Set default properties"
        onPress={setDefaultProperties}
      />
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
  },
  defaultProperties: {
    backgroundColor: '#efefef',
    borderColor: '#000000',
    borderWidth: 1,
    padding: 10,
  },
});
