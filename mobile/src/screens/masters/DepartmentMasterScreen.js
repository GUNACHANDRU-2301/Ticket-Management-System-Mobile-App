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
import { departmentApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const DepartmentMasterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      Alert.alert('Error', 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setShortName('');
    setModalVisible(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setShortName(dept.shortName);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !shortName.trim()) {
      Alert.alert('Validation Error', 'Department name and short code are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        await departmentApi.update(editingDept._id, {
          name: name.trim(),
          shortName: shortName.trim().toUpperCase()
        });
        Alert.alert('Success ✅', 'Department updated successfully.');
      } else {
        await departmentApi.create({
          name: name.trim(),
          shortName: shortName.trim().toUpperCase()
        });
        Alert.alert('Success 🎉', 'New department created.');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await departmentApi.delete(deleteTarget._id);
      fetchDepartments();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = departments.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.shortName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ResponsiveContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader
          title="Departments"
          subtitle="Academic faculties & divisions"
          showBack={navigation?.canGoBack?.()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          showNotification={false}
          showProfile={false}
        />
        {/* Search & Action Top Bar */}
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
              placeholder="Search departments..."
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
            Total <Text style={[styles.bold, { color: theme.colors.text }]}>{filtered.length}</Text> departments
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
            renderItem={({ item }) => (
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
                    { backgroundColor: theme.colors.primaryLight }
                  ]}
                >
                  <Text style={styles.iconText}>🏢</Text>
                </View>

                <View style={styles.info}>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.codePill,
                      {
                        backgroundColor: isDark ? theme.colors.card : '#F1F5F9',
                        borderColor: theme.colors.border
                      }
                    ]}
                  >
                    <Text style={[styles.codeText, { color: theme.colors.textSecondary }]}>
                      CODE: {item.shortName}
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
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.dangerLight }]}
                    onPress={() => setDeleteTarget(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState
                icon="business-outline"
                title="No Departments Found"
                message={
                  search
                    ? 'No departments match your search keyword.'
                    : 'Click "+ Add" to create your first academic department.'
                }
                actionLabel="+ Add Department"
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
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textMuted }]}>
                Enter faculty or academic department details
              </Text>

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Department Name *
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
                placeholder="e.g. Computer Science & Engineering"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Short Code *
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
                placeholder="e.g. CSE"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="characters"
                value={shortName}
                onChangeText={setShortName}
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Save Department"
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
          title="Delete Department"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
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
  codePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1
  },
  codeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5
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
    marginBottom: 16
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

export default DepartmentMasterScreen;
