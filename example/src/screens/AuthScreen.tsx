import React from 'react';
import {StyleSheet, View, Image, Dimensions} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';
import logo from '../img/logo.png';

interface AuthScreenProps {
  onStart: (
    projectToken: string,
    authorization: string,
    baseUrl: string,
  ) => void;
}

export default function AuthScreen(props: AuthScreenProps): React.ReactElement {
  const [projectToken, setProjectToken] = React.useState('');
  const [authorization, setAuthorization] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('https://api.exponea.com');
  const buttonDisabled =
    projectToken === '' || authorization === '' || baseUrl === '';
  return (
    <View style={styles.container}>
      <Image
        style={[
          styles.image,
          {
            width:
              Dimensions.get('window').width - 2 * styles.container.padding,
            height: undefined,
          },
        ]}
        resizeMode={'contain'}
        source={logo}
      />
      <ExponeaInput
        value={projectToken}
        onChangeText={(text) => setProjectToken(text)}
        placeholder="Project token"
      />
      <ExponeaInput
        value={authorization}
        placeholder="Authorization token"
        onChangeText={(text) => setAuthorization(text)}
      />
      <ExponeaInput
        value={baseUrl}
        placeholder="Base URL"
        onChangeText={(text) => setBaseUrl(text)}
      />
      <ExponeaButton
        disabled={buttonDisabled}
        title="Start"
        onPress={() => {
          props.onStart(projectToken, authorization, baseUrl);
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
    backgroundColor: '#eee',
  },
  image: {
    aspectRatio: 2.5,
  },
});
