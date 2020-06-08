import React from 'react';
import {StyleSheet, View, Image, Dimensions} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';
import logo from '../img/logo.png';

interface AuthScreenProps {
  onStart: (
    projectToken: string,
    authentication: string,
    baseUrl: string,
  ) => void;
}

export default function AuthScreen(props: AuthScreenProps): React.ReactElement {
  const [projectToken, setProjectToken] = React.useState('');
  const [authentication, setAuthentication] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('');
  const buttonDisabled =
    projectToken === '' || authentication === '' || baseUrl === '';
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
        value={authentication}
        placeholder="Authentication"
        onChangeText={(text) => setAuthentication(text)}
      />
      <ExponeaInput
        value={baseUrl}
        placeholder="Base url"
        onChangeText={(text) => setBaseUrl(text)}
      />
      <ExponeaButton
        disabled={buttonDisabled}
        title="Start"
        onPress={() => {
          props.onStart(projectToken, authentication, baseUrl);
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
