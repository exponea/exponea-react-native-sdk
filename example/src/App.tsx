import React from 'react';
import {StyleSheet, View} from 'react-native';
import AuthScreen from './screens/AuthScreen';
import TrackingScreen from './screens/TrackingScreen';

interface AppState {
  authenticated: boolean;
}

export default class App extends React.Component<{}, AppState> {
  state = {
    authenticated: false,
  };

  render(): React.ReactNode {
    return (
      <View style={styles.container}>
        {this.state.authenticated ? (
          <TrackingScreen />
        ) : (
          <AuthScreen onStart={this.onStart.bind(this)} />
        )}
      </View>
    );
  }

  onStart(projectToken: string, authentication: string, baseUrl: string): void {
    console.log(
      `We should initialize Exponea SDK here with ${projectToken}, ${authentication} and ${baseUrl}`,
    );
    this.setState({authenticated: true});
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
