import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Exponea from 'react-native-exponea-sdk';

interface AppState {
  status: string;
  message: string;
}

export default class CallbackScreen extends React.Component<{}, AppState> {
  state = {
    status: 'starting',
    message: '--',
  };

  componentDidMount(): void {
    interface SampleSDK {
      sampleMethod(
        stringArgument: string,
        numberArgument: number,
        callback: (value: string) => void,
      ): void;
    }
    ((Exponea as unknown) as SampleSDK).sampleMethod(
      'Testing',
      123,
      (message: string) => {
        this.setState({
          status: 'native callback received',
          message,
        });
      },
    );
  }

  render(): React.ReactNode {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>☆Exponea example☆</Text>
        <Text style={styles.instructions}>STATUS: {this.state.status}</Text>
        <Text style={styles.welcome}>☆NATIVE CALLBACK MESSAGE☆</Text>
        <Text style={styles.instructions}>{this.state.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
