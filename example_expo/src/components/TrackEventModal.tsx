import React from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import Exponea from 'react-native-exponea-sdk';
import RNPickerSelect from 'react-native-picker-select';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';
import ExponeaInput from '@/components/ExponeaInput';
import ExponeaModal from '@/components/ExponeaModal';
import PropertyEditor from '@/components/PropertyEditor';
import type { InAppMessagePreset } from '@/util/InAppMessagesPreset';

const DEFAULT_CUSTOM_EVENT_TYPE = 'test_event';
const EVENT_NAME_PROPERTY = 'event_name';

interface PendingSubmission {
  eventType: string;
  properties: Readonly<Record<string, string>>;
  fromPreset: boolean;
}

interface TrackEventModalProps {
  visible: boolean;
  onClose: () => void;
  eventPresets?: InAppMessagePreset[];
}

export default function TrackEventModal(
  props: TrackEventModalProps
): React.ReactElement {
  const [eventType, setEventType] = React.useState(DEFAULT_CUSTOM_EVENT_TYPE);
  const [properties, setProperties] = React.useState<Record<string, string>>({
    [EVENT_NAME_PROPERTY]: DEFAULT_CUSTOM_EVENT_TYPE,
  });
  const [selectedPresetKey, setSelectedPresetKey] = React.useState<
    string | null
  >(null);
  const pendingSubmissionRef = React.useRef<PendingSubmission | null>(null);
  const customEventSelected = selectedPresetKey === null;
  const displayedProperties = React.useMemo(
    () =>
      customEventSelected
        ? {
            ...properties,
            [EVENT_NAME_PROPERTY]: eventType,
          }
        : properties,
    [customEventSelected, eventType, properties]
  );

  const presetOptions = React.useMemo(
    () =>
      (props.eventPresets ?? []).map((preset, index) => ({
        key: `${preset.category ?? 'Custom'}:${preset.label}:${index}`,
        label: preset.category
          ? `${preset.category} - ${preset.label}`
          : preset.label,
        preset,
      })),
    [props.eventPresets]
  );

  const selectedPresetLabel = React.useMemo(
    () =>
      presetOptions.find((option) => option.key === selectedPresetKey)?.label ??
      '(custom event)',
    [presetOptions, selectedPresetKey]
  );

  const presetItems = React.useMemo(
    () =>
      presetOptions.map((option) => ({
        label: option.label,
        value: option.key,
      })),
    [presetOptions]
  );

  const onPresetSelected = React.useCallback(
    (presetKey: string | null) => {
      if (!presetKey) {
        setSelectedPresetKey(null);
        setEventType(DEFAULT_CUSTOM_EVENT_TYPE);
        setProperties({ [EVENT_NAME_PROPERTY]: DEFAULT_CUSTOM_EVENT_TYPE });
        return;
      }
      const selectedOption = presetOptions.find(
        (option) => option.key === presetKey
      );
      if (!selectedOption) return;
      setSelectedPresetKey(presetKey);
      setEventType(selectedOption.preset.eventName);
      setProperties(selectedOption.preset.properties);
    },
    [presetOptions]
  );

  const onEventTypeChange = React.useCallback((text: string) => {
    setSelectedPresetKey(null);
    setEventType(text);
    setProperties((currentProperties) => ({
      ...currentProperties,
      [EVENT_NAME_PROPERTY]: text,
    }));
  }, []);

  const onPropertiesChange = React.useCallback(
    (updatedProperties: Record<string, string>) => {
      setProperties(
        customEventSelected
          ? {
              ...updatedProperties,
              [EVENT_NAME_PROPERTY]: eventType,
            }
          : updatedProperties
      );
    },
    [customEventSelected, eventType]
  );

  const submitEvent = React.useCallback((submission: PendingSubmission) => {
    console.log('Tracking event requested');
    Exponea.trackEvent(submission.eventType, submission.properties)
      .then(() => {
        console.log('Closing tracking event dialog');
        // Keep preset properties so the same preset can be tracked again
        if (!submission.fromPreset) {
          setProperties({ [EVENT_NAME_PROPERTY]: submission.eventType });
        }
      })
      .catch((error) => {
        console.log(`Error occured while tracking event ${error.message}`);
        Alert.alert('Error tracking event', error.message);
      });
  }, []);

  const onTrackEvent = () => {
    const submission: PendingSubmission = {
      eventType,
      properties: Object.freeze({ ...displayedProperties }),
      fromPreset: !customEventSelected,
    };

    if (Platform.OS === 'ios') {
      if (pendingSubmissionRef.current) return;
      pendingSubmissionRef.current = submission;
      props.onClose();
      return;
    }

    submitEvent(submission);
    props.onClose();
  };

  const onDismiss = () => {
    if (Platform.OS !== 'ios') return;
    const submission = pendingSubmissionRef.current;
    if (!submission) return;
    pendingSubmissionRef.current = null;
    submitEvent(submission);
  };

  return (
    <ExponeaModal
      visible={props.visible}
      onClose={props.onClose}
      onDismiss={onDismiss}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Track Event</Text>
      </View>
      <View style={styles.scrollView}>
        <ExponeaContainer>
          <View style={styles.eventType}>
            <RNPickerSelect
              value={selectedPresetKey}
              onValueChange={onPresetSelected}
              items={presetItems}
              placeholder={{ label: '(custom event)', value: null }}
              useNativeAndroidPickerStyle={false}
              style={pickerStyle}
              touchableWrapperProps={
                Platform.OS === 'ios'
                  ? { accessible: false }
                  : {
                      testID: AutomationIds.INAPP_PRESET,
                      accessibilityLabel: 'Event preset',
                    }
              }
            >
              <View
                style={styles.presetSelect}
                testID={
                  Platform.OS === 'android'
                    ? AutomationIds.INAPP_PRESET
                    : undefined
                }
              >
                <Text
                  accessible
                  style={styles.presetSelectText}
                  testID={AutomationIds.INAPP_PRESET_SELECTED_LABEL}
                >
                  {selectedPresetLabel}
                </Text>
              </View>
            </RNPickerSelect>
            <ExponeaInput
              compact
              placeholder="Event type"
              value={eventType}
              onChangeText={onEventTypeChange}
              editable={customEventSelected}
              style={styles.eventTypeInput}
              testID={AutomationIds.EVENT_NAME}
            />
          </View>
          <Text style={styles.subtitle}>Properties</Text>
          <View>
            <PropertyEditor
              properties={displayedProperties}
              onChange={onPropertiesChange}
              addButtonTestID={AutomationIds.EVENT_ADD_ATTR}
              keyInputTestID={AutomationIds.EVENT_ATTR_NAME}
              propertiesJsonTestID={AutomationIds.EVENT_PROPS_JSON}
              valueInputTestID={AutomationIds.EVENT_ATTR_VALUE}
            />
          </View>
          <ExponeaButton
            title="Track event"
            onPress={onTrackEvent}
            disabled={eventType === ''}
            testID={AutomationIds.TRACK_EVENT}
          />
        </ExponeaContainer>
      </View>
    </ExponeaModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  },
  eventType: {
    flexDirection: 'column',
    width: '100%',
  },
  eventTypeInput: {
    marginHorizontal: 5,
  },
  presetSelect: {
    height: 30,
    margin: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  presetSelectText: {
    color: '#111',
    fontSize: 14,
  },
  scrollView: {
    alignSelf: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
  },
  content: {
    alignSelf: 'stretch',
    alignItems: 'center',
    width: '100%',
  },
});

const pickerStyle = StyleSheet.create({
  inputIOS: styles.presetSelect,
  inputAndroid: styles.presetSelect,
});
