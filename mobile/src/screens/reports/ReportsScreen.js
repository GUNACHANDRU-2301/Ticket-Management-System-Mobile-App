import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { getAllComplaintsApi } from '../../api/complaints';
import { useTheme } from '../../context/ThemeContext';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import TicketCard from '../../components/TicketCard';
import StatCard from '../../components/StatCard';
import SectionHeader from '../../components/SectionHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { MetricsSkeleton } from '../../components/LoadingSkeleton';
import { THEME } from '../../constants/theme';

const ReportsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const [reports, setReports] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setError(null);
      const data = await getAllComplaintsApi();
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Unable to load analytics data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const totalCount = reports.length;
  const completedCount = reports.filter(
    (r) => r.status === 'Completed' || r.status === 'Closed'
  ).length;
  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const assignedCount = reports.filter((r) => r.status === 'Assigned').length;
  const inProgressCount = reports.filter(
    (r) => r.status === 'In-Progress' || r.status === 'On-Hold'
  ).length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pendingRate = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  const inProgressRate = totalCount > 0 ? Math.round(((assignedCount + inProgressCount) / totalCount) * 100) : 0;

  // Category counts
  const categoryCounts = {};
  reports.forEach((r) => {
    const type = r.complaintType || 'General';
    categoryCounts[type] = (categoryCounts[type] || 0) + 1;
  });

  const filteredReports = reports.filter((r) => {
    if (selectedStatus === 'All') return true;
    if (selectedStatus === 'Completed') return r.status === 'Completed' || r.status === 'Closed';
    return r.status === selectedStatus;
  });

  if (loading && !refreshing) {
    return (
      <ResponsiveContainer>
        <View style={[styles.skeletonContainer, { backgroundColor: theme.colors.background }]}>
          <MetricsSkeleton />
        </View>
      </ResponsiveContainer>
    );
  }

  if (error && !reports.length) {
    return (
      <ResponsiveContainer>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ErrorState message={error} onRetry={fetchReports} />
        </View>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader
          title="Analytics & Reports"
          subtitle="Campus maintenance metrics"
          showBack={navigation.canGoBack()}
          onBackPress={() => navigation.goBack()}
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          showProfile={false}
          showNotification={false}
        />
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={{ paddingTop: 12 }}>
              {/* 4 KPI Grid Cards: TOTAL, PENDING, ASSIGNED, CLOSED */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCol}>
                  <StatCard
                    title="TOTAL"
                    count={totalCount}
                    icon="layers-outline"
                    color="primary"
                    subtitle="All time requests"
                  />
                </View>
                <View style={styles.kpiCol}>
                  <StatCard
                    title="PENDING"
                    count={pendingCount}
                    icon="time-outline"
                    color="warning"
                    subtitle="Awaiting dispatch"
                  />
                </View>
                <View style={styles.kpiCol}>
                  <StatCard
                    title="ASSIGNED"
                    count={assignedCount + inProgressCount}
                    icon="construct-outline"
                    color="info"
                    subtitle="Under execution"
                  />
                </View>
                <View style={styles.kpiCol}>
                  <StatCard
                    title="CLOSED"
                    count={completedCount}
                    icon="checkmark-circle-outline"
                    color="success"
                    subtitle="Resolved issues"
                  />
                </View>
              </View>

              {/* Executive Summary Analytics Card */}
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  },
                  theme.shadows.sm
                ]}
              >
                <View style={styles.summaryTopRow}>
                  <View>
                    <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                      Resolution Efficiency
                    </Text>
                    <Text style={[styles.summarySubtitle, { color: theme.colors.textMuted }]}>
                      Turnaround benchmark & resolution index
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.ratePill,
                      {
                        backgroundColor: theme.colors.successLight,
                        borderColor: theme.colors.success
                      }
                    ]}
                  >
                    <Text style={[styles.ratePillText, { color: theme.colors.successDark }]}>
                      {completionRate}% Success
                    </Text>
                  </View>
                </View>

                {/* Multi-segment Resolution Progress Bar */}
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: isDark ? theme.colors.card : '#E2E8F0' }
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBarSegment,
                        {
                          width: `${completionRate}%`,
                          backgroundColor: theme.colors.success
                        }
                      ]}
                    />
                    <View
                      style={[
                        styles.progressBarSegment,
                        {
                          width: `${inProgressRate}%`,
                          backgroundColor: theme.colors.primary
                        }
                      ]}
                    />
                    <View
                      style={[
                        styles.progressBarSegment,
                        {
                          width: `${pendingRate}%`,
                          backgroundColor: theme.colors.warning
                        }
                      ]}
                    />
                  </View>

                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: theme.colors.success }
                        ]}
                      />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        Closed ({completedCount})
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: theme.colors.primary }
                        ]}
                      />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        Active ({assignedCount + inProgressCount})
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: theme.colors.warning }
                        ]}
                      />
                      <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                        Pending ({pendingCount})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Category Breakdown Bar */}
              <View
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  },
                  theme.shadows.sm
                ]}
              >
                <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                  Volume by Service Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryScroll}
                >
                  {Object.entries(categoryCounts).map(([cat, count]) => {
                    const info = THEME.categoryIcons[cat] || {
                      icon: '🔧',
                      color: theme.colors.text
                    };
                    return (
                      <View
                        key={cat}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: isDark ? theme.colors.card : '#F8FAFC',
                            borderColor: theme.colors.border
                          }
                        ]}
                      >
                        <Text style={styles.catIcon}>{info.icon}</Text>
                        <Text style={[styles.catName, { color: theme.colors.text }]}>
                          {cat}
                        </Text>
                        <View
                          style={[
                            styles.catCountBadge,
                            { backgroundColor: theme.colors.primaryLight }
                          ]}
                        >
                          <Text style={[styles.catCountText, { color: theme.colors.primary }]}>
                            {count}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Status Filter Tabs for Audit Log */}
              <SectionHeader
                title="Audit Trail & History"
                subtitle={`${filteredReports.length} tickets matching filter`}
              />

              <View style={styles.filterPillsRow}>
                {['All', 'Pending', 'Assigned', 'In-Progress', 'Completed'].map((st) => {
                  const isActive = selectedStatus === st;
                  const displayLabel = st === 'Completed' ? 'Closed' : st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isActive
                            ? theme.colors.primary
                            : isDark
                            ? theme.colors.card
                            : '#F1F5F9',
                          borderColor: isActive
                            ? theme.colors.primary
                            : theme.colors.border
                        }
                      ]}
                      onPress={() => setSelectedStatus(st)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          {
                            color: isActive
                              ? '#FFFFFF'
                              : theme.colors.textSecondary
                          }
                        ]}
                      >
                        {displayLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={() =>
                navigation.navigate('ComplaintDetail', { ticket: item })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="stats-chart-outline"
              title="No records found"
              message={`No complaint records found under status "${selectedStatus}".`}
            />
          }
        />
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  skeletonContainer: {
    flex: 1,
    padding: 16
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40
  },
  headerBox: {
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16
  },
  kpiCol: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8
  },
  summaryCard: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  summarySubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  ratePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  ratePillText: {
    fontSize: 12,
    fontWeight: '800'
  },
  progressContainer: {
    gap: 12
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  progressBarSegment: {
    height: '100%'
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600'
  },
  categoryCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12
  },
  categoryScroll: {
    gap: 8
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8
  },
  catIcon: {
    fontSize: 16
  },
  catName: {
    fontSize: 13,
    fontWeight: '700'
  },
  catCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10
  },
  catCountText: {
    fontSize: 11,
    fontWeight: '800'
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    marginTop: 4
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});

export default ReportsScreen;
