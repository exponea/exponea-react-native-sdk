import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface ExponeaModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ExponeaModal(
  props: ExponeaModalProps,
): React.ReactElement {
  return (
    <Modal visible={props.visible} transparent={true}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={props.onClose}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
          </View>
          {props.children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    minWidth: 350,
    minHeight: 100,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 5,
    top: Platform.OS === 'ios' ? 5 : 0,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    padding: 5,
  },
});
