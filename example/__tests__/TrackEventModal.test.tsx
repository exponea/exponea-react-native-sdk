import { act, render } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';
import Exponea from 'react-native-exponea-sdk';

import TrackEventModal from '@/components/TrackEventModal';
import type { InAppMessagePreset } from '@/util/InAppMessagesPreset';

const mockTrackEvent = jest.spyOn(Exponea, 'trackEvent');

jest.mock('react-native-picker-select', () => 'RNPickerSelect');
jest.mock('@/components/ExponeaModal', () => 'ExponeaModal');
jest.mock('@/components/ExponeaButton', () => 'ExponeaButton');
jest.mock('@/components/ExponeaContainer', () => 'ExponeaContainer');
jest.mock('@/components/ExponeaInput', () => 'ExponeaInput');
jest.mock('@/components/PropertyEditor', () => 'PropertyEditor');

const modalProps = {
  visible: true,
  onClose: jest.fn(),
};

const modalPreset: InAppMessagePreset = {
  category: 'Core rendering',
  label: 'Modal',
  eventName: 'event_name',
  properties: { property: 'test_msg_modal' },
};

const originalPlatform = Platform.OS;

function mockComponent(name: string): ComponentType<any> {
  return name as unknown as ComponentType<any>;
}

function setPlatform(platform: 'android' | 'ios') {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: platform,
  });
}

function renderModal(eventPresets?: InAppMessagePreset[]) {
  return render(
    <TrackEventModal {...modalProps} eventPresets={eventPresets} />
  );
}

function dismissModal(screen: ReturnType<typeof render>) {
  act(() => {
    screen.UNSAFE_getByType(mockComponent('ExponeaModal')).props.onDismiss();
  });
}

function submitEvent(screen: ReturnType<typeof render>) {
  act(() => {
    screen.UNSAFE_getByType(mockComponent('ExponeaButton')).props.onPress();
  });
}

beforeEach(() => {
  mockTrackEvent.mockImplementation(() => new Promise(() => {}));
  mockTrackEvent.mockClear();
  modalProps.onClose.mockClear();
});

afterEach(() => {
  setPlatform(originalPlatform as 'android' | 'ios');
});

describe('TrackEventModal', () => {
  test('queues an iOS event until its modal host dismisses', () => {
    setPlatform('ios');
    const screen = renderModal();

    submitEvent(screen);

    expect(modalProps.onClose).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).not.toHaveBeenCalled();

    dismissModal(screen);

    expect(mockTrackEvent).toHaveBeenCalledWith('test_event', {
      event_name: 'test_event',
    });
  });

  test('submits the exact iOS preset snapshot after dismissal', () => {
    setPlatform('ios');
    const screen = renderModal([modalPreset]);

    act(() => {
      const picker = screen.UNSAFE_getByType(mockComponent('RNPickerSelect'));
      picker.props.onValueChange(picker.props.items[0].value);
    });
    submitEvent(screen);
    dismissModal(screen);

    expect(mockTrackEvent).toHaveBeenCalledWith('event_name', {
      property: 'test_msg_modal',
    });
  });

  test('does not submit when iOS modal is cancelled', () => {
    setPlatform('ios');
    const screen = renderModal();

    act(() => {
      screen.UNSAFE_getByType(mockComponent('ExponeaModal')).props.onClose();
    });
    dismissModal(screen);

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  test('does not submit twice when iOS dismissal is repeated', () => {
    setPlatform('ios');
    const screen = renderModal();

    submitEvent(screen);
    dismissModal(screen);
    dismissModal(screen);

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
  });

  test('submits immediately on Android', () => {
    setPlatform('android');
    const screen = renderModal();

    submitEvent(screen);

    expect(mockTrackEvent).toHaveBeenCalledWith('test_event', {
      event_name: 'test_event',
    });
    expect(modalProps.onClose).toHaveBeenCalledTimes(1);
  });
});
