import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const ErrorState = ({
  title = 'Unable to connect to server',
  message = 'Please check your internet connection or server status and try again.',
  onRetry,
  style
}) => {
  const { theme } = useTheme();
  const { colors, radius, shadows } = theme;

  return (
    <View
      style={[
        styles.container,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.dangerBorder,
          borderRadius: radius.xl
        },
        style
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.dangerLight,
            borderColor: colors.dangerBorder
          }
        ]}
      >
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>

      {onRetry && (
        <Button
          title="Retry"
          onPress={onRetry}
          variant="primary"
          size="sm"
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.2,
    marginVertical: 14
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12
  },
  icon: {
    fontSize: 26
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6
  },
  message: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 16
  },
  retryBtn: {
    paddingHorizontal: 24
  }
});

export default ErrorState;
