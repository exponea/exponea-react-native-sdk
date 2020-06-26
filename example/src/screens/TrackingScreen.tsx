import React from 'react';
import {StyleSheet, Text, View, Alert, Platform} from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';
import IdentifyCustomerModal from '../components/IdentifyCustomerModal';
import TrackEventModal from '../components/TrackEventModal';

interface AppState {
  customerCookie: string;
  identifyingCustomer: boolean;
  trackingEvent: boolean;
}

export default class TrackingScreen extends React.Component<{}, AppState> {
  state = {
    customerCookie: '?',
    identifyingCustomer: false,
    trackingEvent: false,
  };

  componentDidMount(): void {
    Exponea.getCustomerCookie()
      .then((cookie) => this.setState({customerCookie: cookie}))
      .catch((error) => {
        Alert.alert('Error getting customer Cookie', error.message);
      });
  }

  render(): React.ReactNode {
    return (
      <View style={styles.container}>
        <IdentifyCustomerModal
          visible={this.state.identifyingCustomer}
          onClose={() => {
            this.setState({identifyingCustomer: false});
          }}
        />
        <TrackEventModal
          visible={this.state.trackingEvent}
          onClose={() => {
            this.setState({trackingEvent: false});
          }}
        />
        <Text style={styles.label}>Customer cookie:</Text>
        <Text>{this.state.customerCookie}</Text>
        <ExponeaButton
          title="Identify customer"
          onPress={() => {
            this.setState({identifyingCustomer: true});
          }}
        />
        <ExponeaButton
          title="Track event"
          onPress={() => {
            this.setState({trackingEvent: true});
          }}
        />
        {Platform.OS === 'ios' ? (
          <ExponeaButton
            title="Authorize push notifications"
            onPress={() => {
              Exponea.requestIosPushAuthorization()
                .then((result) =>
                  console.log(`Authorization result: ${result}`),
                )
                .catch((error) => console.log(`Authorization error: ${error}`));
            }}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
