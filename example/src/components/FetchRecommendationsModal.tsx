import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { RecommendationOptions } from 'react-native-exponea-sdk';
import { fetchRecommendations } from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';
import ExponeaInput from '@/components/ExponeaInput';
import ExponeaModal from '@/components/ExponeaModal';

interface FetchRecommendationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FetchRecommendationsModal(
  props: FetchRecommendationsModalProps
): React.ReactElement {
  const [id, setId] = React.useState('');
  const fillWithRandom = true;
  const [size, setSize] = React.useState('');
  const [items, setItems] = React.useState({});
  const noTrack: boolean | 'undefined' = 'undefined';
  const [whitelist, setWhitelist] = React.useState<Array<string>>([]);
  const onFetchRecommendations = () => {
    const options: RecommendationOptions = {
      id,
      fillWithRandom,
      size: parseInt(size, 10) || undefined,
      items: items,
      noTrack: noTrack === 'undefined' ? undefined : noTrack,
      catalogAttributesWhitelist: whitelist,
    };
    setItems({});
    setWhitelist([]);
    setSize('');
    props.onClose();
    fetchRecommendations(options)
      .then((recommendations) => {
        Alert.alert(
          'Received recommendations',
          JSON.stringify(recommendations, null, 2)
        );
      })
      .catch((error) =>
        Alert.alert('Error fetching recommendations', error.message)
      );
  };
  return (
    <ExponeaModal
      visible={props.visible}
      onClose={props.onClose}
      closeButtonTestID={AutomationIds.RECOMMENDATION_DIALOG_CANCEL}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Fetch recommendations</Text>
      </View>
      <ExponeaContainer style={styles.container}>
        <View style={styles.inputContainer}>
          <ExponeaInput
            compact
            placeholder="Recommendation id"
            value={id}
            onChangeText={setId}
            style={styles.fullWidthInput}
            testID={AutomationIds.RECOMMENDATION_ID}
          />
        </View>
      </ExponeaContainer>
      <ExponeaButton
        title="Fetch recommendation"
        onPress={onFetchRecommendations}
        disabled={id === ''}
        testID={AutomationIds.RECOMMENDATION_DIALOG_FETCH}
      />
    </ExponeaModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  },
  required: {
    color: 'red',
  },
  divider: {
    marginVertical: 8,
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
  },
  container: {
    width: '100%',
    marginHorizontal: 0,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    flexGrow: 1,
  },
  content: {
    alignSelf: 'stretch',
    alignItems: 'center',
    width: '100%',
  },
  fullWidthInput: {
    flex: 1,
    marginHorizontal: 0,
  },
});
