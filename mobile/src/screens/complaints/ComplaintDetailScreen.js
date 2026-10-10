import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTechniciansApi, assignComplaintApi, updateComplaintStatusApi } from '../../api/complaints';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import StatusBadge from '../../components/StatusBadge';
import LifecycleStepper from '../../components/LifecycleStepper';
import CustomPicker from '../../components/CustomPicker';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { SERVER_BASE_URL } from '../../constants/config';
import { THEME } from '../../constants/theme';

const STATUS_ACTIONS = [
  { label: 'Pending', value: 'Pending', icon: '⏳', desc: 'Awaiting triage & technician review' },
  { label: 'Assigned', value: 'Assigned', icon: '👤', desc: 'Technician dispatched to location' },
  { label: 'In Progress', value: 'In-Progress', icon: '⚙️', desc: 'Repair work currently under way' },
  { label: 'On Hold', value: 'On-Hold', icon: '⏸️', desc: 'Awaiting replacement parts / equipment' },
  { label: 'Closed / Resolved', value: 'Completed', icon: '✅', desc: 'Repair verified & resolved' }
];

const ComplaintDetailScreen = ({ route, navigation }) => {
  const { ticket: initialTicket } = route.params;
  const { userInfo, isAdmin, isTechnician } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const [ticket, setTicket] = useState(initialTicket);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [updating, setUpdating] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const categoryInfo = THEME.categoryIcons[ticket.complaintType] || {
    icon: '📋',
    color: theme.colors.primary,
    bg: theme.colors.primaryLight,
    border: '#C7D2FE'
  };

  useEffect(() => {
    if (isAdmin) {
      const fetchTechs = async () => {
        try {
          const list = await getTechniciansApi();
          setTechnicians(list || []);
        } catch (err) {
          console.error('Error fetching technicians:', err);
        }
      };
      fetchTechs();
    }
  }, [isAdmin]);

  const handleAssign = async () => {
    if (!selectedTech) {
      Alert.alert('Selection Required', 'Please select a technician or staff member.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await assignComplaintApi(ticket._id, selectedTech);
      setTicket(updated);
      Alert.alert('Success 🎉', 'Staff member assigned to this complaint successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign staff.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (ticket.status === newStatus) return;

    setUpdating(true);
    try {
      const updated = await updateComplaintStatusApi(ticket._id, newStatus);
      setTicket((prev) => ({ ...prev, status: updated.status }));
      Alert.alert('Status Updated ✅', `Ticket status changed to "${newStatus}".`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const attachmentUrl = ticket.attachment
    ? ticket.attachment.startsWith('http')
      ? ticket.attachment
      : `${SERVER_BASE_URL}${ticket.attachment}`
    : null;

  const displayId = ticket._id ? `#TMS${ticket._id.slice(-4).toUpperCase()}` : '#TMS1000';

  return (
    <ResponsiveContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppHeader
          title="Ticket Details"
          subtitle={`${ticket.complaintType} • ${displayId}`}
          showBack={true}
          onBackPress={() => navigation.goBack()}
          showNotification={false}
          showProfile={false}
        />
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
          showsVerticalScrollIndicator={false}
        >
        {/* Top Ticket ID & Status Bar */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            },
            theme.shadows.sm
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.idRow}>
              <View
                style={[
                  styles.idChip,
                  { backgroundColor: theme.colors.primaryLight }
                ]}
              >
                <Text style={[styles.idChipText, { color: theme.colors.primary }]}>
                  {displayId}
                </Text>
              </View>
              <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
                {new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <StatusBadge status={ticket.status} size="md" />
          </View>

          <View style={styles.titleRow}>
            <View
              style={[
                styles.categoryIconCircle,
                {
                  backgroundColor: isDark ? theme.colors.card : categoryInfo.bg,
                  borderColor: categoryInfo.border
                }
              ]}
            >
              <Text style={styles.categoryEmoji}>{categoryInfo.icon}</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={[styles.ticketType, { color: theme.colors.text }]}>
                {ticket.complaintType} Issue
              </Text>
              <Text style={[styles.locationBrief, { color: theme.colors.textSecondary }]}>
                Block {ticket.blockName} • Room {ticket.roomNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIVITY / TIMELINE */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            },
            theme.shadows.sm
          ]}
        >
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            ACTIVITY / TIMELINE
          </Text>
          <LifecycleStepper currentStatus={ticket.status} />
        </View>

        {/* LOCATION DETAILS */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            },
            theme.shadows.sm
          ]}
        >
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            LOCATION
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
                CAMPUS BLOCK
              </Text>
              <Text style={[styles.infoVal, { color: theme.colors.text }]}>
                {ticket.blockName}
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
                ROOM NUMBER
              </Text>
              <Text style={[styles.infoVal, { color: theme.colors.text }]}>
                Room {ticket.roomNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* COMPLAINT DETAILS */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            },
            theme.shadows.sm
          ]}
        >
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            COMPLAINT DETAILS
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
                COMPLAINT TYPE
              </Text>
              <Text style={[styles.infoVal, { color: theme.colors.text }]}>
                {ticket.complaintType}
              </Text>
            </View>
            {ticket.department ? (
              <View style={styles.infoCol}>
                <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
                  DEPARTMENT
                </Text>
                <Text style={[styles.infoVal, { color: theme.colors.text }]}>
                  {ticket.department}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.remarksBlock}>
            <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>
              DESCRIPTION / REMARKS
            </Text>
            <View
              style={[
                styles.remarksBox,
                {
                  backgroundColor: isDark ? theme.colors.card : '#F8FAFC',
                  borderLeftColor: theme.colors.primary
                }
              ]}
            >
              <Text style={[styles.remarksText, { color: theme.colors.textSecondary }]}>
                {ticket.remarks || 'No detailed remarks provided.'}
              </Text>
            </View>
          </View>
        </View>

        {/* REPORTED BY */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            },
            theme.shadows.sm
          ]}
        >
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            REPORTED BY
          </Text>
          <View style={styles.reporterRow}>
            <Avatar
              name={ticket.raisedBy?.username || 'Facility User'}
              size={42}
            />
            <View style={styles.reporterInfo}>
              <Text style={[styles.reporterName, { color: theme.colors.text }]}>
                {ticket.raisedBy?.username || 'Facility User'}
              </Text>
              <Text style={[styles.reporterRole, { color: theme.colors.textMuted }]}>
                Role: {ticket.raisedBy?.role || 'User'}
                {ticket.department ? ` • ${ticket.department}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* ASSIGNED TECHNICIAN (IF ANY) */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            },
            theme.shadows.sm
          ]}
        >
          <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
            ASSIGNED TECHNICIAN
          </Text>
          <View style={styles.reporterRow}>
            <Avatar
              name={ticket.assignedTo?.username || ticket.assignedTo || 'Unassigned'}
              size={42}
            />
            <View style={styles.reporterInfo}>
              <Text
                style={[
                  styles.reporterName,
                  { color: ticket.assignedTo ? theme.colors.text : theme.colors.warning }
                ]}
              >
                {ticket.assignedTo?.username || ticket.assignedTo || 'Unassigned'}
              </Text>
              <Text style={[styles.reporterRole, { color: theme.colors.textMuted }]}>
                {ticket.assignedTo
                  ? 'Assigned Maintenance Staff'
                  : 'Pending technician dispatch by Administrator'}
              </Text>
            </View>
          </View>
        </View>

        {/* ATTACHMENT */}
        {attachmentUrl && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              },
              theme.shadows.sm
            ]}
          >
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              ATTACHMENT
            </Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>
              Photo captured by reporter during ticket creation
            </Text>
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.9}
              style={[styles.imageWrapper, { borderColor: theme.colors.border }]}
            >
              <Image
                source={{ uri: attachmentUrl }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
              <View style={styles.tapZoomOverlay}>
                <Text style={styles.tapZoomText}>🔍 Tap to View Full Screen</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ADMIN ASSIGNMENT SECTION */}
        {isAdmin && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              },
              theme.shadows.sm
            ]}
          >
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              ASSIGN TECHNICIAN
            </Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>
              Dispatch a registered technician or maintenance staff
            </Text>

            <CustomPicker
              placeholder="Select Technician"
              items={technicians.map((t) => ({
                label: `${t.username} (${t.role})`,
                value: t._id
              }))}
              selectedValue={selectedTech}
              onValueChange={setSelectedTech}
            />

            <Button
              title="Assign Technician"
              onPress={handleAssign}
              loading={updating}
              disabled={updating || !selectedTech}
              variant="primary"
              size="md"
              icon="person-add-outline"
            />
          </View>
        )}

        {/* STATUS TRANSITION ACTION CHIPS */}
        {(isAdmin || isTechnician) && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              },
              theme.shadows.sm
            ]}
          >
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              UPDATE COMPLAINT STATUS
            </Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>
              Advance ticket lifecycle as maintenance is carried out
            </Text>

            <View style={styles.statusChipsContainer}>
              {STATUS_ACTIONS.map((opt) => {
                const isActive = ticket.status === opt.value;
                const statusColors =
                  theme.colors.status[opt.value] || theme.colors.status.Pending;

                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.statusActionChip,
                      {
                        borderColor: isActive
                          ? theme.colors.primary
                          : isDark
                          ? theme.colors.border
                          : '#E2E8F0',
                        backgroundColor: isActive
                          ? isDark
                            ? theme.colors.card
                            : '#EEF2FF'
                          : isDark
                          ? theme.colors.surface
                          : '#FFFFFF'
                      }
                    ]}
                    onPress={() => handleStatusChange(opt.value)}
                    disabled={updating}
                    activeOpacity={0.78}
                  >
                    <View style={styles.chipRow}>
                      <Text style={styles.chipIcon}>{opt.icon}</Text>
                      <View style={styles.chipTextCol}>
                        <Text
                          style={[
                            styles.chipTitle,
                            {
                              color: isActive
                                ? theme.colors.primary
                                : theme.colors.text
                            }
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={[styles.chipDesc, { color: theme.colors.textMuted }]}>
                          {opt.desc}
                        </Text>
                      </View>
                      {isActive && (
                        <View
                          style={[
                            styles.activeDot,
                            { backgroundColor: theme.colors.primary }
                          ]}
                        >
                          <Text style={styles.activeCheckText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Full-Screen Zoom Modal */}
        {attachmentUrl && (
          <Modal
            visible={imageModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setImageModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setImageModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕ Close Preview</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: attachmentUrl }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
        </ScrollView>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  heroCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  idChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  idChipText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dateText: {
    fontSize: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  categoryIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  categoryEmoji: {
    fontSize: 22
  },
  titleCol: {
    flex: 1
  },
  ticketType: {
    fontSize: 17,
    fontWeight: '800'
  },
  locationBrief: {
    fontSize: 13,
    marginTop: 2
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  sectionSub: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    rowGap: 12
  },
  infoCol: {
    flex: 1
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 2
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700'
  },
  remarksBlock: {
    marginTop: 14
  },
  remarksBox: {
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    borderLeftWidth: 3
  },
  remarksText: {
    fontSize: 13.5,
    lineHeight: 20
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  reporterInfo: {
    flex: 1
  },
  reporterName: {
    fontSize: 14.5,
    fontWeight: '800'
  },
  reporterRole: {
    fontSize: 12,
    marginTop: 2
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
    borderWidth: 1
  },
  attachmentImage: {
    width: '100%',
    height: 200
  },
  tapZoomOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 8,
    alignItems: 'center'
  },
  tapZoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  statusChipsContainer: {
    gap: 8
  },
  statusActionChip: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  chipIcon: {
    fontSize: 18
  },
  chipTextCol: {
    flex: 1
  },
  chipTitle: {
    fontSize: 13.5,
    fontWeight: '800'
  },
  chipDesc: {
    fontSize: 11,
    marginTop: 1
  },
  activeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  fullScreenImage: {
    width: '94%',
    height: '80%'
  }
});

export default ComplaintDetailScreen;
