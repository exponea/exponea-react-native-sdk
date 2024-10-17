import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import TabNavigation from './screens/TabNavigation';
import {Alert, Linking, NativeModules} from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import PreloadingScreen from './screens/PreloadingScreen';
import {
  InAppMessage,
  InAppMessageButton,
  LogLevel,
  SegmentationDataCallback,
} from 'react-native-exponea-sdk/lib/ExponeaType';
import * as RootNavigation from './util/RootNavigation';
import {Screen} from './screens/Screens';

interface AppState {
  preloaded: boolean;
  sdkConfigured: boolean;
}

export interface CustomerTokenStorage {}

export default class App extends React.Component<{}, AppState> {
  state = {
    preloaded: false,
    sdkConfigured: false,
  };

  discoverySegmentationCallback = new SegmentationDataCallback(
    'discovery',
    false,
    data => {
      console.log(
        `RN_Segments: New for category 'discovery' with IDs: ${JSON.stringify(
          data,
        )}`,
      );
    },
  );

  contentSegmentationCallback = new SegmentationDataCallback(
    'content',
    false,
    data => {
      console.log(
        `RN_Segments: New for category 'content' with IDs: ${JSON.stringify(
          data,
        )}`,
      );
    },
  );

  merchandisingSegmentationCallback = new SegmentationDataCallback(
    'merchandising',
    false,
    data => {
      console.log(
        `RN_Segments: New for category 'merchandising' with IDs: ${JSON.stringify(
          data,
        )}`,
      );
    },
  );

  resolveDeeplinkDestination(url: string) {
    if (url.includes('flush')) {
      return Screen.Flushing;
    }
    if (url.includes('track')) {
      return Screen.Tracking;
    }
    if (url.includes('fetch')) {
      return Screen.Fetching;
    }
    if (url.includes('anonymize')) {
      return Screen.Anonymize;
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

    Linking.addEventListener('url', e => openLink(e.url));
    Linking.getInitialURL().then(openLink);

    Exponea.setPushOpenedListener(pushOpened => {
      // we'll wait for the app to fully resume before showing the alert
      setTimeout(() => {
        const data = JSON.stringify(pushOpened, null, 2);
        Alert.alert(
          'Push notification opened',
          `Action: ${pushOpened.action}\nURL: ${pushOpened.url}\nAdditional data: ${data}`,
        );
      }, 1000);
    });

    Exponea.setPushReceivedListener(data => {
      // we'll wait for the app to fully resume before showing the alert
      setTimeout(() => {
        Alert.alert(
          'Push notification received',
          `Data: ${JSON.stringify(data, null, 2)}`,
        );
      }, 1000);
    });

    Exponea.setInAppMessageCallback({
      inAppMessageClickAction(
        message: InAppMessage,
        button: InAppMessageButton,
      ): void {
        console.log(
          `InApp action ${button.url} received for message ${message.id}`,
        );
        Exponea.trackInAppMessageClick(message, button.text, button.url);
      },
      inAppMessageCloseAction(
        message: InAppMessage,
        button: InAppMessageButton | undefined,
        interaction: boolean,
      ): void {
        console.log(
          `InApp message ${message.id} closed by ${button?.text} with interaction: ${interaction}`,
        );
        Exponea.trackInAppMessageClose(message, button?.text, interaction).then(
          () => {
            console.log('InApp message close track has been done successfully');
          },
          rejectReason => {
            console.error(
              `InApp message close track has been rejected with '${rejectReason}'`,
            );
          },
        );
      },
      inAppMessageError(
        message: InAppMessage | undefined,
        errorMessage: string,
      ): void {
        console.log(
          `InApp error '${errorMessage}' occurred for message ${message?.id}`,
        );
      },
      inAppMessageShown(message: InAppMessage): void {
        console.log(`InApp message ${message?.id} has been shown`);
      },
      overrideDefaultBehavior: false,
      trackActions: false,
    });

    Exponea.isConfigured().then(configured => {
      this.setState({preloaded: true, sdkConfigured: configured});
    });
    Exponea.registerSegmentationDataCallback(
      this.discoverySegmentationCallback,
    );
    Exponea.registerSegmentationDataCallback(this.contentSegmentationCallback);
    Exponea.registerSegmentationDataCallback(
      this.merchandisingSegmentationCallback,
    );
  }

  componentWillUnmount() {
    Exponea.unregisterSegmentationDataCallback(
      this.discoverySegmentationCallback,
    );
    Exponea.unregisterSegmentationDataCallback(
      this.contentSegmentationCallback,
    );
    Exponea.unregisterSegmentationDataCallback(
      this.merchandisingSegmentationCallback,
    );
    super.componentWillUnmount?.();
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
      manualSessionAutoClose: true,
    };
    console.log(
      `Configuring Exponea SDK with ${JSON.stringify(configuration)}`,
    );
    Exponea.configure(configuration)
      .then(() => {
        this.setState({sdkConfigured: true});
      })
      .catch(error =>
        Alert.alert('Error configuring Exponea SDK', error.message),
      );
  }
}
