import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';
import AppInboxButtonNativeComponent from './AppInboxButtonNativeComponent';

export interface AppInboxButtonProps extends ViewProps {
  /**
   * Override the button text (Android only)
   */
  textOverride?: string;

  /**
   * Button text color (Android only)
   * Format: "#RRGGBB" or "#AARRGGBB"
   */
  textColor?: string;

  /**
   * Button background color (Android only)
   * Format: "#RRGGBB" or "#AARRGGBB"
   */
  backgroundColor?: string;

  /**
   * Show/hide the inbox icon (Android only)
   */
  showIcon?: boolean;

  /**
   * Text size (Android only)
   * Format: "12px" or "14sp"
   */
  textSize?: string;

  /**
   * Border radius (Android only)
   * Format: "5px" or "10dp"
   */
  borderRadius?: string;

  /**
   * Text weight/font weight (Android only)
   * Values: "bold", "normal", or numeric "100" through "900"
   */
  textWeight?: string;

  /**
   * Enable/disable the button
   */
  enabled?: boolean;
}

/**
 * AppInboxButton component
 *
 * Displays a native button that opens the App Inbox message list view when clicked.
 * The button is provided by the Exponea SDK and integrates with the App Inbox feature.
 *
 * ## Usage
 * ```tsx
 * import { AppInboxButton } from 'react-native-exponea-sdk';
 *
 * <AppInboxButton
 *   style={{ width: '100%', height: 50 }}
 *   textColor="#FFFFFF"
 *   backgroundColor="#FF0000"
 *   borderRadius="5px"
 * />
 * ```
 *
 * ## Platform Differences
 * - iOS: Only style prop is supported. Styling props are ignored.
 * - Android: All styling props are supported.
 *
 * @note Requires App Inbox to be enabled in your Exponea account.
 * @note Requires the current user to have a customer profile with a hard ID.
 */
export default function AppInboxButton(
  props: AppInboxButtonProps
): React.ReactElement {
  return (
    <View style={props.style}>
      <AppInboxButtonNativeComponent {...props} style={{ flex: 1 }} />
    </View>
  );
}
