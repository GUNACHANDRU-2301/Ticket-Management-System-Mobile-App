import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const SkeletonBox = ({ width = '100%', height = 16, borderRadius = 6, style }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true
        })
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity
        },
        style
      ]}
    />
  );
};

export const CardSkeleton = () => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          borderRadius: radius.lg
        }
      ]}
    >
      <View style={styles.topRow}>
        <SkeletonBox width={42} height={42} borderRadius={radius.md} />
        <View style={styles.textCol}>
          <SkeletonBox width="60%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBox width="35%" height={10} />
        </View>
        <SkeletonBox width={60} height={20} borderRadius={10} />
      </View>

      <View style={styles.chipRow}>
        <SkeletonBox width={120} height={22} borderRadius={4} />
        <SkeletonBox width={70} height={22} borderRadius={4} />
      </View>

      <SkeletonBox width="100%" height={28} borderRadius={4} style={{ marginBottom: 10 }} />

      <View style={styles.bottomRow}>
        <SkeletonBox width={26} height={26} borderRadius={13} />
        <SkeletonBox width="45%" height={12} />
        <SkeletonBox width={50} height={12} style={{ marginLeft: 'auto' }} />
      </View>
    </View>
  );
};

export const MetricsSkeleton = () => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  return (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
              borderRadius: radius.lg
            }
          ]}
        >
          <View style={styles.metricTop}>
            <SkeletonBox width={32} height={32} borderRadius={radius.sm} />
            <SkeletonBox width={36} height={16} borderRadius={8} />
          </View>
          <SkeletonBox width={50} height={26} style={{ marginVertical: 8 }} />
          <SkeletonBox width="80%" height={12} />
        </View>
      ))}
    </View>
  );
};

export const ListSkeleton = ({ count = 3 }) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  textCol: {
    flex: 1
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'transparent'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 14
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    margin: 5,
    borderWidth: 1
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  list: {
    paddingVertical: 6
  }
});

export default ListSkeleton;
