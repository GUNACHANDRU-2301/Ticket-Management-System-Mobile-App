import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import { API_BASE_URL } from '../../constants/config';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { userInfo } = useContext(AuthContext);
  const { colors } = theme;

  const SettingRow = ({ icon, iconColor, iconBg, title, subtitle, right, onPress }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.settingIconBox, { backgroundColor: iconBg || colors.surface }]}>
        <Ionicons name={icon} size={18} color={iconColor || colors.textSecondary} />
      </View>
      <View style={styles.settingTextCol}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.settingSub, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Settings"
        subtitle="App preferences"
        onMenuPress={() => navigation.openDrawer()}
        showNotification={false}
        showProfile={false}
        username={userInfo?.username}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <SettingRow
            icon={isDark ? 'moon' : 'sunny'}
            iconColor={isDark ? '#FBBF24' : '#F59E0B'}
            iconBg={isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(245, 158, 11, 0.1)'}
            title="Dark Mode"
            subtitle={isDark ? 'Dark theme active' : 'Light theme active'}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: '#7C5CFF' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* System */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SYSTEM</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <SettingRow
            icon="server-outline"
            iconColor="#4F7CFF"
            iconBg="rgba(79, 124, 255, 0.12)"
            title="API Server"
            subtitle={API_BASE_URL}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            icon="information-circle-outline"
            iconColor="#22C55E"
            iconBg="rgba(34, 197, 94, 0.12)"
            title="App Version"
            subtitle="TMS v2.0.0 — Enterprise Build"
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <SettingRow
            icon="shield-checkmark-outline"
            iconColor="#7C5CFF"
            iconBg="rgba(124, 92, 255, 0.12)"
            title="Security"
            subtitle="JWT session authentication active"
          />
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ABOUT</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <SettingRow
            icon="document-text-outline"
            iconColor={colors.textSecondary}
            title="Terms of Service"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="lock-closed-outline"
            iconColor={colors.textSecondary}
            title="Privacy Policy"
          />
        </View>

        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Ticket Management System{'\n'}
          © 2024 Enterprise Campus Solutions
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  settingTextCol: {
    flex: 1
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  settingSub: {
    fontSize: 12,
    marginTop: 1
  },
  divider: {
    height: 1,
    marginHorizontal: 14
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 20
  }
});

export default SettingsScreen;
