import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';

const AppHeader = ({
  title = 'TMS',
  subtitle = '',
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  username = 'User',
  pendingCount = 0,
  showNotification = true,
  showProfile = true,
}) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};

  const backgroundColor =
    colors.surface || colors.card || '#FFFFFF';

  const textColor =
    colors.text || (isDark ? '#F5F7FF' : '#151936');

  const secondaryColor =
    colors.textSecondary || '#69718B';

  const borderColor =
    colors.border || (isDark ? '#283149' : '#E8EAF4');

  const primaryColor = colors.primary || '#7C5CFF';

  const openDrawer = () => {
    if (onMenuPress) {
      onMenuPress();
      return;
    }

    navigation.dispatch(DrawerActions.openDrawer());
  };

  const displayName = String(username || 'User').trim();
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor: borderColor,
        },
      ]}
    >
      {/* Hamburger menu */}
      <Pressable
        onPress={openDrawer}
        accessibilityRole="button"
        accessibilityLabel="Open navigation drawer"
        hitSlop={8}
        style={({ pressed }) => [
          styles.menuButton,
          {
            backgroundColor: pressed
              ? isDark
                ? '#282344'
                : '#F0EBFF'
              : 'transparent',
          },
        ]}
      >
        <Ionicons
          name="menu-outline"
          size={28}
          color={textColor}
        />
      </Pressable>

      {/* Screen title */}
      <View style={styles.titleContainer}>
        <Text
          style={[styles.title, { color: textColor }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: secondaryColor },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right-side actions */}
      <View style={styles.rightActions}>
        {showNotification && onNotificationPress && (
          <Pressable
            onPress={onNotificationPress}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            hitSlop={6}
            style={styles.actionButton}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={textColor}
            />

            {Number(pendingCount) > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}

        {showProfile && onProfilePress && (
          <Pressable
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            hitSlop={6}
            style={({ pressed }) => [
              styles.avatarButton,
              {
                backgroundColor: pressed
                  ? '#6040DC'
                  : primaryColor,
              },
            ]}
          >
            <Text style={styles.avatarLetter}>
              {avatarLetter}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 9,
  },

  menuButton: {
    width: 40,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },

  title: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.25,
  },

  subtitle: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  actionButton: {
    width: 38,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  notificationBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },

  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default AppHeader;