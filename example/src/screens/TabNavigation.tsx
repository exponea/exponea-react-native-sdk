import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {StyleSheet, Image, Platform} from 'react-native';
import TrackingScreen from './TrackingScreen';
import FetchingScreen from './FetchingScreen';
import FlushingScreen from './FlushingScreen';
import LoggingScreen from './LoggingScreen';
import trackIcon from '../img/track.png';
import fetchIcon from '../img/fetch.png';
import flushIcon from '../img/flush.png';
import logIcon from '../img/log.png';
import CallbackScreen from './CallbackScreen';

enum Screen {
  Tracking = 'Tracking',
  Fetching = 'Fetching',
  Flushing = 'Flushing',
  Logging = 'Logging',
}

const Tab = createBottomTabNavigator();

export default function TabNavigation(): React.ReactElement {
  return (
    <Tab.Navigator tabBarOptions={{activeTintColor: 'black'}}>
      <Tab.Screen
        options={getTabBarOptions(Screen.Tracking)}
        name={Screen.Tracking}
        // The iOS native SDK is not yet implemented, for now we'll just call sample method to make sure the bridge is working
        component={Platform.OS === 'ios' ? CallbackScreen : TrackingScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.Fetching)}
        name={Screen.Fetching}
        component={FetchingScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.Flushing)}
        name={Screen.Flushing}
        component={FlushingScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.Logging)}
        name={Screen.Logging}
        component={LoggingScreen}
      />
    </Tab.Navigator>
  );
}

function getIcon(name: Screen) {
  switch (name) {
    case Screen.Tracking:
      return trackIcon;
    case Screen.Fetching:
      return fetchIcon;
    case Screen.Flushing:
      return flushIcon;
    case Screen.Logging:
      return logIcon;
  }
}

function getTabBarOptions(screen: Screen): BottomTabNavigationOptions {
  return {
    tabBarIcon: (props: {focused: boolean; color: string; size: number}) => (
      <Image
        style={[styles.tabIcon, {tintColor: props.color}]}
        source={getIcon(screen)}
      />
    ),
  };
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 22,
    height: 22,
  },
});
