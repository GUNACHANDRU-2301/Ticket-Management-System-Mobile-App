import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  userApi,
  roleApi,
  departmentApi,
  programmeApi,
} from '../../api/masters';

import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import SearchBar from '../../components/SearchBar';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const UserMasterScreen = ({ navigation }) => {
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
    success: colors.success || '#22A875',
    warning: colors.warning || '#F5A524',
  };

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // User form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [programme, setProgramme] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [userList, roleList, deptList, progList] = await Promise.all([
        userApi.getAll(),
        roleApi.getAll(),
        departmentApi.getAll(),
        programmeApi.getAll(),
      ]);

      setUsers(Array.isArray(userList) ? userList : []);
      setRoles(Array.isArray(roleList) ? roleList : []);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      setProgrammes(Array.isArray(progList) ? progList : []);
    } catch (error) {
      console.error('Error fetching user master data:', error);

      Alert.alert(
        'Unable to Load',
        'Failed to load user accounts. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isProtectedUser = (user) =>
    user?.role === 'SuperAdmin' || user?.username === 'admin';

  const getProgrammeDepartmentName = (item) => {
    const relation = item?.departmentId;

    if (relation && typeof relation === 'object') {
      return relation.name || relation.departmentName || '';
    }

    if (relation) {
      const matchingDepartment = departments.find(
        (dept) => String(dept._id) === String(relation)
      );

      if (matchingDepartment) return matchingDepartment.name || '';

      if (departments.some((dept) => dept.name === relation)) {
        return relation;
      }
    }

    return '';
  };

  const filteredProgrammes = programmes.filter((item) => {
    if (!department) return true;

    const programmeDepartment = getProgrammeDepartmentName(item);

    // Keep programmes with no department association available.
    return !programmeDepartment || programmeDepartment === department;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setPhone('');
    setEmail('');
    setRole(roles.find((item) => item.name === 'User')?.name || roles[0]?.name || '');
    setDepartment('');
    setProgramme('');
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUsername(user.username || '');
    setPassword('');
    setPhone(user.phone || '');
    setEmail(user.email || '');
    setRole(user.role || '');
    setDepartment(user.department || '');
    setProgramme(user.programme || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingUser(null);
  };

  const handleSave = async () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanUsername || !role) {
      Alert.alert(
        'Required Fields',
        'Username and role are required.'
      );
      return;
    }

    if (!editingUser && !cleanPassword) {
      Alert.alert(
        'Password Required',
        'Enter a password for the new user account.'
      );
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      // Keep the original API field names and string values.
      const payload = {
        username: cleanUsername,
        role,
        phone: cleanPhone,
        email: cleanEmail,
        department,
        programme,
      };

      // A blank password on edit leaves the existing password unchanged.
      if (cleanPassword) {
        payload.password = cleanPassword;
      }

      if (editingUser) {
        await userApi.update(editingUser._id, payload);

        Alert.alert(
          'Updated Successfully',
          'User account details have been updated.'
        );
      } else {
        await userApi.create(payload);

        Alert.alert(
          'Created Successfully',
          'New user account has been created.'
        );
      }

      setModalVisible(false);
      setEditingUser(null);

      await fetchData();
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error.response?.data?.message ||
          'Unable to save the user account. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (isProtectedUser(deleteTarget)) {
      Alert.alert(
        'Protected Account',
        'The primary administrator account cannot be deleted.'
      );
      setDeleteTarget(null);
      return;
    }

    try {
      await userApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchData();

      Alert.alert(
        'Deleted Successfully',
        'User account has been deleted.'
      );
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error.response?.data?.message ||
          'Unable to delete this user account.'
      );

      setDeleteTarget(null);
    }
  };

  const query = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    return (
      (user.username || '').toLowerCase().includes(query) ||
      (user.role || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query) ||
      (user.phone || '').toLowerCase().includes(query) ||
      (user.department || '').toLowerCase().includes(query) ||
      (user.programme || '').toLowerCase().includes(query)
    );
  });

  const roleOptions = roles.map((item) => ({
    label: item.name,
    value: item.name,
  }));

  const departmentOptions = departments.map((item) => ({
    label: item.shortName
      ? `${item.name} (${item.shortName})`
      : item.name,
    value: item.name,
  }));

  const programmeOptions = filteredProgrammes.map((item) => ({
    label: item.shortName
      ? `${item.name} (${item.shortName})`
      : item.name,
    value: item.name,
  }));

  const renderUser = ({ item, index }) => {
    const protectedUser = isProtectedUser(item);
    const superAdmin = item.role === 'SuperAdmin';

    return (
      <View
        style={[
          styles.userCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.userCardTop}>
          <Avatar name={item.username || 'User'} size={49} />

          <View style={styles.userInfo}>
            <Text
              style={[styles.username, { color: palette.text }]}
              numberOfLines={1}
            >
              {item.username || 'Unnamed User'}
            </Text>

            <Text
              style={[styles.userEmail, { color: palette.secondary }]}
              numberOfLines={1}
            >
              {item.email || 'No email provided'}
            </Text>

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: superAdmin
                      ? palette.primaryLight
                      : isDark
                        ? '#202840'
                        : '#F1F3F9',
                    borderColor: palette.border,
                  },
                ]}
              >
                <Ionicons
                  name={superAdmin ? 'shield-checkmark-outline' : 'person-outline'}
                  size={12}
                  color={superAdmin ? palette.primary : palette.secondary}
                />

                <Text
                  style={[
                    styles.roleBadgeText,
                    {
                      color: superAdmin ? palette.primary : palette.secondary,
                    },
                  ]}
                >
                  {item.role || 'No Role'}
                </Text>
              </View>

              {protectedUser && (
                <View
                  style={[
                    styles.protectedBadge,
                    { backgroundColor: isDark ? '#332A1E' : '#FFF4D8' },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={11}
                    color={palette.warning}
                  />

                  <Text
                    style={[styles.protectedText, { color: palette.warning }]}
                  >
                    Protected
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionColumn}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.username}`}
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

            {!protectedUser && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.username}`}
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

        {(item.department || item.programme || item.phone) && (
          <>
            <View
              style={[styles.cardDivider, { backgroundColor: palette.border }]}
            />

            {item.department ? (
              <View style={styles.metadataRow}>
                <Ionicons
                  name="business-outline"
                  size={15}
                  color={palette.primary}
                />

                <Text
                  style={[styles.metadataText, { color: palette.secondary }]}
                  numberOfLines={1}
                >
                  {item.department}
                </Text>
              </View>
            ) : null}

            {item.programme ? (
              <View style={[styles.metadataRow, styles.metadataSpacing]}>
                <Ionicons
                  name="school-outline"
                  size={15}
                  color={palette.primary}
                />

                <Text
                  style={[styles.metadataText, { color: palette.secondary }]}
                  numberOfLines={1}
                >
                  {item.programme}
                </Text>
              </View>
            ) : null}

            {item.phone ? (
              <View style={[styles.metadataRow, styles.metadataSpacing]}>
                <Ionicons
                  name="call-outline"
                  size={15}
                  color={palette.primary}
                />

                <Text
                  style={[styles.metadataText, { color: palette.secondary }]}
                  numberOfLines={1}
                >
                  {item.phone}
                </Text>
              </View>
            ) : null}
          </>
        )}

        <View style={[styles.cardFooter, { borderTopColor: palette.border }]}>
          <View style={styles.footerLeft}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: protectedUser
                    ? palette.warning
                    : palette.success,
                },
              ]}
            />

            <Text style={[styles.footerText, { color: palette.secondary }]}>
              {protectedUser ? 'System account' : 'Registered user'}
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
          title="Users"
          subtitle="Staff, faculty & technician accounts"
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showNotification={false}
          showProfile={false}
        />

        <FlatList
          data={loading ? [] : filteredUsers}
          keyExtractor={(item, index) => String(item._id || index)}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
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
                      name="people"
                      size={27}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={14}
                      color="#FFFFFF"
                    />

                    <Text style={styles.heroBadgeText}>USER MASTER</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>User Management</Text>

                <Text style={styles.heroDescription}>
                  Manage campus users, staff members, technicians and their
                  access roles from one place.
                </Text>

                <View style={styles.heroDivider} />

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>{users.length}</Text>
                    <Text style={styles.heroStatLabel}>Total users</Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>{roles.length}</Text>
                    <Text style={styles.heroStatLabel}>Access roles</Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {users.filter((user) => user.role === 'SuperAdmin').length}
                    </Text>
                    <Text style={styles.heroStatLabel}>Super admins</Text>
                  </View>
                </View>
              </View>

              {/* Heading */}
              <View style={styles.sectionHeading}>
                <View style={styles.headingText}>
                  <Text
                    style={[styles.sectionTitle, { color: palette.text }]}
                  >
                    All User Accounts
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: palette.secondary },
                    ]}
                  >
                    Search and manage registered users
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
                    {filteredUsers.length}
                  </Text>
                </View>
              </View>

              {/* Search and Add */}
              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search name, role, email..."
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
                      ? `${filteredUsers.length} matching account${filteredUsers.length === 1 ? '' : 's'}`
                      : 'Registered campus accounts'}
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
                    name="people-outline"
                    size={30}
                    color={palette.primary}
                  />
                </View>

                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {search ? 'No matching users' : 'No user accounts yet'}
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: palette.secondary },
                  ]}
                >
                  {search
                    ? 'Try searching with a different username, role or email.'
                    : 'Create your first account to get started.'}
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
                    {search ? 'Clear Search' : 'Add User'}
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
            <Pressable style={styles.modalBackdrop} onPress={closeModal} />

            <View
              style={[
                styles.modalContent,
                { backgroundColor: palette.surface },
              ]}
            >
              <ScrollView
                contentContainerStyle={styles.formScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalTopRow}>
                  <View
                    style={[
                      styles.modalIcon,
                      { backgroundColor: palette.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name={editingUser ? 'create-outline' : 'person-add-outline'}
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
                  {editingUser ? 'Edit User Account' : 'Create User Account'}
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: palette.secondary },
                  ]}
                >
                  {editingUser
                    ? 'Update the account details and system role.'
                    : 'Enter the user details and assign the correct access role.'}
                </Text>

                {/* Username */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Username <Text style={styles.required}>*</Text>
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
                    name="person-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="Enter username"
                    placeholderTextColor={palette.muted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                    maxLength={50}
                    returnKeyType="next"
                  />
                </View>

                {/* Password */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Password{' '}
                  <Text style={styles.required}>
                    {editingUser ? '' : '*'}
                  </Text>
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
                    name="lock-closed-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder={
                      editingUser
                        ? 'Leave blank to keep current password'
                        : 'Enter password'
                    }
                    placeholderTextColor={palette.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!saving}
                    maxLength={100}
                    returnKeyType="next"
                  />
                </View>

                {/* Role */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Access Role <Text style={styles.required}>*</Text>
                </Text>

                <CustomPicker
                  label="Role"
                  placeholder="Select Role"
                  items={roleOptions}
                  selectedValue={role}
                  onValueChange={setRole}
                  disabled={saving}
                />

                {/* Department */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Department
                  <Text style={styles.optional}> (Optional)</Text>
                </Text>

                <CustomPicker
                  label="Department"
                  placeholder="Select Department"
                  items={departmentOptions}
                  selectedValue={department}
                  onValueChange={(value) => {
                    setDepartment(value);

                    const currentProgramme = programmes.find(
                      (item) => item.name === programme
                    );

                    const programmeDepartment =
                      getProgrammeDepartmentName(currentProgramme);

                    if (
                      programme &&
                      programmeDepartment &&
                      programmeDepartment !== value
                    ) {
                      setProgramme('');
                    }
                  }}
                  disabled={saving}
                />

                {/* Programme */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Programme
                  <Text style={styles.optional}> (Optional)</Text>
                </Text>

                <CustomPicker
                  label="Programme"
                  placeholder="Select Programme"
                  items={programmeOptions}
                  selectedValue={programme}
                  onValueChange={setProgramme}
                  disabled={saving}
                />

                {/* Email */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Email Address
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
                    name="mail-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="user@campus.edu"
                    placeholderTextColor={palette.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!saving}
                    maxLength={150}
                    returnKeyType="next"
                  />
                </View>

                {/* Phone */}
                <Text style={[styles.label, { color: palette.text }]}>
                  Contact Phone
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
                    name="call-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="Enter phone number"
                    placeholderTextColor={palette.muted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!saving}
                    maxLength={20}
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
                    For an existing account, leave the password blank if
                    you do not want to change it.
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
                        : editingUser
                          ? 'Save Changes'
                          : 'Create Account'}
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
          title="Delete User Account"
          message={`Are you sure you want to delete "${deleteTarget?.username || 'this user'}"?`}
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

  userCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
  },

  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userInfo: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 5,
  },

  username: {
    fontSize: 13.5,
    fontWeight: '900',
  },

  userEmail: {
    fontSize: 10.5,
    marginTop: 5,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
  },

  protectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  protectedText: {
    fontSize: 9,
    fontWeight: '800',
  },

  actionColumn: {
    alignItems: 'center',
    gap: 7,
    marginLeft: 3,
  },

  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 12,
  },

  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metadataSpacing: {
    marginTop: 8,
  },

  metadataText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '600',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 13,
    paddingTop: 11,
  },

  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
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
    maxHeight: '90%',
    paddingTop: 22,
  },

  formScroll: {
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
    marginBottom: 15,
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

  optional: {
    fontSize: 10,
    fontWeight: '500',
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

export default UserMasterScreen;