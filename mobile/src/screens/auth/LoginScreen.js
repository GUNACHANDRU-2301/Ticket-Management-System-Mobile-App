import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PURPLE = '#7C5CFF';

const ROLE_PRESETS = [
  {
    id: 'admin',
    title: 'SuperAdmin',
    username: 'admin',
    password: 'password123',
    desc: 'Manage masters, tickets and reports',
    color: '#8B5CF6',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'tech',
    title: 'Technician',
    username: 'Tech_tms',
    password: 'tech123',
    desc: 'View assigned repairs and update progress',
    color: '#0284C7',
    icon: 'construct-outline',
  },
  {
    id: 'user',
    title: 'Faculty / User',
    username: 'CS(HOD)',
    password: 'password123',
    desc: 'Report campus issues and track complaints',
    color: '#16A34A',
    icon: 'school-outline',
  },
];

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};

  const palette = {
    background:
      colors.background || (isDark ? '#0B1020' : '#F4F3FC'),
    card: colors.card || (isDark ? '#151B2D' : '#FFFFFF'),
    text: colors.text || (isDark ? '#F5F7FF' : '#17172E'),
    secondary:
      colors.textSecondary || (isDark ? '#A8B0C5' : '#69718B'),
    muted:
      colors.textMuted || (isDark ? '#8D96AE' : '#8A91A7'),
    border: colors.border || (isDark ? '#2B344B' : '#E6E7F0'),
    primary: colors.primary || PURPLE,
    input: isDark ? '#101729' : '#F8F8FD',
    error: colors.danger || '#DC2626',
    success: colors.success || '#16A34A',
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const result = await login(
        username.trim(),
        password.trim()
      );

      if (!result?.success) {
        setErrorMessage(
          result?.message ||
            'Login failed. Please check your credentials.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        'Unable to sign in. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setUsername(preset.username);
    setPassword(preset.password);
    setErrorMessage('');
  };

  const handleUsernameChange = (value) => {
    setUsername(value);
    setSelectedPreset(null);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setSelectedPreset(null);
    if (errorMessage) setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: palette.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#241650"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TMS branded hero */}
        <View style={styles.hero}>
          <View style={styles.glowOne} />
          <View style={styles.glowTwo} />

          <View style={styles.logoFrame}>
            <Image
              source={require('../../../assets/tms-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="TMS campus maintenance logo"
            />
          </View>

          <Text style={styles.brandTitle}>
            TMS Facilities
          </Text>

          <Text style={styles.brandSubtitle}>
            TICKET MANAGEMENT SYSTEM
          </Text>

          <View style={styles.heroDivider} />

          <Text style={styles.heroDescription}>
            Campus Infrastructure & Maintenance
          </Text>
        </View>

        {/* Login form */}
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.headingRow}>
            <View style={styles.headingTextContainer}>
              <Text
                style={[
                  styles.welcomeTitle,
                  { color: palette.text },
                ]}
              >
                Welcome back!
              </Text>

              <Text
                style={[
                  styles.welcomeSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Sign in to access your workspace.
              </Text>
            </View>

            <View
              style={[
                styles.headingIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(124,92,255,0.18)'
                    : '#F0ECFF',
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={23}
                color={palette.primary}
              />
            </View>
          </View>

          {/* Role presets */}
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionLabel,
                { color: palette.text },
              ]}
            >
              QUICK ACCESS
            </Text>

            <Text
              style={[
                styles.sectionHint,
                { color: palette.secondary },
              ]}
            >
              Tap to fill
            </Text>
          </View>

          <View style={styles.presetsList}>
            {ROLE_PRESETS.map((preset) => {
              const active = selectedPreset === preset.id;

              return (
                <Pressable
                  key={preset.id}
                  onPress={() => handleSelectPreset(preset)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${preset.title} preset`}
                  style={({ pressed }) => [
                    styles.presetCard,
                    {
                      backgroundColor: active
                        ? isDark
                          ? 'rgba(124,92,255,0.17)'
                          : '#F1EDFF'
                        : palette.input,
                      borderColor: active
                        ? preset.color
                        : palette.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.presetIcon,
                      {
                        backgroundColor: `${preset.color}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={preset.icon}
                      size={21}
                      color={preset.color}
                    />
                  </View>

                  <View style={styles.presetContent}>
                    <Text
                      style={[
                        styles.presetTitle,
                        { color: palette.text },
                      ]}
                    >
                      {preset.title}
                    </Text>

                    <Text
                      style={[
                        styles.presetDescription,
                        { color: palette.secondary },
                      ]}
                      numberOfLines={2}
                    >
                      {preset.desc}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.presetSelectIcon,
                      {
                        backgroundColor: active
                          ? preset.color
                          : 'transparent',
                        borderColor: active
                          ? preset.color
                          : palette.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        active
                          ? 'checkmark'
                          : 'chevron-forward'
                      }
                      size={15}
                      color={active ? '#FFFFFF' : palette.muted}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: palette.border },
              ]}
            />

            <Text
              style={[
                styles.dividerText,
                { color: palette.secondary },
              ]}
            >
              OR SIGN IN MANUALLY
            </Text>

            <View
              style={[
                styles.dividerLine,
                { backgroundColor: palette.border },
              ]}
            />
          </View>

          {/* Error message */}
          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: isDark
                    ? 'rgba(220,38,38,0.13)'
                    : '#FEF2F2',
                  borderColor: isDark
                    ? '#7F1D1D'
                    : '#FECACA',
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={palette.error}
              />

              <Text
                style={[
                  styles.errorText,
                  { color: palette.error },
                ]}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Username */}
          <Text
            style={[
              styles.inputLabel,
              { color: palette.text },
            ]}
          >
            Username or Staff ID
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: palette.input,
                borderColor: palette.border,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={19}
              color={palette.muted}
            />

            <TextInput
              style={[
                styles.textInput,
                { color: palette.text },
              ]}
              placeholder="Enter your username"
              placeholderTextColor={palette.muted}
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="next"
              accessibilityLabel="Username or Staff ID"
              editable={!loading}
            />

            {username.length > 0 && (
              <Pressable
                onPress={() => handleUsernameChange('')}
                accessibilityRole="button"
                accessibilityLabel="Clear username"
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={palette.muted}
                />
              </Pressable>
            )}
          </View>

          {/* Password */}
          <Text
            style={[
              styles.inputLabel,
              styles.passwordLabel,
              { color: palette.text },
            ]}
          >
            Password
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: palette.input,
                borderColor: palette.border,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={palette.muted}
            />

            <TextInput
              style={[
                styles.textInput,
                { color: palette.text },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={palette.muted}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              accessibilityLabel="Password"
              editable={!loading}
            />

            <Pressable
              onPress={() =>
                setShowPassword((previous) => !previous)
              }
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={20}
                color={palette.muted}
              />
            </Pressable>
          </View>

          {/* Sign in */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: palette.primary,
                opacity: loading ? 0.75 : pressed ? 0.88 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text style={styles.loginButtonText}>
                  Sign In to Workspace
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          <View style={styles.secureNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={palette.success}
            />

            <Text
              style={[
                styles.secureNoteText,
                { color: palette.secondary },
              ]}
            >
              Secure login with role-based access
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: palette.muted },
            ]}
          >
            TMS Facilities & Maintenance
          </Text>

          <Text
            style={[
              styles.footerSubtext,
              { color: palette.muted },
            ]}
          >
            Campus service management
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  // Branding
  hero: {
    backgroundColor: '#241650',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 76,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },

  glowOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124,92,255,0.22)',
    top: -105,
    right: -55,
  },

  glowTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(79,70,229,0.18)',
    bottom: -105,
    left: -60,
  },

  logoFrame: {
    width: 128,
    height: 128,
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: '#21115B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  logoImage: {
    width: '100%',
    height: '100%',
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
  },

  brandSubtitle: {
    color: '#C4B5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
    textAlign: 'center',
  },

  heroDivider: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#A78BFA',
    marginTop: 17,
    marginBottom: 12,
  },

  heroDescription: {
    color: '#E5E7EB',
    fontSize: 12,
    textAlign: 'center',
  },

  // Form card
  formCard: {
    marginHorizontal: 17,
    marginTop: -46,
    paddingHorizontal: 19,
    paddingVertical: 22,
    borderRadius: 25,
    borderWidth: 1,
    elevation: 7,
    shadowColor: '#35216B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
  },

  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 23,
  },

  headingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  welcomeSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  headingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Presets
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionHint: {
    fontSize: 11,
    fontWeight: '600',
  },

  presetsList: {
    gap: 9,
  },

  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
  },

  presetIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  presetContent: {
    flex: 1,
    paddingRight: 5,
  },

  presetTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  presetDescription: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },

  presetSelectIcon: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 10,
  },

  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // Errors
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    gap: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  // Inputs
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },

  passwordLabel: {
    marginTop: 17,
  },

  inputWrapper: {
    minHeight: 53,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 10,
  },

  textInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 13,
    minWidth: 0,
  },

  // Login button
  loginButton: {
    minHeight: 54,
    borderRadius: 15,
    paddingHorizontal: 17,
    marginTop: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
  },

  secureNoteText: {
    fontSize: 10.5,
    fontWeight: '600',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 23,
  },

  footerText: {
    fontSize: 11,
    fontWeight: '800',
  },

  footerSubtext: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default LoginScreen;