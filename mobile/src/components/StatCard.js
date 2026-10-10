import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import PressableScale from './PressableScale';

const ICON_MAP = {
  '📋': 'documents-outline',
  '⏳': 'time-outline',
  '👤': 'person-outline',
  '✅': 'checkmark-circle-outline',
  '📊': 'bar-chart-outline',
  '📈': 'trending-up-outline'
};

const StatCard = ({
  title,
  count,
  color,
  icon = 'documents-outline',
  subtitle,
  trend,
  onPress,
  style
}) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const cardColor = colors[color] || color || colors.primary;
  const iconName = ICON_MAP[icon] || icon || 'document-text-outline';

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border
        },
        style
      ]}
      accessibilityLabel={`${title}: ${count ?? 0}`}
    >
      {/* Top subtle hairline glow */}
      <View style={[styles.topAccentBar, { backgroundColor: cardColor }]} />

      {/* Header Row */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: cardColor + '15',
              borderColor: cardColor + '30'
            }
          ]}
        >
          <Ionicons name={iconName} size={15} color={cardColor} />
        </View>

        <View style={[styles.statusPill, { backgroundColor: cardColor + '10' }]}>
          <View style={[styles.pulseDot, { backgroundColor: cardColor }]} />
          <Text style={[styles.statusText, { color: cardColor }]}>
            {trend || 'Live'}
          </Text>
        </View>
      </View>

      {/* Numerical Display */}
      <View style={styles.numberRow}>
        <Text style={[styles.countText, { color: colors.text }]}>
          {count ?? 0}
        </Text>
      </View>

      {/* Footer Title & Subtitle */}
      <View style={styles.footerRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.titleText, { color: colors.textSecondary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitleText, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between'
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.85
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6.5,
    paddingVertical: 2.5,
    borderRadius: 999,
    gap: 4.5
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  numberRow: {
    marginVertical: 4
  },
  countText: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.8
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleCol: {
    flex: 1,
    marginRight: 4
  },
  titleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase'
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1
  }
});

export default StatCard;
