
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';

import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { departmentApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const DepartmentMasterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};

  const palette = {
    background: colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    surface: colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    card: colors.card || colors.surface || '#FFFFFF',
    text: colors.text || (isDark ? '#F5F7FF' : '#171936'),
    secondary: colors.textSecondary || (isDark ? '#A4ADC4' : '#737B93'),
    muted: colors.textMuted || (isDark ? '#8A93AA' : '#8A91A7'),
    border: colors.border || (isDark ? '#293149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    primaryLight: colors.primaryLight || (isDark ? '#292344' : '#EEE8FF'),
    danger: colors.danger || '#EF4444',
    dangerLight: colors.dangerLight || (isDark ? '#3B202B' : '#FEECEE'),
  };

  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepartments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await departmentApi.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      Alert.alert('Unable to Load', 'Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setShortName('');
    setModalVisible(true);
  };

  const openEditModal = (department) => {
    setEditingDept(department);
    setName(department.name || '');
    setShortName(department.shortName || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalVisible(false);
    setEditingDept(null);
  };

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanShortName = shortName.trim().toUpperCase();

    if (!cleanName || !cleanShortName) {
      Alert.alert(
        'Required Fields',
        'Department name and short code are required.'
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const payload = {
        name: cleanName,
        shortName: cleanShortName,
      };

      if (editingDept) {
        await departmentApi.update(editingDept._id, payload);
        Alert.alert('Updated Successfully', 'Department details have been updated.');
      } else {
        await departmentApi.create(payload);
        Alert.alert('Created Successfully', 'New department has been added.');
      }

      setModalVisible(false);
      setEditingDept(null);
      await fetchDepartments();
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error.response?.data?.message || 'Unable to save department. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await departmentApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchDepartments();
      Alert.alert('Deleted', 'Department has been deleted successfully.');
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error.response?.data?.message || 'Unable to delete this department.'
      );
      setDeleteTarget(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = departments.filter((department) => {
    const departmentName = (department.name || '').toLowerCase();
    const code = (department.shortName || '').toLowerCase();

    return (
      departmentName.includes(normalizedSearch) ||
      code.includes(normalizedSearch)
    );
  });

  const renderDepartment = ({ item, index }) => (
    <View
      style={[
        styles.departmentCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.cardMain}>
        <View
          style={[
            styles.departmentIcon,
            { backgroundColor: palette.primaryLight },
          ]}
        >
          <Ionicons
            name="business-outline"
            size={24}
            color={palette.primary}
          />
        </View>

        <View style={styles.departmentInfo}>
          <Text
            style={[styles.departmentName, { color: palette.text }]}
            numberOfLines={2}
          >
            {item.name || 'Unnamed Department'}
          </Text>

          <View
            style={[
              styles.codeBadge,
              {
                backgroundColor: isDark ? '#202840' : '#F4F1FF',
                borderColor: palette.border,
              },
            ]}
          >
            <Ionicons
              name="pricetag-outline"
              size={12}
              color={palette.primary}
            />

            <Text style={[styles.codeText, { color: palette.primary }]}>
              {item.shortName || 'NO CODE'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.name}`}
            style={[
              styles.actionButton,
              { backgroundColor: palette.primaryLight },
            ]}
            onPress={() => openEditModal(item)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={palette.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
            style={[
              styles.actionButton,
              { backgroundColor: palette.dangerLight },
            ]}
            onPress={() => setDeleteTarget(item)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={palette.danger}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: palette.border }]} />

      <View style={styles.cardFooter}>
        <View style={styles.footerMeta}>
          <Ionicons
            name="layers-outline"
            size={14}
            color={palette.muted}
          />
          <Text style={[styles.footerMetaText, { color: palette.secondary }]}>
            Academic Department
          </Text>
        </View>

        <Text style={[styles.indexText, { color: palette.muted }]}>
          #{String(index + 1).padStart(2, '0')}
        </Text>
      </View>
    </View>
  );

  return (
    <ResponsiveContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />

      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <AppHeader
          title="Departments"
          subtitle="Academic faculties & divisions"
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          showNotification={false}
          showProfile={false}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderDepartment}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchDepartments(true)}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Premium hero */}
              <View style={styles.heroCard}>
                <View style={styles.heroCircleOne} />
                <View style={styles.heroCircleTwo} />

                <View style={styles.heroTopRow}>
                  <View style={styles.heroIcon}>
                    <Ionicons
                      name="business"
                      size={27}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.heroCountBadge}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={15}
                      color="#FFFFFF"
                    />
                    <Text style={styles.heroCountText}>MASTER DATA</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>Department Management</Text>

                <Text style={styles.heroDescription}>
                  Organise academic departments and maintain their official
                  department codes in one place.
                </Text>

                <View style={styles.heroDivider} />

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {departments.length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Total departments</Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {filtered.length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Showing results</Text>
                  </View>
                </View>
              </View>

              {/* Search */}
              <View style={styles.sectionHeading}>
                <View style={styles.headingText}>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    All Departments
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: palette.secondary },
                    ]}
                  >
                    Search, edit or add departments
                  </Text>
                </View>

                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Text style={[styles.countBadgeText, { color: palette.primary }]}>
                    {filtered.length}
                  </Text>
                </View>
              </View>

              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search name or code..."
                  />
                </View>

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: palette.primary }]}
                  onPress={openAddModal}
                  activeOpacity={0.82}
                >
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.resultRow}>
                <View style={styles.resultLeft}>
                  <View
                    style={[
                      styles.resultDot,
                      { backgroundColor: palette.primary },
                    ]}
                  />
                  <Text style={[styles.resultText, { color: palette.secondary }]}>
                    {search
                      ? `${filtered.length} matching department${filtered.length === 1 ? '' : 's'}`
                      : 'Registered academic departments'}
                  </Text>
                </View>

                {!!search && (
                  <Pressable onPress={() => setSearch('')}>
                    <Text style={[styles.clearText, { color: palette.primary }]}>
                      Clear search
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          }
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
                    borderColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={30}
                    color={palette.primary}
                  />
                </View>

                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {search ? 'No matching departments' : 'No departments yet'}
                </Text>

                <Text style={[styles.emptyDescription, { color: palette.secondary }]}>
                  {search
                    ? 'Try another department name or short code.'
                    : 'Add your first department to start organising the campus.'}
                </Text>

                {search ? (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    style={[styles.emptyAction, { backgroundColor: palette.primaryLight }]}
                  >
                    <Text style={[styles.emptyActionText, { color: palette.primary }]}>
                      Clear search
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={openAddModal}
                    style={[styles.emptyAction, { backgroundColor: palette.primary }]}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.emptyActionPrimaryText}>
                      Add Department
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          }
        />

        {/* Add / Edit modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
          statusBarTranslucent
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={closeModal}
            />

            <View
              style={[
                styles.modalContent,
                { backgroundColor: palette.surface },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalTopRow}>
                  <View
                    style={[
                      styles.modalIcon,
                      { backgroundColor: palette.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name={editingDept ? 'create-outline' : 'business-outline'}
                      size={25}
                      color={palette.primary}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={closeModal}
                    disabled={saving}
                    style={[
                      styles.closeButton,
                      { backgroundColor: palette.background },
                    ]}
                  >
                    <Ionicons name="close" size={21} color={palette.secondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalTitle, { color: palette.text }]}>
                  {editingDept ? 'Edit Department' : 'Add New Department'}
                </Text>

                <Text style={[styles.modalSubtitle, { color: palette.secondary }]}>
                  {editingDept
                    ? 'Update the department information below.'
                    : 'Enter the official department name and short code.'}
                </Text>

                <Text style={[styles.label, { color: palette.text }]}>
                  Department Name <Text style={styles.required}>*</Text>
                </Text>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="e.g. Computer Applications"
                    placeholderTextColor={palette.muted}
                    value={name}
                    onChangeText={setName}
                    editable={!saving}
                    autoCapitalize="words"
                    returnKeyType="next"
                    maxLength={100}
                  />
                </View>

                <Text style={[styles.label, { color: palette.text }]}>
                  Department Short Code <Text style={styles.required}>*</Text>
                </Text>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="e.g. MCA"
                    placeholderTextColor={palette.muted}
                    value={shortName}
                    onChangeText={(value) =>
                      setShortName(value.replace(/\s/g, '').toUpperCase())
                    }
                    editable={!saving}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    maxLength={15}
                  />
                </View>

                <View
                  style={[
                    styles.hintBox,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={palette.primary}
                  />

                  <Text style={[styles.hintText, { color: palette.primary }]}>
                    Use a short, memorable code such as MCA, BCA or CSE.
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <View style={styles.modalButton}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={closeModal}
                      disabled={saving}
                    />
                  </View>

                  <View style={styles.modalButton}>
                    <Button
                      title={editingDept ? 'Save Changes' : 'Create Department'}
                      variant="primary"
                      onPress={handleSave}
                      loading={saving}
                      disabled={saving}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete confirmation */}
        <ConfirmDialog
          visible={!!deleteTarget}
          title="Delete Department"
          message={`Are you sure you want to delete "${deleteTarget?.name || 'this department'}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmVariant="danger"
        />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 35,
    flexGrow: 1,
  },

  heroCard: {
    backgroundColor: PURPLE,
    borderRadius: 25,
    padding: 20,
    marginBottom: 26,
    overflow: 'hidden',
  },

  heroCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -115,
    right: -55,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 73,
    bottom: -95,
    left: 75,
    backgroundColor: 'rgba(30,15,95,0.18)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  heroIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  heroCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  heroCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  heroDescription: {
    color: '#E8E2FF',
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 310,
  },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 20,
    marginBottom: 16,
  },

  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroStatItem: {
    flex: 1,
  },

  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },

  heroStatLabel: {
    color: '#E8E2FF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },

  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 22,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  headingText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  countBadge: {
    minWidth: 38,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  countBadgeText: {
    fontSize: 13,
    fontWeight: '900',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  searchContainer: {
    flex: 1,
  },

  addButton: {
    minHeight: 45,
    paddingHorizontal: 13,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 7,
  },

  resultDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  resultText: {
    fontSize: 10.5,
    fontWeight: '600',
  },

  clearText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
  },

  departmentCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
  },

  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  departmentIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  departmentInfo: {
    flex: 1,
    paddingRight: 5,
  },

  departmentName: {
    fontSize: 13.5,
    fontWeight: '900',
    lineHeight: 19,
  },

  codeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 7,
  },

  codeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginLeft: 4,
  },

  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 11,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  footerMetaText: {
    fontSize: 10,
    fontWeight: '600',
  },

  indexText: {
    fontSize: 10,
    fontWeight: '800',
  },

  skeletonContainer: {
    gap: 12,
    paddingTop: 4,
  },

  emptyCard: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 5,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 260,
  },

  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
  },

  emptyActionText: {
    fontSize: 11,
    fontWeight: '900',
  },

  emptyActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3,6,18,0.65)',
  },

  modalContent: {
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    maxHeight: '88%',
    paddingTop: 22,
  },

  modalScrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  modalSubtitle: {
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
    marginBottom: 20,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 12,
  },

  required: {
    color: '#EF4444',
  },

  inputWrapper: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 12,
  },

  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },

  hintText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },

  modalButton: {
    flex: 1,
  },
});

export default DepartmentMasterScreen;
