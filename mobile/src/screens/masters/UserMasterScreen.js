import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { userApi, roleApi, departmentApi, programmeApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const UserMasterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [programme, setProgramme] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [userList, roleList, deptList, progList] = await Promise.all([
        userApi.getAll(),
        roleApi.getAll(),
        departmentApi.getAll(),
        programmeApi.getAll()
      ]);
      setUsers(userList || []);
      setRoles(roleList || []);
      setDepartments(deptList || []);
      setProgrammes(progList || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setPhone('');
    setEmail('');
    setRole(roles[0]?.name || 'User');
    setDepartment('');
    setProgramme('');
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(''); // leave blank unless updating
    setPhone(user.phone || '');
    setEmail(user.email || '');
    setRole(user.role || '');
    setDepartment(user.department || '');
    setProgramme(user.programme || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username.trim() || !role) {
      Alert.alert('Validation Error', 'Username and role are required.');
      return;
    }

    if (!editingUser && !password.trim()) {
      Alert.alert('Validation Error', 'Password is required for new accounts.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: username.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        department,
        programme
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (editingUser) {
        await userApi.update(editingUser._id, payload);
        Alert.alert('Success ✅', 'User account updated.');
      } else {
        await userApi.create(payload);
        Alert.alert('Success 🎉', 'New user account created.');
      }

      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.role === 'SuperAdmin' || deleteTarget.username === 'admin') {
      Alert.alert('Protected Account', 'The primary administrator account cannot be deleted.');
      setDeleteTarget(null);
      return;
    }

    try {
      await userApi.delete(deleteTarget._id);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ResponsiveContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader
          title="Users"
          subtitle="Staff, faculty & technician accounts"
          showBack={navigation?.canGoBack?.()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          showNotification={false}
          showProfile={false}
        />
        {/* Search & Top Action Bar */}
        <View
          style={[
            styles.topBar,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border
            }
          ]}
        >
          <View style={styles.searchWrapper}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search username, role, email..."
            />
          </View>
          <Button
            title="+ Add"
            size="sm"
            onPress={openAddModal}
            variant="primary"
          />
        </View>

        <View style={styles.counterRow}>
          <Text style={[styles.counterText, { color: theme.colors.textMuted }]}>
            Total <Text style={[styles.bold, { color: theme.colors.text }]}>{filtered.length}</Text> user accounts
          </Text>
        </View>

        {loading ? (
          <View style={styles.skeletonContainer}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSuper = item.role === 'SuperAdmin';
              const isProtected = isSuper || item.username === 'admin';

              return (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border
                    },
                    theme.shadows.sm
                  ]}
                >
                  <Avatar name={item.username} size={42} />

                  <View style={styles.info}>
                    <Text style={[styles.usernameText, { color: theme.colors.text }]}>
                      {item.username}
                    </Text>
                    <View style={styles.roleRow}>
                      <View
                        style={[
                          styles.rolePill,
                          {
                            backgroundColor: isSuper
                              ? theme.colors.primaryLight
                              : isDark
                              ? theme.colors.card
                              : '#F1F5F9',
                            borderColor: theme.colors.border
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            {
                              color: isSuper
                                ? theme.colors.primary
                                : theme.colors.textSecondary
                            }
                          ]}
                        >
                          {item.role}
                        </Text>
                      </View>
                      {item.department ? (
                        <Text style={[styles.deptText, { color: theme.colors.textMuted }]}>
                          • {item.department}
                        </Text>
                      ) : null}
                    </View>
                    {item.email ? (
                      <Text style={[styles.emailText, { color: theme.colors.textMuted }]}>
                        {item.email}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.colors.primaryLight }]}
                      onPress={() => openEditModal(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionIcon}>✏️</Text>
                    </TouchableOpacity>
                    {!isProtected && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}
                        onPress={() => setDeleteTarget(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionIcon}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No Accounts Found"
                message={
                  search
                    ? 'No user accounts match your search keyword.'
                    : 'Click "+ Add" to create a new user profile.'
                }
                actionLabel="+ Add User"
                onAction={openAddModal}
              />
            }
          />
        )}

        {/* Add / Edit Sheet Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View
                style={[
                  styles.modalGrabBar,
                  { backgroundColor: theme.colors.border }
                ]}
              />

              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editingUser ? 'Edit User Account' : 'Add New Account'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textMuted }]}>
                Manage authentication & system permissions
              </Text>

              <ScrollView
                contentContainerStyle={styles.formScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Username *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? theme.colors.card : '#F8FAFC',
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="e.g. jdoe or staff1"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />

                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Password {editingUser ? '(leave blank to keep unchanged)' : '*'}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? theme.colors.card : '#F8FAFC',
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <CustomPicker
                  label="Role *"
                  placeholder="Select Role"
                  items={roles.map((r) => ({
                    label: r.name,
                    value: r.name
                  }))}
                  selectedValue={role}
                  onValueChange={setRole}
                />

                <CustomPicker
                  label="Department (Optional)"
                  placeholder="Select Department"
                  items={departments.map((d) => ({
                    label: `${d.name} (${d.shortName})`,
                    value: d.name
                  }))}
                  selectedValue={department}
                  onValueChange={setDepartment}
                />

                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Email Address
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? theme.colors.card : '#F8FAFC',
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="user@campus.edu"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Contact Phone
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? theme.colors.card : '#F8FAFC',
                      borderColor: theme.colors.border,
                      color: theme.colors.text
                    }
                  ]}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                <View style={styles.modalBtnRow}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Save Account"
                    variant="primary"
                    onPress={handleSave}
                    loading={saving}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          visible={!!deleteTarget}
          title="Delete Account"
          message={`Are you sure you want to delete user "${deleteTarget?.username}"?`}
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
    flex: 1
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10
  },
  searchWrapper: {
    flex: 1
  },
  counterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  counterText: {
    fontSize: 12.5
  },
  bold: {
    fontWeight: '800'
  },
  skeletonContainer: {
    padding: 16,
    gap: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1
  },
  info: {
    flex: 1,
    marginLeft: 12
  },
  usernameText: {
    fontSize: 14.5,
    fontWeight: '800'
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1
  },
  roleText: {
    fontSize: 10.5,
    fontWeight: '800'
  },
  deptText: {
    fontSize: 12
  },
  emailText: {
    fontSize: 11.5,
    marginTop: 3
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionIcon: {
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%'
  },
  modalGrabBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900'
  },
  modalSub: {
    fontSize: 12.5,
    marginTop: 2,
    marginBottom: 10
  },
  formScroll: {
    paddingBottom: 24
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20
  }
});

export default UserMasterScreen;
