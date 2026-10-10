import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import PressableScale from './PressableScale';

const getCategoryMeta = (type = '', colors) => {
  const lower = type.toLowerCase();
  if (lower.includes('electr')) {
    return { icon: 'flash-outline', color: colors.warning, bg: colors.warningLight };
  }
  if (lower.includes('plumb') || lower.includes('water')) {
    return { icon: 'water-outline', color: colors.accent || '#38BDF8', bg: colors.accentLight };
  }
  if (lower.includes('it') || lower.includes('computer') || lower.includes('network')) {
    return { icon: 'desktop-outline', color: colors.primary, bg: colors.primaryLight };
  }
  if (lower.includes('ac') || lower.includes('cool') || lower.includes('air')) {
    return { icon: 'snow-outline', color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.14)' };
  }
  if (lower.includes('carpent') || lower.includes('wood')) {
    return { icon: 'construct-outline', color: '#F97316', bg: 'rgba(249, 115, 22, 0.14)' };
  }
  if (lower.includes('clean') || lower.includes('housekeep')) {
    return { icon: 'sparkles-outline', color: colors.success, bg: colors.successLight };
  }
  return { icon: 'build-outline', color: colors.primary, bg: colors.primaryLight };
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const RecentComplaintRow = ({ ticket, onPress }) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const rawStatus = ticket.status || 'Pending';
  const normalizedStatus = rawStatus === 'Completed' ? 'Closed' : rawStatus;
  const statusMeta = colors.status[rawStatus] || colors.status.Pending;
  const categoryMeta = getCategoryMeta(ticket.complaintType, colors);

  const displayTitle = ticket.remarks
    ? ticket.remarks.trim()
    : ticket.complaintType || 'Facility Issue';

  const ticketId = ticket._id ? `#${ticket._id.slice(-4).toUpperCase()}` : '#TMS';

  const locationText = [
    ticket.blockName ? `Block ${ticket.blockName}` : 'Main Campus',
    ticket.roomNumber ? `Rm ${ticket.roomNumber}` : null
  ]
    .filter(Boolean)
    .join(' • ');

  const timeAgo = formatTimeAgo(ticket.createdAt);

  return (
    <PressableScale
      style={[
        styles.row,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={onPress}
      accessibilityLabel={`Ticket ${ticketId}: ${displayTitle}, ${normalizedStatus}`}
    >
      {/* Category Vector Icon */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: categoryMeta.bg,
            borderColor: categoryMeta.color + '30'
          }
        ]}
      >
        <Ionicons name={categoryMeta.icon} size={17} color={categoryMeta.color} />
      </View>

      {/* Main Content */}
      <View style={styles.centerCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.idTag, { color: colors.primary }]}>{ticketId}</Text>
          <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
            {locationText}
          </Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.timeText, { color: colors.textMuted }]}>{timeAgo}</Text>
        </View>
      </View>

      {/* Status Badge & Chevron */}
      <View style={styles.rightCol}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusMeta.bg,
              borderColor: statusMeta.border
            }
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusMeta.dot }]} />
          <Text style={[styles.statusText, { color: statusMeta.text }]}>
            {normalizedStatus}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10.5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 7.5
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9.5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  centerCol: {
    flex: 1,
    marginRight: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2
  },
  idTag: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: '65%'
  },
  metaDot: {
    fontSize: 9
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '500'
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4
  },
  statusDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  }
});

export default RecentComplaintRow;
