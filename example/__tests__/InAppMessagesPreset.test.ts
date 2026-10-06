import { inAppMessagePresets } from '@/util/InAppMessagesPreset';

const expectedPresetValues = {
  'Control Group': 'test_msg_control_group',
  'Alert Rich': 'test_msg_alert_rich',
  'Alert Legacy': 'test_msg_alert_legacy',
  'Slide-in': 'test_msg_slidein',
  'Modal': 'test_msg_modal',
  'Fullscreen': 'test_msg_fullscreen',
  'HTML': 'test_msg_html',
  'HTML No Close': 'test_msg_html_noclose',
  'Data Link External': 'test_msg_datalink',
  'UL Data Link + HTML Attr': 'test_msg_datalink_html_attr',
  'Auto Close 5s': 'test_msg_autoclose',
  'Stop SDK': 'test_msg_stop_sdk',
  'Stop And Restart': 'test_msg_stop_restart',
  'GDPR Dialog': 'test_msg_gdpr',
  'GDPR No Consents Customer': 'test_msg_gdpr_no_consents',
  'AB Variant A': 'test_msg_ab_variant_a',
  'AB Variant B': 'test_msg_ab_variant_b',
};

describe('inAppMessagePresets', () => {
  test('matches the compatibility=3 event contract', () => {
    expect(
      Object.fromEntries(
        inAppMessagePresets.map(({ label, properties }) => [
          label,
          properties.property,
        ])
      )
    ).toEqual(expectedPresetValues);

    for (const preset of inAppMessagePresets) {
      expect(preset.eventName).toBe('event_name');
      expect(Object.keys(preset.properties)).toEqual(['property']);
    }
  });
});
