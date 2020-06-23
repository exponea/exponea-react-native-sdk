import React from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import Exponea from '../../../lib';
import AnonymizeModal from '../components/AnonymizeModal';

export default function FlushingScreen(): React.ReactElement {
  const [showingAnonymize, setShowingAnonymize] = React.useState(false);
  const flushData = async () => {
    try {
      await Exponea.flushData();
      Alert.alert('Data flushed', 'Check logs for more details.');
    } catch (error) {
      Alert.alert('Error flushing data', error.message);
    }
  };
  return (
    <View style={styles.container}>
      <AnonymizeModal
        visible={showingAnonymize}
        onClose={() => {
          setShowingAnonymize(false);
        }}
      />
      <ExponeaButton title="Flush data" onPress={flushData} />
      <ExponeaButton
        title="Anonymize"
        onPress={() => setShowingAnonymize(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
