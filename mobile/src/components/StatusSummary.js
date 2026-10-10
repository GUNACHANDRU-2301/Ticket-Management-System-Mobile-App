import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import PressableScale from './PressableScale';

const StatusSummary = ({ stats = { total: 0, pending: 0, assigned: 0, closed: 0 }, onPress }) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const total = stats.total || 0;
  const closed = stats.closed || 0;
  const pending = stats.pending || 0;
  const assigned = stats.assigned || 0;
  const other = Math.max(0, total - (closed + pending + assigned));

  const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 100;

  const getPct = (val) => (total > 0 ? (val / total) * 100 : 0);
  const closedPct = getPct(closed);
  const pendingPct = getPct(pending);
  const assignedPct = getPct(assigned);
  const otherPct = getPct(other);

  const items = [
    { label: 'Closed', count: closed, pct: closedPct, color: colors.success },
    { label: 'Pending', count: pending, pct: pendingPct, color: colors.warning },
    { label: 'Assigned', count: assigned, pct: assignedPct, color: colors.accent || '#38BDF8' },
    ...(other > 0 ? [{ label: 'Other', count: other, pct: otherPct, color: colors.purple || '#7C6CFF' }] : [])
  ];

  return (
    <PressableScale
      style={[
        styles.container,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`Complaint Status: ${resolutionRate}% resolved`}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View
            style={[
              styles.headerIconBox,
              {
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                borderColor: 'rgba(99, 102, 241, 0.25)'
              }
            ]}
          >
            <Ionicons name="analytics-outline" size={15} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Complaint Status</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {total} active facility records
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.ratePill,
            {
              backgroundColor: colors.successLight,
              borderColor: colors.successBorder
            }
          ]}
        >
          <Ionicons name="checkmark-done-circle" size={13} color={colors.success} />
          <Text style={[styles.rateText, { color: colors.success }]}>
            {resolutionRate}% Resolved
          </Text>
        </View>
      </View>

      {/* Segmented Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
        ]}
      >
        {total === 0 ? (
          <View
            style={[
              styles.emptyBar,
              { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
            ]}
          />
        ) : (
          <>
            {closed > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: closed,
                    backgroundColor: colors.success
                  }
                ]}
              />
            )}
            {pending > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: pending,
                    backgroundColor: colors.warning
                  }
                ]}
              />
            )}
            {assigned > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: assigned,
                    backgroundColor: colors.accent || '#38BDF8'
                  }
                ]}
              />
            )}
            {other > 0 && (
              <View
                style={[
                  styles.barSegment,
                  {
                    flex: other,
                    backgroundColor: colors.purple || '#7C6CFF'
                  }
                ]}
              />
            )}
          </>
        )}
      </View>

      {/* Telemetry Legend Row */}
      <View style={styles.legendGrid}>
        {items.map((item) => (
          <View key={item.label} style={styles.legendCol}>
            <View style={styles.legendHeader}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </View>
            <View style={styles.legendValueRow}>
              <Text style={[styles.legendCount, { color: colors.text }]}>
                {item.count}
              </Text>
              <Text style={[styles.legendPct, { color: colors.textMuted }]}>
                {Math.round(item.pct)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9
  },
  headerIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4
  },
  rateText: {
    fontSize: 11,
    fontWeight: '700'
  },
  progressBarContainer: {
    height: 6.5,
    borderRadius: 3.5,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2.5,
    marginBottom: 12
  },
  barSegment: {
    height: '100%',
    borderRadius: 3
  },
  emptyBar: {
    flex: 1,
    height: '100%',
    borderRadius: 3
  },
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2
  },
  legendCol: {
    flex: 1
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    marginBottom: 2
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  legendValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  legendCount: {
    fontSize: 15,
    fontWeight: '800'
  },
  legendPct: {
    fontSize: 10,
    fontWeight: '500'
  }
});

export default StatusSummary;
