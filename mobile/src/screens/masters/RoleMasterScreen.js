import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { roleApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const RoleMasterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      const data = await roleApi.getAll();
      setRoles(data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setEditingRole(null);
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setName(role.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Role name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingRole) {
        await roleApi.update(editingRole._id, { name: name.trim() });
        Alert.alert('Success ✅', 'Role updated successfully.');
      } else {
        await roleApi.create({ name: name.trim() });
        Alert.alert('Success 🎉', 'New role added.');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (['SuperAdmin', 'Admin', 'User'].includes(deleteTarget.name)) {
      Alert.alert('Protected Role', 'Default system roles cannot be deleted.');
      setDeleteTarget(null);
      return;
    }

    try {
      await roleApi.delete(deleteTarget._id);
      fetchRoles();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete role.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = roles.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ResponsiveContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader
          title="Roles"
          subtitle="User roles & system permissions"
          showBack={navigation?.canGoBack?.()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          showNotification={false}
          showProfile={false}
        />
        {/* Top Search & Add Bar */}
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
              placeholder="Search user roles..."
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
            Total <Text style={[styles.bold, { color: theme.colors.text }]}>{filtered.length}</Text> system roles
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
              const isProtected = ['SuperAdmin', 'Admin', 'User'].includes(item.name);

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
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: theme.colors.dangerLight }
                    ]}
                  >
                    <Text style={styles.iconText}>🔑</Text>
                  </View>

                  <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    <View
                      style={[
                        styles.roleTag,
                        {
                          backgroundColor: isProtected
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
                          styles.roleTagText,
                          {
                            color: isProtected
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        ]}
                      >
                        {isProtected ? 'System Core Role' : 'Custom Service Role'}
                      </Text>
                    </View>
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
                icon="shield-checkmark-outline"
                title="No Roles Found"
                message={
                  search
                    ? 'No roles match your search keyword.'
                    : 'Click "+ Add" to create a new access role.'
                }
                actionLabel="+ Add Role"
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
                {editingRole ? 'Edit System Role' : 'Add New Role'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textMuted }]}>
                Define role title for access control
              </Text>

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Role Title *
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
                placeholder="e.g. Electrician, Lab Assistant, Supervisor"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Save Role"
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
          title="Delete Role"
          message={`Are you sure you want to delete role "${deleteTarget?.name}"?`}
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
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  iconText: {
    fontSize: 20
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: 14.5,
    fontWeight: '800'
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1
  },
  roleTagText: {
    fontSize: 10.5,
    fontWeight: '700'
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
    paddingBottom: 34
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
    marginBottom: 14
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

export default RoleMasterScreen;
