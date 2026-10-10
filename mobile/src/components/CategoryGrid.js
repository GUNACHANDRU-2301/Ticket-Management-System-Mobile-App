import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CategoryGrid = ({ selectedCategory, onSelectCategory }) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>
        Select Service Category *
      </Text>
      <View style={styles.grid}>
        {theme.categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? cat.color : colors.border,
                  borderRadius: radius.md
                },
                isSelected && { backgroundColor: isSelected ? cat.bg : colors.surface }
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.82}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isSelected ? '#FFFFFF' : cat.bg,
                    borderRadius: radius.sm
                  }
                ]}
              >
                <Text style={styles.icon}>{cat.icon}</Text>
              </View>

              <View style={styles.textCol}>
                <Text
                  style={[
                    styles.catName,
                    { color: colors.text },
                    isSelected && { color: cat.color, fontWeight: '800' }
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
                <Text
                  style={[styles.catDesc, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {cat.desc}
                </Text>
              </View>

              {isSelected && (
                <View
                  style={[
                    styles.checkCircle,
                    { backgroundColor: cat.color, borderRadius: radius.full }
                  ]}
                >
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10
  },
  grid: {
    gap: 8
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12
  },
  iconBox: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    fontSize: 18
  },
  textCol: {
    flex: 1
  },
  catName: {
    fontSize: 14,
    fontWeight: '700'
  },
  catDesc: {
    fontSize: 11,
    marginTop: 2
  },
  checkCircle: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  }
});

export default CategoryGrid;
