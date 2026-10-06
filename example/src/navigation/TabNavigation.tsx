import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStateContext } from '@/App';
import { AutomationIds } from '@/automation/AutomationIds';
import anonymizeIcon from '@/img/anonymize.png';
import inAppCbIcon from '@/img/content_blocks.png';
import fetchIcon from '@/img/fetch.png';
import flushIcon from '@/img/flush.png';
import brMiniIcon from '@/img/ic_br_mini.png';
import logsIcon from '@/img/ic_logs.png';
import trackIcon from '@/img/track.png';
import AnonymizeScreen from '@/screens/AnonymizeScreen';
import FetchingScreen from '@/screens/FetchingScreen';
import FlushingScreen from '@/screens/FlushingScreen';
import InAppCbScreen from '@/screens/InAppCbScreen';
import LogViewScreen from '@/screens/LogViewScreen';
import { Screen } from '@/screens/Screens';
import StatusViewScreen from '@/screens/StatusViewScreen';
import TrackingScreen from '@/screens/TrackingScreen';

const Tab = createBottomTabNavigator();
type TabScreen = Exclude<
  Screen,
  Screen.StopAndContinue | Screen.StopAndRestart
>;

export default function TabNavigation(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { sdkConfigured } = useContext(AppStateContext);

  const [showLogsOverlay, setShowLogsOverlay] = React.useState(false);
  const [showStatusOverlay, setShowStatusOverlay] = React.useState(false);

  const headerContentHeight = Platform.OS === 'ios' ? 44 : 56;
  const headerHeight = insets.top + headerContentHeight;

  const openLogsOverlay = React.useCallback(() => {
    setShowLogsOverlay(true);
  }, []);
  const closeLogsOverlay = React.useCallback(() => {
    setShowLogsOverlay(false);
  }, []);
  const openStatusOverlay = React.useCallback(() => {
    setShowStatusOverlay(true);
  }, []);
  const closeStatusOverlay = React.useCallback(() => {
    setShowStatusOverlay(false);
  }, []);

  const navigatorScreenOptions = React.useMemo(
    () => ({ tabBarActiveTintColor: 'black' }),
    []
  );

  const fetchingTabOptions = React.useMemo(
    () =>
      getTabBarOptions(
        Screen.Fetching,
        headerHeight,
        insets.top,
        openLogsOverlay,
        openStatusOverlay,
        sdkConfigured
      ),
    [
      headerHeight,
      insets.top,
      openLogsOverlay,
      openStatusOverlay,
      sdkConfigured,
    ]
  );
  const trackingTabOptions = React.useMemo(
    () =>
      getTabBarOptions(
        Screen.Tracking,
        headerHeight,
        insets.top,
        openLogsOverlay,
        openStatusOverlay,
        sdkConfigured
      ),
    [
      headerHeight,
      insets.top,
      openLogsOverlay,
      openStatusOverlay,
      sdkConfigured,
    ]
  );
  const flushingTabOptions = React.useMemo(
    () =>
      getTabBarOptions(
        Screen.Flushing,
        headerHeight,
        insets.top,
        openLogsOverlay,
        openStatusOverlay,
        sdkConfigured
      ),
    [
      headerHeight,
      insets.top,
      openLogsOverlay,
      openStatusOverlay,
      sdkConfigured,
    ]
  );
  const anonymizeTabOptions = React.useMemo(
    () =>
      getTabBarOptions(
        Screen.Anonymize,
        headerHeight,
        insets.top,
        openLogsOverlay,
        openStatusOverlay,
        sdkConfigured
      ),
    [
      headerHeight,
      insets.top,
      openLogsOverlay,
      openStatusOverlay,
      sdkConfigured,
    ]
  );
  const inAppCbTabOptions = React.useMemo(
    () =>
      getTabBarOptions(
        Screen.InAppCB,
        headerHeight,
        insets.top,
        openLogsOverlay,
        openStatusOverlay,
        sdkConfigured
      ),
    [
      headerHeight,
      insets.top,
      openLogsOverlay,
      openStatusOverlay,
      sdkConfigured,
    ]
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={navigatorScreenOptions}
        detachInactiveScreens={false}
      >
        <Tab.Screen
          options={fetchingTabOptions}
          name={Screen.Fetching}
          component={FetchingScreen}
        />
        <Tab.Screen
          options={trackingTabOptions}
          name={Screen.Tracking}
          component={TrackingScreen}
        />
        <Tab.Screen
          options={flushingTabOptions}
          name={Screen.Flushing}
          component={FlushingScreen}
        />
        <Tab.Screen
          options={anonymizeTabOptions}
          name={Screen.Anonymize}
          component={AnonymizeScreen}
        />
        <Tab.Screen
          options={inAppCbTabOptions}
          name={Screen.InAppCB}
          component={InAppCbScreen}
        />
      </Tab.Navigator>
      <LogViewScreen
        visible={showLogsOverlay}
        topInset={insets.top}
        onClose={closeLogsOverlay}
      />
      <StatusViewScreen
        visible={showStatusOverlay}
        topInset={insets.top}
        onClose={closeStatusOverlay}
      />
    </>
  );
}

function getIcon(name: TabScreen) {
  switch (name) {
    case Screen.Tracking:
      return trackIcon;
    case Screen.Fetching:
      return fetchIcon;
    case Screen.Flushing:
      return flushIcon;
    case Screen.Anonymize:
      return anonymizeIcon;
    case Screen.InAppCB:
      return inAppCbIcon;
  }
}

function getNavAutomationId(name: TabScreen): string {
  switch (name) {
    case Screen.Tracking:
      return AutomationIds.NAV_TRACKING;
    case Screen.Fetching:
      return AutomationIds.NAV_FETCHING;
    case Screen.Flushing:
      return AutomationIds.NAV_FLUSHING;
    case Screen.Anonymize:
      return AutomationIds.NAV_ANONYMIZE;
    case Screen.InAppCB:
      return AutomationIds.NAV_CONTENT_BLOCKS;
  }
}

function getTabBarOptions(
  screen: TabScreen,
  headerHeight: number,
  topInset: number,
  onLogsPress: () => void,
  onStatusPress: () => void,
  sdkConfigured: boolean
): BottomTabNavigationOptions {
  return {
    tabBarButtonTestID: getNavAutomationId(screen),
    tabBarIcon: (props: { focused: boolean; color: string; size: number }) => (
      <Image
        style={[styles.tabIcon, { tintColor: props.color }]}
        source={getIcon(screen)}
      />
    ),
    header: () => (
      <View
        style={[styles.header, { height: headerHeight, paddingTop: topInset }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity testID={'xxx'} onPress={onStatusPress}>
            <Image source={brMiniIcon} style={styles.icon} />
          </TouchableOpacity>
          <View style={styles.left}>
            <View
              testID={AutomationIds.STATUS_SDK_INDICATOR}
              style={[sdkConfigured ? styles.ready : styles.off, styles.status]}
            />
            <TouchableOpacity
              testID={AutomationIds.OPEN_LOGS}
              onPress={onLogsPress}
            >
              <Image source={logsIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
  };
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 22,
    height: 22,
  },
  header: {
    marginTop: 0,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginRight: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  status: {
    width: 18,
    height: 18,
    borderStyle: 'solid',
    borderRadius: 18,
    marginRight: 18,
    borderColor: '#ffffff',
    borderWidth: 1,
  },
  ready: {
    backgroundColor: 'rgba(0,255,42,0.49)',
  },
  off: {
    backgroundColor: 'red',
  },
});
