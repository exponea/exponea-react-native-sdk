import React from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import Exponea from 'react-native-exponea-sdk';
import FetchRecommendationsModal from '../components/FetchRecommendationsModal';

export default function FetchingScreen(): React.ReactElement {
  const [
    showingFetchRecommendations,
    setShowingFetchRecommendations,
  ] = React.useState(false);

  const fetchConsents = async () => {
    try {
      const consents = await Exponea.fetchConsents();
      Alert.alert('Received consents', JSON.stringify(consents, null, 2));
    } catch (error) {
      Alert.alert('Error fetching consents', error.message);
    }
  };
  const fetchRecommendations = () => {
    setShowingFetchRecommendations(true);
  };
  return (
    <View style={styles.container}>
      <FetchRecommendationsModal
        visible={showingFetchRecommendations}
        onClose={() => {
          setShowingFetchRecommendations(false);
        }}
      />
      <ExponeaButton title="Fetch Consents" onPress={fetchConsents} />
      <ExponeaButton
        title="Fetch Recommendations"
        onPress={fetchRecommendations}
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
