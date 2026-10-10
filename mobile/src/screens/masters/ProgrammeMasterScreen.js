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

import { programmeApi, departmentApi } from '../../api/masters';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import SearchBar from '../../components/SearchBar';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const getRelationId = (value) => {
  if (value && typeof value === 'object') {
    return value._id || value.id || '';
  }

  return value || '';
};

const getDepartmentName = (programme) => {
  const department = programme?.departmentId;

  if (department && typeof department === 'object') {
    return department.name || department.departmentName || 'Department';
  }

  return 'Department';
};

const ProgrammeMasterScreen = ({ navigation }) => {
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

  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState(null);

  const [departmentId, setDepartmentId] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [programmeList, departmentList] = await Promise.all([
        programmeApi.getAll(),
        departmentApi.getAll(),
      ]);

      setProgrammes(Array.isArray(programmeList) ? programmeList : []);
      setDepartments(Array.isArray(departmentList) ? departmentList : []);
    } catch (error) {
      console.error('Error fetching programme data:', error);

      Alert.alert(
        'Unable to Load',
        'Failed to load programmes. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = () => {
    setEditingProgramme(null);
    setDepartmentId(departments[0]?._id || '');
    setName('');
    setShortName('');
    setModalVisible(true);
  };

  const openEditModal = (programme) => {
    setEditingProgramme(programme);
    setDepartmentId(getRelationId(programme.departmentId));
    setName(programme.name || '');
    setShortName(programme.shortName || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setEditingProgramme(null);
  };

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanShortName = shortName.trim().toUpperCase();

    if (!departmentId || !cleanName || !cleanShortName) {
      Alert.alert(
        'Required Fields',
        'Please select a department and enter the programme name and short code.'
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const payload = {
        departmentId,
        name: cleanName,
        shortName: cleanShortName,
      };

      if (editingProgramme) {
        await programmeApi.update(editingProgramme._id, payload);

        Alert.alert(
          'Updated Successfully',
          'Programme details have been updated.'
        );
      } else {
        await programmeApi.create(payload);

        Alert.alert(
          'Created Successfully',
          'New programme has been added.'
        );
      }

      setModalVisible(false);
      setEditingProgramme(null);

      await fetchData();
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error.response?.data?.message ||
          'Unable to save programme. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (programme) => {
    Alert.alert(
      'Delete Programme',
      `Are you sure you want to delete "${programme.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await programmeApi.delete(programme._id);
              await fetchData();

              Alert.alert(
                'Deleted',
                'Programme has been deleted successfully.'
              );
            } catch (error) {
              Alert.alert(
                'Delete Failed',
                error.response?.data?.message ||
                  'Unable to delete this programme.'
              );
            }
          },
        },
      ]
    );
  };

  const filtered = programmes.filter((programme) => {
    const query = search.trim().toLowerCase();

    return (
      (programme.name || '').toLowerCase().includes(query) ||
      (programme.shortName || '').toLowerCase().includes(query) ||
      getDepartmentName(programme).toLowerCase().includes(query)
    );
  });

  const departmentOptions = departments.map((department) => ({
    label: department.name || department.departmentName || 'Department',
    value: department._id,
  }));

  const renderProgramme = ({ item, index }) => (
    <View
      style={[
        styles.programmeCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.cardMain}>
        <View
          style={[
            styles.programmeIcon,
            { backgroundColor: palette.primaryLight },
          ]}
        >
          <Ionicons
            name="school-outline"
            size={25}
            color={palette.primary}
          />
        </View>

        <View style={styles.programmeInfo}>
          <Text
            style={[styles.programmeName, { color: palette.text }]}
            numberOfLines={2}
          >
            {item.name || 'Unnamed Programme'}
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
            onPress={() => confirmDelete(item)}
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
            name="business-outline"
            size={14}
            color={palette.muted}
          />

          <Text
            style={[styles.footerMetaText, { color: palette.secondary }]}
            numberOfLines={1}
          >
            {getDepartmentName(item)}
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
          title="Programmes"
          subtitle="Degree specialisations & courses"
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showNotification={false}
          showProfile={false}
        />

        <FlatList
          data={loading ? [] : filtered}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderProgramme}
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
              <View style={styles.heroCard}>
                <View style={styles.heroCircleOne} />
                <View style={styles.heroCircleTwo} />

                <View style={styles.heroTopRow}>
                  <View style={styles.heroIcon}>
                    <Ionicons
                      name="school"
                      size={27}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="library-outline"
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.heroBadgeText}>MASTER DATA</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle}>Programme Management</Text>

                <Text style={styles.heroDescription}>
                  Manage academic courses, specialisations and their
                  department associations.
                </Text>

                <View style={styles.heroDivider} />

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatValue}>
                      {programmes.length}
                    </Text>
                    <Text style={styles.heroStatLabel}>
                      Total programmes
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
                </View>
              </View>

              <View style={styles.sectionHeading}>
                <View style={styles.headingText}>
                  <Text style={[styles.sectionTitle, { color: palette.text }]}>
                    All Programmes
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: palette.secondary },
                    ]}
                  >
                    Search, edit or add academic programmes
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
                    placeholder="Search programme or department..."
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

                  <Text style={[styles.resultText, { color: palette.secondary }]}>
                    {search
                      ? `${filtered.length} matching programme${filtered.length === 1 ? '' : 's'}`
                      : 'Registered academic programmes'}
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
                    name="school-outline"
                    size={30}
                    color={palette.primary}
                  />
                </View>

                <Text style={[styles.emptyTitle, { color: palette.text }]}>
                  {search ? 'No matching programmes' : 'No programmes yet'}
                </Text>

                <Text
                  style={[
                    styles.emptyDescription,
                    { color: palette.secondary },
                  ]}
                >
                  {search
                    ? 'Try another programme name, code or department.'
                    : 'Add your first academic programme to get started.'}
                </Text>

                <TouchableOpacity
                  onPress={
                    search
                      ? () => setSearch('')
                      : openAddModal
                  }
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
                    {search ? 'Clear Search' : 'Add Programme'}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* Add / Edit Programme Modal */}
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
                      name={editingProgramme ? 'create-outline' : 'school-outline'}
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
                  {editingProgramme ? 'Edit Programme' : 'Add New Programme'}
                </Text>

                <Text style={[styles.modalSubtitle, { color: palette.secondary }]}>
                  {editingProgramme
                    ? 'Update the programme details below.'
                    : 'Choose a department and enter the programme details.'}
                </Text>

                <Text style={[styles.label, { color: palette.text }]}>
                  Department <Text style={styles.required}>*</Text>
                </Text>

                {departments.length > 0 ? (
                  <CustomPicker
                    label="Department"
                    placeholder="Select Department"
                    items={departmentOptions}
                    selectedValue={departmentId}
                    onValueChange={setDepartmentId}
                    disabled={saving}
                  />
                ) : (
                  <View
                    style={[
                      styles.warningBox,
                      { backgroundColor: palette.dangerLight },
                    ]}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={palette.danger}
                    />
                    <Text style={[styles.warningText, { color: palette.danger }]}>
                      Add a department before creating a programme.
                    </Text>
                  </View>
                )}

                <Text style={[styles.label, { color: palette.text }]}>
                  Programme Name <Text style={styles.required}>*</Text>
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
                    name="school-outline"
                    size={19}
                    color={palette.muted}
                  />

                  <TextInput
                    style={[styles.input, { color: palette.text }]}
                    placeholder="e.g. Master of Computer Applications"
                    placeholderTextColor={palette.muted}
                    value={name}
                    onChangeText={setName}
                    editable={!saving}
                    autoCapitalize="words"
                    maxLength={100}
                    returnKeyType="next"
                  />
                </View>

                <Text style={[styles.label, { color: palette.text }]}>
                  Programme Short Code <Text style={styles.required}>*</Text>
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
                    maxLength={15}
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
                    Example: MCA, BCA, MBA or MSc-CS.
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
                    <Text style={[styles.cancelButtonText, { color: palette.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving || departments.length === 0}
                    style={[
                      styles.saveButton,
                      { backgroundColor: palette.primary },
                      (saving || departments.length === 0) && { opacity: 0.6 },
                    ]}
                  >
                    {saving ? (
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color="#FFFFFF"
                        />

                        <Text style={styles.saveButtonText}>
                          {editingProgramme ? 'Save Changes' : 'Create Programme'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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

  programmeCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
  },

  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  programmeIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  programmeInfo: {
    flex: 1,
    paddingRight: 5,
  },

  programmeName: {
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
    flex: 1,
    gap: 6,
    marginRight: 10,
  },

  footerMetaText: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
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

  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    borderRadius: 12,
  },

  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
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

export default ProgrammeMasterScreen;