import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Text } from 'react-native';

interface ExponeaModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ExponeaModal(
  props: ExponeaModalProps
): React.ReactElement {
  return (
    <Modal
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    minWidth: 300,
    minHeight: 100,
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
