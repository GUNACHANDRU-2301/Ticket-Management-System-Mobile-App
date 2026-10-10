import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
  DrawerActions,
} from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import { getComplaintsApi } from '../../api/complaints';

import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import TicketCard from '../../components/TicketCard';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { ListSkeleton } from '../../components/LoadingSkeleton';

const PURPLE = '#7C5CFF';

const STATUS_TABS = [
  { key: 'All', label: 'All', icon: 'layers-outline' },
  { key: 'Pending', label: 'Pending', icon: 'time-outline' },
  { key: 'Assigned', label: 'Assigned', icon: 'people-outline' },
  { key: 'In-Progress', label: 'In Progress', icon: 'construct-outline' },
  { key: 'Completed', label: 'Closed', icon: 'checkmark-circle-outline' },
];

const normalizeStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const isClosedStatus = (status) =>
  ['closed', 'completed', 'resolved'].includes(
    normalizeStatus(status)
  );

const getSearchText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return String(value.username || value.name || '');
  }
  return String(value);
};

const ComplaintListScreen = ({ route, navigation }) => {
  const { userInfo, isUser, isAdmin } = useContext(AuthContext);
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};
  const shadows = theme?.shadows || {};

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
    text:
      colors.text || (isDark ? '#F5F7FF' : '#151936'),
    secondary:
      colors.textSecondary ||
      (isDark ? '#A8B0C5' : '#69718B'),
    muted:
      colors.textMuted ||
      (isDark ? '#8D96AE' : '#8A91A7'),
    border:
      colors.border || (isDark ? '#283149' : '#E8EAF4'),
    primary: colors.primary || PURPLE,
    warning: colors.warning || '#F5A524',
    info: colors.info || '#5B8CFF',
    success: colors.success || '#22C55E',
  };

  const initialStatus = route?.params?.status || 'All';
  const initialSearch = route?.params?.search || '';

  const [activeTab, setActiveTab] = useState(
    initialStatus === 'Closed' ? 'Completed' : initialStatus
  );

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Update filters when navigating from the dashboard.
  useEffect(() => {
    if (route?.params?.status) {
      const incomingStatus =
        route.params.status === 'Closed'
          ? 'Completed'
          : route.params.status;

      if (
        STATUS_TABS.some((tab) => tab.key === incomingStatus)
      ) {
        setActiveTab(incomingStatus);
      }
    }

    if (route?.params?.search !== undefined) {
      setSearchQuery(route.params.search || '');
    }
  }, [route?.params?.status, route?.params?.search]);

  // Fetch complaints from the existing backend API.
  const fetchComplaints = useCallback(async () => {
    try {
      if (!userInfo) {
        setComplaints([]);
        return;
      }

      setError(null);

      const data = await getComplaintsApi(
        userInfo.role,
        userInfo.userId
      );

      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching complaints list:', err);

      setError(
        'Unable to connect to the server. Please check your connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo]);

  // Refresh whenever this screen gains focus.
  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComplaints();
  }, [fetchComplaints]);

  // Status count for each filter.
  const getTabCount = useCallback(
    (tabKey) => {
      if (tabKey === 'All') return complaints.length;

      if (tabKey === 'Completed') {
        return complaints.filter((item) =>
          isClosedStatus(item.status)
        ).length;
      }

      return complaints.filter(
        (item) => normalizeStatus(item.status) ===
          normalizeStatus(tabKey)
      ).length;
    },
    [complaints]
  );

  // Dashboard-style metrics.
  const totalCount = complaints.length;
  const pendingCount = getTabCount('Pending');
  const assignedCount = getTabCount('Assigned');
  const closedCount = getTabCount('Completed');

  // Search and filter.
  const filteredComplaints = complaints.filter((item) => {
    const itemStatus = normalizeStatus(item.status);

    let matchesTab = true;

    if (activeTab === 'Completed') {
      matchesTab = isClosedStatus(item.status);
    } else if (activeTab !== 'All') {
      matchesTab =
        itemStatus === normalizeStatus(activeTab);
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) return matchesTab;

    const searchableFields = [
      item.complaintType,
      item.blockName,
      item.roomNumber,
      item.department,
      item.remarks,
      item.status,
      item.raisedBy,
      item.raisedBy?.username,
      item.assignedTo,
      item.assignedTo?.username,
    ];

    const matchesSearch = searchableFields.some((field) =>
      getSearchText(field).toLowerCase().includes(query)
    );

    return matchesTab && matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('All');
    navigation.setParams({
      status: undefined,
      search: undefined,
    });
  };

  const canRaiseComplaint = Boolean(isUser || isAdmin);

  const openComplaint = (ticket) => {
    navigation.navigate('ComplaintDetail', { ticket });
  };

  const openRaiseComplaint = () => {
    navigation.navigate('RaiseComplaint');
  };

  const renderMetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    tint,
    status,
  }) => (
    <Pressable
      key={title}
      onPress={() => setActiveTab(status)}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      style={({ pressed }) => [
        styles.metricCard,
        {
          backgroundColor: palette.card,
          borderColor:
            activeTab === status ? color : palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.metricTop}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: tint },
          ]}
        >
          <Ionicons name={icon} size={19} color={color} />
        </View>

        <Ionicons
          name="chevron-forward"
          size={15}
          color={palette.muted}
        />
      </View>

      <Text
        style={[
          styles.metricValue,
          { color: palette.text },
        ]}
      >
        {loading ? '—' : value}
      </Text>

      <Text
        style={[
          styles.metricTitle,
          { color: palette.text },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.metricSubtitle,
          { color: palette.secondary },
        ]}
        numberOfLines={1}
      >
        {subtitle}
      </Text>

      <View
        style={[
          styles.metricAccent,
          { backgroundColor: color },
        ]}
      />
    </Pressable>
  );

  const ListHeader = (
    <View>
      {/* Intro banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View style={styles.heroIcon}>
          <Ionicons
            name="clipboard-outline"
            size={26}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.heroEyebrow}>
          FACILITY SUPPORT
        </Text>

        <Text style={styles.heroTitle}>
          Complaint Center
        </Text>

        <Text style={styles.heroSubtitle}>
          Track issues, check progress and manage maintenance tickets.
        </Text>

        <View style={styles.heroBottom}>
          <View style={styles.heroPill}>
            <Ionicons
              name="pulse-outline"
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.heroPillText}>
              Ticket overview
            </Text>
          </View>

          <Text style={styles.heroCount}>
            {totalCount} total tickets
          </Text>
        </View>
      </View>

      {/* Statistics heading */}
      <View style={styles.sectionHeader}>
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
      </View>

      {/* Statistics grid */}
      <View style={styles.metricsGrid}>
        {renderMetricCard({
          title: 'Total',
          value: totalCount,
          subtitle: 'All complaints',
          icon: 'documents-outline',
          color: '#5B8CFF',
          tint: 'rgba(91,140,255,0.14)',
          status: 'All',
        })}

        {renderMetricCard({
          title: 'Pending',
          value: pendingCount,
          subtitle: 'Awaiting action',
          icon: 'time-outline',
          color: '#F5A524',
          tint: 'rgba(245,165,36,0.14)',
          status: 'Pending',
        })}

        {renderMetricCard({
          title: 'Assigned',
          value: assignedCount,
          subtitle: 'Work in progress',
          icon: 'people-outline',
          color: '#9A72FF',
          tint: 'rgba(154,114,255,0.14)',
          status: 'Assigned',
        })}

        {renderMetricCard({
          title: 'Closed',
          value: closedCount,
          subtitle: 'Resolved tickets',
          icon: 'checkmark-circle-outline',
          color: '#22B879',
          tint: 'rgba(34,184,121,0.14)',
          status: 'Completed',
        })}
      </View>

      {/* Search */}
      <View style={styles.sectionHeader}>
        <View>
          <Text
            style={[
              styles.sectionTitle,
              { color: palette.text },
            ]}
          >
            All complaints
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: palette.secondary },
            ]}
          >
            Search and filter facility tickets
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search complaint, room, block..."
        />
      </View>

      {/* Status filters */}
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.tabsContent}
        renderItem={({ item }) => {
          const active = activeTab === item.key;

          return (
            <Pressable
              onPress={() => setActiveTab(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: active
                    ? palette.primary
                    : palette.card,
                  borderColor: active
                    ? palette.primary
                    : palette.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={15}
                color={active ? '#FFFFFF' : palette.secondary}
              />

              <Text
                style={[
                  styles.filterText,
                  {
                    color: active ? '#FFFFFF' : palette.text,
                  },
                ]}
              >
                {item.label}
              </Text>

              <View
                style={[
                  styles.filterCount,
                  {
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.2)'
                      : isDark
                        ? '#252D43'
                        : '#EEF0F8',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    {
                      color: active
                        ? '#FFFFFF'
                        : palette.secondary,
                    },
                  ]}
                >
                  {getTabCount(item.key)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Result summary */}
      <View style={styles.resultRow}>
        <View>
          <Text
            style={[
              styles.resultTitle,
              { color: palette.text },
            ]}
          >
            {filteredComplaints.length} results
          </Text>

          <Text
            style={[
              styles.resultSubtitle,
              { color: palette.secondary },
            ]}
          >
            {activeTab === 'All'
              ? 'Showing all complaint tickets'
              : `Filtered by ${
                  STATUS_TABS.find(
                    (tab) => tab.key === activeTab
                  )?.label || activeTab
                }`}
          </Text>
        </View>

        {(searchQuery || activeTab !== 'All') && (
          <Pressable
            onPress={clearFilters}
            style={styles.resetButton}
            accessibilityRole="button"
          >
            <Ionicons
              name="refresh-outline"
              size={14}
              color={palette.primary}
            />

            <Text
              style={[
                styles.resetText,
                { color: palette.primary },
              ]}
            >
              Reset
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <ResponsiveContainer
      style={{ backgroundColor: palette.background }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.surface}
      />

      <View
        style={[
          styles.container,
          { backgroundColor: palette.background },
        ]}
      >
        <AppHeader
          title="Complaints"
          subtitle="Campus maintenance tickets"
          showBack={navigation.canGoBack()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          onNotificationPress={() =>
            setActiveTab(pendingCount > 0 ? 'Pending' : 'All')
          }
          onProfilePress={() => navigation.navigate('Profile')}
          username={userInfo?.username}
          pendingCount={pendingCount}
        />

        {loading && complaints.length === 0 ? (
          <View style={styles.loadingContainer}>
            <View
              style={[
                styles.loadingCard,
                { backgroundColor: palette.card },
              ]}
            >
              <ActivityIndicatorFallback color={palette.primary} />
              <Text
                style={[
                  styles.loadingTitle,
                  { color: palette.text },
                ]}
              >
                Loading complaints
              </Text>
              <Text
                style={[
                  styles.loadingSubtitle,
                  { color: palette.secondary },
                ]}
              >
                Fetching your latest facility tickets...
              </Text>
            </View>

            <ListSkeleton count={3} />
          </View>
        ) : error && complaints.length === 0 ? (
          <View style={styles.errorContainer}>
            <ErrorState
              message={error}
              onRetry={fetchComplaints}
            />
          </View>
        ) : (
          <FlatList
            data={filteredComplaints}
            keyExtractor={(item, index) =>
              String(item._id || item.id || index)
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={ListHeader}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[palette.primary]}
                tintColor={palette.primary}
              />
            }
            renderItem={({ item }) => (
              <View style={styles.ticketWrapper}>
                <TicketCard
                  ticket={item}
                  onPress={() => openComplaint(item)}
                />
              </View>
            )}
            ListEmptyComponent={
              <View
                style={[
                  styles.emptyWrapper,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                <EmptyState
                  icon="ticket-outline"
                  title="No complaints found"
                  message={
                    searchQuery
                      ? `No tickets match "${searchQuery}". Try another keyword.`
                      : activeTab !== 'All'
                        ? `No tickets found under the ${
                            STATUS_TABS.find(
                              (tab) => tab.key === activeTab
                            )?.label || activeTab
                          } filter.`
                        : 'There are no maintenance tickets to display right now.'
                  }
                  actionLabel={
                    canRaiseComplaint
                      ? '+ Raise Complaint'
                      : undefined
                  }
                  onAction={
                    canRaiseComplaint
                      ? openRaiseComplaint
                      : undefined
                  }
                />
              </View>
            }
            ListFooterComponent={<View style={{ height: 90 }} />}
          />
        )}

        {/* Floating action */}
        {canRaiseComplaint && !loading && !error && (
          <Pressable
            onPress={openRaiseComplaint}
            accessibilityRole="button"
            accessibilityLabel="Raise a complaint"
            style={({ pressed }) => [
              styles.fabButton,
              {
                backgroundColor: palette.primary,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Ionicons
              name="add"
              size={22}
              color="#FFFFFF"
            />

            <Text style={styles.fabText}>
              Raise Complaint
            </Text>
          </Pressable>
        )}
      </View>
    </ResponsiveContainer>
  );
};

// Small self-contained loading indicator.
const ActivityIndicatorFallback = ({ color }) => (
  <Ionicons
    name="sync-circle-outline"
    size={36}
    color={color}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 13,
  },

  // Hero banner
  heroCard: {
    position: 'relative',
    backgroundColor: PURPLE,
    borderRadius: 23,
    padding: 18,
    marginBottom: 23,
    overflow: 'hidden',
  },

  heroGlowOne: {
    position: 'absolute',
    width: 165,
    height: 165,
    borderRadius: 83,
    top: -90,
    right: -40,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderRadius: 58,
    bottom: -75,
    right: 65,
    backgroundColor: 'rgba(30,15,95,0.2)',
  },

  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  heroEyebrow: {
    color: '#DDD6FE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 6,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 290,
  },

  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
  },

  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },

  heroPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  heroCount: {
    color: '#F3E8FF',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Section headings
  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.35,
  },

  sectionSubtitle: {
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  metricCard: {
    width: '48.3%',
    minHeight: 145,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },

  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricValue: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  metricTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  metricSubtitle: {
    fontSize: 10,
    marginTop: 5,
  },

  metricAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },

  // Search
  searchCard: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 15,
  },

  // Status filters
  tabsContent: {
    gap: 8,
    paddingBottom: 17,
    paddingRight: 4,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    gap: 6,
  },

  filterText: {
    fontSize: 11,
    fontWeight: '800',
  },

  filterCount: {
    minWidth: 21,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },

  filterCountText: {
    fontSize: 9,
    fontWeight: '900',
  },

  // Result summary
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  resultTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  resultSubtitle: {
    fontSize: 10.5,
    marginTop: 3,
  },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(124,92,255,0.1)',
    gap: 5,
  },

  resetText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Ticket list
  ticketWrapper: {
    marginBottom: 10,
  },

  emptyWrapper: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 6,
    marginTop: 2,
  },

  // Loading and error
  loadingContainer: {
    padding: 16,
  },

  loadingCard: {
    alignItems: 'center',
    padding: 23,
    borderRadius: 18,
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 9,
  },

  loadingSubtitle: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    padding: 16,
  },

  // Floating action
  fabButton: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 25,
    gap: 7,
    elevation: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});

export default ComplaintListScreen;