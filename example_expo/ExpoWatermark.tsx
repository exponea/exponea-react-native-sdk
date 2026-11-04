// Expo example only: draws a faint "EXPO" watermark over the shared example UI,
// so screenshots and recordings show which example app they come from.
//
// The watermark lives outside src/, which mirrors ../example, so the shared
// example code stays identical in both apps. It is purely visual: touches pass
// through it and it is hidden from accessibility, so UI automation such as
// test-hub neither sees nor taps it.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function withExpoWatermark<P extends object>(
  App: React.ComponentType<P>
): React.ComponentType<P> {
  function ExpoWatermarkedApp(props: P): React.ReactElement {
    return (
      <View style={styles.root}>
        <App {...props} />
        <View
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.overlay}
        >
          <Text style={styles.label}>EXPO</Text>
        </View>
      </View>
    );
  }
  return ExpoWatermarkedApp;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    // A darker shade of Bloomreach yellow (#FFD400), so the watermark stays
    // visible over the app's yellow buttons too.
    color: '#C9A700',
    fontSize: 120,
    fontWeight: '900',
    letterSpacing: 8,
    opacity: 0.3,
    transform: [{ rotate: '-30deg' }],
  },
});
