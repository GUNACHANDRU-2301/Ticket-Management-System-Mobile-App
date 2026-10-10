import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.searchBox,
        {
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
          borderRadius: radius.md
        },
        style
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.clearIcon, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingHorizontal: 12
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500'
  },
  clearBtn: {
    padding: 4
  },
  clearIcon: {
    fontSize: 13
  }
});

export default SearchBar;
