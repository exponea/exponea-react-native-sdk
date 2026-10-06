export interface InAppMessagePreset {
  label: string;
  category: string;
  eventName: string;
  properties: Record<string, string>;
}

const TEST_EVENT = 'event_name';
const PROPERTY_KEY = 'property';

export const inAppMessagePresets: InAppMessagePreset[] = [
  {
    label: 'Control Group',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_control_group' },
  },
  {
    label: 'Alert Rich',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_alert_rich' },
  },
  {
    label: 'Alert Legacy',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_alert_legacy' },
  },
  {
    label: 'Slide-in',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_slidein' },
  },
  {
    label: 'Modal',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_modal' },
  },
  {
    label: 'Fullscreen',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_fullscreen' },
  },
  {
    label: 'HTML',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_html' },
  },
  {
    label: 'HTML No Close',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_html_noclose' },
  },
  {
    label: 'Data Link External',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_datalink' },
  },
  {
    label: 'UL Data Link + HTML Attr',
    category: 'Core rendering',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_datalink_html_attr' },
  },
  {
    label: 'Auto Close 5s',
    category: 'Behaviour',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_autoclose' },
  },
  {
    label: 'Stop SDK',
    category: 'Behaviour',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_stop_sdk' },
  },
  {
    label: 'Stop And Restart',
    category: 'Behaviour',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_stop_restart' },
  },
  {
    label: 'GDPR Dialog',
    category: 'GDPR',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_gdpr' },
  },
  {
    label: 'GDPR No Consents Customer',
    category: 'GDPR',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_gdpr_no_consents' },
  },
  {
    label: 'AB Variant A',
    category: 'A/B testing',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_ab_variant_a' },
  },
  {
    label: 'AB Variant B',
    category: 'A/B testing',
    eventName: TEST_EVENT,
    properties: { [PROPERTY_KEY]: 'test_msg_ab_variant_b' },
  },
];
