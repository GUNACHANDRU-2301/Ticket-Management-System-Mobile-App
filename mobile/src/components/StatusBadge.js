import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const StatusBadge = ({ status, size = 'medium' }) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  const normalizedStatus = status === 'Closed' ? 'Completed' : (status || 'Pending');
  const statusInfo = colors.status[normalizedStatus] || colors.status.Pending;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusInfo.bg,
          borderColor: statusInfo.border,
          borderRadius: radius.full
        },
        isSmall && styles.badgeSmall
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: statusInfo.dot },
          isSmall && styles.dotSmall
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: statusInfo.text },
          isSmall && styles.textSmall
        ]}
      >
        {statusInfo.label || normalizedStatus}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start'
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4
  },
  dot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  text: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  textSmall: {
    fontSize: 10.5
  }
});

export default StatusBadge;
