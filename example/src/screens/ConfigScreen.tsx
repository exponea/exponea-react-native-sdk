import React from 'react';
import {View, StyleSheet} from 'react-native';
import DefaultPropertiesModal from '../components/DefaultPropertiesModal';
import ExponeaButton from '../components/ExponeaButton';

export default function ConfigScreen(): React.ReactElement {
  const [
    settingDefaultProperties,
    setSettingDefaultProperties,
  ] = React.useState(false);
  return (
    <View style={styles.container}>
      <DefaultPropertiesModal
        visible={settingDefaultProperties}
        onClose={() => setSettingDefaultProperties(false)}
      />
      <ExponeaButton
        title="Default properties"
        onPress={() => setSettingDefaultProperties(true)}
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
