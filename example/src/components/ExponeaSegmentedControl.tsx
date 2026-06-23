import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface ExponeaSegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function ExponeaSegmentedControl<T extends string>(
  props: ExponeaSegmentedControlProps<T>
): React.ReactElement {
  return (
    <View style={styles.container}>
      {props.options.map((option, index) => {
        const isActive = props.value === option.value;
        const isFirst = index === 0;
        const isLast = index === props.options.length - 1;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.segment,
              isActive && styles.segmentActive,
              !isFirst && styles.segmentBorderLeft,
              !isLast && styles.segmentBorderRight,
            ]}
            onPress={() => props.onChange(option.value)}
          >
            <Text
              style={[styles.segmentText, isActive && styles.segmentTextActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  segmentActive: {
    backgroundColor: '#ffd50033',
  },
  segmentBorderLeft: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#999',
  },
  segmentBorderRight: {
    borderRightWidth: 0.5,
    borderRightColor: '#999',
  },
  segmentText: {
    fontSize: 14,
    color: '#333',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
});
