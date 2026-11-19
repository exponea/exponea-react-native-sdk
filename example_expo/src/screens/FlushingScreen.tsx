import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  flushData,
  FlushMode,
  getFlushMode,
  getFlushPeriod,
  getLogLevel,
  LogLevel,
  setFlushMode,
  setFlushPeriod,
  setLogLevel,
} from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';
import Snackbar from '@/components/Snackbar';

type FlushingTab = 'mode' | 'period' | 'logLevel';

const FLUSHING_TABS: { testID: string; title: string; value: FlushingTab }[] = [
  {
    testID: AutomationIds.TAB_FLUSH_MODE,
    title: 'Flush Mode',
    value: 'mode',
  },
  {
    testID: AutomationIds.TAB_FLUSH_PERIOD,
    title: 'Flush Period',
    value: 'period',
  },
  {
    testID: AutomationIds.TAB_LOG_LEVEL,
    title: 'Log Level',
    value: 'logLevel',
  },
];

function logLevelDisplayName(level: LogLevel | ''): string {
  if (!level) return '';
  if (level === LogLevel.DBG) return 'DEBUG';
  const key = (Object.keys(LogLevel) as Array<keyof typeof LogLevel>).find(
    (k) => LogLevel[k] === level
  );
  return key ?? level;
}

export default function FlushingScreen(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<FlushingTab>('mode');
  const [currentFlushMode, setCurrentFlushMode] = useState<FlushMode | ''>('');
  const [currentFlushPeriod, setCurrentFlushPeriod] = useState<number>(0);
  const [currentLogLevel, setCurrentLogLevel] = useState<LogLevel | ''>('');

  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null
  );

  const handleGetFlushMode = useCallback(async () => {
    try {
      const mode = await getFlushMode();
      setCurrentFlushMode(mode);
    } catch (error) {
      Alert.alert('Error', `Failed to get flush mode: ${error}`);
    }
  }, []);

  const handleSetFlushMode = useCallback(async (mode: FlushMode) => {
    try {
      await setFlushMode(mode);
      setCurrentFlushMode(mode);
      setSnackbarMessage(`Flush Mode -> ${mode}`);
    } catch (error) {
      Alert.alert('Error', `Failed to set flush mode: ${error}`);
    }
  }, []);

  const handleGetFlushPeriod = useCallback(async () => {
    try {
      const period = await getFlushPeriod();
      setCurrentFlushPeriod(period);
    } catch (error) {
      Alert.alert('Error', `Failed to get flush period: ${error}`);
    }
  }, []);

  const handleSetFlushPeriod = useCallback(async (period: number) => {
    try {
      await setFlushPeriod(period);
      setCurrentFlushPeriod(period);
      setSnackbarMessage(`Flush period -> ${period} second`);
    } catch (error) {
      Alert.alert('Error', `Failed to set flush period: ${error}`);
    }
  }, []);

  const handleFlushData = useCallback(async () => {
    try {
      await flushData();
      setSnackbarMessage(`Data flushed successfully`);
    } catch (error) {
      Alert.alert('Error', `Failed to flush data: ${error}`);
    }
  }, []);

  const handleGetLogLevel = useCallback(async () => {
    try {
      const level = await getLogLevel();
      setCurrentLogLevel(level);
    } catch (error) {
      Alert.alert('Error', `Failed to get log level: ${error}`);
    }
  }, []);

  const handleSetLogLevel = useCallback(async (level: LogLevel) => {
    try {
      await setLogLevel(level);
      setCurrentLogLevel(level);
      setSnackbarMessage(`Log level -> ${logLevelDisplayName(level)}`);
    } catch (error) {
      Alert.alert('Error', `Failed to set log level: ${error}`);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await handleGetFlushMode();
      await handleGetFlushPeriod();
      await handleGetLogLevel();
    })();
  }, [handleGetFlushMode, handleGetFlushPeriod, handleGetLogLevel]);

  const renderTabContent = () => {
    const currentFlushPeriodLabel =
      currentFlushPeriod > 0 ? `${currentFlushPeriod} seconds` : 'Manual';

    switch (activeTab) {
      case 'period':
        return (
          <ExponeaContainer title={'Flush Period'}>
            <ExponeaButton
              secondary
              compact
              title="Get Flush Period"
              onPress={handleGetFlushPeriod}
              testID={AutomationIds.GET_FLUSH_PERIOD}
            />
            <View style={styles.status}>
              <Text
                style={styles.statusText}
                testID={AutomationIds.CURRENT_FLUSH_PERIOD}
              >
                Current period: {currentFlushPeriodLabel}
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <ExponeaButton
                compact
                title="30 seconds"
                style={styles.buttons}
                onPress={() => handleSetFlushPeriod(30)}
                testID={AutomationIds.FLUSH_PERIOD_30}
              />
              <ExponeaButton
                compact
                title="60 seconds"
                style={styles.buttons}
                onPress={() => handleSetFlushPeriod(60)}
                testID={AutomationIds.FLUSH_PERIOD_60}
              />
            </View>

            <ExponeaButton
              compact
              title="Flush Data"
              onPress={handleFlushData}
              testID={AutomationIds.FLUSH_DATA}
            />
          </ExponeaContainer>
        );
      case 'logLevel':
        return (
          <ExponeaContainer title={'Log Level'}>
            <ExponeaButton
              secondary
              compact
              title="Get Log Level"
              onPress={handleGetLogLevel}
              testID={AutomationIds.GET_LOG_LEVEL}
            />
            <View style={styles.status}>
              <Text
                style={styles.statusText}
                testID={AutomationIds.CURRENT_LOG_LEVEL}
              >
                Current log level: {logLevelDisplayName(currentLogLevel)}
              </Text>
            </View>

            <ExponeaButton
              compact
              title="OFF"
              onPress={() => handleSetLogLevel(LogLevel.OFF)}
              testID={AutomationIds.LOG_OFF}
            />
            <ExponeaButton
              compact
              title="ERROR"
              onPress={() => handleSetLogLevel(LogLevel.ERROR)}
              testID={AutomationIds.LOG_ERROR}
            />
            <ExponeaButton
              compact
              title="WARN"
              onPress={() => handleSetLogLevel(LogLevel.WARN)}
              testID={AutomationIds.LOG_WARN}
            />
            <ExponeaButton
              compact
              title="INFO"
              onPress={() => handleSetLogLevel(LogLevel.INFO)}
              testID={AutomationIds.LOG_INFO}
            />
            <ExponeaButton
              compact
              title="DEBUG"
              onPress={() => handleSetLogLevel(LogLevel.DBG)}
              testID={AutomationIds.LOG_DEBUG}
            />
            <ExponeaButton
              compact
              title="VERBOSE"
              onPress={() => handleSetLogLevel(LogLevel.VERBOSE)}
              testID={AutomationIds.LOG_VERBOSE}
            />
          </ExponeaContainer>
        );
      case 'mode':
      default:
        return (
          <ExponeaContainer title={'Flush Mode'}>
            <ExponeaButton
              secondary
              compact
              title="Get Flush Mode"
              onPress={handleGetFlushMode}
              testID={AutomationIds.GET_FLUSH_MODE}
            />
            <View style={styles.status}>
              <Text
                style={styles.statusText}
                testID={AutomationIds.CURRENT_FLUSH_MODE}
              >
                Current mode: {currentFlushMode}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <ExponeaButton
                compact
                title="IMMEDIATE"
                style={styles.buttons}
                onPress={() => handleSetFlushMode(FlushMode.IMMEDIATE)}
                testID={AutomationIds.FLUSH_MODE_IMMEDIATE}
              />
              <ExponeaButton
                compact
                title="PERIOD"
                style={styles.buttons}
                onPress={() => handleSetFlushMode(FlushMode.PERIOD)}
                testID={AutomationIds.FLUSH_MODE_PERIOD}
              />
            </View>
            <View style={styles.buttonRow}>
              <ExponeaButton
                compact
                title="APP_CLOSE"
                style={styles.buttons}
                onPress={() => handleSetFlushMode(FlushMode.APP_CLOSE)}
                testID={AutomationIds.FLUSH_MODE_APP_CLOSE}
              />
              <ExponeaButton
                compact
                title="MANUAL"
                style={styles.buttons}
                onPress={() => handleSetFlushMode(FlushMode.MANUAL)}
                testID={AutomationIds.FLUSH_MODE_MANUAL}
              />
            </View>
          </ExponeaContainer>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tabRow}>
          {FLUSHING_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <Pressable
                key={tab.value}
                testID={tab.testID}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.value)}
              >
                <Text style={styles.tabText}>{tab.title}</Text>
              </Pressable>
            );
          })}
        </View>
        {renderTabContent()}
      </ScrollView>
      <Snackbar
        message={snackbarMessage}
        onDismiss={() => {
          setSnackbarMessage(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 40,
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    marginHorizontal: 5,
    backgroundColor: '#ffffff',
    borderColor: '#999999',
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  activeTab: {
    backgroundColor: '#ffd500',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  buttons: {
    flex: 1,
  },
  status: {
    borderColor: '#d8d8d8',
    borderWidth: 1,
    padding: 5,
    marginHorizontal: 5,
    marginVertical: 10,
  },
  statusText: {
    fontSize: 14,
  },
  hint: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 5,
    marginBottom: 10,
  },
});
