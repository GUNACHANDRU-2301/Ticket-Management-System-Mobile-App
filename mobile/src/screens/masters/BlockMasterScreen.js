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
import { blockApi, departmentApi, programmeApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const BlockMasterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [departmentId, setDepartmentId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [blockList, deptList, progList] = await Promise.all([
        blockApi.getAll(),
        departmentApi.getAll(),
        programmeApi.getAll()
      ]);
      setBlocks(blockList || []);
      setDepartments(deptList || []);
      setProgrammes(progList || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load blocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProgrammes = programmes.filter((p) => {
    const dId = p.departmentId?._id || p.departmentId;
    return !departmentId || dId === departmentId;
  });

  const openAddModal = () => {
    setEditingBlock(null);
    setDepartmentId(departments[0]?._id || '');
    setProgrammeId('');
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (block) => {
    setEditingBlock(block);
    setDepartmentId(block.departmentId?._id || block.departmentId || '');
    setProgrammeId(block.programmeId?._id || block.programmeId || '');
    setName(block.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Block name is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        departmentId: departmentId || undefined,
        programmeId: programmeId || undefined
      };

      if (editingBlock) {
        await blockApi.update(editingBlock._id, payload);
        Alert.alert('Success ✅', 'Block updated successfully.');
      } else {
        await blockApi.create(payload);
        Alert.alert('Success 🎉', 'New block created.');
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save block.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await blockApi.delete(deleteTarget._id);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete block.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = blocks.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.departmentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.programmeId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ResponsiveContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader
          title="Blocks"
          subtitle="Campus infrastructure & buildings"
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
              placeholder="Search blocks or dept..."
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
            Total <Text style={[styles.bold, { color: theme.colors.text }]}>{filtered.length}</Text> campus blocks
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
              const deptName = item.departmentId?.name;
              const progName = item.programmeId?.name;
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
                      { backgroundColor: theme.colors.warningLight }
                    ]}
                  >
                    <Text style={styles.iconText}>🏗️</Text>
                  </View>

                  <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    <View style={styles.metaRow}>
                      {deptName && (
                        <Text style={[styles.deptText, { color: theme.colors.textMuted }]}>
                          🏢 {deptName}
                        </Text>
                      )}
                      {progName && (
                        <Text style={[styles.deptText, { color: theme.colors.textMuted }]}>
                          • 🎓 {progName}
                        </Text>
                      )}
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
              );
            }}
            ListEmptyComponent={
              <EmptyState
                icon="cube-outline"
                title="No Blocks Found"
                message={
                  search
                    ? 'No blocks match your search query.'
                    : 'Click "+ Add" to register a campus building or block.'
                }
                actionLabel="+ Add Block"
                onAction={openAddModal}
              />
            }
          />
        )}

        {/* Add / Edit Modal */}
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
                {editingBlock ? 'Edit Campus Block' : 'Add Campus Block'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.colors.textMuted }]}>
                Configure building infrastructure zones
              </Text>

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Block Name *
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
                placeholder="e.g. Block A, Main Academic Tower"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
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

              <CustomPicker
                label="Programme (Optional)"
                placeholder="Select Programme"
                items={filteredProgrammes.map((p) => ({
                  label: `${p.name} (${p.shortName})`,
                  value: p._id
                }))}
                selectedValue={programmeId}
                onValueChange={setProgrammeId}
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Save Block"
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
          title="Delete Block"
          message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4
  },
  deptText: {
    fontSize: 12
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

export default BlockMasterScreen;
