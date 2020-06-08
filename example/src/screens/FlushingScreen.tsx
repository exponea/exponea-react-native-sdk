import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function FlushingScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text>Flushing screen</Text>
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
