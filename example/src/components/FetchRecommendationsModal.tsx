import React from 'react';
import {StyleSheet, Text, Alert, View, ScrollView} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaModal from './ExponeaModal';
import PropertyEditor from './PropertyEditor';
import Exponea from 'react-native-exponea-sdk';
import ExponeaInput from './ExponeaInput';
import {RecommendationOptions} from 'react-native-exponea-sdk/lib/Recommendation';
import ExponeaPicker from './ExponeaPicker';
import ListEditor from './ListEditor';

interface FetchRecommendationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FetchRecommendationsModal(
  props: FetchRecommendationsModalProps,
): React.ReactElement {
  const [id, setId] = React.useState('');
  const [fillWithRandom, setFillWithRandom] = React.useState(true);
  const [size, setSize] = React.useState('');
  const [items, setItems] = React.useState({});
  const [noTrack, setNoTrack] = React.useState<boolean | 'undefined'>(
    'undefined',
  );
  const [whitelist, setWhitelist] = React.useState<Array<string>>([]);
  const fetchRecommendations = () => {
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
    Exponea.fetchRecommendations(options)
      .then(recommendations => {
        Alert.alert(
          'Received recommendations',
          JSON.stringify(recommendations, null, 2),
        );
      })
      .catch(error =>
        Alert.alert('Error fetching recommendations', error.message),
      );
  };
  return (
    <ExponeaModal visible={props.visible} onClose={props.onClose}>
      <Text style={styles.title}>Fetch recommendations</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.subtitle}>Id</Text>
        <View style={styles.inputContainer}>
          <ExponeaInput
            compact
            placeholder="Recommendation id"
            value={id}
            onChangeText={setId}
          />
        </View>
        <Text style={styles.subtitle}>Fill with random</Text>
        <ExponeaPicker<boolean>
          width={100}
          value={fillWithRandom}
          setValue={setFillWithRandom}
          options={{true: true, false: false}}
        />
        <Text style={styles.subtitle}>Size (optional)</Text>
        <View style={styles.inputContainer}>
          <ExponeaInput
            compact
            placeholder="Recommendation size"
            value={size}
            onChangeText={setSize}
          />
        </View>
        <Text style={styles.subtitle}>Items (optional)</Text>
        <PropertyEditor properties={items} onChange={setItems} />
        <Text style={styles.subtitle}>Don't track (optional)</Text>
        <ExponeaPicker<boolean | 'undefined'>
          width={140}
          value={noTrack}
          setValue={setNoTrack}
          options={{undefined: 'undefined', true: true, false: false}}
        />
        <Text style={styles.subtitle}>
          Catalog attributes whitelist (optional)
        </Text>
        <ListEditor values={whitelist} onChange={setWhitelist} />
      </ScrollView>
      <ExponeaButton
        title="Fetch recommendation"
        onPress={fetchRecommendations}
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
  inputContainer: {
    width: 200,
  },
  scrollView: {
    alignSelf: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
});
