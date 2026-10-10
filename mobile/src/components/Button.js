import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
  accessibilityLabel
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  // Base and variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.backgroundSubtle,
          border: colors.border,
          text: colors.text
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.border,
          text: colors.text
        };
      case 'danger':
        return {
          bg: colors.danger,
          border: colors.danger,
          text: '#FFFFFF'
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: colors.primary
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: '#FFFFFF'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 7,
          paddingHorizontal: 12,
          fontSize: 12,
          radius: radius.sm
        };
      case 'lg':
        return {
          paddingVertical: 15,
          paddingHorizontal: 22,
          fontSize: 16,
          radius: radius.md
        };
      case 'md':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
          radius: radius.md
        };
    }
  };

  const v = getVariantStyles();
  const s = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderRadius: s.radius,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal
        },
        (disabled || loading) && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={v.text}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
         {icon ? (
  <View style={styles.iconContainer}>
    {typeof icon === 'string' ? (
      <Text>{icon}</Text>
    ) : (
      icon
    )}
  </View>
) : null}
          <Text
            style={[
              styles.baseText,
              {
                color: v.text,
                fontSize: s.fontSize
              },
              textStyle
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  baseText: {
    fontWeight: '700',
    letterSpacing: -0.2
  },
  disabled: {
    opacity: 0.6
  },
  spinner: {
    paddingVertical: 2
  }
});

export default Button;
