import React, { useRef } from 'react';
import { Pressable, Animated } from 'react-native';

const PressableScale = ({
  children,
  onPress,
  onLongPress,
  scaleTo = 0.975,
  style,
  disabled = false,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
  testID
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: scaleTo,
      friction: 8,
      tension: 140,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 160,
      useNativeDriver: true
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      testID={testID}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default PressableScale;
