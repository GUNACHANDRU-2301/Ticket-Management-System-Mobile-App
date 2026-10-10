import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
  { key: 'Pending', label: 'Submitted', icon: '📝' },
  { key: 'Assigned', label: 'Assigned', icon: '👤' },
  { key: 'In-Progress', label: 'In Progress', icon: '⚙️' },
  { key: 'Completed', label: 'Resolved', icon: '✅' }
];

const LifecycleStepper = ({ currentStatus }) => {
  const { theme } = useTheme();
  const { colors, radius, shadows } = theme;

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Assigned':
        return 1;
      case 'In-Progress':
      case 'On-Hold':
        return 2;
      case 'Completed':
      case 'Closed':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);
  const isOnHold = currentStatus === 'On-Hold';

  return (
    <View
      style={[
        styles.container,
        shadows.sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          borderRadius: radius.lg
        }
      ]}
    >
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        Resolution Lifecycle Timeline
      </Text>

      <View style={styles.trackRow}>
        {STEPS.map((step, index) => {
          const isDone = index < activeIndex || (index === 3 && activeIndex === 3);
          const isCurrent = index === activeIndex;

          let circleBg = colors.backgroundSubtle;
          let textColor = colors.textMuted;
          let circleBorder = colors.border;

          if (isDone) {
            circleBg = colors.successLight;
            circleBorder = colors.success;
            textColor = colors.successDark;
          } else if (isCurrent) {
            if (isOnHold) {
              circleBg = colors.dangerLight;
              circleBorder = colors.danger;
              textColor = colors.dangerDark;
            } else {
              circleBg = colors.primaryLight;
              circleBorder = colors.primary;
              textColor = colors.primary;
            }
          }

          return (
            <React.Fragment key={step.key}>
              <View style={styles.stepNode}>
                <View
                  style={[
                    styles.nodeCircle,
                    {
                      backgroundColor: circleBg,
                      borderColor: circleBorder
                    },
                    isCurrent && styles.nodeCircleCurrent
                  ]}
                >
                  <Text style={styles.nodeIcon}>
                    {isOnHold && isCurrent ? '⏸️' : isDone ? '✓' : step.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.nodeLabel,
                    { color: textColor },
                    isCurrent && styles.nodeLabelCurrent
                  ]}
                >
                  {isOnHold && isCurrent ? 'On-Hold' : step.label}
                </Text>
              </View>

              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connectingLine,
                    {
                      backgroundColor: index < activeIndex ? colors.success : colors.border
                    }
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 16
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  stepNode: {
    alignItems: 'center',
    width: 62
  },
  nodeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  nodeCircleCurrent: {
    elevation: 3
  },
  nodeIcon: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center'
  },
  nodeLabelCurrent: {
    fontWeight: '800'
  },
  connectingLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginBottom: 20
  }
});

export default LifecycleStepper;
