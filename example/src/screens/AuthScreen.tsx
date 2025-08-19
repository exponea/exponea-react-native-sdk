import React from 'react';
import {StyleSheet, View, Image, Dimensions} from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import ExponeaButton from '../components/ExponeaButton';
import ExponeaInput from '../components/ExponeaInput';
import logo from '../img/logo.png';

interface AuthScreenProps {
  onStart: (
    projectToken: string,
    authorization: string,
    advancedAuthKey: string,
    baseUrl: string,
  ) => void;
}

export default function AuthScreen(props: AuthScreenProps): React.ReactElement {
  const [projectToken, setProjectToken] = React.useState('');
  const [authorization, setAuthorization] = React.useState('');
  const [advancedAuthKey, setAdvancedAuthKey] = React.useState('');
  const [baseUrl, setBaseUrl] = React.useState('');
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
        onChangeText={text => setProjectToken(text)}
        placeholder="Project token"
      />
      <ExponeaInput
        value={authorization}
        placeholder="Authorization token"
        onChangeText={text => setAuthorization(text)}
      />
      <ExponeaInput
        value={advancedAuthKey}
        onChangeText={text => setAdvancedAuthKey(text)}
        placeholder="Advanced Auth key"
      />
      <ExponeaInput
        value={baseUrl}
        placeholder="Base URL"
        onChangeText={text => setBaseUrl(text)}
      />
      <ExponeaButton
        disabled={buttonDisabled}
        title="Start"
        onPress={() => {
          props.onStart(projectToken, authorization, advancedAuthKey, baseUrl);
        }}
      />
      <ExponeaButton
        title="Clear local data"
        onPress={() => {
          Exponea.clearLocalCustomerData("group.com.exponea.ExponeaSDK-Example2").then(
            () => {
              console.log('SDK data has been cleared');
            },
            rejectReason => {
              console.error(
                `SDK data clear has been rejected: '${rejectReason}'`,
              );
            },
          );
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
