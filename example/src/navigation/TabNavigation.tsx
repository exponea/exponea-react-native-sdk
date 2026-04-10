import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StyleSheet, Image } from 'react-native';
import TrackingScreen from '../screens/TrackingScreen';
import FetchingScreen from '../screens/FetchingScreen';
import FlushingScreen from '../screens/FlushingScreen';
import AnonymizeScreen from '../screens/AnonymizeScreen';
import InAppCbScreen from '../screens/InAppCbScreen';
import { Screen } from '../screens/Screens';
import trackIcon from '../img/track.png';
import fetchIcon from '../img/fetch.png';
import flushIcon from '../img/flush.png';
import anonymizeIcon from '../img/anonymize.png';
import inAppCbIcon from '../img/content_blocks.png';

const Tab = createBottomTabNavigator();

export default function TabNavigation(): React.ReactElement {
  return (
    <Tab.Navigator
      screenOptions={{ tabBarActiveTintColor: 'black' }}
      detachInactiveScreens={false}
    >
      <Tab.Screen
        options={getTabBarOptions(Screen.Tracking)}
        name={Screen.Tracking}
        component={TrackingScreen}
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
        options={getTabBarOptions(Screen.Anonymize)}
        name={Screen.Anonymize}
        component={AnonymizeScreen}
      />
      <Tab.Screen
        options={getTabBarOptions(Screen.InAppCB)}
        name={Screen.InAppCB}
        component={InAppCbScreen}
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
    case Screen.Anonymize:
      return anonymizeIcon;
    case Screen.InAppCB:
      return inAppCbIcon;
  }
}

function getTabBarOptions(screen: Screen): BottomTabNavigationOptions {
  return {
    tabBarIcon: (props: { focused: boolean; color: string; size: number }) => (
      <Image
        style={[styles.tabIcon, { tintColor: props.color }]}
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
