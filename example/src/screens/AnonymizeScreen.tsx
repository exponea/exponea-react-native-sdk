import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import AnonymizeModal from '../components/AnonymizeModal';
import Exponea from 'react-native-exponea-sdk';
import ExponeaModal from '../components/ExponeaModal';
import { AppStateContext } from '../App';

export default function AnonymizeScreen(): React.ReactElement {
  const [anonymizeModalVisible, setAnonymizeModalVisible] = useState(false);
  const { returnToAuth } = useContext(AppStateContext);
  const [showingStopIntegration, setShowingStopIntegration] =
    React.useState(false);
  const [sdkConfigured, setSdkConfigured] = useState(false);

  useEffect(() => {
    (async () => {
      const configured = await Exponea.isConfigured();
      setSdkConfigured(configured);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <AnonymizeModal
        visible={anonymizeModalVisible}
        onClose={() => setAnonymizeModalVisible(false)}
      />
      <ExponeaModal
        visible={showingStopIntegration}
        onClose={() => {
          setShowingStopIntegration(false);
        }}
      >
        <Text style={styles.title}>SDK stopped!</Text>
        <Text style={styles.subtitle}>
          SDK has been de-integrated from your app.
        </Text>
        <Text style={styles.subtitle}>
          You may return app 'Back to Auth' to re-integrate.
        </Text>
        <Text style={styles.subtitle}>
          You may 'Continue' in using app without initialised SDK.
        </Text>
        <ExponeaButton title="Back to Auth" onPress={returnToAuth} />
        <ExponeaButton
          title="Continue"
          onPress={() => {
            setShowingStopIntegration(false);
          }}
        />
      </ExponeaModal>

      <View style={styles.section}>
        <ExponeaButton
          title="Anonymize"
          onPress={() => setAnonymizeModalVisible(true)}
          disabled={!sdkConfigured}
        />

        <ExponeaButton
          title="Stop Integration"
          onPress={async () => {
            try {
              if (await Exponea.isConfigured()) {
                await Exponea.stopIntegration();
              }
            } catch (e) {
              console.error(`Failed to stop SDK: ${e}`);
            }
            setShowingStopIntegration(true);
            setSdkConfigured(await Exponea.isConfigured());
          }}
        />
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
