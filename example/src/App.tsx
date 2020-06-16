import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import TabNavigation from './screens/TabNavigation';

interface AppState {
  sdkConfigured: boolean;
}

export default class App extends React.Component<{}, AppState> {
  state = {
    sdkConfigured: false,
  };

  render(): React.ReactNode {
    return (
      <NavigationContainer>
        {this.state.sdkConfigured ? (
          <TabNavigation />
        ) : (
          <AuthScreen onStart={this.onStart.bind(this)} />
        )}
      </NavigationContainer>
    );
  }

  onStart(projectToken: string, authorization: string, baseUrl: string): void {
    console.log(
      `We should initialize Exponea SDK here with ${projectToken}, ${authorization} and ${baseUrl}`,
    );
    this.setState({sdkConfigured: true});
  }
}
