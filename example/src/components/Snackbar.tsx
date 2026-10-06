import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface SnackbarProps {
  message: string | null;
  duration?: number;
  bottomOffset?: number;
  onDismiss?: () => void;
}

export default function Snackbar({
  message,
  duration,
  bottomOffset,
  onDismiss,
}: SnackbarProps): React.ReactElement | null {
  const [isRendered, setIsRendered] = React.useState(false);
  const isRenderedRef = React.useRef(false);
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    isRenderedRef.current = isRendered;
  }, [isRendered]);

  const clearHideTimer = React.useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const animateIn = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const animateOut = React.useCallback(
    (onComplete?: () => void) => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
        if (onComplete) {
          onComplete();
        }
      });
    },
    [opacity, translateY]
  );

  React.useEffect(() => {
    if (message) {
      setIsRendered(true);
      clearHideTimer();
      opacity.setValue(0);
      translateY.setValue(20);
      animateIn();
      hideTimerRef.current = setTimeout(() => {
        animateOut(() => {
          if (onDismiss) {
            onDismiss();
          }
        });
      }, duration ?? 2200);
    } else if (isRenderedRef.current) {
      clearHideTimer();
      animateOut();
    }
  }, [
    animateIn,
    animateOut,
    clearHideTimer,
    duration,
    message,
    onDismiss,
    opacity,
    translateY,
  ]);

  React.useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  if (!isRendered || !message || message.length === 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.overlay, { bottom: bottomOffset ?? 20 }]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  container: {
    backgroundColor: '#242424',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
  },
});
