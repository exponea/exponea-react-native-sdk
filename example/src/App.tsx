import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/TabNavigation';
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
import {Screen as DeeplinkFlow} from './screens/Screens';

interface AppState {
  preloaded: boolean;
  sdkConfigured: boolean;
}

export const AppStateContext = React.createContext<{ validateSdkState: () => void }>({
  validateSdkState: () => {},
});

export interface CustomerTokenStorage {}

export default class App extends React.Component<{}, AppState> {
  state = {
    preloaded: false,
    sdkConfigured: false,
  };

  reloadSdkState = () => {
    Exponea.isConfigured().then(configured => {
      this.setState({sdkConfigured: configured});
    });
  }

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
      return DeeplinkFlow.Flushing;
    }
    if (url.includes('track')) {
      return DeeplinkFlow.Tracking;
    }
    if (url.includes('fetch')) {
      return DeeplinkFlow.Fetching;
    }
    if (url.includes('anonymize')) {
      return DeeplinkFlow.Anonymize;
    }
    if (url.includes('inappcb')) {
      return DeeplinkFlow.InAppCB;
    }
    if (url.includes('stopAndContinue')) {
      return DeeplinkFlow.StopAndContinue;
    }
    if (url.includes('stopAndRestart')) {
      return DeeplinkFlow.StopAndRestart;
    }
    return null;
  }

  componentDidMount(): void {
    const handleDeeplinkDestination = (target: DeeplinkFlow) => {
      switch (target) {
        case DeeplinkFlow.StopAndContinue:
          Exponea.stopIntegration()
          RootNavigation.navigate(DeeplinkFlow.Fetching);
          break;
        case DeeplinkFlow.StopAndRestart:
          Exponea.stopIntegration()
          this.setState({sdkConfigured: false});
          break;
        default:
          RootNavigation.navigate(target);
          break;
      }
    }

    const openLink = (url: string | null) => {
      if (url != null) {
        setTimeout(() => {
          console.log(`Link received: ${url}`);
          Alert.alert('Link received', `Url: ${url}`);
          const screenToOpen = this.resolveDeeplinkDestination(url);
          if (screenToOpen != null) {
            handleDeeplinkDestination(screenToOpen);
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

    const messageIsForGdpr = (message: InAppMessage) : Boolean => {
      // apply your detection for GDPR related In-app
      // our example app is triggering GDPR In-app by custom event tracking so we used it for detection
      // you may implement detection against message title, ID, payload, etc.
      if (!message.trigger) return false;
      if (message.trigger["event_type"] !== "event_name") return false;
      const triggerFilter = message.trigger["filter"] as any[]
      return triggerFilter?.[0]?.constraint?.operands?.[0]?.value === "gdpr";
    }

    Exponea.setInAppMessageCallback({
      inAppMessageClickAction(
        message: InAppMessage,
        button: InAppMessageButton,
      ): void {
        console.log(`InApp action ${button.url} received for message ${message.id}`);
        Exponea.trackInAppMessageClick(message, button.text, button.url);
        if (messageIsForGdpr(message)) {
          switch (button.url) {
            case "https://bloomreach.com/tracking/allow":
              Exponea.trackEvent('gdpr', {status: "allowed"});
              break;
            case "https://bloomreach.com/tracking/deny":
              console.log(`Stopping SDK`);
              Exponea.stopIntegration();
              break;
          }
        } else if (!!button.url) {
          Linking.openURL(button.url)
        }
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
        if (messageIsForGdpr(message) && interaction) {
          // regardless from `button` nullability, parameter `interaction` tells that user closed message
          console.log(`Stopping SDK`)
          Exponea.stopIntegration()
        }
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
        console.log(`InApp message ${message?.name} has been shown`);
        if (message.name.includes("StopSDK")) {
          console.log(`InApp message ${message?.name} will stop SDK`);
          setTimeout(() => {
            console.log(`Stopping SDK`)
            Exponea.stopIntegration()
          }, 4000)
        }
      },
      overrideDefaultBehavior: true,
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
      <AppStateContext.Provider value={{ validateSdkState: this.reloadSdkState }}>
        <NavigationContainer ref={RootNavigation.navigationRef}>
          {this.state.sdkConfigured ? (
            <DashboardScreen />
          ) : (
            <AuthScreen onStart={this.onStart.bind(this)} />
          )}
        </NavigationContainer>
      </AppStateContext.Provider>
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
