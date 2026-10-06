import React, { useCallback, useContext, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Segment } from 'react-native-exponea-sdk';
import {
  AppInboxButton,
  fetchConsents,
  getSegments,
} from 'react-native-exponea-sdk';

import { AppStateContext } from '@/App.tsx';
import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';
import FetchRecommendationsModal from '@/components/FetchRecommendationsModal';
import Snackbar from '@/components/Snackbar';
import flushIcon from '@/img/ic_clear_inverse.png';

export default function FetchingScreen(): React.ReactElement {
  const [showingFetchRecommendations, setShowingFetchRecommendations] =
    useState(false);
  const [fetchMessage, setFetchMessage] = React.useState('');
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null
  );
  const { sdkConfigured } = useContext(AppStateContext);
  const hasFetchMessage = fetchMessage.length > 0;

  const onFetchConsents = useCallback(async () => {
    try {
      const consents = await fetchConsents();
      setFetchMessage(JSON.stringify(consents, null, 2));
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFetchMessage(`Error fetching consents ${errorMessage}`);
    }
  }, []);

  const onFetchRecommendations = useCallback(() => {
    setShowingFetchRecommendations(true);
  }, []);

  const onFetchSegments = useCallback(async () => {
    try {
      const segments: Array<Segment> = await getSegments('discovery', true);
      setFetchMessage(JSON.stringify(segments, null, 2));
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFetchMessage(`Error fetching segments ${errorMessage}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <FetchRecommendationsModal
        visible={showingFetchRecommendations}
        onClose={() => {
          setShowingFetchRecommendations(false);
        }}
      />
      <ExponeaContainer title={'Fetch'}>
        <ExponeaButton
          title="Fetch Consents"
          onPress={onFetchConsents}
          testID={AutomationIds.FETCH_CONSENTS}
        />
        <ExponeaButton
          title="Fetch Recommendations"
          onPress={onFetchRecommendations}
          testID={AutomationIds.FETCH_RECOMMENDATIONS}
        />
        <ExponeaButton
          title="Fetch Segments"
          onPress={onFetchSegments}
          testID={AutomationIds.FETCH_SEGMENTS}
        />
        {sdkConfigured && (
          <View style={styles.inbox} testID={AutomationIds.OPEN_INBOX}>
            <AppInboxButton style={styles.inboxButton} borderRadius="5dp" />
          </View>
        )}
      </ExponeaContainer>
      <ExponeaContainer
        title={'Result'}
        style={styles.resultContainer}
        childrenContainerStyle={styles.resultChildrenContainer}
        action={{
          cb: () => {
            setFetchMessage('');
            setSnackbarMessage('Result cleared');
          },
          icon: <Image source={flushIcon} style={styles.actionIcon} />,
          testID: AutomationIds.CLEAR_RESULT,
        }}
      >
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultScrollContent}
        >
          <View style={styles.box}>
            <Text
              testID={AutomationIds.FETCH_RESULT}
              style={
                hasFetchMessage ? styles.resultText : styles.placeholderText
              }
            >
              {hasFetchMessage ? fetchMessage : 'Result will appear here.'}
            </Text>
          </View>
        </ScrollView>
      </ExponeaContainer>
      <Snackbar
        message={snackbarMessage}
        onDismiss={() => {
          setSnackbarMessage(null);
        }}
      />
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
  inbox: {
    margin: 5,
  },
  inboxButton: {
    width: '100%',
    height: 40,
  },
  box: {
    padding: 10,
  },
  resultContainer: {
    flex: 1,
  },
  resultChildrenContainer: {
    flex: 1,
  },
  resultScroll: {
    borderColor: '#d8d8d8',
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  resultScrollContent: {
    flexGrow: 1,
    backgroundColor: '#f4f4f4',
  },
  resultText: {
    color: '#000000',
  },
  placeholderText: {
    color: '#666666',
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
});
