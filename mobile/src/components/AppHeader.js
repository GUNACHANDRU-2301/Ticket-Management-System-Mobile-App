import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

const AppHeader = ({
  title,
  subtitle,
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  username,
  showNotification = true,
  showProfile = true,
  showBack = false,
  onBackPress,
  pendingCount = 0,
  rightContent
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top + 4, 12),
          borderBottomColor: colors.border
        }
      ]}
    >
      <View style={styles.headerRow}>
        {/* Left Side */}
        <View style={styles.leftCol}>
          {showBack ? (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={styles.titleCol}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[styles.subtitle, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right Side */}
        <View style={styles.rightCol}>
          {rightContent}

          {showNotification && (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.textSecondary}
              />
              {pendingCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showProfile && (
            <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
              <Avatar
                name={username || 'U'}
                size={36}
                online={true}
                color="#7C5CFF"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 12
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  titleCol: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 1
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  notifBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  }
});

export default AppHeader;
