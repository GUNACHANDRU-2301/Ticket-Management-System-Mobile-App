import React, { useContext } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PURPLE = '#7C5CFF';

const MENU_CONFIG = {
  Dashboard: {
    label: 'Dashboard',
    icon: 'home-outline',
    group: 'WORKSPACE',
  },
  Complaints: {
    label: 'Complaints',
    icon: 'clipboard-outline',
    group: 'WORKSPACE',
  },
  RaiseComplaint: {
    label: 'Raise a Complaint',
    icon: 'add-circle-outline',
    group: 'WORKSPACE',
  },
  Reports: {
    label: 'Reports & Insights',
    icon: 'analytics-outline',
    group: 'WORKSPACE',
  },
  Departments: {
    label: 'Departments',
    icon: 'business-outline',
    group: 'ADMINISTRATION',
  },
  Programmes: {
    label: 'Programmes',
    icon: 'school-outline',
    group: 'ADMINISTRATION',
  },
  Blocks: {
    label: 'Campus Blocks',
    icon: 'grid-outline',
    group: 'ADMINISTRATION',
  },
  Rooms: {
    label: 'Rooms',
    icon: 'key-outline',
    group: 'ADMINISTRATION',
  },
  Users: {
    label: 'Users',
    icon: 'people-outline',
    group: 'ADMINISTRATION',
  },
  Roles: {
    label: 'Roles & Permissions',
    icon: 'shield-checkmark-outline',
    group: 'ADMINISTRATION',
  },
  Profile: {
    label: 'My Profile',
    icon: 'person-circle-outline',
    group: 'ACCOUNT',
  },
  Settings: {
    label: 'Settings',
    icon: 'settings-outline',
    group: 'ACCOUNT',
  },
};

const GROUP_ORDER = [
  'WORKSPACE',
  'ADMINISTRATION',
  'ACCOUNT',
];

const NavigationDrawer = (props) => {
  const { userInfo } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};

  const palette = {
    background:
      colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    card: colors.card || (isDark ? '#151B2D' : '#FFFFFF'),
    surface:
      colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    text: colors.text || (isDark ? '#F5F7FF' : '#151936'),
    secondary:
      colors.textSecondary || (isDark ? '#A8B0C5' : '#69718B'),
    muted:
      colors.textMuted || (isDark ? '#8D96AE' : '#8A91A7'),
    border: colors.border || (isDark ? '#283149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
  };

  const routes = props.state?.routes || [];
  const activeRoute = routes[props.state?.index]?.name;

  const username = userInfo?.username || 'User';
  const role = userInfo?.role || 'Staff';
  const initial = username.trim().charAt(0).toUpperCase() || 'U';

  const availableGroups = GROUP_ORDER.map((group) => ({
    group,
    items: routes.filter(
      (route) => MENU_CONFIG[route.name]?.group === group
    ),
  })).filter((section) => section.items.length > 0);

  const handleNavigate = (routeName) => {
    props.navigation.navigate(routeName);
    props.navigation.closeDrawer();
  };

  const renderMenuItem = (route) => {
    const config = MENU_CONFIG[route.name];

    if (!config) return null;

    const isActive = activeRoute === route.name;

    return (
      <Pressable
        key={route.key}
        onPress={() => handleNavigate(route.name)}
        accessibilityRole="button"
        accessibilityLabel={config.label}
        accessibilityState={{ selected: isActive }}
        style={({ pressed }) => [
          styles.menuItem,
          {
            backgroundColor: isActive
              ? isDark
                ? 'rgba(124,92,255,0.18)'
                : '#F0ECFF'
              : 'transparent',
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.menuIconBox,
            {
              backgroundColor: isActive
                ? palette.primary
                : isDark
                  ? '#202940'
                  : '#F1F2F9',
            },
          ]}
        >
          <Ionicons
            name={config.icon}
            size={19}
            color={isActive ? '#FFFFFF' : palette.secondary}
          />
        </View>

        <Text
          style={[
            styles.menuLabel,
            {
              color: isActive ? palette.primary : palette.text,
              fontWeight: isActive ? '800' : '600',
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>

        {isActive && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: palette.primary },
            ]}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.background },
      ]}
    >
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TMS branding */}
        <View
          style={[
            styles.brandCard,
            { backgroundColor: '#241650' },
          ]}
        >
          <View style={styles.brandGlow} />

          <View style={styles.brandHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/tms-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="TMS logo"
              />
            </View>

            <View style={styles.brandText}>
              <Text style={styles.brandTitle}>TMS Facilities</Text>
              <Text style={styles.brandSubtitle}>
                TICKET MANAGEMENT SYSTEM
              </Text>
            </View>
          </View>

          <View style={styles.brandDivider} />

          <View style={styles.systemStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.systemStatusText}>
              Campus service workspace
            </Text>
          </View>
        </View>

        {/* User information */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: palette.primary },
            ]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text
              style={[
                styles.username,
                { color: palette.text },
              ]}
              numberOfLines={1}
            >
              {username}
            </Text>

            <View style={styles.roleRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={12}
                color={palette.primary}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: palette.secondary },
                ]}
                numberOfLines={1}
              >
                {role}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.accountBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(124,92,255,0.15)'
                  : '#F0ECFF',
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={17}
              color={palette.primary}
            />
          </View>
        </View>

        {/* Navigation groups */}
        <View style={styles.menuContainer}>
          {availableGroups.map((section) => (
            <View
              key={section.group}
              style={styles.menuSection}
            >
              <Text
                style={[
                  styles.sectionLabel,
                  { color: palette.muted },
                ]}
              >
                {section.group}
              </Text>

              {section.items.map(renderMenuItem)}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { borderTopColor: palette.border },
          ]}
        >
          <View style={styles.footerBrandRow}>
            <Ionicons
              name="construct-outline"
              size={15}
              color={palette.primary}
            />

            <Text
              style={[
                styles.footerTitle,
                { color: palette.text },
              ]}
            >
              TMS Facilities & Maintenance
            </Text>
          </View>

          <Text
            style={[
              styles.footerCaption,
              { color: palette.muted },
            ]}
          >
            Manage. Maintain. Resolve.
          </Text>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
  },

  // Branding header
  brandCard: {
    padding: 15,
    borderRadius: 21,
    overflow: 'hidden',
    marginBottom: 14,
  },

  brandGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -65,
    top: -65,
    backgroundColor: 'rgba(167,139,250,0.18)',
  },

  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  brandText: {
    flex: 1,
    marginLeft: 11,
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  brandSubtitle: {
    color: '#C4B5FD',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginTop: 5,
  },

  brandDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginTop: 15,
    marginBottom: 11,
  },

  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 7,
  },

  systemStatusText: {
    color: '#E9E2FF',
    fontSize: 10,
    fontWeight: '600',
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 19,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  userInfo: {
    flex: 1,
    marginLeft: 11,
  },

  username: {
    fontSize: 13,
    fontWeight: '800',
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },

  roleText: {
    fontSize: 10.5,
    fontWeight: '600',
  },

  accountBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu groups
  menuContainer: {
    flex: 1,
  },

  menuSection: {
    marginBottom: 17,
  },

  sectionLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginLeft: 9,
    marginBottom: 8,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 47,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 13,
    marginBottom: 3,
    overflow: 'hidden',
  },

  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  menuLabel: {
    fontSize: 12.5,
    flex: 1,
  },

  activeIndicator: {
    width: 4,
    height: 22,
    borderRadius: 3,
    marginLeft: 5,
  },

  // Footer
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 7,
    paddingTop: 15,
    paddingHorizontal: 4,
  },

  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  footerTitle: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  footerCaption: {
    fontSize: 10,
    marginTop: 6,
    marginLeft: 22,
  },
});

export default NavigationDrawer;