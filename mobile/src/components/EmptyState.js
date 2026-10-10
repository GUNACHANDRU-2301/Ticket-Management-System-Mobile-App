import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const EmptyState = ({
  icon = '📋',
  title = 'No Data Found',
  message = 'There are no items to display at this time.',
  actionText,
  actionLabel,
  onActionPress,
  onAction,
  style
}) => {
  const { theme } = useTheme();
  const { colors, radius, shadows } = theme;

  const btnLabel = actionLabel || actionText;
  const btnHandler = onAction || onActionPress;

  return (
    <View
      style={[
        styles.container,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          borderRadius: radius.xl
        },
        style
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.backgroundSubtle,
            borderColor: colors.border
          }
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>

      {btnLabel && btnHandler ? (
        <Button
          title={btnLabel}
          onPress={btnHandler}
          size="sm"
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 12
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 14
  },
  icon: {
    fontSize: 28
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
    paddingHorizontal: 12
  },
  actionBtn: {
    marginTop: 4
  }
});

export default EmptyState;
