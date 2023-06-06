import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';
import IdentifyCustomerModal from '../components/IdentifyCustomerModal';
import TrackEventModal from '../components/TrackEventModal';
import AppInboxButton from 'react-native-exponea-sdk/lib/AppInboxButton';

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
    Exponea.setAppInboxProvider({
      appInboxButton: {
        textSize: '16sp',
        textWeight: 'bold',
        backgroundColor: 'red',
      },
      detailView: {
        title: {
          textColor: '#262626',
          textSize: '20sp',
        },
        content: {
          textColor: '#262626',
          textSize: '16sp',
        },
        button: {
          textSize: '16sp',
          textColor: '#262626',
          backgroundColor: '#ffd500',
          borderRadius: '10dp',
        },
      },
      listView: {
        list: {
          backgroundColor: 'white',
          item: {
            content: {
              textSize: '16sp',
              textColor: '#262626',
            },
          },
        },
      },
    });
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
        <AppInboxButton
          style={{
            width: '100%',
            height: 50,
          }}
          {...styles.buttonProps}
        />
        <ExponeaButton
          title="Inbox fetch test"
          onPress={() => {
            Exponea.fetchAppInbox()
              .then((list) => {
                console.log(`AppInbox loaded of size ${list.length}`);
                if (list.length > 0) {
                  console.log(
                    `AppInbox first message: ${JSON.stringify(list[0])}`,
                  );
                }
              })
              .catch((error) => console.log(`AppInbox error: ${error}`));
          }}
        />
        <ExponeaButton
          title="Inbox fetch first message"
          onPress={() => {
            Exponea.fetchAppInbox()
              .then((list) => {
                if (list.length == 0) {
                  console.log('AppInbox is empty, identifyCustomer!');
                  return;
                }
                Exponea.fetchAppInboxItem(list[0].id)
                  .then((message) =>
                    console.log(
                      `AppInbox first message: ${JSON.stringify(message)}`,
                    ),
                  )
                  .catch((error) =>
                    console.log(`AppInbox message error: ${error}`),
                  );
              })
              .catch((error) => console.log(`AppInbox error: ${error}`));
          }}
        />
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
  buttonProps: {
    textOverride: 'Example Inbox',
    borderRadius: 5,
    showIcon: true,
    enabled: true,
  },
});
