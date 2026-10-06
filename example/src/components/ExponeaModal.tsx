import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExponeaModalProps {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  closeButtonTestID?: string;
  containerTestID?: string;
}

export default function ExponeaModal(
  props: ExponeaModalProps
): React.ReactElement {
  return (
    <Modal
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
      onDismiss={props.onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer} testID={props.containerTestID}>
          <TouchableOpacity
            testID={props.closeButtonTestID}
            style={styles.closeButton}
            onPress={props.onClose}
          >
            <Text style={styles.closeButtonText}>✖</Text>
          </TouchableOpacity>
          {props.children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    minWidth: 300,
    minHeight: 100,
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
