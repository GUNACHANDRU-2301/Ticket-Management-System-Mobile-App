import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
  StatusBar
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { roomApi, departmentApi, programmeApi, blockApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import PressableScale from '../../components/PressableScale';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const RoomMasterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};
  const shadows = theme?.shadows || {};

  // Dashboard-matching design palette with safe fallbacks
  const palette = {
    background: colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    card: colors.card || colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    surface: colors.surface || colors.card || (isDark ? '#151B2D' : '#FFFFFF'),
    text: colors.text || (isDark ? '#F5F7FF' : '#151936'),
    secondary: colors.textSecondary || (isDark ? '#A8B0C5' : '#69718B'),
    muted: colors.textMuted || (isDark ? '#8D96AE' : '#8A91A7'),
    border: colors.border || (isDark ? '#283149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    warning: colors.warning || '#F5A524',
    accent: colors.accent || '#38BDF8',
    success: colors.success || '#22C55E',
    danger: colors.danger || '#EF4444'
  };

  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [departmentId, setDepartmentId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // Entrance animations matching DashboardScreen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true
      })
    ]);
    animation.start();
    return () => animation.stop();
  }, [fadeAnim, slideAnim]);

  const fetchData = useCallback(async () => {
    try {
      const [roomList, deptList, progList, blockList] = await Promise.all([
        roomApi.getAll(),
        departmentApi.getAll(),
        programmeApi.getAll(),
        blockApi.getAll()
      ]);
      setRooms(roomList || []);
      setDepartments(deptList || []);
      setProgrammes(progList || []);
      setBlocks(blockList || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load rooms.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const filteredBlocks = blocks.filter((b) => {
    const dId = b.departmentId?._id || b.departmentId;
    const pId = b.programmeId?._id || b.programmeId;
    return (!departmentId || dId === departmentId) && (!programmeId || pId === programmeId);
  });

  const openAddModal = () => {
    setEditingRoom(null);
    setDepartmentId(departments[0]?._id || '');
    setProgrammeId('');
    setBlockId(blocks[0]?._id || '');
    setRoomNumber('');
    setModalVisible(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setDepartmentId(room.departmentId?._id || room.departmentId || '');
    setProgrammeId(room.programmeId?._id || room.programmeId || '');
    setBlockId(room.blockId?._id || room.blockId || '');
    setRoomNumber(room.roomNumber);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!roomNumber.trim() || !blockId) {
      Alert.alert('Validation Error', 'Room number and campus block are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        roomNumber: roomNumber.trim(),
        blockId,
        departmentId: departmentId || undefined,
        programmeId: programmeId || undefined
      };

      if (editingRoom) {
        await roomApi.update(editingRoom._id, payload);
        Alert.alert('Success ✅', 'Room updated successfully.');
      } else {
        await roomApi.create(payload);
        Alert.alert('Success 🎉', 'New room registered.');
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save room.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await roomApi.delete(deleteTarget._id);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete room.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = rooms.filter(
    (r) =>
      r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.blockId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.departmentId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Statistics derived for the metrics section
  const uniqueBlocksCount = new Set(rooms.map((r) => r.blockId?._id || r.blockId).filter(Boolean)).size;
  const uniqueDeptsCount = new Set(rooms.map((r) => r.departmentId?._id || r.departmentId).filter(Boolean)).size;

  const metricCards = [
    {
      title: 'Total rooms',
      value: rooms.length,
      subtitle: `${filtered.length} matching`,
      icon: 'key-outline',
      color: '#5B8CFF',
      tint: 'rgba(91,140,255,0.14)'
    },
    {
      title: 'Campus blocks',
      value: uniqueBlocksCount,
      subtitle: `${blocks.length} configured`,
      icon: 'cube-outline',
      color: '#F5A524',
      tint: 'rgba(245,165,36,0.14)'
    },
    {
      title: 'Departments',
      value: uniqueDeptsCount,
      subtitle: `${departments.length} faculties`,
      icon: 'business-outline',
      color: '#22C55E',
      tint: 'rgba(34,197,94,0.14)'
    }
  ];

  return (
    <ResponsiveContainer style={{ backgroundColor: palette.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />

      <AppHeader
        title="Room Master"
        subtitle="Classrooms, laboratories & facility units"
        showBack={navigation?.canGoBack?.()}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        showNotification={false}
        showProfile={false}
      />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Dashboard-style Welcome / Hero Card */}
              <View style={styles.welcomeCard}>
                <View style={styles.welcomeGlowOne} />
                <View style={styles.welcomeGlowTwo} />

                <View style={styles.welcomeContent}>
                  <View style={styles.welcomeEyebrow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.welcomeEyebrowText}>CAMPUS SPACES DIRECTORY</Text>
                  </View>

                  <Text style={styles.welcomeTitle}>
                    Room Management
                  </Text>

                  <Text style={styles.welcomeSubtitle}>
                    Organize, track, and assign classrooms, labs, and office facilities across all blocks.
                  </Text>
                </View>

                <View style={styles.welcomeIcon}>
                  <Ionicons name="key-outline" size={28} color="#FFFFFF" />
                </View>

                <View style={styles.welcomeBottomRow}>
                  <View style={styles.welcomeStatusPill}>
                    <Ionicons name="shield-checkmark-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.welcomeStatusText}>Active Directory</Text>
                  </View>

                  <Text style={styles.welcomeDate}>
                    {filtered.length} {filtered.length === 1 ? 'room' : 'rooms'} listed
                  </Text>
                </View>
              </View>

              {/* Quick Metrics Grid */}
              <View style={styles.metricsGrid}>
                {metricCards.map((item) => (
                  <View
                    key={item.title}
                    style={[
                      styles.metricCard,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border
                      },
                      shadows.sm
                    ]}
                  >
                    <View style={styles.metricTop}>
                      <View style={[styles.metricIcon, { backgroundColor: item.tint }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                      </View>
                      <View style={[styles.metricDot, { backgroundColor: item.color }]} />
                    </View>

                    <Text style={[styles.metricValue, { color: palette.text }]}>
                      {loading ? '—' : item.value}
                    </Text>

                    <Text style={[styles.metricTitle, { color: palette.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <Text style={[styles.metricSubtitle, { color: palette.secondary }]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>

                    <View style={[styles.metricAccent, { backgroundColor: item.color }]} />
                  </View>
                ))}
              </View>

              {/* Section Header & Search + Add Bar */}
              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    All registered rooms
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: palette.secondary }]}>
                    Filter by room number, building block or department
                  </Text>
                </View>
              </View>

              <View style={styles.actionToolbar}>
                <View style={styles.searchWrapper}>
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search room, block or department..."
                  />
                </View>

                <PressableScale
                  onPress={openAddModal}
                  style={styles.addButton}
                  accessibilityLabel="Add Room"
                >
                  <Ionicons name="add" size={19} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addButtonText}>Add Room</Text>
                </PressableScale>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const blockName = item.blockId?.name || 'Unassigned Block';
            const deptName = item.departmentId?.name;
            const progName = item.programmeId?.name;

            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border
                  },
                  shadows.sm
                ]}
              >
                {/* Visual Left Accent Strip */}
                <View style={[styles.cardAccentStrip, { backgroundColor: palette.primary }]} />

                <View style={styles.cardHeader}>
                  <View style={[styles.roomIconWrapper, { backgroundColor: 'rgba(124,92,255,0.12)' }]}>
                    <Ionicons name="business-outline" size={20} color={palette.primary} />
                  </View>

                  <View style={styles.cardMainInfo}>
                    <View style={styles.roomTitleRow}>
                      <Text style={[styles.roomTitle, { color: palette.text }]}>
                        Room {item.roomNumber}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                        <View style={[styles.activeDot, { backgroundColor: palette.success }]} />
                        <Text style={[styles.statusBadgeText, { color: palette.success }]}>
                          Available
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.roomSub, { color: palette.secondary }]}>
                      Identifier #{item._id?.slice(-6).toUpperCase() || 'SPACE'}
                    </Text>
                  </View>

                  {/* Action buttons (Edit & Delete) */}
                  <View style={styles.cardActions}>
                    <PressableScale
                      onPress={() => openEditModal(item)}
                      style={[styles.actionBtn, { backgroundColor: 'rgba(124,92,255,0.12)' }]}
                      accessibilityLabel="Edit Room"
                    >
                      <Ionicons name="pencil-outline" size={16} color={palette.primary} />
                    </PressableScale>

                    <PressableScale
                      onPress={() => setDeleteTarget(item)}
                      style={[styles.actionBtn, { backgroundColor: 'rgba(239,68,68,0.12)' }]}
                      accessibilityLabel="Delete Room"
                    >
                      <Ionicons name="trash-outline" size={16} color={palette.danger} />
                    </PressableScale>
                  </View>
                </View>

                {/* Metadata Pills */}
                <View style={styles.pillRow}>
                  <View
                    style={[
                      styles.metaPill,
                      {
                        backgroundColor: isDark ? '#1C2438' : '#F1F5F9',
                        borderColor: palette.border
                      }
                    ]}
                  >
                    <Ionicons name="cube-outline" size={13} color={palette.warning} style={{ marginRight: 5 }} />
                    <Text style={[styles.metaPillText, { color: palette.text }]}>
                      {blockName}
                    </Text>
                  </View>

                  {deptName ? (
                    <View
                      style={[
                        styles.metaPill,
                        {
                          backgroundColor: isDark ? '#1C2438' : '#F1F5F9',
                          borderColor: palette.border
                        }
                      ]}
                    >
                      <Ionicons name="school-outline" size={13} color={palette.accent} style={{ marginRight: 5 }} />
                      <Text style={[styles.metaPillText, { color: palette.secondary }]} numberOfLines={1}>
                        {deptName}
                      </Text>
                    </View>
                  ) : null}

                  {progName ? (
                    <View
                      style={[
                        styles.metaPill,
                        {
                          backgroundColor: isDark ? '#1C2438' : '#F1F5F9',
                          borderColor: palette.border
                        }
                      ]}
                    >
                      <Ionicons name="book-outline" size={13} color={palette.primary} style={{ marginRight: 5 }} />
                      <Text style={[styles.metaPillText, { color: palette.secondary }]} numberOfLines={1}>
                        {progName}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View style={styles.skeletonContainer}>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </View>
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border
                  }
                ]}
              >
                <EmptyState
                  icon="key-outline"
                  title="No Rooms Found"
                  message={
                    search
                      ? 'No room entries match your search criteria.'
                      : 'No facility rooms registered yet. Click below to add one.'
                  }
                  actionLabel="+ Add New Room"
                  onAction={openAddModal}
                />
              </View>
            )
          }
        />

        {/* Add / Edit Sheet Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: palette.card, borderColor: palette.border }
              ]}
            >
              <View style={[styles.modalGrabBar, { backgroundColor: palette.border }]} />

              <View style={styles.modalHeaderRow}>
                <View style={[styles.modalIconBox, { backgroundColor: 'rgba(124,92,255,0.14)' }]}>
                  <Ionicons
                    name={editingRoom ? 'pencil-outline' : 'add-circle-outline'}
                    size={22}
                    color={palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: palette.text }]}>
                    {editingRoom ? 'Edit Room' : 'Add New Room'}
                  </Text>
                  <Text style={[styles.modalSub, { color: palette.secondary }]}>
                    Assign room identifier and map to campus infrastructure
                  </Text>
                </View>
              </View>

              <Text style={[styles.label, { color: palette.text }]}>
                Room Number / Identifier *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#101626' : '#F8FAFC',
                    borderColor: palette.border,
                    color: palette.text
                  }
                ]}
                placeholder="e.g. 101, Lab 3, Auditorium A"
                placeholderTextColor={palette.muted}
                value={roomNumber}
                onChangeText={setRoomNumber}
              />

              <CustomPicker
                label="Campus Block *"
                placeholder="Select Campus Block"
                items={(departmentId ? filteredBlocks : blocks).map((b) => ({
                  label: b.name,
                  value: b._id
                }))}
                selectedValue={blockId}
                onValueChange={setBlockId}
              />

              <CustomPicker
                label="Department (Optional)"
                placeholder="Select Department"
                items={departments.map((d) => ({
                  label: `${d.name} (${d.shortName})`,
                  value: d._id
                }))}
                selectedValue={departmentId}
                onValueChange={(val) => {
                  setDepartmentId(val);
                  setProgrammeId('');
                }}
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title={editingRoom ? 'Update Room' : 'Save Room'}
                  variant="primary"
                  onPress={handleSave}
                  loading={saving}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          visible={!!deleteTarget}
          title="Delete Room"
          message={`Are you sure you want to delete room "${deleteTarget?.roomNumber}"? This cannot be undone.`}
          confirmText="Delete Room"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmVariant="danger"
        />
      </Animated.View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48
  },

  // Dashboard-matching Welcome Banner
  welcomeCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    backgroundColor: PURPLE,
    overflow: 'hidden',
    position: 'relative'
  },
  welcomeGlowOne: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -70,
    right: -40
  },
  welcomeGlowTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(39,20,119,0.18)',
    bottom: -90,
    right: 65
  },
  welcomeContent: {
    paddingRight: 52
  },
  welcomeEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#A7F3D0',
    marginRight: 7
  },
  welcomeEyebrowText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 29
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 270
  },
  welcomeIcon: {
    position: 'absolute',
    right: 20,
    top: 22,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)'
  },
  welcomeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16
  },
  welcomeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  welcomeStatusText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    marginLeft: 5
  },
  welcomeDate: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600'
  },

  // 3-Card Metrics Row
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8
  },
  metricCard: {
    flex: 1,
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 16,
    padding: 11,
    overflow: 'hidden',
    position: 'relative'
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  metricSubtitle: {
    fontSize: 9.5,
    marginTop: 1
  },
  metricAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5
  },

  // Section Headers
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  sectionSubtitle: {
    fontSize: 11.5,
    marginTop: 2
  },

  // Action Toolbar (Search + Add Button)
  actionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14
  },
  searchWrapper: {
    flex: 1
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },

  // Room Card
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 11,
    position: 'relative',
    overflow: 'hidden'
  },
  cardAccentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  roomIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardMainInfo: {
    flex: 1
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    gap: 4
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  roomSub: {
    fontSize: 11,
    marginTop: 2
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Pill Metadata Row
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 12,
    paddingLeft: 2
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1
  },
  metaPillText: {
    fontSize: 11.5,
    fontWeight: '600'
  },

  // Empty & Skeleton Containers
  skeletonContainer: {
    gap: 12,
    marginTop: 8
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginTop: 6
  },

  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 18, 0.65)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24
  },
  modalGrabBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22
  }
});

export default RoomMasterScreen;
