import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import TabNavigation from './screens/TabNavigation';

interface AppState {
  authenticated: boolean;
}

export default class App extends React.Component<{}, AppState> {
  state = {
    authenticated: false,
  };

  render(): React.ReactNode {
    return (
      <NavigationContainer>
        {this.state.authenticated ? (
          <TabNavigation />
        ) : (
          <AuthScreen onStart={this.onStart.bind(this)} />
        )}
      </NavigationContainer>
    );
  }

  onStart(projectToken: string, authentication: string, baseUrl: string): void {
    console.log(
      `We should initialize Exponea SDK here with ${projectToken}, ${authentication} and ${baseUrl}`,
    );
    this.setState({authenticated: true});
  }
}
