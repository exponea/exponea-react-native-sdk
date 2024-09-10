import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import Exponea from 'react-native-exponea-sdk';

export default function FlushingScreen(): React.ReactElement {
  const flushData = async () => {
    try {
      await Exponea.flushData();
      Alert.alert('Data flushed', 'Check logs for more details.');
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error flushing data', errorMessage);
    }
  };
  return (
    <View style={styles.container}>
      <ExponeaButton title="Flush data" onPress={flushData} />
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
