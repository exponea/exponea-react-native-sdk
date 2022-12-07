import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import TabNavigation from './screens/TabNavigation';
import {Alert, Linking} from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import PreloadingScreen from './screens/PreloadingScreen';
import {LogLevel} from 'react-native-exponea-sdk/lib/ExponeaType';

interface AppState {
  preloaded: boolean;
  sdkConfigured: boolean;
}

export default class App extends React.Component<{}, AppState> {
  state = {
    preloaded: false,
    sdkConfigured: false,
  };

  componentDidMount(): void {
    const openLink = (url: string | null) => {
      if (url != null) {
        setTimeout(() => {
          console.log(`Link received url: ${url}`);
          Alert.alert('Link received', `Url: ${url}`);
        }, 1000);
      }
    };
    Linking.addEventListener('url', (e) => openLink(e.url));
    Linking.getInitialURL().then(openLink);

    Exponea.setPushOpenedListener((pushOpened) => {
      // we'll wait for the app to fully resume before showing the alert
      setTimeout(() => {
        const data = JSON.stringify(pushOpened, null, 2);
        Alert.alert(
          'Push notification opened',
          `Action: ${pushOpened.action}\nURL: ${pushOpened.url}\nAdditional data: ${data}`,
        );
      }, 1000);
    });

    Exponea.setPushReceivedListener((data) => {
      // we'll wait for the app to fully resume before showing the alert
      setTimeout(() => {
        Alert.alert(
          'Push notification received',
          `Data: ${JSON.stringify(data, null, 2)}`,
        );
      }, 1000);
    });

    Exponea.isConfigured().then((configured) => {
      this.setState({preloaded: true, sdkConfigured: configured});
    });
  }

  render(): React.ReactNode {
    if (!this.state.preloaded) {
      return <PreloadingScreen />;
    }
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
      `Configuring Exponea SDK with ${projectToken}, ${authorization} and ${baseUrl}`,
    );
    Exponea.setLogLevel(LogLevel.VERBOSE);
    Exponea.checkPushSetup();
    Exponea.configure({
      projectToken: projectToken,
      authorizationToken: authorization,
      baseUrl: baseUrl,
      allowDefaultCustomerProperties: false,
      ios: {
        appGroup: 'group.com.exponea.ExponeaSDK-Example2',
      },
      android: {
        pushIconResourceName: 'push_icon',
        pushAccentColorRGBA: '161, 226, 200, 220',
      },
    })
      .then(() => {
        this.setState({sdkConfigured: true});
      })
      .catch((error) =>
        Alert.alert('Error configuring Exponea SDK', error.message),
      );
  }
}
