import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import ExponeaProject from '../../../lib/ExponeaProject';
import ExponeaButton from './ExponeaButton';
import ExponeaInput from './ExponeaInput';

interface ExponeaProjectEditorProps {
  value: ExponeaProject | undefined;
  onChange: (value: ExponeaProject | undefined) => void;
}

export default function ExponeaProjectEditor(
  props: ExponeaProjectEditorProps,
): React.ReactElement {
  const [editing, setEditing] = React.useState(false);
  const onSave = (value: ExponeaProject | undefined) => {
    setEditing(false);
    props.onChange(value);
  };
  return (
    <View style={styles.container}>
      {editing ? (
        <Editing value={props.value} onSave={onSave} />
      ) : (
        <Viewing value={props.value} onEdit={() => setEditing(true)} />
      )}
    </View>
  );
}

interface ViewingProps {
  value: ExponeaProject | undefined;
  onEdit: () => void;
}

function Viewing(props: ViewingProps): React.ReactElement {
  return (
    <View>
      {props.value !== undefined ? (
        <View>
          <Text>
            <Text style={styles.title}>Project token:</Text>{' '}
            {props.value.projectToken}
          </Text>
          <Text>
            <Text style={styles.title}>Authorization token:</Text>{' '}
            {props.value.authorizationToken}
          </Text>
          <Text>
            <Text style={styles.title}>Base url:</Text>{' '}
            {props.value.baseUrl || '[default]'}
          </Text>
        </View>
      ) : (
        <Text style={styles.noProject}>undefined</Text>
      )}
      <ExponeaButton compact title="Edit" onPress={props.onEdit} />
    </View>
  );
}

interface EditingProps {
  value: ExponeaProject | undefined;
  onSave: (value: ExponeaProject | undefined) => void;
}

function Editing(props: EditingProps): React.ReactElement {
  const [projectToken, setProjectToken] = React.useState(
    props.value ? props.value.projectToken : '',
  );
  const [authorizationToken, setAuthorizationToken] = React.useState(
    props.value ? props.value.authorizationToken : '',
  );
  const [baseUrl, setBaseUrl] = React.useState(
    props.value ? props.value.baseUrl || '' : '',
  );
  const onSave = () => {
    props.onSave({
      projectToken,
      authorizationToken,
      baseUrl: baseUrl !== '' ? baseUrl : undefined,
    });
  };
  return (
    <View>
      <ExponeaInput
        compact
        value={projectToken}
        placeholder="Project token"
        onChangeText={setProjectToken}
      />
      <ExponeaInput
        compact
        value={authorizationToken}
        placeholder="Authorization token"
        onChangeText={setAuthorizationToken}
      />
      <ExponeaInput
        compact
        value={baseUrl}
        placeholder="Base url"
        onChangeText={setBaseUrl}
      />
      <ExponeaButton compact title="Save" onPress={onSave} />
      <ExponeaButton
        compact
        title="Clear"
        onPress={() => props.onSave(undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    marginTop: 5,
    alignItems: 'stretch',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 10,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  title: {
    fontWeight: 'bold',
  },
  noProject: {
    textAlign: 'center',
  },
});
