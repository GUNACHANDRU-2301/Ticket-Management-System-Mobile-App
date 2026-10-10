import React, { useState, useEffect, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

import {
  departmentApi,
  programmeApi,
  blockApi,
  roomApi,
} from '../../api/masters';

import { raiseComplaintApi } from '../../api/complaints';
import { useTheme } from '../../context/ThemeContext';

import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import CustomPicker from '../../components/CustomPicker';
import CategoryGrid from '../../components/CategoryGrid';
import ImagePickerInput from '../../components/ImagePickerInput';
import Button from '../../components/Button';
import { ListSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const getRelationId = (value) => {
  if (value && typeof value === 'object') {
    return value._id || value.id || '';
  }

  return value || '';
};

const RaiseComplaintScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};

  const palette = {
    background: colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    surface: colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    card: colors.card || colors.surface || '#FFFFFF',
    text: colors.text || (isDark ? '#F5F7FF' : '#151936'),
    secondary: colors.textSecondary || '#69718B',
    muted: colors.textMuted || '#8A91A7',
    border: colors.border || (isDark ? '#283149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    primaryLight: colors.primaryLight || '#EEE8FF',
    warning: colors.warning || '#F5A524',
    warningLight: colors.warningLight || '#FFF4D8',
    info: colors.info || '#5B8CFF',
    infoLight: colors.infoLight || '#EAF1FF',
    success: colors.success || '#22B879',
    danger: colors.danger || '#EF4444',
  };

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProg, setSelectedProg] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const [complaintType, setComplaintType] = useState('Electrician');
  const [remarks, setRemarks] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load department, programme, block and room master data.
  const fetchMasterData = useCallback(async () => {
    setLoadingData(true);
    setCatalogError(false);

    try {
      const [deptList, progList, blockList, roomList] =
        await Promise.all([
          departmentApi.getAll(),
          programmeApi.getAll(),
          blockApi.getAll(),
          roomApi.getAll(),
        ]);

      setDepartments(Array.isArray(deptList) ? deptList : []);
      setProgrammes(Array.isArray(progList) ? progList : []);
      setBlocks(Array.isArray(blockList) ? blockList : []);
      setRooms(Array.isArray(roomList) ? roomList : []);
    } catch (err) {
      console.error('Error fetching master data:', err);
      setCatalogError(true);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Cascading dropdowns.
  const filteredProgrammes = programmes.filter((programme) => {
    if (!selectedDept) return true;

    return (
      String(getRelationId(programme.departmentId)) ===
      String(selectedDept)
    );
  });

  const filteredBlocks = blocks.filter((block) => {
    const blockDeptId = getRelationId(block.departmentId);
    const blockProgId = getRelationId(block.programmeId);

    const matchesDepartment =
      !selectedDept ||
      String(blockDeptId) === String(selectedDept);

    const matchesProgramme =
      !selectedProg ||
      String(blockProgId) === String(selectedProg);

    return matchesDepartment && matchesProgramme;
  });

  const filteredRooms = rooms.filter((room) => {
    if (!selectedBlock) return false;

    return (
      String(getRelationId(room.blockId)) ===
      String(selectedBlock)
    );
  });

  const resetForm = () => {
    setSelectedDept('');
    setSelectedProg('');
    setSelectedBlock('');
    setSelectedRoom('');
    setComplaintType('Electrician');
    setRemarks('');
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!selectedBlock) {
      Alert.alert(
        'Location Required',
        'Please select the campus block.'
      );
      return;
    }

    if (!selectedRoom) {
      Alert.alert(
        'Room Required',
        'Please select the room number.'
      );
      return;
    }

    if (!complaintType) {
      Alert.alert(
        'Category Required',
        'Please select a maintenance issue category.'
      );
      return;
    }

    if (!remarks.trim()) {
      Alert.alert(
        'Description Required',
        'Please describe the maintenance problem.'
      );
      return;
    }

    const blockObj = blocks.find(
      (block) => String(block._id) === String(selectedBlock)
    );

    const roomObj = rooms.find(
      (room) => String(room._id) === String(selectedRoom)
    );

    const deptObj = departments.find(
      (department) =>
        String(department._id) === String(selectedDept)
    );

    const blockName = blockObj?.name || selectedBlock;
    const roomNumber = roomObj?.roomNumber || selectedRoom;
    const departmentName = deptObj?.name || '';

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('blockName', String(blockName));
      formData.append('roomNumber', String(roomNumber));
      formData.append('complaintType', complaintType);
      formData.append('remarks', remarks.trim());

      if (departmentName) {
        formData.append('department', departmentName);
      }

      if (imageUri) {
        const filename =
          imageUri.split('/').pop() || 'photo.jpg';

        const match = /\.(\w+)$/.exec(filename);
        const extension = match
          ? match[1].toLowerCase()
          : 'jpg';

        const mimeType =
          extension === 'jpg' || extension === 'jpeg'
            ? 'image/jpeg'
            : `image/${extension}`;

        formData.append('attachment', {
          uri: imageUri,
          name: filename,
          type: mimeType,
        });
      }

      await raiseComplaintApi(formData);

      Alert.alert(
        'Complaint Submitted!',
        `Your maintenance ticket has been registered for Block ${blockName}, Room ${roomNumber}.`,
        [
          {
            text: 'View Complaints',
            onPress: () => {
              resetForm();

              navigation.navigate('Complaints', {
                screen: 'ComplaintList',
              });
            },
          },
          {
            text: 'Log Another',
            style: 'cancel',
            onPress: () => {
              setRemarks('');
              setImageUri(null);
            },
          },
        ]
      );
    } catch (err) {
      console.error('Complaint submission error:', err);

      Alert.alert(
        'Submission Failed',
        err.response?.data?.message ||
          'Unable to register the complaint. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepHeader = ({
    number,
    title,
    subtitle,
    icon,
    tint,
    iconColor,
  }) => (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIcon,
          { backgroundColor: tint },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.sectionHeaderText}>
        <View style={styles.sectionTitleRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: palette.text },
            ]}
          >
            {title}
          </Text>

          <View
            style={[
              styles.stepPill,
              { backgroundColor: tint },
            ]}
          >
            <Text
              style={[
                styles.stepPillText,
                { color: iconColor },
              ]}
            >
              STEP {number}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionSubtitle,
            { color: palette.secondary },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );

  if (loadingData) {
    return (
      <ResponsiveContainer>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={palette.surface}
        />

        <View
          style={[
            styles.container,
            { backgroundColor: palette.background },
          ]}
        >
          <AppHeader
            title="Raise Complaint"
            subtitle="Submit maintenance request"
            showBack={navigation.canGoBack()}
            onBackPress={() => navigation.goBack()}
            onMenuPress={() =>
              navigation.dispatch(DrawerActions.openDrawer())
            }
            showNotification={false}
            showProfile={false}
          />

          <ScrollView
            contentContainerStyle={styles.loadingContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="create-outline"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.heroEyebrow}>
                FACILITY SUPPORT
              </Text>

              <Text style={styles.heroTitle}>
                Raise a Ticket
              </Text>

              <Text style={styles.heroSubtitle}>
                Tell us what needs fixing. We'll help you get it
                sorted.
              </Text>
            </View>

            <View
              style={[
                styles.loadingCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <ActivityIndicator
                size="large"
                color={palette.primary}
              />

              <Text
                style={[
                  styles.loadingTitle,
                  { color: palette.text },
                ]}
              >
                Preparing your form
              </Text>

              <Text
                style={[
                  styles.loadingSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Loading campus locations...
              </Text>
            </View>

            <ListSkeleton count={3} />
          </ScrollView>
        </View>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.surface}
      />

      <View
        style={[
          styles.container,
          { backgroundColor: palette.background },
        ]}
      >
        <AppHeader
          title="Raise Complaint"
          subtitle="Submit maintenance request"
          showBack={navigation.canGoBack()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showNotification={false}
          showProfile={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero banner */}
            <View style={styles.heroCard}>
              <View style={styles.heroDecorationOne} />
              <View style={styles.heroDecorationTwo} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="create-outline"
                    size={25}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeText}>
                    NEW REQUEST
                  </Text>
                </View>
              </View>

              <Text style={styles.heroEyebrow}>
                CAMPUS FACILITY SUPPORT
              </Text>

              <Text style={styles.heroTitle}>
                Raise a Ticket
              </Text>

              <Text style={styles.heroSubtitle}>
                Report a maintenance issue and help us get it fixed
                faster.
              </Text>

              <View style={styles.progressRow}>
                {[1, 2, 3].map((step, index) => (
                  <React.Fragment key={step}>
                    <View style={styles.progressStep}>
                      <View style={styles.progressCircle}>
                        <Text style={styles.progressNumber}>
                          {step}
                        </Text>
                      </View>

                      <Text style={styles.progressLabel}>
                        {index === 0
                          ? 'Location'
                          : index === 1
                            ? 'Details'
                            : 'Photo'}
                      </Text>
                    </View>

                    {index < 2 && (
                      <View style={styles.progressLine} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Master data loading error */}
            {catalogError && (
              <View
                style={[
                  styles.warningCard,
                  {
                    backgroundColor: isDark
                      ? '#302417'
                      : '#FFF7E7',
                    borderColor: isDark
                      ? '#65451E'
                      : '#F5D89B',
                  },
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={22}
                  color={palette.warning}
                />

                <View style={styles.warningContent}>
                  <Text
                    style={[
                      styles.warningTitle,
                      { color: palette.text },
                    ]}
                  >
                    Location data unavailable
                  </Text>

                  <Text
                    style={[
                      styles.warningMessage,
                      { color: palette.secondary },
                    ]}
                  >
                    Please retry loading campus locations before
                    submitting your complaint.
                  </Text>

                  <Pressable
                    onPress={fetchMasterData}
                    style={styles.retryButton}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={15}
                      color={palette.primary}
                    />

                    <Text
                      style={[
                        styles.retryButtonText,
                        { color: palette.primary },
                      ]}
                    >
                      Retry
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Step 1: Location */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
                theme?.shadows?.sm,
              ]}
            >
              {renderStepHeader({
                number: 1,
                title: 'Location details',
                subtitle:
                  'Choose where the issue needs attention.',
                icon: 'location-outline',
                tint: palette.primaryLight,
                iconColor: palette.primary,
              })}

              <View style={styles.formDivider} />

              {departments.length > 0 && (
                <CustomPicker
                  label="Department (Optional)"
                  placeholder="Select Department"
                  items={departments.map((department) => ({
                    label: department.shortName
                      ? `${department.name} (${department.shortName})`
                      : department.name,
                    value: department._id,
                  }))}
                  selectedValue={selectedDept}
                  onValueChange={(value) => {
                    setSelectedDept(value);
                    setSelectedProg('');
                    setSelectedBlock('');
                    setSelectedRoom('');
                  }}
                />
              )}

              {programmes.length > 0 && (
                <CustomPicker
                  label="Programme (Optional)"
                  placeholder={
                    selectedDept
                      ? 'Select Programme'
                      : 'Select Programme'
                  }
                  items={filteredProgrammes.map((programme) => ({
                    label: programme.shortName
                      ? `${programme.name} (${programme.shortName})`
                      : programme.name,
                    value: programme._id,
                  }))}
                  selectedValue={selectedProg}
                  onValueChange={(value) => {
                    setSelectedProg(value);
                    setSelectedBlock('');
                    setSelectedRoom('');
                  }}
                />
              )}

              <CustomPicker
                label="Campus Block *"
                placeholder="Select Campus Block"
                items={filteredBlocks.map((block) => ({
                  label: block.name,
                  value: block._id,
                }))}
                selectedValue={selectedBlock}
                onValueChange={(value) => {
                  setSelectedBlock(value);
                  setSelectedRoom('');
                }}
              />

              <CustomPicker
                label="Room Number *"
                placeholder={
                  selectedBlock
                    ? 'Select Room Number'
                    : 'Select a block first'
                }
                items={filteredRooms.map((room) => ({
                  label: `Room ${room.roomNumber}`,
                  value: room._id,
                }))}
                selectedValue={selectedRoom}
                onValueChange={setSelectedRoom}
                disabled={!selectedBlock}
              />

              <View
                style={[
                  styles.infoHint,
                  {
                    backgroundColor: isDark
                      ? '#1A2337'
                      : '#F1F3FF',
                  },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={palette.primary}
                />

                <Text
                  style={[
                    styles.infoHintText,
                    { color: palette.secondary },
                  ]}
                >
                  Select the block first. Room numbers will be
                  filtered automatically.
                </Text>
              </View>
            </View>

            {/* Step 2: Complaint details */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
                theme?.shadows?.sm,
              ]}
            >
              {renderStepHeader({
                number: 2,
                title: 'Issue details',
                subtitle:
                  'Select the issue type and describe the problem.',
                icon: 'construct-outline',
                tint: palette.warningLight,
                iconColor: palette.warning,
              })}

              <View style={styles.formDivider} />

              <Text
                style={[
                  styles.inputLabel,
                  { color: palette.text },
                ]}
              >
                Maintenance category *
              </Text>

              <Text
                style={[
                  styles.inputHint,
                  { color: palette.secondary },
                ]}
              >
                Choose the category that best matches the issue.
              </Text>

              <CategoryGrid
                selectedCategory={complaintType}
                onSelectCategory={setComplaintType}
              />

              <View style={styles.remarksHeaderRow}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: palette.text },
                  ]}
                >
                  Description / Remarks *
                </Text>

                <Text
                  style={[
                    styles.charCount,
                    {
                      color:
                        remarks.length >= 450
                          ? palette.warning
                          : palette.muted,
                    },
                  ]}
                >
                  {remarks.length}/500
                </Text>
              </View>

              <View
                style={[
                  styles.textAreaWrapper,
                  {
                    backgroundColor: isDark
                      ? '#10172A'
                      : '#F8F9FD',
                    borderColor: palette.border,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.textAreaInput,
                    { color: palette.text },
                  ]}
                  placeholder={
                    'Describe the problem...\nExample: Ceiling fan not working in Room 204.'
                  }
                  placeholderTextColor={palette.muted}
                  multiline
                  numberOfLines={5}
                  maxLength={500}
                  textAlignVertical="top"
                  value={remarks}
                  onChangeText={setRemarks}
                  editable={!submitting}
                />

                <View style={styles.textAreaFooter}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={16}
                    color={palette.muted}
                  />

                  <Text
                    style={[
                      styles.textAreaFooterText,
                      { color: palette.muted },
                    ]}
                  >
                    Clear details help resolve issues faster.
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 3: Attachment */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
                theme?.shadows?.sm,
              ]}
            >
              {renderStepHeader({
                number: 3,
                title: 'Add a photo',
                subtitle:
                  'Attach an image to help explain the issue.',
                icon: 'image-outline',
                tint: palette.infoLight,
                iconColor: palette.info,
              })}

              <View style={styles.formDivider} />

              <View
                style={[
                  styles.attachmentHint,
                  {
                    backgroundColor: isDark
                      ? '#171F32'
                      : '#F7F8FD',
                    borderColor: palette.border,
                  },
                ]}
              >
                <Ionicons
                  name="camera-outline"
                  size={23}
                  color={palette.primary}
                />

                <View style={styles.attachmentHintContent}>
                  <Text
                    style={[
                      styles.attachmentTitle,
                      { color: palette.text },
                    ]}
                  >
                    Visual evidence
                  </Text>

                  <Text
                    style={[
                      styles.attachmentSubtitle,
                      { color: palette.secondary },
                    ]}
                  >
                    A clear photo may help the maintenance team
                    understand the problem.
                  </Text>
                </View>
              </View>

              <ImagePickerInput
                imageUri={imageUri}
                onImagePicked={setImageUri}
              />
            </View>

            {/* Submit */}
            <View
              style={[
                styles.submitCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.submitInfoRow}>
                <View
                  style={[
                    styles.submitIcon,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={21}
                    color={palette.primary}
                  />
                </View>

                <View style={styles.submitInfoContent}>
                  <Text
                    style={[
                      styles.submitInfoTitle,
                      { color: palette.text },
                    ]}
                  >
                    Ready to submit?
                  </Text>

                  <Text
                    style={[
                      styles.submitInfoText,
                      { color: palette.secondary },
                    ]}
                  >
                    Review your details before creating the ticket.
                  </Text>
                </View>
              </View>

              <View style={styles.submitButtonWrapper}>
                <Button
                  title={
                    submitting
                      ? 'Submitting...'
                      : 'Submit Complaint'
                  }
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting || catalogError}
                  size="lg"
                  variant="primary"
                  icon="send"
                />
              </View>

              <View style={styles.submitFooter}>
                <Ionicons
                  name="lock-closed-outline"
                  size={13}
                  color={palette.muted}
                />

                <Text
                  style={[
                    styles.submitFooterText,
                    { color: palette.muted },
                  ]}
                >
                  Your ticket will be registered in the system.
                </Text>
              </View>
            </View>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  loadingContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // Hero banner
  heroCard: {
    backgroundColor: PURPLE,
    borderRadius: 23,
    padding: 19,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  heroDecorationOne: {
    position: 'absolute',
    width: 165,
    height: 165,
    borderRadius: 83,
    top: -90,
    right: -42,
    backgroundColor: 'rgba(255,255,255,0.11)',
  },

  heroDecorationTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -80,
    right: 70,
    backgroundColor: 'rgba(30,15,95,0.20)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
  },

  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8DF5BD',
  },

  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  heroEyebrow: {
    color: '#DDD6FE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 6,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 300,
  },

  // Progress row
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  progressStep: {
    alignItems: 'center',
    minWidth: 54,
  },

  progressCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  progressLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },

  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.32)',
    marginHorizontal: 8,
    marginBottom: 18,
  },

  // Sections
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  stepPill: {
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  stepPillText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  formDivider: {
    height: 1,
    backgroundColor: '#E9EAF2',
    marginBottom: 15,
    opacity: 0.8,
  },

  // Information hints
  infoHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 11,
    marginTop: 5,
    gap: 8,
  },

  infoHintText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 16,
  },

  // Warning
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  warningMessage: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 10,
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Description
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
  },

  inputHint: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5,
    marginBottom: 10,
  },

  remarksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },

  charCount: {
    fontSize: 10,
    fontWeight: '800',
  },

  textAreaWrapper: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 11,
  },

  textAreaInput: {
    minHeight: 115,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 12,
    lineHeight: 19,
  },

  textAreaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#E9EAF2',
  },

  textAreaFooterText: {
    flex: 1,
    fontSize: 9.5,
  },

  // Attachment
  attachmentHint: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 13,
    marginBottom: 15,
    gap: 11,
  },

  attachmentHintContent: {
    flex: 1,
  },

  attachmentTitle: {
    fontSize: 12,
    fontWeight: '800',
  },

  attachmentSubtitle: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 4,
  },

  // Submit
  submitCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginTop: 2,
  },

  submitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 16,
  },

  submitIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitInfoContent: {
    flex: 1,
  },

  submitInfoTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  submitInfoText: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 4,
  },

  submitButtonWrapper: {
    marginTop: 2,
  },

  submitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },

  submitFooterText: {
    fontSize: 9.5,
    textAlign: 'center',
  },

  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },

  loadingSubtitle: {
    fontSize: 11,
    marginTop: 6,
  },

  bottomSpace: {
    height: 20,
  },
});

export default RaiseComplaintScreen;