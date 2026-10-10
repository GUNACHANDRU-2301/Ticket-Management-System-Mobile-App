import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import { API_BASE_URL } from '../../constants/config';

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout, isSuperAdmin, isAdmin } = useContext(AuthContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const { colors, radius, shadows } = theme;

  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);

  const username = userInfo?.username || 'User';
  const role = userInfo?.role || 'Staff';

  return (
    <ResponsiveContainer>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader
          title="Profile"
          subtitle="Account information"
          showBack={navigation?.canGoBack?.()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          showNotification={false}
          showProfile={false}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Hero Header Card */}
        <View
          style={[
            styles.profileHeroCard,
            shadows.md,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
              borderRadius: radius.xl
            }
          ]}
        >
          <Avatar
            name={username}
            size={76}
            color={colors.primary}
            online={true}
            style={styles.avatarWrapper}
          />

          <Text style={[styles.displayName, { color: colors.text }]}>{username}</Text>
          <Text style={[styles.userIdText, { color: colors.textMuted }]}>
            Staff ID: {userInfo?.userId ? `#${userInfo.userId.slice(-6).toUpperCase()}` : '#TMS-USER'}
          </Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
                borderRadius: radius.full
              }
            ]}
          >
            <View style={[styles.roleDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.roleText, { color: colors.primary }]}>{role}</Text>
          </View>
        </View>

        {/* Account Details Section */}
        <View
          style={[
            styles.sectionCard,
            shadows.sm,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
              borderRadius: radius.lg
            }
          ]}
        >
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            ACCOUNT CREDENTIALS
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailIcon}>👤</Text>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Username</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{username}</Text>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailIcon}>🛡️</Text>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Access Role</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{role}</Text>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailIcon}>🏢</Text>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {userInfo?.department || (isAdmin ? 'Campus Administration' : 'Academic Facilities')}
            </Text>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailIcon}>🎓</Text>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Programme</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {userInfo?.programme || (isAdmin ? 'Executive Administration' : 'Campus Infrastructure')}
            </Text>
          </View>
        </View>

        {/* Preferences & Settings */}
        <View
          style={[
            styles.sectionCard,
            shadows.sm,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
              borderRadius: radius.lg
            }
          ]}
        >
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            SYSTEM PREFERENCES
          </Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.backgroundSubtle }]}>
                <Text style={styles.preferenceIcon}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                  Dark Theme
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textMuted }]}>
                  {isDark ? 'Obsidian slate dark mode active' : 'Clean daytime light palette active'}
                </Text>
              </View>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.backgroundSubtle }]}>
                <Text style={styles.preferenceIcon}>🔗</Text>
              </View>
              <View>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                  API Endpoint
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textMuted }]} numberOfLines={1}>
                  {API_BASE_URL}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.backgroundSubtle }]}>
                <Text style={styles.preferenceIcon}>ℹ️</Text>
              </View>
              <View>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                  App Build Version
                </Text>
                <Text style={[styles.preferenceSub, { color: colors.textMuted }]}>
                  TMS Enterprise v2.0.0 (Production)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.dangerLight,
              borderColor: colors.dangerBorder,
              borderRadius: radius.md
            }
          ]}
          onPress={() => setConfirmLogoutVisible(true)}
          activeOpacity={0.82}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Sign Out of Workspace
          </Text>
        </TouchableOpacity>

        <Text style={[styles.copyrightFooter, { color: colors.textMuted }]}>
          Campus Facilities & Maintenance Management System{'\n'}
          Protected by Enterprise Session Security
        </Text>

        {/* Confirmation Modal */}
        <ConfirmDialog
          visible={confirmLogoutVisible}
          title="Sign Out"
          message="Are you sure you want to end your session? You will need to log back in to access tickets."
          confirmText="Sign Out"
          cancelText="Cancel"
          icon="🚪"
          confirmVariant="danger"
          onConfirm={() => {
            setConfirmLogoutVisible(false);
            logout();
          }}
          onCancel={() => setConfirmLogoutVisible(false)}
        />
        </ScrollView>
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  profileHeroCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1
  },
  avatarWrapper: {
    marginBottom: 12
  },
  displayName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4
  },
  userIdText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600'
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderWidth: 1,
    marginTop: 10
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800'
  },
  sectionCard: {
    padding: 18,
    marginBottom: 16,
    borderWidth: 1
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 14
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  detailIcon: {
    fontSize: 15
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  rowDivider: {
    height: 1,
    marginVertical: 4
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  },
  preferenceIcon: {
    fontSize: 16
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  preferenceSub: {
    fontSize: 11.5,
    marginTop: 1
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.2,
    marginTop: 4,
    marginBottom: 20
  },
  logoutIcon: {
    fontSize: 16
  },
  logoutText: {
    fontSize: 14.5,
    fontWeight: '800'
  },
  copyrightFooter: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16
  }
});

export default ProfileScreen;
