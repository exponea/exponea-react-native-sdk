import 'react-native-gesture-handler'; // This needs to be first import according to docs
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert, Linking, NativeModules } from 'react-native';
import Exponea, {
  isConfigured,
  configure,
  setLogLevel,
  checkPushSetup,
  setAppInboxProvider,
  setPushOpenedListener,
  setPushReceivedListener,
  setInAppMessageCallback,
  registerSegmentationDataCallback,
  unregisterSegmentationDataCallback,
  trackInAppMessageClick,
  trackInAppMessageClose,
  stopIntegration,
  trackEvent,
  LogLevel,
  SegmentationDataCallback,
  setSdkAuthToken,
  setSdkAuthErrorCallback,
  removeSdkAuthErrorCallback,
} from 'react-native-exponea-sdk';
import type {
  InAppMessage,
  InAppMessageButton,
  CustomerIdentity,
} from 'react-native-exponea-sdk';
import AuthScreen from './screens/AuthScreen';
import TabNavigation from './navigation/TabNavigation';
import PreloadingScreen from './screens/PreloadingScreen';
import * as RootNavigation from './util/RootNavigation';
import {
  resolveDeeplinkDestination,
  handleDeeplinkDestination,
} from './util/deeplink';
import LocalJwtTokenGenerator from './util/LocalJwtTokenGenerator';
import SdkSetupState from './util/SdkSetupState';

export interface ProjectConfigParams {
  type: 'project';
  projectToken: string;
  authorizationToken: string;
  baseUrl: string;
  advancedAuthKey: string;
  registeredId?: string;
  applicationId: string;
}

export interface StreamConfigParams {
  type: 'stream';
  streamId: string;
  baseUrl: string;
  jwtKeyId: string;
  jwtSecret: string;
  registeredId?: string;
  applicationId: string;
}

export const AppStateContext = React.createContext<{
  validateSdkState: () => void;
  returnToAuth: () => void;
  isStreamConfig: boolean;
}>({
  validateSdkState: () => {},
  returnToAuth: () => {},
  isStreamConfig: false,
});

export default function App(): React.ReactElement {
  const [preloaded, setPreloaded] = useState(false);
  const [sdkConfigured, setSdkConfigured] = useState(false);
  const [isStreamConfig, setIsStreamConfig] = useState(false);

  const discoverySegmentationCallback = useRef(
    new SegmentationDataCallback('discovery', false, (data) => {
      console.log(
        `RN_Segments: New for category 'discovery' with IDs: ${JSON.stringify(
          data
        )}`
      );
    })
  );

  const contentSegmentationCallback = useRef(
    new SegmentationDataCallback('content', false, (data) => {
      console.log(
        `RN_Segments: New for category 'content' with IDs: ${JSON.stringify(
          data
        )}`
      );
    })
  );

  const merchandisingSegmentationCallback = useRef(
    new SegmentationDataCallback('merchandising', false, (data) => {
      console.log(
        `RN_Segments: New for category 'merchandising' with IDs: ${JSON.stringify(
          data
        )}`
      );
    })
  );

  const reloadSdkState = () => {
    (async () => {
      const configured = await isConfigured();
      setSdkConfigured(configured);
    })();
  };

  const returnToAuth = async () => {
    removeSdkAuthErrorCallback();
    setIsStreamConfig(false);
    SdkSetupState.reset();
    setSdkConfigured(await Exponea.isConfigured());
  };

  const messageIsForGdpr = (message: InAppMessage): boolean => {
    // apply your detection for GDPR related In-app
    // our example app is triggering GDPR In-app by custom event tracking so we used it for detection
    // you may implement detection against message title, ID, payload, etc.
    if (!message.trigger) return false;
    if ((message.trigger as any).event_type !== 'event_name') return false;
    const triggerFilter = (message.trigger as any).filter as any[];
    return triggerFilter?.[0]?.constraint?.operands?.[0]?.value === 'gdpr';
  };

  useEffect(() => {
    const deeplinkDeps = {
      stopIntegration,
      navigate: RootNavigation.navigate,
      returnToAuth,
    };

    const openLink = (url: string | null | undefined) => {
      if (url) {
        setTimeout(() => {
          console.log(`Link received: ${url}`);
          Alert.alert('Link received', `Url: ${url}`);
          const screenToOpen = resolveDeeplinkDestination(url);
          if (screenToOpen != null) {
            handleDeeplinkDestination(screenToOpen, deeplinkDeps);
          }
        }, 1000);
      }
    };

    const linkingSubscription = Linking.addEventListener('url', (e) =>
      openLink(e.url)
    );
    Linking.getInitialURL().then(openLink);

    setPushOpenedListener((pushOpened) => {
      // we'll wait for the app to fully resume before showing the alert
      setTimeout(() => {
        const data = JSON.stringify(pushOpened, null, 2);
        Alert.alert(
          'Push notification opened',
          `Action: ${pushOpened.action}\nURL: ${pushOpened.url}\nAdditional data: ${data}`
        );
      }, 1000);
    });

    setPushReceivedListener((data) => {
      if (data.status === 'ctrl_group') {
        // SDK already tracked delivery — nothing to show the user
        return;
      }
      // we'll wait for the app to fully resume before showing the alert
      setTimeout(() => {
        Alert.alert(
          'Push notification received',
          `Data: ${JSON.stringify(data, null, 2)}`
        );
      }, 1000);
    });

    setInAppMessageCallback({
      inAppMessageClickAction(
        message: InAppMessage,
        button: InAppMessageButton
      ): void {
        console.log(
          `InApp action ${button.url} received for message ${message.id}`
        );
        trackInAppMessageClick(message, button.text, button.url);
        if (messageIsForGdpr(message)) {
          switch (button.url) {
            case 'https://bloomreach.com/tracking/allow':
              trackEvent('gdpr', { status: 'allowed' });
              break;
            case 'https://bloomreach.com/tracking/deny':
              console.log(`Stopping SDK`);
              stopIntegration().catch((e) =>
                console.error(`Failed to stop SDK: ${e}`)
              );
              break;
          }
        } else if (button.url) {
          Linking.openURL(button.url);
        }
      },
      inAppMessageCloseAction(
        message: InAppMessage,
        button: InAppMessageButton | undefined,
        interaction: boolean
      ): void {
        console.log(
          `InApp message ${message.id} closed by ${button?.text} with interaction: ${interaction}`
        );
        trackInAppMessageClose(message, button?.text, interaction).then(
          () => {
            console.log('InApp message close track has been done successfully');
          },
          (rejectReason) => {
            console.error(
              `InApp message close track has been rejected with '${rejectReason}'`
            );
          }
        );
        if (messageIsForGdpr(message) && interaction) {
          console.log(`Stopping SDK`);
          stopIntegration().catch((e) =>
            console.error(`Failed to stop SDK: ${e}`)
          );
        }
      },
      inAppMessageError(
        message: InAppMessage | undefined,
        errorMessage: string
      ): void {
        console.log(
          `InApp error '${errorMessage}' occurred for message ${message?.id}`
        );
      },
      inAppMessageShown(message: InAppMessage): void {
        console.log(`InApp message ${message?.name} has been shown`);
        if (message.name.includes('StopSDK')) {
          console.log(`InApp message ${message?.name} will stop SDK`);
          setTimeout(() => {
            console.log(`Stopping SDK`);
            stopIntegration().catch((e) =>
              console.error(`Failed to stop SDK: ${e}`)
            );
          }, 4000);
        }
      },
      overrideDefaultBehavior: true,
      trackActions: false,
    });

    (async () => {
      const configured = await isConfigured();
      setSdkConfigured(configured);
    })();
    setPreloaded(true);

    const discoveryDataCallback = discoverySegmentationCallback.current;
    registerSegmentationDataCallback(discoveryDataCallback);
    const contentDataCallback1 = contentSegmentationCallback.current;
    registerSegmentationDataCallback(contentDataCallback1);
    const merchandisingDataCallback2 =
      merchandisingSegmentationCallback.current;
    registerSegmentationDataCallback(merchandisingDataCallback2);

    return () => {
      linkingSubscription.remove();
      unregisterSegmentationDataCallback(discoveryDataCallback);
      unregisterSegmentationDataCallback(contentDataCallback1);
      unregisterSegmentationDataCallback(merchandisingDataCallback2);
    };
  }, []);

  const onStart = async (
    params: ProjectConfigParams | StreamConfigParams
  ): Promise<void> => {
    await setLogLevel(LogLevel.DBG);

    let configuration: object;

    if (params.type === 'project') {
      NativeModules.CustomerTokenStorage.configure({
        host: params.baseUrl,
        projectToken: params.projectToken,
        publicKey: params.advancedAuthKey,
        ...(params.registeredId
          ? { customerIds: { registered: params.registeredId } }
          : {}),
      });
      configuration = {
        integrationConfig: {
          projectToken: params.projectToken,
          authorizationToken: params.authorizationToken,
          baseUrl: params.baseUrl,
        },
        allowDefaultCustomerProperties: false,
        advancedAuthEnabled: params.advancedAuthKey.trim().length !== 0,
        inAppContentBlockPlaceholdersAutoLoad: ['example_top'],
        ios: {
          appGroup: 'group.com.exponea.sdk.example',
        },
        android: {
          pushIconResourceName: 'push_icon',
          pushAccentColorRGBA: '161, 226, 200, 220',
        },
        manualSessionAutoClose: true,
        applicationId: params.applicationId,
      };
    } else {
      if (params.jwtKeyId && params.jwtSecret) {
        LocalJwtTokenGenerator.configure(params.jwtSecret, params.jwtKeyId);
      }
      configuration = {
        integrationConfig: {
          streamId: params.streamId,
          baseUrl: params.baseUrl,
        },
        allowDefaultCustomerProperties: false,
        inAppContentBlockPlaceholdersAutoLoad: ['example_top'],
        ios: {
          appGroup: 'group.com.exponea.sdk.example',
        },
        android: {
          pushIconResourceName: 'push_icon',
          pushAccentColorRGBA: '161, 226, 200, 220',
        },
        manualSessionAutoClose: true,
        applicationId: params.applicationId,
      };
    }
    if (params.registeredId) {
      SdkSetupState.setCustomerIds({ registered: params.registeredId });
    }
    const customerIdentity: CustomerIdentity | undefined = params.registeredId
      ? {
          customerIds: { registered: params.registeredId },
          sdkAuthToken:
            params.type === 'stream' && LocalJwtTokenGenerator.isConfigured()
              ? (LocalJwtTokenGenerator.generateToken({
                  registered: params.registeredId,
                }) ?? undefined)
              : undefined,
        }
      : undefined;
    console.log(
      `Configuring Exponea SDK with ${JSON.stringify(configuration)}`
    );
    try {
      await configure(configuration as any, customerIdentity);

      if (params.type === 'stream') {
        setIsStreamConfig(true);
      }
      if (params.type === 'stream' && LocalJwtTokenGenerator.isConfigured()) {
        setSdkAuthErrorCallback((error) => {
          console.log(`Auth error received: ${JSON.stringify(error)}`);
          if (Object.keys(SdkSetupState.customerIds).length === 0) {
            console.log(
              'Customer is not identified, skipping JWT token generation'
            );
            return;
          }
          const newToken = LocalJwtTokenGenerator.generateToken(
            SdkSetupState.customerIds
          );
          if (newToken) {
            setSdkAuthToken(newToken).catch((e) =>
              console.error(`Failed to refresh auth token: ${e}`)
            );
          }
        });
      }

      setSdkConfigured(true);
      await checkPushSetup();
      await setAppInboxProvider({
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
    } catch (error) {
      console.error('Configuration error:', error);
      // SDK might already be configured from a previous session
      if (await isConfigured()) {
        console.log('SDK was already configured, proceeding');
        setSdkConfigured(true);
      } else {
        Alert.alert('Configuration Error', String(error));
      }
    }
  };

  if (!preloaded) {
    return <PreloadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AppStateContext.Provider
        value={{
          validateSdkState: reloadSdkState,
          returnToAuth,
          isStreamConfig,
        }}
      >
        <NavigationContainer ref={RootNavigation.navigationRef}>
          {sdkConfigured ? <TabNavigation /> : <AuthScreen onStart={onStart} />}
        </NavigationContainer>
      </AppStateContext.Provider>
    </SafeAreaProvider>
  );
}
