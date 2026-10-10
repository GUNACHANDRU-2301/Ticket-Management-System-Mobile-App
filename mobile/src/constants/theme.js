// Theme configuration supporting Light and Dark modes
export const LIGHT_THEME = {
  mode: 'light',
  colors: {
    // Brand Core Palette
    primary: '#4F46E5',        // Indigo
    primaryDark: '#3730A3',
    primaryLight: '#EEF2FF',
    primaryGlow: 'rgba(79, 70, 229, 0.12)',

    accent: '#0284C7',         // Ocean Sky Blue
    accentLight: '#F0F9FF',
    accentGlow: 'rgba(2, 132, 199, 0.12)',

    // Header & Hero Obsidian Dark
    headerBg: '#0F172A',
    headerCard: '#1E293B',
    headerText: '#FFFFFF',
    headerSubtext: '#94A3B8',
    headerBorder: '#334155',

    // Canvas Neutrals
    background: '#F8FAFC',
    backgroundSubtle: '#F1F5F9',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',

    // Status System
    success: '#16A34A',
    successDark: '#15803D',
    successLight: '#DCFCE7',
    successBorder: '#BBF7D0',

    warning: '#F59E0B',
    warningDark: '#D97706',
    warningLight: '#FEF3C7',
    warningBorder: '#FDE68A',

    danger: '#DC2626',
    dangerDark: '#B91C1C',
    dangerLight: '#FEE2E2',
    dangerBorder: '#FECACA',

    info: '#2563EB',
    infoDark: '#1D4ED8',
    infoLight: '#DBEAFE',
    infoBorder: '#BFDBFE',

    purple: '#7C3AED',
    purpleLight: '#F5F3FF',
    purpleBorder: '#DDD6FE',

    // Status Pill Presets
    status: {
      Pending: {
        bg: '#FEF3C7',
        text: '#B45309',
        border: '#FDE68A',
        dot: '#F59E0B',
        icon: '⏳',
        label: 'Pending'
      },
      Assigned: {
        bg: '#DBEAFE',
        text: '#1D4ED8',
        border: '#BFDBFE',
        dot: '#2563EB',
        icon: '👤',
        label: 'Assigned'
      },
      'In-Progress': {
        bg: '#EEF2FF',
        text: '#4338CA',
        border: '#C7D2FE',
        dot: '#4F46E5',
        icon: '⚙️',
        label: 'In-Progress'
      },
      'On-Hold': {
        bg: '#FEE2E2',
        text: '#B91C1C',
        border: '#FECACA',
        dot: '#DC2626',
        icon: '⏸️',
        label: 'On-Hold'
      },
      Completed: {
        bg: '#DCFCE7',
        text: '#15803D',
        border: '#BBF7D0',
        dot: '#16A34A',
        icon: '✅',
        label: 'Closed'
      },
      Closed: {
        bg: '#DCFCE7',
        text: '#15803D',
        border: '#BBF7D0',
        dot: '#16A34A',
        icon: '✅',
        label: 'Closed'
      }
    }
  }
};

export const DARK_THEME = {
  mode: 'dark',
  colors: {
    // Brand Core Palette
    primary: '#6366F1',        // Electric Indigo
    primaryDark: '#4F46E5',
    primaryLight: 'rgba(99, 102, 241, 0.16)',
    primaryGlow: 'rgba(99, 102, 241, 0.25)',

    accent: '#38BDF8',
    accentLight: 'rgba(56, 189, 248, 0.14)',
    accentGlow: 'rgba(56, 189, 248, 0.22)',

    // Header & Hero Dark
    headerBg: '#070B14',
    headerCard: '#151D2E',
    headerText: '#F8FAFC',
    headerSubtext: '#94A3B8',
    headerBorder: 'rgba(255, 255, 255, 0.08)',

    // Canvas Neutrals
    background: '#070B14',
    backgroundSubtle: '#0B1020',
    surface: '#111827',
    card: '#151D2E',
    cardElevated: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.04)',
    divider: 'rgba(255, 255, 255, 0.06)',

    // Status System
    success: '#22C55E',
    successDark: '#16A34A',
    successLight: 'rgba(34, 197, 94, 0.15)',
    successBorder: 'rgba(34, 197, 94, 0.35)',

    warning: '#F59E0B',
    warningDark: '#D97706',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    warningBorder: 'rgba(245, 158, 11, 0.35)',

    danger: '#EF4444',
    dangerDark: '#DC2626',
    dangerLight: 'rgba(239, 68, 68, 0.15)',
    dangerBorder: 'rgba(239, 68, 68, 0.35)',

    info: '#3B82F6',
    infoDark: '#2563EB',
    infoLight: 'rgba(59, 130, 246, 0.15)',
    infoBorder: 'rgba(59, 130, 246, 0.35)',

    purple: '#7C6CFF',
    purpleLight: 'rgba(124, 108, 255, 0.15)',
    purpleBorder: 'rgba(124, 108, 255, 0.35)',

    // Status Pill Presets
    status: {
      Pending: {
        bg: 'rgba(245, 158, 11, 0.12)',
        text: '#FBBF24',
        border: 'rgba(245, 158, 11, 0.3)',
        dot: '#F59E0B',
        icon: 'time-outline',
        label: 'Pending'
      },
      Assigned: {
        bg: 'rgba(59, 130, 246, 0.12)',
        text: '#93C5FD',
        border: 'rgba(59, 130, 246, 0.3)',
        dot: '#3B82F6',
        icon: 'person-outline',
        label: 'Assigned'
      },
      'In-Progress': {
        bg: 'rgba(99, 102, 241, 0.14)',
        text: '#C7D2FE',
        border: 'rgba(99, 102, 241, 0.3)',
        dot: '#818CF8',
        icon: 'construct-outline',
        label: 'In-Progress'
      },
      'On-Hold': {
        bg: 'rgba(239, 68, 68, 0.12)',
        text: '#FCA5A5',
        border: 'rgba(239, 68, 68, 0.3)',
        dot: '#EF4444',
        icon: 'pause-circle-outline',
        label: 'On-Hold'
      },
      Completed: {
        bg: 'rgba(34, 197, 94, 0.12)',
        text: '#86EFAC',
        border: 'rgba(34, 197, 94, 0.3)',
        dot: '#22C55E',
        icon: 'checkmark-circle-outline',
        label: 'Closed'
      },
      Closed: {
        bg: 'rgba(34, 197, 94, 0.12)',
        text: '#86EFAC',
        border: 'rgba(34, 197, 94, 0.3)',
        dot: '#22C55E',
        icon: 'checkmark-circle-outline',
        label: 'Closed'
      }
    }
  }
};

export const COMMON_THEME = {
  typography: {
    screenTitle: {
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700'
    },
    body: {
      fontSize: 14,
      fontWeight: '500'
    },
    secondary: {
      fontSize: 12,
      fontWeight: '500'
    },
    caption: {
      fontSize: 11,
      fontWeight: '600'
    }
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999
  },

  shadows: {
    none: {},
    sm: {
      shadowColor: '#070B14',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 2
    },
    md: {
      shadowColor: '#070B14',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 3
    },
    lg: {
      shadowColor: '#070B14',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 6
    },
    xl: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.2,
      shadowRadius: 28,
      elevation: 10
    }
  },

  // Category Configuration with Ionicons vector icons
  categories: [
    {
      id: 'Electrician',
      name: 'Electrical',
      fullLabel: 'Electrical / Wiring',
      desc: 'Lights, switches, power outages & wiring',
      icon: '⚡',
      iconName: 'flash-outline',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    {
      id: 'Plumber',
      name: 'Plumbing',
      fullLabel: 'Plumbing & Water',
      desc: 'Pipes, taps, water leaks & drainage',
      icon: '🚰',
      iconName: 'water-outline',
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.3)'
    },
    {
      id: 'Carpenter',
      name: 'Carpentry',
      fullLabel: 'Carpentry & Woodwork',
      desc: 'Benches, doors, locks & wood furniture',
      icon: '🪚',
      iconName: 'construct-outline',
      color: '#F97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.3)'
    },
    {
      id: 'IT Support',
      name: 'IT Support',
      fullLabel: 'IT & Networking',
      desc: 'LAN, Wi-Fi, projectors, lab PCs & audio',
      icon: '💻',
      iconName: 'desktop-outline',
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.3)'
    },
    {
      id: 'AC Technician',
      name: 'AC & HVAC',
      fullLabel: 'AC & Air Conditioning',
      desc: 'Cooling issues, thermostat & duct noise',
      icon: '❄️',
      iconName: 'snow-outline',
      color: '#14B8A6',
      bg: 'rgba(20, 184, 166, 0.12)',
      border: 'rgba(20, 184, 166, 0.3)'
    },
    {
      id: 'Cleaning',
      name: 'Housekeeping',
      fullLabel: 'Cleaning & Sanitation',
      desc: 'Waste disposal, washroom & floor clean',
      icon: '🧹',
      iconName: 'sparkles-outline',
      color: '#22C55E',
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.3)'
    },
    {
      id: 'General',
      name: 'General',
      fullLabel: 'General Maintenance',
      desc: 'Civil repairs, ceiling, paint & masonry',
      icon: '🔧',
      iconName: 'build-outline',
      color: '#94A3B8',
      bg: 'rgba(148, 163, 184, 0.12)',
      border: 'rgba(148, 163, 184, 0.3)'
    }
  ],

  categoryIcons: {
    Electrician: { icon: '⚡', iconName: 'flash-outline', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', label: 'Electrical' },
    Plumber: { icon: '🚰', iconName: 'water-outline', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)', label: 'Plumbing' },
    Carpenter: { icon: '🪚', iconName: 'construct-outline', color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)', label: 'Carpentry' },
    'IT Support': { icon: '💻', iconName: 'desktop-outline', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)', label: 'IT Support' },
    'AC Technician': { icon: '❄️', iconName: 'snow-outline', color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.3)', label: 'AC Technician' },
    Cleaning: { icon: '🧹', iconName: 'sparkles-outline', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)', label: 'Cleaning' },
    General: { icon: '🔧', iconName: 'build-outline', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)', label: 'General' }
  }
};

// Default export for backward compatibility
export const THEME = {
  ...COMMON_THEME,
  colors: LIGHT_THEME.colors
};

export const COLORS = THEME.colors;
