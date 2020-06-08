import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function FetchingScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text>Fetching screen</Text>
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
