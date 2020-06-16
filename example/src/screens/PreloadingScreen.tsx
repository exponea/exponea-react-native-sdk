import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

export default function PreloadingScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ffd500" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
});
