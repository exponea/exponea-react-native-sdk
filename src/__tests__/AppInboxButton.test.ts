jest.mock('../AppInboxButtonNativeComponent', () => ({
  __esModule: true,
  default: 'AppInboxButtonNativeComponent',
}));

import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import AppInboxButton, { type AppInboxButtonProps } from '../AppInboxButton';
import AppInboxButtonNativeComponent from '../AppInboxButtonNativeComponent';

// Inspect wrapper props; navigation and platform styling belong to native tests.
function renderButton(props: AppInboxButtonProps = {}): {
  container: React.ReactElement<ViewProps>;
  button: React.ReactElement<AppInboxButtonProps>;
} {
  const container = AppInboxButton(props) as React.ReactElement<ViewProps>;
  const button = React.Children.only(
    container.props.children
  ) as React.ReactElement<AppInboxButtonProps>;
  return { container, button };
}

describe('AppInboxButton', () => {
  test('renders the native inbox button without supplying customization defaults', () => {
    const { button } = renderButton();

    expect(button.type).toBe(AppInboxButtonNativeComponent);
    expect(button.props).toEqual({ style: expect.anything() });
  });

  test('keeps caller styles on the container while the native button fills it', () => {
    const style: ViewProps['style'] = [
      { width: '100%', height: 50, margin: 8 },
      false,
      { height: 64 },
    ];
    const { container, button } = renderButton({ style });

    expect(container.type).toBe(View);
    expect(container.props.style).toBe(style);
    expect(StyleSheet.flatten(button.props.style)).toEqual({ flex: 1 });
  });

  test('forwards customization values, including explicit false flags', () => {
    const props: AppInboxButtonProps = {
      textOverride: 'Messages',
      textColor: '#123456',
      backgroundColor: '#abcdef',
      textSize: '14sp',
      borderRadius: '10dp',
      textWeight: '700',
      showIcon: false,
      enabled: false,
    };
    const { button } = renderButton(props);

    expect(button.props).toMatchObject(props);
  });

  test('forwards accessibility and interaction props to the native control', () => {
    const props: AppInboxButtonProps = {
      testID: 'app-inbox',
      accessibilityLabel: 'Open messages',
      accessibilityRole: 'button',
      accessibilityState: { disabled: true },
      pointerEvents: 'none',
      onLayout: jest.fn(),
    };
    const { button } = renderButton(props);

    expect(button.props).toMatchObject(props);
  });
});
