import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';

const PURPLE = '#7C5CFF';

const MASTER_ITEMS = [
  {
    id: 'DepartmentMaster',
    title: 'Departments',
    subtitle: 'Academic faculties and divisions',
    icon: 'business-outline',
    color: '#7C5CFF',
    light: '#EEE8FF',
  },
  {
    id: 'ProgrammeMaster',
    title: 'Programmes',
    subtitle: 'Courses and specialisations',
    icon: 'school-outline',
    color: '#3986EF',
    light: '#EAF2FF',
  },
  {
    id: 'BlockMaster',
    title: 'Blocks',
    subtitle: 'Campus buildings and blocks',
    icon: 'business-outline',
    color: '#D99020',
    light: '#FFF3DB',
  },
  {
    id: 'RoomMaster',
    title: 'Rooms',
    subtitle: 'Classrooms and laboratory units',
    icon: 'key-outline',
    color: '#22A875',
    light: '#E4F8EF',
  },
  {
    id: 'UserMaster',
    title: 'Users',
    subtitle: 'Staff and technician accounts',
    icon: 'people-outline',
    color: '#9B6BDF',
    light: '#F1E8FF',
  },
  {
    id: 'RoleMaster',
    title: 'Roles',
    subtitle: 'System roles and access control',
    icon: 'shield-checkmark-outline',
    color: '#E36B87',
    light: '#FFEAF0',
  },
];

const MasterHubScreen = ({ navigation }) => {
  const { isSuperAdmin, isAdmin } = useContext(AuthContext);
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
  };

  const roleLabel = isSuperAdmin
    ? 'Super Admin'
    : isAdmin
      ? 'Administrator'
      : 'Administration';

  const handleNavigate = (screenName) => {
    navigation.navigate(screenName);
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
          title="Administration"
          subtitle="Manage your campus"
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showNotification={false}
          showProfile={false}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Premium Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroCircleOne} />
            <View style={styles.heroCircleTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="settings-outline"
                  size={29}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.adminBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.adminBadgeText}>
                  {roleLabel.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Master Data Centre
            </Text>

            <Text style={styles.heroDescription}>
              Manage departments, academic programmes, campus
              infrastructure and system accounts from one place.
            </Text>

            <View style={styles.heroDivider} />

            <View style={styles.heroFooter}>
              <View style={styles.heroFooterIcon}>
                <Ionicons
                  name="grid-outline"
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.heroFooterText}>
                <Text style={styles.heroFooterTitle}>
                  6 Management Modules
                </Text>

                <Text style={styles.heroFooterSubtitle}>
                  Everything organised in one workspace
                </Text>
              </View>

              <Ionicons
                name="arrow-forward-circle-outline"
                size={25}
                color="#E8E2FF"
              />
            </View>
          </View>

          {/* Section heading */}
          <View style={styles.sectionHeading}>
            <View style={styles.headingText}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: palette.text },
                ]}
              >
                Master Modules
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Select a module to manage records
              </Text>
            </View>

            <View
              style={[
                styles.moduleCount,
                { backgroundColor: palette.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.moduleCountText,
                  { color: palette.primary },
                ]}
              >
                06
              </Text>
            </View>
          </View>

          {/* Module Cards */}
          <View style={styles.modulesContainer}>
            {MASTER_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.78}
                onPress={() => handleNavigate(item.id)}
                style={[
                  styles.moduleCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View style={styles.moduleTopRow}>
                  <View
                    style={[
                      styles.moduleIcon,
                      {
                        backgroundColor: isDark
                          ? `${item.color}26`
                          : item.light,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={25}
                      color={item.color}
                    />
                  </View>

                  <View
                    style={[
                      styles.moduleArrow,
                      {
                        backgroundColor: isDark
                          ? '#202840'
                          : '#F4F5FA',
                      },
                    ]}
                  >
                    <Ionicons
                      name="arrow-up-right"
                      size={17}
                      color={palette.secondary}
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.moduleIndex,
                    { color: item.color },
                  ]}
                >
                  MODULE {String(index + 1).padStart(2, '0')}
                </Text>

                <Text
                  style={[
                    styles.moduleTitle,
                    { color: palette.text },
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.moduleDescription,
                    { color: palette.secondary },
                  ]}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>

                <View
                  style={[
                    styles.moduleBottomLine,
                    { backgroundColor: palette.border },
                  ]}
                />

                <View style={styles.moduleFooter}>
                  <Text
                    style={[
                      styles.manageText,
                      { color: palette.primary },
                    ]}
                  >
                    Manage records
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={palette.primary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom information */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: palette.primaryLight },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={23}
                color={palette.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoTitle,
                  { color: palette.text },
                ]}
              >
                Administration Workspace
              </Text>

              <Text
                style={[
                  styles.infoDescription,
                  { color: palette.secondary },
                ]}
              >
                Keep academic records, facility locations and user
                access details organised and up to date.
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.footerText,
              { color: palette.muted },
            ]}
          >
            TMS FACILITIES & MAINTENANCE · MASTER DATA
          </Text>
        </ScrollView>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 35,
  },

  heroCard: {
    backgroundColor: PURPLE,
    borderRadius: 25,
    padding: 20,
    marginBottom: 27,
    overflow: 'hidden',
  },

  heroCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -110,
    right: -50,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -95,
    left: 100,
    backgroundColor: 'rgba(30,15,95,0.18)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 23,
    gap: 10,
  },

  heroIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.23)',
  },

  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  adminBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  heroDescription: {
    color: '#E8E2FF',
    fontSize: 11.5,
    lineHeight: 19,
    marginTop: 9,
  },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 19,
  },

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  heroFooterIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  heroFooterText: {
    flex: 1,
  },

  heroFooterTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  heroFooterSubtitle: {
    color: '#E8E2FF',
    fontSize: 9.5,
    marginTop: 4,
    lineHeight: 15,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  headingText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  moduleCount: {
    width: 40,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  moduleCountText: {
    fontSize: 13,
    fontWeight: '900',
  },

  modulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  moduleCard: {
    width: '48.3%',
    borderRadius: 19,
    borderWidth: 1,
    padding: 13,
    marginBottom: 12,
    minHeight: 190,
  },

  moduleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  moduleIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleArrow: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleIndex: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 6,
  },

  moduleTitle: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },

  moduleDescription: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
    minHeight: 30,
  },

  moduleBottomLine: {
    height: 1,
    marginTop: 13,
    marginBottom: 10,
  },

  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
  },

  manageText: {
    fontSize: 9,
    fontWeight: '800',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 13,
    gap: 12,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
  },

  infoDescription: {
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 6,
  },

  footerText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 23,
  },
});

export default MasterHubScreen;