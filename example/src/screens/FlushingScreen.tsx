import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getFlushMode,
  setFlushMode,
  getFlushPeriod,
  setFlushPeriod,
  flushData,
  getLogLevel,
  setLogLevel,
  FlushMode,
  LogLevel,
} from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';

function logLevelDisplayName(level: LogLevel | ''): string {
  if (!level) return '';
  const key = (Object.keys(LogLevel) as Array<keyof typeof LogLevel>).find(
    (k) => LogLevel[k] === level
  );
  return key ?? level;
}

export default function FlushingScreen(): React.ReactElement {
  const [currentFlushMode, setCurrentFlushMode] = useState<FlushMode | ''>('');
  const [currentFlushPeriod, setCurrentFlushPeriod] = useState<number>(0);
  const [currentLogLevel, setCurrentLogLevel] = useState<LogLevel | ''>('');

  const handleGetFlushMode = async () => {
    try {
      const mode = await getFlushMode();
      setCurrentFlushMode(mode);
      Alert.alert('Flush Mode', `Current mode: ${mode}`);
    } catch (error) {
      Alert.alert('Error', `Failed to get flush mode: ${error}`);
    }
  };

  const handleSetFlushMode = async (mode: FlushMode) => {
    try {
      await setFlushMode(mode);
      setCurrentFlushMode(mode);
      Alert.alert('Success', `Flush mode set to ${mode}`);
    } catch (error) {
      Alert.alert('Error', `Failed to set flush mode: ${error}`);
    }
  };

  const handleGetFlushPeriod = async () => {
    try {
      const period = await getFlushPeriod();
      setCurrentFlushPeriod(period);
      Alert.alert('Flush Period', `Current period: ${period} seconds`);
    } catch (error) {
      Alert.alert('Error', `Failed to get flush period: ${error}`);
    }
  };

  const handleSetFlushPeriod = async (period: number) => {
    try {
      await setFlushPeriod(period);
      setCurrentFlushPeriod(period);
      Alert.alert('Success', `Flush period set to ${period} seconds`);
    } catch (error) {
      Alert.alert('Error', `Failed to set flush period: ${error}`);
    }
  };

  const handleFlushData = async () => {
    try {
      await flushData();
      Alert.alert('Success', 'Data flushed successfully');
    } catch (error) {
      Alert.alert('Error', `Failed to flush data: ${error}`);
    }
  };

  const handleGetLogLevel = async () => {
    try {
      const level = await getLogLevel();
      setCurrentLogLevel(level);
      Alert.alert('Log Level', `Current level: ${logLevelDisplayName(level)}`);
    } catch (error) {
      Alert.alert('Error', `Failed to get log level: ${error}`);
    }
  };

  const handleSetLogLevel = async (level: LogLevel) => {
    try {
      await setLogLevel(level);
      setCurrentLogLevel(level);
      Alert.alert('Success', `Log level set to ${logLevelDisplayName(level)}`);
    } catch (error) {
      Alert.alert('Error', `Failed to set log level: ${error}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Flush Mode Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flush Mode</Text>

        <ExponeaButton title="Get Flush Mode" onPress={handleGetFlushMode} />

        {currentFlushMode !== '' && (
          <View style={styles.card}>
            <Text style={styles.label}>Current mode:</Text>
            <Text style={styles.value}>{currentFlushMode}</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <ExponeaButton
              title="IMMEDIATE"
              onPress={() => handleSetFlushMode(FlushMode.IMMEDIATE)}
            />
          </View>
          <View style={styles.buttonHalf}>
            <ExponeaButton
              title="PERIOD"
              onPress={() => handleSetFlushMode(FlushMode.PERIOD)}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <ExponeaButton
              title="APP_CLOSE"
              onPress={() => handleSetFlushMode(FlushMode.APP_CLOSE)}
            />
          </View>
          <View style={styles.buttonHalf}>
            <ExponeaButton
              title="MANUAL"
              onPress={() => handleSetFlushMode(FlushMode.MANUAL)}
            />
          </View>
        </View>
      </View>

      {/* Flush Period Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flush Period</Text>

        <ExponeaButton
          title="Get Flush Period"
          onPress={handleGetFlushPeriod}
        />

        {currentFlushPeriod > 0 && (
          <View style={styles.card}>
            <Text style={styles.label}>Current period:</Text>
            <Text style={styles.value}>{currentFlushPeriod} seconds</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <ExponeaButton
              title="30 seconds"
              onPress={() => handleSetFlushPeriod(30)}
            />
          </View>
          <View style={styles.buttonHalf}>
            <ExponeaButton
              title="60 seconds"
              onPress={() => handleSetFlushPeriod(60)}
            />
          </View>
        </View>

        <ExponeaButton title="Flush Data" onPress={handleFlushData} />
      </View>

      {/* Log Level Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log Level</Text>

        <ExponeaButton title="Get Log Level" onPress={handleGetLogLevel} />

        {currentLogLevel !== '' && (
          <View style={styles.card}>
            <Text style={styles.label}>Current level:</Text>
            <Text style={styles.value}>
              {logLevelDisplayName(currentLogLevel)}
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <View style={styles.buttonThird}>
            <ExponeaButton
              title="OFF"
              onPress={() => handleSetLogLevel(LogLevel.OFF)}
            />
          </View>
          <View style={styles.buttonThird}>
            <ExponeaButton
              title="ERROR"
              onPress={() => handleSetLogLevel(LogLevel.ERROR)}
            />
          </View>
          <View style={styles.buttonThird}>
            <ExponeaButton
              title="WARN"
              onPress={() => handleSetLogLevel(LogLevel.WARN)}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <View style={styles.buttonThird}>
            <ExponeaButton
              title="INFO"
              onPress={() => handleSetLogLevel(LogLevel.INFO)}
            />
          </View>
          <View style={styles.buttonThird}>
            <ExponeaButton
              title="DEBUG"
              onPress={() => handleSetLogLevel(LogLevel.DBG)}
            />
          </View>
          <View style={styles.buttonThird}>
            <ExponeaButton
              title="VERBOSE"
              onPress={() => handleSetLogLevel(LogLevel.VERBOSE)}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonHalf: {
    flex: 1,
  },
  buttonThird: {
    flex: 1,
  },
});
