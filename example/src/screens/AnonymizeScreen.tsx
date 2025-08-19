import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import { AppStateContext } from '../App.tsx';
import AnonymizeModal from '../components/AnonymizeModal.tsx';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from '../components/ExponeaModal.tsx';

export default function AnonymizeScreen(): React.ReactElement {
  const { validateSdkState } = useContext(AppStateContext);
  const [showingAnonymize, setShowingAnonymize] = React.useState(false);
  const [showingStopIntegration, setShowingStopIntegration] = React.useState(false);
  return (
    <View style={styles.container}>
      <AnonymizeModal
        visible={showingAnonymize}
        onClose={() => {
          setShowingAnonymize(false);
        }}
      />
      <ExponeaModal
        visible={showingStopIntegration}
        onClose={() => {
          setShowingStopIntegration(false)
        }}>
        <Text style={styles.title}>SDK stopped!</Text>
        <Text style={styles.subtitle}>SDK has been de-integrated from your app.</Text>
        <Text style={styles.subtitle}>You may return app 'Back to Auth' to re-integrate.</Text>
        <Text style={styles.subtitle}>You may 'Continue' in using app without initialised SDK.</Text>
        <ExponeaButton title="Back to Auth" onPress={validateSdkState} />
        <ExponeaButton title="Continue" onPress={() => {}} />
      </ExponeaModal>
      <ExponeaButton
        title="Anonymize"
        onPress={() => setShowingAnonymize(true)}
      />
      <ExponeaButton
        title="Stop Integration"
        onPress={async () => {
          await Exponea.stopIntegration()
          setShowingStopIntegration(true)
        }}
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
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
