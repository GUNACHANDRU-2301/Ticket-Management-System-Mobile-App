import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';

const PURPLE = '#7C5CFF';

const ProfileScreen = ({ navigation }) => {
  const { userInfo, isAdmin, isTechnician } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const profile =
    userInfo?.user ||
    userInfo?.data?.user ||
    userInfo?.data ||
    userInfo ||
    {};

  const colors = theme?.colors || {};

  const palette = {
    background: colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    surface: colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    card: colors.card || colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    text: colors.text || (isDark ? '#F5F7FF' : '#171936'),
    secondary: colors.textSecondary || (isDark ? '#A4ADC4' : '#707891'),
    border: colors.border || (isDark ? '#293149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    primaryLight: colors.primaryLight || (isDark ? '#292344' : '#EEE8FF'),
  };

  const getValue = (...values) => {
    const value = values.find(
      (item) => item !== undefined && item !== null && item !== ''
    );

    if (typeof value === 'object') {
      return value.username || value.name || value.email || 'Not provided';
    }

    return value ? String(value) : 'Not provided';
  };

  const name = getValue(
    profile.username,
    profile.name,
    profile.fullName,
    profile.userName
  );

  const email = getValue(profile.email);
  const phone = getValue(profile.phoneNumber, profile.phone, profile.mobile);

  const role =
    getValue(
      typeof profile.role === 'object'
        ? profile.role?.roleName || profile.role?.name
        : profile.role
    ) === 'Not provided'
      ? isAdmin
        ? 'Super Admin'
        : isTechnician
          ? 'Technician'
          : 'User'
      : getValue(
          typeof profile.role === 'object'
            ? profile.role?.roleName || profile.role?.name
            : profile.role
        );

  const department = getValue(
    typeof profile.department === 'object'
      ? profile.department?.departmentName || profile.department?.name
      : profile.department
  );

  const programme = getValue(
    typeof profile.programme === 'object'
      ? profile.programme?.programmeName || profile.programme?.name
      : profile.programme
  );

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const details = [
    {
      label: 'Full Name',
      value: name,
      icon: 'person-outline',
    },
    {
      label: 'Email Address',
      value: email,
      icon: 'mail-outline',
    },
    {
      label: 'Phone Number',
      value: phone,
      icon: 'call-outline',
    },
    {
      label: 'Department',
      value: department,
      icon: 'business-outline',
    },
    {
      label: 'Programme',
      value: programme,
      icon: 'school-outline',
    },
  ];

  const InfoCard = ({ label, value, icon }) => (
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
          name={icon}
          size={20}
          color={palette.primary}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: palette.secondary }]}>
          {label}
        </Text>

        <Text
          style={[styles.infoValue, { color: palette.text }]}
          numberOfLines={2}
        >
          {value}
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

      <View
        style={[
          styles.container,
          { backgroundColor: palette.background },
        ]}
      >
        <AppHeader
          title="My Profile"
          subtitle="Your account information"
          showNotification={false}
          showProfile={false}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroCircleOne} />
            <View style={styles.heroCircleTwo} />

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initials || 'U'}
              </Text>
            </View>

            <Text style={styles.profileName} numberOfLines={2}>
              {name}
            </Text>

            <Text style={styles.profileEmail} numberOfLines={2}>
              {email}
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#FFFFFF"
              />
              <Text style={styles.roleText}>{role}</Text>
            </View>

            <View style={styles.heroFooter}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#C8FFE5"
              />
              <Text style={styles.heroFooterText}>
                TMS Account
              </Text>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.sectionHeading}>
            <View>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Personal Information
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Your registered account details
              </Text>
            </View>

            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: palette.primaryLight },
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={22}
                color={palette.primary}
              />
            </View>
          </View>

          <View style={styles.infoList}>
            {details.map((item) => (
              <InfoCard
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </View>

          {/* Account Information */}
          <View style={styles.sectionHeading}>
            <View>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Account Information
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Your access and permissions
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: palette.primaryLight },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color={palette.primary}
              />
            </View>

            <View style={styles.accountContent}>
              <Text style={[styles.accountTitle, { color: palette.text }]}>
                Account Role
              </Text>
              <Text
                style={[
                  styles.accountSubtitle,
                  { color: palette.secondary },
                ]}
              >
                {role}
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#22A875"
            />
          </View>

          <View
            style={[
              styles.accountCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.accountIcon,
                { backgroundColor: '#E2F8EE' },
              ]}
            >
              <Ionicons
                name="business-outline"
                size={23}
                color="#22A875"
              />
            </View>

            <View style={styles.accountContent}>
              <Text style={[styles.accountTitle, { color: palette.text }]}>
                Department Access
              </Text>
              <Text
                style={[
                  styles.accountSubtitle,
                  { color: palette.secondary },
                ]}
              >
                {department}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Ionicons
              name="construct-outline"
              size={22}
              color={palette.primary}
            />

            <View style={styles.footerContent}>
              <Text style={[styles.footerTitle, { color: palette.text }]}>
                TMS Facilities & Maintenance
              </Text>
              <Text
                style={[
                  styles.footerSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Ticket Management System
              </Text>
            </View>
          </View>

          <Text style={[styles.version, { color: palette.secondary }]}>
            Version 1.0.0
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
    padding: 16,
    paddingBottom: 35,
  },

  heroCard: {
    backgroundColor: PURPLE,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    marginBottom: 27,
    overflow: 'hidden',
  },

  heroCircleOne: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 90,
    top: -100,
    right: -45,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 70,
    bottom: -85,
    left: -35,
    backgroundColor: 'rgba(30,15,95,0.18)',
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.19)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  profileEmail: {
    color: '#E9E3FF',
    fontSize: 12,
    marginTop: 7,
    textAlign: 'center',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.23)',
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 15,
  },

  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    marginTop: 20,
    paddingTop: 14,
    width: '100%',
    justifyContent: 'center',
  },

  heroFooterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },

  sectionSubtitle: {
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoList: {
    gap: 11,
    marginBottom: 26,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    minHeight: 77,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    padding: 14,
    marginBottom: 11,
  },

  accountIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  accountContent: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 12,
    fontWeight: '900',
  },

  accountSubtitle: {
    fontSize: 11,
    marginTop: 5,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 14,
  },

  footerContent: {
    flex: 1,
    marginLeft: 12,
  },

  footerTitle: {
    fontSize: 12,
    fontWeight: '900',
  },

  footerSubtitle: {
    fontSize: 10,
    marginTop: 5,
  },

  version: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 17,
  },
});

export default ProfileScreen;