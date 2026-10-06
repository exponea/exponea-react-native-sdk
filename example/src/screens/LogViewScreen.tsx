import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AutomationIds } from '@/automation/AutomationIds';
import clearIcon from '@/img/ic_clear.png';
import copyIcon from '@/img/ic_copy.png';
import deleteIcon from '@/img/ic_delete.png';
import { LogEntry, LogLevel } from '@/logging/LogEntry';
import MemoryLogger from '@/logging/MemoryLogger';

interface LogViewScreenProps {
  visible: boolean;
  onClose: () => void;
  topInset: number;
}

type LevelFilter = 'All' | LogLevel;
const LEVELS: LevelFilter[] = [
  'All',
  LogLevel.VERBOSE,
  LogLevel.DEBUG,
  LogLevel.INFO,
  LogLevel.WARN,
  LogLevel.ERROR,
];

function getLevelFilterTestID(level: LevelFilter): string {
  switch (level) {
    case 'All':
      return AutomationIds.LOGS_FILTER_ALL;
    case LogLevel.VERBOSE:
      return AutomationIds.LOGS_FILTER_VERBOSE;
    case LogLevel.DEBUG:
      return AutomationIds.LOGS_FILTER_DEBUG;
    case LogLevel.INFO:
      return AutomationIds.LOGS_FILTER_INFO;
    case LogLevel.WARN:
      return AutomationIds.LOGS_FILTER_WARN;
    case LogLevel.ERROR:
      return AutomationIds.LOGS_FILTER_ERROR;
  }
}

export default function LogViewScreen(
  props: LogViewScreenProps
): React.ReactElement {
  const [selected, setSelected] = useState<LevelFilter>('All');
  const [entries, setEntries] = useState<LogEntry[]>(
    MemoryLogger.INSTANCE.snapshot()
  );

  useEffect(() => {
    return MemoryLogger.INSTANCE.subscribe((event) => {
      if (event.type === 'cleared') {
        setEntries([]);
        return;
      }
      setEntries((previous) => {
        const next = [...previous, event.entry];
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });
    });
  }, []);

  useEffect(() => {
    if (!props.visible) {
      return;
    }
    setEntries(MemoryLogger.INSTANCE.snapshot());
  }, [props.visible]);

  const onClear = useCallback(() => {
    MemoryLogger.INSTANCE.clear();
  }, []);

  const onCopy = useCallback(() => {
    console.log('TBD should copy');
  }, []);

  const filteredEntries = useMemo(() => {
    const selectedEntries =
      selected === 'All'
        ? entries
        : entries.filter((entry) => entry.level === selected);
    return [...selectedEntries].reverse();
  }, [entries, selected]);

  const renderLogEntry = useCallback((item: LogEntry): React.ReactElement => {
    return (
      <View style={styles.logRow}>
        <Text style={styles.metaText}>
          {formatTimestamp(item.timestamp)} {item.level}
          {item.tag ? `/${item.tag}` : ''}
        </Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback(
    (item: LogEntry, index: number): string =>
      `${item.timestamp}-${item.level}-${index}`,
    []
  );

  const renderFlatListItem = useCallback(
    ({ item }: { item: LogEntry }) => renderLogEntry(item),
    [renderLogEntry]
  );

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: props.topInset + 8 }]}>
          <Text style={styles.title}>SDK Logs</Text>
          <View style={styles.iconContainer}>
            <TouchableOpacity testID={AutomationIds.LOGS_COPY} onPress={onCopy}>
              <Image source={copyIcon} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              testID={AutomationIds.LOGS_CLEAR}
              onPress={onClear}
            >
              <Image source={deleteIcon} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              testID={AutomationIds.LOGS_CLOSE}
              onPress={props.onClose}
            >
              <Image source={clearIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.levelHeader}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              testID={getLevelFilterTestID(level)}
              style={[
                styles.levels,
                level === selected ? styles.selected : null,
              ]}
              onPress={() => {
                setSelected(level);
              }}
            >
              <Text style={styles.text}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.divider} />
        <View style={styles.content}>
          {filteredEntries.length === 0 ? (
            <Text style={styles.emptyText} testID={AutomationIds.LOGS_EMPTY}>
              No log entries for selected level.
            </Text>
          ) : (
            <FlatList
              testID={AutomationIds.LIST_LOGS}
              data={filteredEntries}
              keyExtractor={keyExtractor}
              renderItem={renderFlatListItem}
              contentContainerStyle={styles.logListContainer}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  return `${date.toLocaleTimeString('en-US', {
    hour12: false,
  })}.${milliseconds}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  levels: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#333333',
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    margin: 10,
    padding: 5,
  },
  selected: {
    backgroundColor: '#eac163',
  },
  divider: {
    height: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  logListContainer: {
    paddingBottom: 24,
  },
  logRow: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  metaText: {
    color: '#777777',
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'Courier',
  },
  messageText: {
    color: '#000000',
    fontSize: 14,
  },
  text: {
    color: '#000000',
    fontSize: 14,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
