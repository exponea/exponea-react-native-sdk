import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import TabNavigation from './screens/TabNavigation';
import {Alert, Linking, NativeModules} from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import PreloadingScreen from './screens/PreloadingScreen';
import {LogLevel} from 'react-native-exponea-sdk/lib/ExponeaType';
import * as RootNavigation from './util/RootNavigation';
import {Screen} from './screens/Screens';

interface AppState {
  preloaded: boolean;
  sdkConfigured: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomerTokenStorage {}

export default class App extends React.Component<{}, AppState> {
  state = {
    preloaded: false,
    sdkConfigured: false,
  };

  resolveDeeplinkDestination(url: string) {
    if (url.includes('flush')) {
      return Screen.Flushing;
    }
    if (url.includes('track')) {
      return Screen.Tracking;
    }
    if (url.includes('manual')) {
      return Screen.Fetching;
    }
    if (url.includes('anonymize')) {
      return Screen.Config;
    }
    if (url.includes('inappcb')) {
      return Screen.InAppCB;
    }
    return null;
  }

  componentDidMount(): void {
    const openLink = (url: string | null) => {
      if (url != null) {
        setTimeout(() => {
          console.log(`Link received: ${url}`);
          Alert.alert('Link received', `Url: ${url}`);
          const screenToOpen = this.resolveDeeplinkDestination(url);
          if (screenToOpen != null) {
            RootNavigation.navigate(screenToOpen);
          }
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Exponea.setInAppMessageCallback(false, true, (action) => {
      console.log('InApp action received - App.tsx');
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
      <NavigationContainer ref={RootNavigation.navigationRef}>
        {this.state.sdkConfigured ? (
          <TabNavigation />
        ) : (
          <AuthScreen onStart={this.onStart.bind(this)} />
        )}
      </NavigationContainer>
    );
  }

  onStart(
    projectToken: string,
    authorization: string,
    advancedAuthKey: string,
    baseUrl: string,
  ): void {
    Exponea.setLogLevel(LogLevel.VERBOSE);
    Exponea.checkPushSetup();
    // Prepare Example Advanced Auth
    NativeModules.CustomerTokenStorage.configure({
      host: baseUrl,
      projectToken: projectToken,
      publicKey: advancedAuthKey,
    });
    Exponea.setAppInboxProvider({
      appInboxButton: {
        textSize: '16sp',
        textWeight: 'bold',
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
    const configuration = {
      projectToken: projectToken,
      authorizationToken: authorization,
      baseUrl: baseUrl,
      allowDefaultCustomerProperties: false,
      advancedAuthEnabled: (advancedAuthKey || '').trim().length !== 0,
      inAppContentBlockPlaceholdersAutoLoad: ['example_top'],
      ios: {
        appGroup: 'group.com.exponea.ExponeaSDK-Example2',
      },
      android: {
        pushIconResourceName: 'push_icon',
        pushAccentColorRGBA: '161, 226, 200, 220',
      },
    };
    console.log(
      `Configuring Exponea SDK with ${JSON.stringify(configuration)}`,
    );
    Exponea.configure(configuration)
      .then(() => {
        this.setState({sdkConfigured: true});
      })
      .catch((error) =>
        Alert.alert('Error configuring Exponea SDK', error.message),
      );
  }
}
