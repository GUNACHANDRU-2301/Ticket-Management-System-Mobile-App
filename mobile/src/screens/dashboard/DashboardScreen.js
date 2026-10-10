import React, {
  useState,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
  StatusBar,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  DrawerActions,
} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import {
  getComplaintStatsApi,
  getRecentComplaintsApi,
} from '../../api/complaints';

import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import StatusSummary from '../../components/StatusSummary';
import RecentComplaintRow from '../../components/RecentComplaintRow';
import PressableScale from '../../components/PressableScale';

import {
  MetricsSkeleton,
  ListSkeleton,
} from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { userInfo, isAdmin, isUser } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};
  const shadows = theme?.shadows || {};
  const categories = Array.isArray(theme?.categories)
    ? theme.categories
    : [];

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    closed: 0,
  });

  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  // Theme-aware colors.
  const palette = {
    background:
      colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    card:
      colors.card ||
      colors.surface ||
      (isDark ? '#151B2D' : '#FFFFFF'),
    surface:
      colors.surface ||
      colors.card ||
      (isDark ? '#151B2D' : '#FFFFFF'),
    text: colors.text || (isDark ? '#F5F7FF' : '#151936'),
    secondary:
      colors.textSecondary ||
      (isDark ? '#A8B0C5' : '#69718B'),
    muted:
      colors.textMuted ||
      (isDark ? '#8D96AE' : '#8A91A7'),
    border: colors.border || (isDark ? '#283149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    warning: colors.warning || '#F59E0B',
    accent: colors.accent || '#38BDF8',
    success: colors.success || '#22C55E',
  };

  // Intro animation.
  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fadeAnim, slideAnim]);

  // Fetch dashboard data using the existing APIs.
  const fetchData = useCallback(async () => {
    try {
      if (!userInfo) {
        return;
      }

      const [statsData, recentData] = await Promise.all([
        getComplaintStatsApi(userInfo.role, userInfo.userId),
        getRecentComplaintsApi(userInfo.role, userInfo.userId),
      ]);

      setStats({
        total: Number(statsData?.total) || 0,
        pending: Number(statsData?.pending) || 0,
        assigned: Number(statsData?.assigned) || 0,
        closed: Number(statsData?.closed) || 0,
      });

      setRecentTickets(Array.isArray(recentData) ? recentData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo]);

  // Refresh data whenever the dashboard gains focus.
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Pull-to-refresh.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';

    return 'Good evening';
  };

  const username = userInfo?.username || 'User';
  const displayRecent = recentTickets.slice(0, 4);

  // Open the existing complaints screen with a status filter.
  const openComplaintList = (status = 'All') => {
    navigation.navigate('Complaints', {
      screen: 'ComplaintList',
      params: { status },
    });
  };

  // Dashboard statistics.
  const metricCards = [
    {
      title: 'Total complaints',
      value: stats.total,
      subtitle: 'All reported issues',
      icon: 'documents-outline',
      color: '#5B8CFF',
      tint: 'rgba(91,140,255,0.14)',
      status: 'All',
    },
    {
      title: 'Pending',
      value: stats.pending,
      subtitle: 'Awaiting action',
      icon: 'time-outline',
      color: '#F5A524',
      tint: 'rgba(245,165,36,0.14)',
      status: 'Pending',
    },
    {
      title: 'Assigned',
      value: stats.assigned,
      subtitle: 'Work in progress',
      icon: 'people-outline',
      color: '#9A72FF',
      tint: 'rgba(154,114,255,0.14)',
      status: 'Assigned',
    },
    {
      title: 'Closed',
      value: stats.closed,
      subtitle: 'Successfully resolved',
      icon: 'checkmark-circle-outline',
      color: '#22B879',
      tint: 'rgba(34,184,121,0.14)',
      status: 'Closed',
    },
  ];

  const renderMetricCard = (item) => (
    <Pressable
      key={item.title}
      onPress={() => openComplaintList(item.status)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}: ${item.value}`}
      style={({ pressed }) => [
        styles.metricCard,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.metricTop}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: item.tint },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={21}
            color={item.color}
          />
        </View>

        <Ionicons
          name="open-outline"
          size={17}
          color={palette.muted}
        />
      </View>

      <Text style={[styles.metricValue, { color: palette.text }]}>
        {loading ? '—' : item.value}
      </Text>

      <Text
        style={[styles.metricTitle, { color: palette.text }]}
        numberOfLines={1}
      >
        {item.title}
      </Text>

      <Text
        style={[
          styles.metricSubtitle,
          { color: palette.secondary },
        ]}
        numberOfLines={1}
      >
        {item.subtitle}
      </Text>

      <View
        style={[
          styles.metricAccent,
          { backgroundColor: item.color },
        ]}
      />
    </Pressable>
  );

  // Available actions depend on the user's permissions.
  const quickActions = [
    ...(isUser || isAdmin
      ? [
          {
            title: 'Raise complaint',
            subtitle: 'Report a new issue',
            icon: 'add-circle-outline',
            onPress: () => navigation.navigate('RaiseComplaint'),
            primary: true,
          },
        ]
      : []),
    {
      title: 'View complaints',
      subtitle: 'Track ticket progress',
      icon: 'file-tray-full-outline',
      onPress: () => navigation.navigate('Complaints'),
      primary: false,
      color: '#5B8CFF',
    },
    {
      title: 'Reports & insights',
      subtitle: 'Review service activity',
      icon: 'bar-chart-outline',
      onPress: () => navigation.navigate('Reports'),
      primary: false,
      color: '#22B879',
    },
  ];

  return (
    <ResponsiveContainer
      style={{ backgroundColor: palette.background }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />

      <AppHeader
        title="Dashboard"
        subtitle="Real-time facility ticket status"
        onMenuPress={() =>
          navigation.dispatch(DrawerActions.openDrawer())
        }
        onNotificationPress={() =>
          openComplaintList(stats.pending > 0 ? 'Pending' : 'All')
        }
        onProfilePress={() => navigation.navigate('Profile')}
        username={username}
        pendingCount={stats.pending}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom + 28, 42),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Welcome banner */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeGlowOne} />
            <View style={styles.welcomeGlowTwo} />

            <View style={styles.welcomeContent}>
              <View style={styles.welcomeEyebrow}>
                <View style={styles.liveDot} />
                <Text style={styles.welcomeEyebrowText}>
                  FACILITY OVERVIEW
                </Text>
              </View>

              <Text style={styles.welcomeTitle}>
                {getGreeting()},{'\n'}
                <Text style={styles.welcomeName}>
                  {username}
                </Text>
              </Text>

              <Text style={styles.welcomeSubtitle}>
                Here’s what’s happening across your facility today.
              </Text>
            </View>

            <View style={styles.welcomeIcon}>
              <Ionicons
                name="grid-outline"
                size={30}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.welcomeBottomRow}>
              <View style={styles.welcomeStatusPill}>
                <Ionicons
                  name="pulse-outline"
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.welcomeStatusText}>
                  Live overview
                </Text>
              </View>

              <Text style={styles.welcomeDate}>
                {new Date().toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          </View>

          {/* Overview heading */}
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: palette.text },
                ]}
              >
                Overview
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Complaint status at a glance
              </Text>
            </View>

            <Pressable
              onPress={() => openComplaintList('All')}
              style={styles.viewAllButton}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.viewAllText,
                  { color: palette.primary },
                ]}
              >
                View all
              </Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={palette.primary}
              />
            </Pressable>
          </View>

          {/* Statistics cards */}
          {loading ? (
            <MetricsSkeleton />
          ) : (
            <View style={styles.metricsGrid}>
              {metricCards.map(renderMetricCard)}
            </View>
          )}

          {/* Complaint analytics */}
          <View
            style={[
              styles.analyticsCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
              shadows.sm,
            ]}
          >
            <View style={styles.cardHeadingRow}>
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: palette.text },
                  ]}
                >
                  Complaint status
                </Text>
                <Text
                  style={[
                    styles.cardSubtitle,
                    { color: palette.secondary },
                  ]}
                >
                  Current ticket distribution
                </Text>
              </View>

              <View style={styles.analyticsIcon}>
                <Ionicons
                  name="pie-chart-outline"
                  size={20}
                  color={palette.primary}
                />
              </View>
            </View>

            <StatusSummary
              stats={stats}
              onPress={() => openComplaintList('All')}
            />

            {/* Status progress bars */}
            <View style={styles.statusBreakdown}>
              {[
                {
                  label: 'Pending',
                  value: stats.pending,
                  color: '#F5A524',
                },
                {
                  label: 'Assigned',
                  value: stats.assigned,
                  color: '#9A72FF',
                },
                {
                  label: 'Closed',
                  value: stats.closed,
                  color: '#22B879',
                },
              ].map((item) => {
                const total = Number(stats.total) || 0;
                const value = Number(item.value) || 0;

                const percentage =
                  total > 0
                    ? Math.min((value / total) * 100, 100)
                    : 0;

                return (
                  <View
                    key={item.label}
                    style={styles.statusItem}
                  >
                    <View style={styles.statusLabelRow}>
                      <View style={styles.statusLabelLeft}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusLabel,
                            { color: palette.secondary },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.statusValue,
                          { color: palette.text },
                        ]}
                      >
                        {value}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.progressTrack,
                        {
                          backgroundColor: isDark
                            ? '#252D43'
                            : '#EEF0F8',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: palette.text },
                ]}
              >
                Quick actions
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Get things done faster
              </Text>
            </View>
          </View>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <PressableScale
                key={action.title}
                onPress={action.onPress}
                accessibilityLabel={action.title}
                style={[
                  styles.quickActionCard,
                  {
                    backgroundColor: action.primary
                      ? PURPLE
                      : palette.card,
                    borderColor: action.primary
                      ? PURPLE
                      : palette.border,
                  },
                  shadows.sm,
                ]}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    {
                      backgroundColor: action.primary
                        ? 'rgba(255,255,255,0.18)'
                        : isDark
                          ? 'rgba(124,92,255,0.16)'
                          : 'rgba(124,92,255,0.10)',
                    },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={22}
                    color={
                      action.primary
                        ? '#FFFFFF'
                        : action.color || palette.primary
                    }
                  />
                </View>

                <View style={styles.quickActionText}>
                  <Text
                    style={[
                      styles.quickActionTitle,
                      {
                        color: action.primary
                          ? '#FFFFFF'
                          : palette.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {action.title}
                  </Text>

                  <Text
                    style={[
                      styles.quickActionSubtitle,
                      {
                        color: action.primary
                          ? 'rgba(255,255,255,0.78)'
                          : palette.secondary,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {action.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={
                    action.primary ? '#FFFFFF' : palette.muted
                  }
                />
              </PressableScale>
            ))}
          </View>

          {/* Service categories */}
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: palette.text },
                ]}
              >
                Service categories
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Browse complaints by type
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <PressableScale
                key={category.id}
                onPress={() =>
                  navigation.navigate('Complaints', {
                    screen: 'ComplaintList',
                    params: { search: category.id },
                  })
                }
                accessibilityLabel={`Filter by ${category.name}`}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        category.bg ||
                        'rgba(124,92,255,0.12)',
                    },
                  ]}
                >
                  <Ionicons
                    name={category.iconName || 'build-outline'}
                    size={16}
                    color={category.color || palette.primary}
                  />
                </View>

                <Text
                  style={[
                    styles.categoryText,
                    { color: palette.text },
                  ]}
                >
                  {category.name}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>

          {/* Recent complaints */}
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: palette.text },
                ]}
              >
                Recent complaints
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Latest reported campus issues
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('Complaints')}
              style={styles.viewAllButton}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.viewAllText,
                  { color: palette.primary },
                ]}
              >
                View all
              </Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={palette.primary}
              />
            </Pressable>
          </View>

          {loading ? (
            <ListSkeleton count={3} />
          ) : displayRecent.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={30}
                  color={palette.success}
                />
              </View>

              <Text
                style={[
                  styles.emptyTitle,
                  { color: palette.text },
                ]}
              >
                You’re all caught up
              </Text>

              <Text
                style={[
                  styles.emptySubtitle,
                  { color: palette.secondary },
                ]}
              >
                There are no recent complaints to show right now.
              </Text>

              {(isUser || isAdmin) && (
                <PressableScale
                  onPress={() =>
                    navigation.navigate('RaiseComplaint')
                  }
                  style={styles.emptyButton}
                >
                  <Ionicons
                    name="add"
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.emptyButtonText}>
                    Raise a complaint
                  </Text>
                </PressableScale>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.recentCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
                shadows.sm,
              ]}
            >
              {displayRecent.map((ticket, index) => (
                <View
                  key={ticket._id || ticket.id || index}
                >
                  {index > 0 && (
                    <View
                      style={[
                        styles.ticketDivider,
                        { backgroundColor: palette.border },
                      ]}
                    />
                  )}

                  <RecentComplaintRow
                    ticket={ticket}
                    onPress={() =>
                      navigation.navigate('Complaints', {
                        screen: 'ComplaintDetail',
                        params: { ticket },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </ResponsiveContainer>
  );
};

// Dashboard styles.
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Welcome banner
  welcomeCard: {
    minHeight: 202,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: PURPLE,
  },
  welcomeGlowOne: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -105,
    right: -30,
  },
  welcomeGlowTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(39,20,119,0.18)',
    bottom: -90,
    right: 65,
  },
  welcomeContent: {
    paddingRight: 52,
  },
  welcomeEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#A7F3D0',
    marginRight: 7,
  },
  welcomeEyebrowText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  welcomeName: {
    color: '#FFFFFF',
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 260,
  },
  welcomeIcon: {
    position: 'absolute',
    right: 20,
    top: 22,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  welcomeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
  },
  welcomeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  welcomeStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 5,
  },
  welcomeDate: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '600',
  },

  // Section headers
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.35,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    marginTop: 3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Statistics cards
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  metricCard: {
    width: '48.3%',
    minHeight: 148,
    borderWidth: 1,
    borderRadius: 19,
    padding: 13,
    marginBottom: 10,
    overflow: 'hidden',
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  metricSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },
  metricAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    opacity: 0.85,
  },

  // Analytics
  analyticsCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },
  analyticsIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(124,92,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBreakdown: {
    marginTop: 8,
    gap: 13,
  },
  statusItem: {
    gap: 7,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  // Quick actions
  quickActionsGrid: {
    gap: 10,
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    borderRadius: 17,
    borderWidth: 1,
    padding: 13,
  },
  quickActionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
    marginRight: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  quickActionSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },

  // Category chips
  categoryScroll: {
    paddingBottom: 4,
    paddingTop: 1,
    paddingRight: 4,
    gap: 9,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginBottom: 22,
  },
  categoryIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Recent complaints
  recentCard: {
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  ticketDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 4,
  },
  emptyCard: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(34,184,121,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 250,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 15,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
});

export default DashboardScreen;