import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Avatar = ({
  name = 'User',
  size = 44,
  online = false,
  color,
  style
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const avatarColor = color || colors.primary;

  return (
    <View style={[{ position: 'relative' }, style]}>
      <View
        style={[
          styles.avatarCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: avatarColor,
            borderColor: 'rgba(255, 255, 255, 0.16)'
          }
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>
          {initial}
        </Text>
      </View>

      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: Math.max(size * 0.26, 9),
              height: Math.max(size * 0.26, 9),
              borderRadius: Math.max(size * 0.26, 9) / 2,
              backgroundColor: colors.success,
              borderColor: colors.background
            }
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2
  }
});

export default Avatar;
