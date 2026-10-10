import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from './StatusBadge';

const TicketCard = ({ ticket, onPress }) => {
  const { theme } = useTheme();
  const { colors, radius, shadows } = theme;

  const normalizedStatus = ticket.status === 'Closed' ? 'Completed' : (ticket.status || 'Pending');
  const statusInfo = colors.status[normalizedStatus] || colors.status.Pending;

  const categoryInfo = theme.categoryIcons[ticket.complaintType] || {
    icon: '📋',
    color: colors.primary,
    bg: colors.primaryLight,
    border: colors.border
  };

  const dateStr = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Recently';

  const tmsId = ticket._id ? `#TMS${ticket._id.slice(-4).toUpperCase()}` : '#TMS1024';
  const initialLetter = ticket.raisedBy?.username?.charAt(0).toUpperCase() || 'U';
  const assignedName = ticket.assignedTo?.username || ticket.assignedTo;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg
        }
      ]}
      onPress={onPress}
      activeOpacity={0.84}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${tmsId}: ${ticket.complaintType}`}
    >
      {/* Left status accent strip */}
      <View style={[styles.leftAccentBar, { backgroundColor: statusInfo.dot }]} />

      <View style={styles.cardInner}>
        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.categoryBox,
                {
                  backgroundColor: categoryInfo.bg,
                  borderColor: categoryInfo.border,
                  borderRadius: radius.md
                }
              ]}
            >
              <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            </View>

            <View style={styles.titleWrapper}>
              <View style={styles.idRow}>
                <Text style={[styles.tmsIdText, { color: colors.primary }]}>{tmsId}</Text>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>• {dateStr}</Text>
              </View>
              <Text style={[styles.typeText, { color: colors.text }]} numberOfLines={1}>
                {ticket.complaintType || 'Facility Issue'}
              </Text>
            </View>
          </View>

          <StatusBadge status={normalizedStatus} size="small" />
        </View>

        {/* Location & Department Metadata Chips */}
        <View style={styles.locationChipContainer}>
          <View
            style={[
              styles.locationPill,
              {
                backgroundColor: colors.backgroundSubtle,
                borderColor: colors.border,
                borderRadius: radius.sm
              }
            ]}
          >
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {ticket.blockName ? `Block ${ticket.blockName}` : 'Campus Block'} • Rm {ticket.roomNumber || '—'}
            </Text>
          </View>

          {ticket.department ? (
            <View
              style={[
                styles.deptChip,
                {
                  backgroundColor: colors.primaryLight,
                  borderRadius: radius.sm
                }
              ]}
            >
              <Text style={[styles.deptChipText, { color: colors.primary }]}>
                {ticket.department}
              </Text>
            </View>
          ) : null}

          {ticket.attachment ? (
            <View
              style={[
                styles.attachmentChip,
                {
                  backgroundColor: colors.successLight,
                  borderRadius: radius.sm
                }
              ]}
            >
              <Text style={[styles.attachmentText, { color: colors.successDark }]}>
                📷 Photo Proof
              </Text>
            </View>
          ) : null}
        </View>

        {/* Remarks preview snippet */}
        {ticket.remarks ? (
          <View
            style={[
              styles.remarksBox,
              {
                backgroundColor: colors.backgroundSubtle,
                borderLeftColor: colors.primary,
                borderRadius: radius.sm
              }
            ]}
          >
            <Text
              style={[styles.remarksText, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              "{ticket.remarks}"
            </Text>
          </View>
        ) : null}

        {/* Footer Row */}
        <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
          <View style={styles.userRow}>
            <View
              style={[
                styles.userAvatarCircle,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.border
                }
              ]}
            >
              <Text style={[styles.userAvatarText, { color: colors.primary }]}>
                {initialLetter}
              </Text>
            </View>
            <View style={styles.userMetaCol}>
              <Text style={[styles.raisedByText, { color: colors.text }]} numberOfLines={1}>
                Reported by: <Text style={styles.bold}>{ticket.raisedBy?.username || 'Facility User'}</Text>
              </Text>
              {assignedName ? (
                <Text style={[styles.assignedToText, { color: colors.infoDark }]} numberOfLines={1}>
                  Tech: {assignedName}
                </Text>
              ) : (
                <Text style={[styles.unassignedText, { color: colors.warningDark }]}>
                  ⚠️ Unassigned
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actionLinkRow}>
            <Text style={[styles.detailsChevron, { color: colors.primary }]}>Details</Text>
            <Text style={[styles.arrowIcon, { color: colors.primary }]}>›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  leftAccentBar: {
    width: 4
  },
  cardInner: {
    flex: 1,
    padding: 14
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8
  },
  categoryBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  categoryIcon: {
    fontSize: 18
  },
  titleWrapper: {
    justifyContent: 'center',
    flex: 1
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  tmsIdText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600'
  },
  typeText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 1
  },
  locationChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    gap: 4
  },
  locationIcon: {
    fontSize: 11
  },
  locationText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  deptChip: {
    paddingHorizontal: 8,
    paddingVertical: 3.5
  },
  deptChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  attachmentChip: {
    paddingHorizontal: 8,
    paddingVertical: 3.5
  },
  attachmentText: {
    fontSize: 11,
    fontWeight: '700'
  },
  remarksBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderLeftWidth: 2.5
  },
  remarksText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  userAvatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  userAvatarText: {
    fontSize: 11,
    fontWeight: '800'
  },
  userMetaCol: {
    flex: 1
  },
  raisedByText: {
    fontSize: 11.5
  },
  bold: {
    fontWeight: '700'
  },
  assignedToText: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1
  },
  unassignedText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  detailsChevron: {
    fontSize: 11.5,
    fontWeight: '800'
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '800'
  }
});

export default TicketCard;
