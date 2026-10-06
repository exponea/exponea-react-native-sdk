import 'react-native-gesture-handler'; // This needs to be first import according to docs

import { NavigationContainer } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Linking, NativeModules } from 'react-native';
import type {
  CustomerIdentity,
  InAppMessage,
  InAppMessageButton,
} from 'react-native-exponea-sdk';
import Exponea, {
  checkPushSetup,
  configure,
  isConfigured,
  LogLevel,
  PushTokenTrackingFrequency,
  registerLoggerCallback,
  registerSegmentationDataCallback,
  removeInAppMessageCallback,
  removeSdkAuthErrorCallback,
  SegmentationDataCallback,
  setAppInboxProvider,
  setInAppMessageCallback,
  setLogLevel,
  setPushOpenedListener,
  setPushReceivedListener,
  setSdkAuthErrorCallback,
  setSdkAuthToken,
  stopIntegration,
  trackEvent,
  trackInAppMessageClick,
  trackInAppMessageClose,
  unregisterLoggerCallback,
  unregisterSegmentationDataCallback,
} from 'react-native-exponea-sdk';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appendNativeSdkLog } from '@/logging/NativeSdkLogger';
import TabNavigation from '@/navigation/TabNavigation';
import AuthScreen from '@/screens/AuthScreen';
import PreloadingScreen from '@/screens/PreloadingScreen';
import { Screen } from '@/screens/Screens';
import {
  handleDeeplinkDestination,
  resolveDeeplinkDestination,
} from '@/util/deeplink';
import LocalJwtTokenGenerator from '@/util/LocalJwtTokenGenerator';
import * as RootNavigation from '@/util/RootNavigation';
import SdkSetupState from '@/util/SdkSetupState';

import Configuration from '../../src/Configuration';

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

export interface SubConfig {
  pushTokenTrackingFrequency?: PushTokenTrackingFrequency;
  applicationId?: string;
  regenerateDeviceIdOnAnonymize?: boolean;
}

export const AppStateContext = React.createContext<{
  validateSdkState: () => Promise<void>;
  returnToAuth: () => void;
  sdkConfigured: boolean;
  isStreamConfig: boolean;
  customerCookie: string;
  refreshCustomerCookie: () => Promise<void>;
  subConfig: SubConfig;
}>({
  validateSdkState: async () => {},
  returnToAuth: () => {},
  sdkConfigured: false,
  isStreamConfig: false,
  customerCookie: '?',
  refreshCustomerCookie: async () => {},
  subConfig: {},
});

export default function App(): React.ReactElement {
  const [preloaded, setPreloaded] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);
  const [sdkConfigured, setSdkConfigured] = useState(false);
  const [isStreamConfig, setIsStreamConfig] = useState(false);
  const [customerCookie, setCustomerCookie] = useState('?');
  const [subConfig, setSubConfig] = useState<SubConfig>({});
  const stopPromiseRef = useRef<Promise<void> | undefined>(undefined);

  const discoverySegmentationCallback = useRef(
    new SegmentationDataCallback('discovery', false, (data: any) => {
      console.log(
        `RN_Segments: New for category 'discovery' with IDs: ${JSON.stringify(
          data
        )}`
      );
    })
  );

  const contentSegmentationCallback = useRef(
    new SegmentationDataCallback('content', false, (data: any) => {
      console.log(
        `RN_Segments: New for category 'content' with IDs: ${JSON.stringify(
          data
        )}`
      );
    })
  );

  const merchandisingSegmentationCallback = useRef(
    new SegmentationDataCallback('merchandising', false, (data: any) => {
      console.log(
        `RN_Segments: New for category 'merchandising' with IDs: ${JSON.stringify(
          data
        )}`
      );
    })
  );

  const refreshCustomerCookie = useCallback(async () => {
    try {
      const cookie = await Exponea.getCustomerCookie();
      setCustomerCookie(cookie);
    } catch (error) {
      setCustomerCookie(`Error: ${error}`);
    }
  }, []);

  const reloadSdkState = useCallback(async () => {
    const configured = await isConfigured();
    setSdkConfigured(configured);
    if (configured) {
      setAppLoaded(true);
      await refreshCustomerCookie();
    } else {
      setCustomerCookie('?');
    }
  }, [refreshCustomerCookie]);

  const returnToAuth = useCallback(async () => {
    removeSdkAuthErrorCallback();
    setIsStreamConfig(false);
    setCustomerCookie('?');
    SdkSetupState.reset();
    setAppLoaded(false);
    setSdkConfigured(await Exponea.isConfigured());
  }, []);

  const markSdkStopped = useCallback(() => {
    setAppLoaded(true);
    setSdkConfigured(false);
    setCustomerCookie('?');
  }, []);

  useEffect(() => {
    registerLoggerCallback(appendNativeSdkLog);
    return () => {
      unregisterLoggerCallback(appendNativeSdkLog);
    };
  }, []);

  const messageIsForGdpr = useCallback((message: InAppMessage): boolean => {
    // apply your detection for GDPR related In-app
    // our example app is triggering GDPR In-app by custom event tracking so we used it for detection
    // you may implement detection against message title, ID, payload, etc.
    if (!message.trigger) return false;
    if ((message.trigger as any).event_type !== 'event_name') return false;
    const triggerFilter = (message.trigger as any).filter as any[];
    return triggerFilter?.[0]?.constraint?.operands?.[0]?.value === 'gdpr';
  }, []);

  useEffect(() => {
    const pendingStopTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const cancelStopTimer = (messageId: string) => {
      const timer = pendingStopTimers.get(messageId);
      if (timer) {
        clearTimeout(timer);
        pendingStopTimers.delete(messageId);
      }
    };
    const stopSdk = (): Promise<void> => {
      if (!stopPromiseRef.current) {
        stopPromiseRef.current = stopIntegration().catch((error) => {
          stopPromiseRef.current = undefined;
          throw error;
        });
      }
      return stopPromiseRef.current;
    };
    const deeplinkDeps = {
      stopIntegration: stopSdk,
      navigate: RootNavigation.navigate,
      returnToAuth,
      markSdkStopped,
    };

    const openLink = (url: string | null | undefined) => {
      if (url) {
        setTimeout(() => {
          console.log(`Link received: ${url}`);
          Alert.alert('Link received', `Url: ${url}`);
          const screenToOpen = resolveDeeplinkDestination(url);
          if (screenToOpen != null) {
            if (
              screenToOpen === Screen.StopAndContinue ||
              screenToOpen === Screen.StopAndRestart
            ) {
              pendingStopTimers.forEach((_, messageId) =>
                cancelStopTimer(messageId)
              );
            }
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
        const trackClick = () =>
          trackInAppMessageClick(message, button.text, button.url).catch(
            (rejectReason) => {
              console.error(
                `InApp message click track has been rejected with '${rejectReason}'`
              );
            }
          );
        if (messageIsForGdpr(message)) {
          trackClick();
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
          const screenToOpen = resolveDeeplinkDestination(button.url);
          if (screenToOpen != null) {
            if (
              screenToOpen === Screen.StopAndContinue ||
              screenToOpen === Screen.StopAndRestart
            ) {
              cancelStopTimer(message.id);
            }
            trackClick().then(() => {
              handleDeeplinkDestination(screenToOpen, deeplinkDeps);
            });
          } else {
            trackClick();
            Linking.openURL(button.url);
          }
        } else {
          trackClick();
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
          cancelStopTimer(message.id);
          pendingStopTimers.set(
            message.id,
            setTimeout(() => {
              pendingStopTimers.delete(message.id);
              console.log('Stopping SDK');
              stopSdk()
                .then(() => {
                  SdkSetupState.reset();
                  markSdkStopped();
                })
                .catch((error) =>
                  console.error(`Failed to stop SDK: ${error}`)
                );
            }, 4000)
          );
        }
      },
      overrideDefaultBehavior: true,
      trackActions: false,
    });

    (async () => {
      const configured = await isConfigured();
      setSdkConfigured(configured);
      if (configured) {
        setAppLoaded(true);
        await refreshCustomerCookie();
      }
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
      pendingStopTimers.forEach((timer) => clearTimeout(timer));
      pendingStopTimers.clear();
      removeInAppMessageCallback();
      linkingSubscription.remove();
      unregisterSegmentationDataCallback(discoveryDataCallback);
      unregisterSegmentationDataCallback(contentDataCallback1);
      unregisterSegmentationDataCallback(merchandisingDataCallback2);
    };
  }, [markSdkStopped, messageIsForGdpr, refreshCustomerCookie, returnToAuth]);

  const onStart = async (
    params: ProjectConfigParams | StreamConfigParams
  ): Promise<void> => {
    await setLogLevel(LogLevel.DBG);

    let configuration: Configuration;

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

    setSubConfig({
      regenerateDeviceIdOnAnonymize:
        configuration.regenerateDeviceIdOnAnonymize,
      applicationId: configuration.applicationId,
      pushTokenTrackingFrequency: configuration.pushTokenTrackingFrequency,
    });

    try {
      await checkPushSetup();
      await configure(configuration, customerIdentity);
      stopPromiseRef.current = undefined;

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

      // Register the style before any AppInboxButton renders
      await setAppInboxProvider({
        appInboxButton: {
          textColor: '#262626',
          backgroundColor: '#ffd500',
          showIcon: false,
          textSize: '16sp',
          textWeight: 'bold',
          borderRadius: '5dp',
        },
        detailView: {
          title: {
            textSize: '20sp',
          },
          content: {
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
            item: {
              content: {
                textSize: '16sp',
              },
            },
          },
        },
      });

      setSdkConfigured(true);
      setAppLoaded(true);
      await refreshCustomerCookie();
    } catch (error) {
      console.error('Configuration error:', error);
      // SDK might already be configured from a previous session
      if (await isConfigured()) {
        console.log('SDK was already configured, proceeding');
        setSdkConfigured(true);
        await refreshCustomerCookie();
      } else {
        Alert.alert('Configuration Error', String(error));
      }
    }
  };

  const appStateContextValue = useMemo(
    () => ({
      validateSdkState: reloadSdkState,
      returnToAuth,
      sdkConfigured,
      isStreamConfig,
      customerCookie,
      refreshCustomerCookie,
      subConfig,
    }),
    [
      customerCookie,
      isStreamConfig,
      refreshCustomerCookie,
      reloadSdkState,
      returnToAuth,
      sdkConfigured,
      subConfig,
    ]
  );

  if (!preloaded) {
    return <PreloadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AppStateContext.Provider value={appStateContextValue}>
        <NavigationContainer ref={RootNavigation.navigationRef}>
          {sdkConfigured || appLoaded ? (
            <TabNavigation />
          ) : (
            <AuthScreen onStart={onStart} />
          )}
        </NavigationContainer>
      </AppStateContext.Provider>
    </SafeAreaProvider>
  );
}
