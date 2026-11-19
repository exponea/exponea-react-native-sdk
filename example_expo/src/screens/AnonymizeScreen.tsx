import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Exponea from 'react-native-exponea-sdk';

import { AppStateContext } from '@/App';
import { AutomationIds } from '@/automation/AutomationIds';
import AnonymizeModal from '@/components/AnonymizeModal';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';
import ExponeaModal from '@/components/ExponeaModal';
import SdkSetupState from '@/util/SdkSetupState';

export default function AnonymizeScreen(): React.ReactElement {
  const [anonymizeModalVisible, setAnonymizeModalVisible] = useState(false);
  const {
    refreshCustomerCookie,
    returnToAuth,
    sdkConfigured,
    validateSdkState,
  } = useContext(AppStateContext);
  const [showingStopIntegration, setShowingStopIntegration] =
    React.useState(false);

  const closeStopIntegration = () => setShowingStopIntegration(false);

  return (
    <View style={styles.container}>
      <AnonymizeModal
        visible={anonymizeModalVisible}
        onClose={() => setAnonymizeModalVisible(false)}
        onSuccess={refreshCustomerCookie}
      />
      <ExponeaModal
        visible={showingStopIntegration}
        onClose={closeStopIntegration}
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
        <ExponeaButton
          title="Back to Auth"
          onPress={returnToAuth}
          testID={AutomationIds.STOP_BACK_TO_AUTH}
        />
        <ExponeaButton
          title="Continue"
          testID={AutomationIds.STOP_CONTINUE}
          onPress={closeStopIntegration}
        />
      </ExponeaModal>

      <ExponeaContainer
        title={'Anonymize'}
        hint={'Clears local customer data and starts a new anonymous session.'}
      >
        <ExponeaButton
          title="Anonymize"
          onPress={() => setAnonymizeModalVisible(true)}
          disabled={!sdkConfigured}
          testID={AutomationIds.ANONYMIZE}
        />
        <ExponeaButton
          warn
          title="Stop Integration"
          testID={AutomationIds.STOP_INTEGRATION}
          onPress={async () => {
            try {
              if (await Exponea.isConfigured()) {
                SdkSetupState.reset();
                await Exponea.stopIntegration();
              }
            } catch (e) {
              console.error(`Failed to stop SDK: ${e}`);
            }
            await validateSdkState();
            setShowingStopIntegration(true);
          }}
        />
      </ExponeaContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
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
