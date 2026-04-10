import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  getDefaultProperties,
  setDefaultProperties,
  type JsonObject,
} from 'react-native-exponea-sdk';
import ExponeaModal from './ExponeaModal';
import ExponeaButton from './ExponeaButton';
import PropertyEditor from './PropertyEditor';

interface DefaultPropertiesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DefaultPropertiesModal(
  props: DefaultPropertiesModalProps
): React.ReactElement {
  const [currentPropertiesLoaded, setCurrentPropertiesLoaded] = useState(false);
  const [currentProperties, setCurrentProperties] = useState<JsonObject | null>(
    null
  );
  const [newProperties, setNewProperties] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (props.visible && !currentPropertiesLoaded) {
      loadCurrentProperties();
    }
  }, [props.visible, currentPropertiesLoaded]);

  const loadCurrentProperties = async () => {
    try {
      const props = await getDefaultProperties();
      setCurrentProperties(props);
      setCurrentPropertiesLoaded(true);
    } catch (error) {
      Alert.alert('Error', `Failed to get default properties: ${error}`);
      setCurrentPropertiesLoaded(true);
    }
  };

  const handleSetProperties = async () => {
    try {
      await setDefaultProperties(newProperties);
      Alert.alert('Success', 'Default properties updated successfully');
      setNewProperties({});
      setCurrentPropertiesLoaded(false); // Force reload on next open
      props.onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to set default properties: ${error}`);
    }
  };

  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Default Properties</Text>

        <Text style={styles.subtitle}>Current default properties</Text>
        {!currentPropertiesLoaded ? (
          <ActivityIndicator size="small" color="#ffd500" />
        ) : (
          <View style={styles.jsonContainer}>
            <Text style={styles.jsonText}>
              {JSON.stringify(currentProperties, null, 2)}
            </Text>
          </View>
        )}

        <Text style={styles.subtitle}>Update default properties</Text>
        <PropertyEditor
          properties={newProperties}
          onChange={setNewProperties}
        />

        <ExponeaButton
          title="Set default properties"
          onPress={handleSetProperties}
        />
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
  jsonContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  jsonText: {
    fontSize: 12,
    fontFamily: 'Courier',
  },
});
