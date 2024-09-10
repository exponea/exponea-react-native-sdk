import React from 'react';
import {StyleSheet, View} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import AnonymizeModal from '../components/AnonymizeModal.tsx';

export default function AnonymizeScreen(): React.ReactElement {
  const [showingAnonymize, setShowingAnonymize] = React.useState(false);
  return (
    <View style={styles.container}>
      <AnonymizeModal
        visible={showingAnonymize}
        onClose={() => {
          setShowingAnonymize(false);
        }}
      />
      <ExponeaButton
        title="Anonymize"
        onPress={() => setShowingAnonymize(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
