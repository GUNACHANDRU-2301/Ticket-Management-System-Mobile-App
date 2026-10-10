import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SectionHeader = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  style
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionText && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  textCol: {
    flex: 1,
    marginRight: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
    letterSpacing: -0.1
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 999
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700'
  }
});

export default SectionHeader;
