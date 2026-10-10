import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ResponsiveContainer = ({ children, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.outerBackground, { backgroundColor: colors.background }]}>
      <View style={[styles.innerContainer, { backgroundColor: colors.background }, style]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBackground: {
    flex: 1,
    alignItems: 'center'
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1020 : '100%'
  }
});

export default ResponsiveContainer;
