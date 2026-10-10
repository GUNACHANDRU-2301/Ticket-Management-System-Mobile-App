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

import {
  blockApi,
  departmentApi,
  programmeApi,
} from '../../api/masters';

import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import SearchBar from '../../components/SearchBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const getRelationId = (relation) => {
  if (relation && typeof relation === 'object') {
    return relation._id || relation.id || '';
  }

  return relation || '';
};

const getRelationName = (relation, records = []) => {
  if (relation && typeof relation === 'object') {
    return relation.name || relation.departmentName || relation.programmeName || '';
  }

  if (!relation) return '';

  const matched = records.find(
    (record) => String(record._id) === String(relation)
  );

  return matched?.name || '';
};

const BlockMasterScreen = ({ navigation }) => {
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
  };

  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [departmentId, setDepartmentId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [name, setName] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [blockList, departmentList, programmeList] = await Promise.all([
        blockApi.getAll(),
        departmentApi.getAll(),
        programmeApi.getAll(),
      ]);

      setBlocks(Array.isArray(blockList) ? blockList : []);
      setDepartments(Array.isArray(departmentList) ? departmentList : []);
      setProgrammes(Array.isArray(programmeList) ? programmeList : []);
    } catch (error) {
      console.error('Error fetching block data:', error);

      Alert.alert(
        'Unable to Load',
        'Failed to load campus blocks. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProgrammes = programmes.filter((programme) => {
    const programmeDepartmentId = getRelationId(programme.departmentId);

    return (
      !departmentId ||
      String(programmeDepartmentId) === String(departmentId)
    );
  });

  const openAddModal = () => {
    setEditingBlock(null);
    setDepartmentId('');
    setProgrammeId('');
    setName('');
    setModalVisible(true);
  };

  const openEditModal = (block) => {
    setEditingBlock(block);
    setDepartmentId(getRelationId(block.departmentId));
    setProgrammeId(getRelationId(block.programmeId));
    setName(block.name || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingBlock(null);
  };

  const handleSave = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      Alert.alert('Required Field', 'Block name is required.');
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const payload = {
        name: cleanName,
        departmentId: departmentId || undefined,
        programmeId: programmeId || undefined,
      };

      if (editingBlock) {
        await blockApi.update(editingBlock._id, payload);

        Alert.alert(
          'Updated Successfully',
          'Campus block details have been updated.'
        );
      } else {
        await blockApi.create(payload);

        Alert.alert(
          'Created Successfully',
          'New campus block has been added.'
        );
      }

      setModalVisible(false);
      setEditingBlock(null);

      await fetchData();
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error.response?.data?.message ||
          'Unable to save the block. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await blockApi.delete(deleteTarget._id);

      setDeleteTarget(null);
      await fetchData();

      Alert.alert(
        'Deleted Successfully',
        'Campus block has been deleted.'
      );
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error.response?.data?.message ||
          'Unable to delete this block. Please try again.'
      );

      setDeleteTarget(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = blocks.filter((block) => {
    const blockName = (block.name || '').toLowerCase();

    const departmentName = getRelationName(
      block.departmentId,
      departments
    ).toLowerCase();

    const programmeName = getRelationName(
      block.programmeId,
      programmes
    ).toLowerCase();

    return (
      blockName.includes(normalizedSearch) ||
      departmentName.includes(normalizedSearch) ||
      programmeName.includes(normalizedSearch)
    );
  });

  const departmentOptions = departments.map((department) => ({
    label: department.shortName
      ? `${department.name} (${department.shortName})`
      : department.name,
    value: department._id,
  }));

  const programmeOptions = filteredProgrammes.map((programme) => ({
    label: programme.shortName
      ? `${programme.name} (${programme.shortName})`
      : programme.name,
    value: programme._id,
  }));

  const renderBlock = ({ item, index }) => {
    const departmentName = getRelationName(
      item.departmentId,
      departments
    );

    const programmeName = getRelationName(
      item.programmeId,
      programmes
    );

    return (
      <View
        style={[
          styles.blockCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.cardMain}>
          <View
            style={[
              styles.blockIcon,
              { backgroundColor: palette.primaryLight },
            ]}
          >
            <Ionicons
              name="business-outline"
              size={25}
              color={palette.primary}
            />
          </View>

          <View style={styles.blockInfo}>
            <Text
              style={[styles.blockName, { color: palette.text }]}
              numberOfLines={2}
            >
              {item.name || 'Unnamed Block'}
            </Text>

            <View style={styles.blockBadge}>
              <Ionicons
                name="cube-outline"
                size={12}
                color={palette.secondary}
              />

              <Text style={[styles.blockBadgeText, { color: palette.secondary }]}>
                CAMPUS BLOCK
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

        {(departmentName || programmeName) && (
          <>
            <View
              style={[
                styles.cardDivider,
                { backgroundColor: palette.border },
              ]}
            />

            {departmentName ? (
              <View style={styles.metaRow}>
                <Ionicons
                  name="business-outline"
                  size={15}
                  color={palette.primary}
                />

                <Text
                  style={[styles.metaText, { color: palette.secondary }]}
                  numberOfLines={1}
                >
                  {departmentName}
                </Text>
              </View>
            ) : null}

            {programmeName ? (
              <View style={[styles.metaRow, { marginTop: 8 }]}>
                <Ionicons
                  name="school-outline"
                  size={15}
                  color={palette.primary}
                />

                <Text
                  style={[styles.metaText, { color: palette.secondary }]}
                  numberOfLines={1}
                >
                  {programmeName}
                </Text>
              </View>
            ) : null}
          </>
        )}

        <View style={[styles.cardFooter, { borderTopColor: palette.border }]}>
          <View style={styles.footerMeta}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: '#22A875' },
              ]}
            />

            <Text style={[styles.footerText, { color: palette.secondary }]}>
              Registered campus block
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
          title="Blocks"
          subtitle="Campus infrastructure & buildings"
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showNotification={false}
          showProfile={false}
        />

        <FlatList
          data={loading ? [] : filtered}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderBlock}
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

                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="layers-outline"
                      size={14}
                      color="#FFFFFF"
                    />

                    <Text style={styles.heroBadgeText}>
                      MASTER DATA
                    </Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>
                  Block Management
                </Text>

                <Text style={styles.heroDescription}>
                  Organise campus buildings, academic blocks and their
                  department and programme associations.
                </Text>

                <View style={styles.heroDivider} />

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {blocks.length}
                    </Text>

                    <Text style={styles.heroStatLabel}>
                      Total blocks
                    </Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {departments.length}
                    </Text>

                    <Text style={styles.heroStatLabel}>
                      Departments
                    </Text>
                  </View>

                  <View style={styles.heroStatDivider} />

                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {programmes.length}
                    </Text>

                    <Text style={styles.heroStatLabel}>
                      Programmes
                    </Text>
                  </View>
                </View>
              </View>

              {/* Search and list heading */}
              <View style={styles.sectionHeading}>
                <View style={styles.headingText}>
                  <Text
                    style={[styles.sectionTitle, { color: palette.text }]}
                  >
                    All Campus Blocks
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: palette.secondary },
                    ]}
                  >
                    Search and manage campus infrastructure
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
                    {filtered.length}
                  </Text>
                </View>
              </View>

              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search blocks or departments..."
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
                      ? `${filtered.length} matching block${filtered.length === 1 ? '' : 's'}`
                      : 'Registered campus infrastructure'}
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
                    name="business-outline"
                    size={30}
                    color={palette.primary}
                  />
                </View>

                <Text
                  style={[styles.emptyTitle, { color: palette.text }]}
                >
                  {search ? 'No matching blocks' : 'No blocks yet'}
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: palette.secondary },
                  ]}
                >
                  {search
                    ? 'Try another block name, department or programme.'
                    : 'Add your first campus block to start organising the infrastructure.'}
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
                    {search ? 'Clear Search' : 'Add Block'}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* Add / Edit Block Modal */}
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
                      name={editingBlock ? 'create-outline' : 'business-outline'}
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

                <Text
                  style={[styles.modalTitle, { color: palette.text }]}
                >
                  {editingBlock ? 'Edit Campus Block' : 'Add Campus Block'}
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: palette.secondary },
                  ]}
                >
                  {editingBlock
                    ? 'Update this block and its academic associations.'
                    : 'Enter the block name and select its department and programme.'}
                </Text>

                <Text style={[styles.label, { color: palette.text }]}>
                  Block Name <Text style={styles.required}>*</Text>
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
                    placeholder="e.g. Block A, Main Academic Block"
                    placeholderTextColor={palette.muted}
                    value={name}
                    onChangeText={setName}
                    editable={!saving}
                    autoCapitalize="words"
                    maxLength={100}
                    returnKeyType="done"
                  />
                </View>

                <Text style={[styles.label, { color: palette.text }]}>
                  Department
                  <Text style={styles.optional}> (Optional)</Text>
                </Text>

                <CustomPicker
                  label="Department"
                  placeholder="Select Department"
                  items={departmentOptions}
                  selectedValue={departmentId}
                  onValueChange={(value) => {
                    setDepartmentId(value);
                    setProgrammeId('');
                  }}
                  disabled={saving}
                />

                <Text style={[styles.label, { color: palette.text }]}>
                  Programme
                  <Text style={styles.optional}> (Optional)</Text>
                </Text>

                <CustomPicker
                  label="Programme"
                  placeholder={
                    departmentId
                      ? 'Select Programme'
                      : 'Select department first'
                  }
                  items={programmeOptions}
                  selectedValue={programmeId}
                  onValueChange={setProgrammeId}
                  disabled={saving || !departmentId}
                />

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
                    Programme options are filtered by the selected department.
                    Both associations are optional.
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
                        : editingBlock
                          ? 'Save Changes'
                          : 'Create Block'}
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
          title="Delete Campus Block"
          message={`Are you sure you want to delete "${deleteTarget?.name || 'this block'}"?`}
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

  blockCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
  },

  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  blockIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  blockInfo: {
    flex: 1,
    paddingRight: 5,
  },

  blockName: {
    fontSize: 13.5,
    fontWeight: '900',
    lineHeight: 19,
  },

  blockBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },

  blockBadgeText: {
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
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  metaText: {
    flex: 1,
    fontSize: 11,
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

  footerMeta: {
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

export default BlockMasterScreen;