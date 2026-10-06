import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface ExponeaContainerProps {
  children: React.ReactNode;
  title?: string;
  hint?: string;
  action?: ExponeaContainerActionProps;
  style?: StyleProp<ViewStyle>;
  childrenContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ExponeaContainerActionProps {
  cb: () => void;
  icon: React.ReactNode;
  testID?: string;
}

export default function ExponeaContainer(
  props: ExponeaContainerProps
): React.ReactElement {
  return (
    <View style={[styles.container, props.style]} testID={props.testID}>
      {(props.title || props.action) && (
        <View style={styles.header}>
          {props.title && <Text style={styles.title}>{props.title}</Text>}
          {props.action && (
            <TouchableOpacity
              testID={props.action.testID}
              onPress={props.action.cb}
            >
              {props.action.icon}
            </TouchableOpacity>
          )}
        </View>
      )}
      {props.hint && (
        <View style={styles.header}>
          <Text style={styles.hint}>{props.hint}</Text>
        </View>
      )}
      <View style={props.childrenContainerStyle}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  hint: {
    fontSize: 14,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
    margin: 10,
    padding: 10,
    borderRadius: 5,
  },
});
