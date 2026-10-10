import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  leadingIcon,
  clearable = false,
  error,
  helperText,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  disabled = false,
  style,
  inputStyle
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
          {maxLength && multiline && (
            <Text style={[styles.counter, { color: colors.textMuted }]}>
              {(value || '').length} / {maxLength}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.primary
              : colors.border,
            borderRadius: radius.md
          },
          multiline && styles.multilineWrapper,
          disabled && { opacity: 0.6 }
        ]}
      >
        {leadingIcon && (
          <View style={styles.leadingIconBox}>
            {leadingIcon}
          </View>
        )}

        <TextInput
          style={[
            styles.textInput,
            { color: colors.text },
            multiline && {
              height: numberOfLines * 24 + 16,
              textAlignVertical: 'top'
            },
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {clearable && value ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.actionIcon, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        ) : null}

        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.actionIcon}>
              {isPasswordVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  counter: {
    fontSize: 11,
    fontWeight: '600'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingHorizontal: 12
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 10
  },
  leadingIconBox: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 11,
    fontWeight: '500'
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4
  },
  actionIcon: {
    fontSize: 14
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4
  },
  helperText: {
    fontSize: 11.5,
    marginTop: 4
  }
});

export default Input;
