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

import { roleApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const PROTECTED_ROLES = ['SuperAdmin', 'Admin', 'User'];

const RoleMasterScreen = ({ navigation }) => {
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
    warning: colors.warning || '#F5A524',
    success: colors.success || '#22A875',
  };

  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [name, setName] = useState('');

  const fetchRoles = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await roleApi.getAll();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading roles:', error);

      Alert.alert(
        'Unable to Load',
        'Failed to load system roles. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const isProtectedRole = (role) =>
    PROTECTED_ROLES.includes(role?.name);

  const openAddModal = () => {
    setEditingRole(null);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setName(role.name || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingRole(null);
  };

  const handleSave = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      Alert.alert('Required Field', 'Role name is required.');
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      if (editingRole) {
        await roleApi.update(editingRole._id, {
          name: cleanName,
        });

        Alert.alert(
          'Updated Successfully',
          'Role details have been updated.'
        );
      } else {
        await roleApi.create({
          name: cleanName,
        });

        Alert.alert(
          'Created Successfully',
          'New system role has been added.'
        );
      }

      setModalVisible(false);
      setEditingRole(null);

      await fetchRoles();
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error.response?.data?.message ||
          'Unable to save role. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (isProtectedRole(deleteTarget)) {
      Alert.alert(
        'Protected Role',
        'Default system roles cannot be deleted.'
      );

      setDeleteTarget(null);
      return;
    }

    try {
      await roleApi.delete(deleteTarget._id);

      setDeleteTarget(null);
      await fetchRoles();

      Alert.alert(
        'Deleted Successfully',
        'Role has been deleted.'
      );
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error.response?.data?.message ||
          'Unable to delete this role. Please try again.'
      );

      setDeleteTarget(null);
    }
  };

  const query = search.trim().toLowerCase();

  const filteredRoles = roles.filter((role) =>
    (role.name || '').toLowerCase().includes(query)
  );

  const getRoleIcon = (roleName) => {
    switch ((roleName || '').toLowerCase()) {
      case 'superadmin':
        return 'shield-checkmark-outline';
      case 'admin':
        return 'shield-outline';
      case 'user':
        return 'person-outline';
      case 'networking staff':
        return 'wifi-outline';
      case 'plumber':
        return 'water-outline';
      case 'electrician':
        return 'flash-outline';
      case 'software developer':
        return 'code-slash-outline';
      default:
        return 'briefcase-outline';
    }
  };

  const renderRole = ({ item, index }) => {
    const protectedRole = isProtectedRole(item);
    const iconName = getRoleIcon(item.name);

    return (
      <View
        style={[
          styles.roleCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.cardMain}>
          <View
            style={[
              styles.roleIcon,
              {
                backgroundColor: protectedRole
                  ? palette.primaryLight
                  : isDark
                    ? '#202840'
                    : '#F0F2FA',
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={25}
              color={protectedRole ? palette.primary : palette.secondary}
            />
          </View>

          <View style={styles.roleInfo}>
            <Text
              style={[styles.roleName, { color: palette.text }]}
              numberOfLines={2}
            >
              {item.name || 'Unnamed Role'}
            </Text>

            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: protectedRole
                    ? palette.primaryLight
                    : isDark
                      ? '#243127'
                      : '#E6F8EF',
                },
              ]}
            >
              <Ionicons
                name={
                  protectedRole
                    ? 'lock-closed-outline'
                    : 'checkmark-circle-outline'
                }
                size={12}
                color={protectedRole ? palette.primary : palette.success}
              />

              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color: protectedRole
                      ? palette.primary
                      : palette.success,
                  },
                ]}
              >
                {protectedRole ? 'SYSTEM ROLE' : 'CUSTOM ROLE'}
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

            {!protectedRole && (
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
            )}
          </View>
        </View>

        <View
          style={[styles.cardDivider, { backgroundColor: palette.border }]}
        />

        <View style={styles.cardFooter}>
          <View style={styles.footerMeta}>
            <Ionicons
              name="key-outline"
              size={14}
              color={palette.muted}
            />

            <Text
              style={[styles.footerText, { color: palette.secondary }]}
            >
              {protectedRole
                ? 'Default access role'
                : 'Custom service role'}
            </Text>
          </View>

          <Text style={[styles.indexText, { color: palette.muted }]}>
            #{String(index + 1).padStart(2, '0')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ResponsiveContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />

      <View
        style={[
          styles.container,
          { backgroundColor: palette.background },
        ]}
      >
        <AppHeader
          title="Roles"
          subtitle="User roles & system permissions"
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showNotification={false}
          showProfile={false}
        />

        <FlatList
          data={loading ? [] : filteredRoles}
          keyExtractor={(item, index) => String(item._id || index)}
          renderItem={renderRole}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRoles(true)}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Hero */}
              <View style={styles.heroCard}>
                <View style={styles.heroCircleOne} />
                <View style={styles.heroCircleTwo} />

                <View style={styles.heroTopRow}>
                  <View style={styles.heroIcon}>
                    <Ionicons
                      name="shield-checkmark"
                      size={27}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={14}
                      color="#FFFFFF"
                    />

                    <Text style={styles.heroBadgeText}>ACCESS CONTROL</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>Role Management</Text>

                <Text style={styles.heroDescription}>
                  Organise access roles for administrators, campus users
                  and maintenance staff.
                </Text>

                <View style={styles.heroDivider} />

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {roles.length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Total roles</Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {roles.filter(isProtectedRole).length}
                    </Text>
                    <Text style={styles.heroStatLabel}>System roles</Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {roles.filter((item) => !isProtectedRole(item)).length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Custom roles</Text>
                  </View>
                </View>
              </View>

              {/* Heading */}
              <View style={styles.sectionHeading}>
                <View style={styles.headingText}>
                  <Text
                    style={[styles.sectionTitle, { color: palette.text }]}
                  >
                    All System Roles
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: palette.secondary },
                    ]}
                  >
                    Search and manage role definitions
                  </Text>
                </View>

                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      { color: palette.primary },
                    ]}
                  >
                    {filteredRoles.length}
                  </Text>
                </View>
              </View>

              {/* Search & Add */}
              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search roles..."
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: palette.primary },
                  ]}
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

                  <Text
                    style={[styles.resultText, { color: palette.secondary }]}
                  >
                    {search
                      ? `${filteredRoles.length} matching role${filteredRoles.length === 1 ? '' : 's'}`
                      : 'Registered access roles'}
                  </Text>
                </View>

                {!!search && (
                  <Pressable onPress={() => setSearch('')}>
                    <Text
                      style={[styles.clearText, { color: palette.primary }]}
                    >
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
                    name="shield-outline"
                    size={30}
                    color={palette.primary}
                  />
                </View>

                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {search ? 'No matching roles' : 'No roles available'}
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: palette.secondary },
                  ]}
                >
                  {search
                    ? 'Try searching with another role name.'
                    : 'Add a custom role to organise system access.'}
                </Text>

                <TouchableOpacity
                  onPress={search ? () => setSearch('') : openAddModal}
                  style={[
                    styles.emptyAction,
                    { backgroundColor: palette.primary },
                  ]}
                >
                  <Ionicons
                    name={search ? 'search-outline' : 'add'}
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.emptyActionText}>
                    {search ? 'Clear Search' : 'Add Role'}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* Add / Edit Modal */}
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
                      name={editingRole ? 'create-outline' : 'shield-outline'}
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
                    <Ionicons
                      name="close"
                      size={21}
                      color={palette.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalTitle, { color: palette.text }]}>
                  {editingRole ? 'Edit System Role' : 'Add New Role'}
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: palette.secondary },
                  ]}
                >
                  Define a clear role name for the TMS access-control system.
                </Text>

                <Text style={[styles.label, { color: palette.text }]}>
                  Role Name <Text style={styles.required}>*</Text>
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
                    name="shield-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="e.g. Electrician, Plumber"
                    placeholderTextColor={palette.muted}
                    value={name}
                    onChangeText={setName}
                    editable={!saving}
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={60}
                    returnKeyType="done"
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
                    Default system roles cannot be deleted. Make sure the
                    new role name accurately reflects its intended use.
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={closeModal}
                    disabled={saving}
                    style={[
                      styles.cancelButton,
                      { borderColor: palette.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        { color: palette.text },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={[
                      styles.saveButton,
                      { backgroundColor: palette.primary },
                      saving && { opacity: 0.6 },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text style={styles.saveButtonText}>
                      {saving
                        ? 'Saving...'
                        : editingRole
                          ? 'Save Changes'
                          : 'Create Role'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete confirmation */}
        <ConfirmDialog
          visible={!!deleteTarget}
          title="Delete Role"
          message={`Are you sure you want to delete "${deleteTarget?.name || 'this role'}"?`}
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

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  heroBadgeText: {
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
    fontSize: 22,
    fontWeight: '900',
  },

  heroStatLabel: {
    color: '#E8E2FF',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },

  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 13,
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

  roleCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
  },

  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  roleInfo: {
    flex: 1,
    paddingRight: 5,
  },

  roleName: {
    fontSize: 13.5,
    fontWeight: '900',
    lineHeight: 19,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 7,
  },

  roleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
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
    gap: 7,
  },

  footerText: {
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
    maxWidth: 270,
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
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3,6,18,0.4)',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3,6,18,0.35)',
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
    marginTop: 14,
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

  cancelButton: {
    minHeight: 48,
    paddingHorizontal: 15,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },

  saveButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});

export default RoleMasterScreen;