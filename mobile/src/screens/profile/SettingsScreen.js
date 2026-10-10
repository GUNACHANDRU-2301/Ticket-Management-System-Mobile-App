import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Switch,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';

const PURPLE = '#7C5CFF';

const SettingsScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const colors = theme?.colors || {};

  const palette = {
    background: colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    surface: colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    card: colors.card || colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    text: colors.text || (isDark ? '#F5F7FF' : '#171936'),
    secondary:
      colors.textSecondary || (isDark ? '#A4ADC4' : '#737B93'),
    border: colors.border || (isDark ? '#293149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    primaryLight:
      colors.primaryLight || (isDark ? '#292344' : '#EEE8FF'),
  };

  const profile =
    userInfo?.user ||
    userInfo?.data?.user ||
    userInfo?.data ||
    userInfo ||
    {};

  const name =
    profile.username ||
    profile.name ||
    profile.fullName ||
    'TMS User';

  const email = profile.email || 'Account settings';

  const SettingRow = ({
    icon,
    title,
    subtitle,
    color,
    tint,
    onPress,
    rightElement,
    showArrow = true,
  }) => (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          opacity: pressed && onPress ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: tint || palette.primaryLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={color || palette.primary}
        />
      </View>

      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: palette.text }]}>
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={[
              styles.settingSubtitle,
              { color: palette.secondary },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement ? (
        rightElement
      ) : showArrow ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={palette.secondary}
        />
      ) : null}
    </Pressable>
  );

  const SectionHeading = ({ title, subtitle }) => (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={[styles.sectionSubtitle, { color: palette.secondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

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
          title="Settings"
          subtitle="Personalise your TMS experience"
          showNotification={false}
          showProfile={false}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroCircleOne} />
            <View style={styles.heroCircleTwo} />

            <View style={styles.heroIcon}>
              <Ionicons
                name="settings-outline"
                size={32}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.heroTitle}>App Settings</Text>

            <Text style={styles.heroSubtitle}>
              Manage your preferences and account
            </Text>

            <View style={styles.heroBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.heroBadgeText}>
                TMS FACILITIES
              </Text>
            </View>
          </View>

          {/* Account */}
          <SectionHeading
            title="Account"
            subtitle="Manage your personal information"
          />

          <SettingRow
            icon="person-outline"
            title="My Profile"
            subtitle={name}
            onPress={() => navigation.navigate('Profile')}
          />

          <SettingRow
            icon="mail-outline"
            title="Email Address"
            subtitle={email}
            showArrow={false}
          />

          {/* Preferences */}
          <SectionHeading
            title="Preferences"
            subtitle="Control your app experience"
          />

          <SettingRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Enable complaint update alerts"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: palette.border,
                  true: palette.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />

          <SettingRow
            icon="volume-medium-outline"
            title="Sound"
            subtitle="Notification sound preference"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{
                  false: palette.border,
                  true: palette.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
            showArrow={false}
          />

          <SettingRow
            icon={isDark ? 'moon-outline' : 'sunny-outline'}
            title="Appearance"
            subtitle={`Current theme: ${isDark ? 'Dark' : 'Light'}`}
            rightElement={
              <View
                style={[
                  styles.themeBadge,
                  { backgroundColor: palette.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.themeBadgeText,
                    { color: palette.primary },
                  ]}
                >
                  {isDark ? 'DARK' : 'LIGHT'}
                </Text>
              </View>
            }
            showArrow={false}
          />

          {/* Support */}
          <SectionHeading
            title="Support"
            subtitle="Application information"
          />

          <SettingRow
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get assistance with TMS"
            onPress={() =>
              Alert.alert(
                'Help & Support',
                'For assistance, contact your campus TMS administrator.'
              )
            }
          />

          <SettingRow
            icon="information-circle-outline"
            title="About TMS"
            subtitle="Ticket Management System"
            onPress={() =>
              Alert.alert(
                'About TMS',
                'TMS Facilities & Maintenance\nVersion 1.0.0'
              )
            }
          />

          {/* Footer */}
          <View
            style={[
              styles.footerCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.footerIcon,
                { backgroundColor: palette.primaryLight },
              ]}
            >
              <Ionicons
                name="construct-outline"
                size={24}
                color={palette.primary}
              />
            </View>

            <Text style={[styles.footerTitle, { color: palette.text }]}>
              TMS Facilities & Maintenance
            </Text>

            <Text
              style={[
                styles.footerSubtitle,
                { color: palette.secondary },
              ]}
            >
              Making campus maintenance simpler.
            </Text>

            <Text style={[styles.version, { color: palette.secondary }]}>
              Version 1.0.0
            </Text>
          </View>
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
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 27,
    overflow: 'hidden',
  },

  heroCircleOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    top: -95,
    right: -45,
    backgroundColor: 'rgba(255,255,255,0.11)',
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -85,
    left: -35,
    backgroundColor: 'rgba(30,15,95,0.18)',
  },

  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  heroSubtitle: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 17,
    color: '#E9E3FF',
    textAlign: 'center',
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },

  heroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFFFFF',
  },

  sectionHeading: {
    marginTop: 4,
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },

  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 17,
    marginBottom: 10,
  },

  settingIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  settingContent: {
    flex: 1,
    paddingRight: 8,
  },

  settingTitle: {
    fontSize: 12,
    fontWeight: '900',
  },

  settingSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },

  themeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  footerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 21,
    alignItems: 'center',
    marginTop: 15,
  },

  footerIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  footerSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
  },

  version: {
    fontSize: 10,
    marginTop: 15,
  },
});

export default SettingsScreen;