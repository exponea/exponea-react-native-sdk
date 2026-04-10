import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import { fetchConsents, getSegments } from 'react-native-exponea-sdk';
import type { Segment } from 'react-native-exponea-sdk';
import FetchRecommendationsModal from '../components/FetchRecommendationsModal';

export default function FetchingScreen(): React.ReactElement {
  const [showingFetchRecommendations, setShowingFetchRecommendations] =
    React.useState(false);

  const onFetchConsents = async () => {
    try {
      const consents = await fetchConsents();
      Alert.alert('Received consents', JSON.stringify(consents, null, 2));
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error fetching consents', errorMessage);
    }
  };
  const onFetchRecommendations = () => {
    setShowingFetchRecommendations(true);
  };
  const onFetchSegments = async () => {
    try {
      const segments: Array<Segment> = await getSegments('discovery', true);
      Alert.alert('Received segments', JSON.stringify(segments, null, 2));
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error fetching segments', errorMessage);
    }
  };
  return (
    <View style={styles.container}>
      <FetchRecommendationsModal
        visible={showingFetchRecommendations}
        onClose={() => {
          setShowingFetchRecommendations(false);
        }}
      />
      <ExponeaButton title="Fetch Consents" onPress={onFetchConsents} />
      <ExponeaButton
        title="Fetch Recommendations"
        onPress={onFetchRecommendations}
      />
      <ExponeaButton title="Fetch Segments" onPress={onFetchSegments} />
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
