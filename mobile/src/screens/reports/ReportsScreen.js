import React, { useState, useEffect, useCallback } from 'react';

import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

import { getAllComplaintsApi } from '../../api/complaints';
import { useTheme } from '../../context/ThemeContext';

import ResponsiveContainer from '../../components/ResponsiveContainer';
import AppHeader from '../../components/AppHeader';
import TicketCard from '../../components/TicketCard';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { MetricsSkeleton } from '../../components/LoadingSkeleton';

import { THEME } from '../../constants/theme';

const PURPLE = '#7C5CFF';

const STATUS_FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'In Progress', value: 'In-Progress' },
  { label: 'Closed', value: 'Completed' },
];

const normalizeStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const isClosedStatus = (status) =>
  ['completed', 'closed', 'resolved'].includes(
    normalizeStatus(status)
  );

const ReportsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  const colors = theme?.colors || {};

  const palette = {
    background:
      colors.background || (isDark ? '#0B1020' : '#F5F6FC'),
    surface:
      colors.surface || (isDark ? '#151B2D' : '#FFFFFF'),
    card:
      colors.card || colors.surface || '#FFFFFF',
    text:
      colors.text || (isDark ? '#F5F7FF' : '#151936'),
    secondary:
      colors.textSecondary || '#69718B',
    muted:
      colors.textMuted || '#8A91A7',
    border:
      colors.border || (isDark ? '#283149' : '#E8EAF4'),
    primary:
      colors.primary || PURPLE,
    success:
      colors.success || '#22B879',
    warning:
      colors.warning || '#F5A524',
    info:
      colors.info || '#3986EF',
  };

  const [reports, setReports] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Existing reports API.
  const fetchReports = useCallback(async () => {
    try {
      setError(null);

      const data = await getAllComplaintsApi();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.complaints)
          ? data.complaints
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setReports(list);
    } catch (err) {
      console.error('Error fetching reports:', err);

      setError(
        'Unable to load analytics data. Please check your connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  // Metrics.
  const totalCount = reports.length;

  const completedCount = reports.filter(
    (item) => isClosedStatus(item.status)
  ).length;

  const pendingCount = reports.filter(
    (item) => normalizeStatus(item.status) === 'pending'
  ).length;

  const assignedCount = reports.filter(
    (item) => normalizeStatus(item.status) === 'assigned'
  ).length;

  const inProgressCount = reports.filter((item) =>
    ['in-progress', 'on-hold'].includes(
      normalizeStatus(item.status)
    )
  ).length;

  const activeCount = assignedCount + inProgressCount;

  const completionRate =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  const pendingRate =
    totalCount > 0
      ? Math.round((pendingCount / totalCount) * 100)
      : 0;

  const activeRate =
    totalCount > 0
      ? Math.round((activeCount / totalCount) * 100)
      : 0;

  // Count tickets by service category.
  const categoryCounts = reports.reduce((acc, item) => {
    const category = item.complaintType || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const filteredReports = reports.filter((item) => {
    if (selectedStatus === 'All') return true;

    if (selectedStatus === 'Completed') {
      return isClosedStatus(item.status);
    }

    return (
      normalizeStatus(item.status) ===
      normalizeStatus(selectedStatus)
    );
  });

  const openTicket = (ticket) => {
    // ComplaintDetail lives inside the Complaints drawer stack.
    navigation.navigate('Complaints', {
      screen: 'ComplaintDetail',
      params: { ticket },
    });
  };

  const renderMetric = ({
    title,
    value,
    subtitle,
    icon,
    color,
    tint,
    filter,
  }) => {
    const selected = selectedStatus === filter;

    return (
      <Pressable
        key={title}
        onPress={() => setSelectedStatus(filter)}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value}`}
        style={({ pressed }) => [
          styles.metricCard,
          {
            backgroundColor: palette.card,
            borderColor: selected ? color : palette.border,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <View style={styles.metricTopRow}>
          <View
            style={[
              styles.metricIcon,
              { backgroundColor: tint },
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color={color}
            />
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
          {value}
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
  };

  const ListHeader = (
    <View>
      {/* Dashboard-inspired hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroDecorationOne} />
        <View style={styles.heroDecorationTwo} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="stats-chart-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.heroPill}>
            <View style={styles.liveDot} />
            <Text style={styles.heroPillText}>
              ANALYTICS
            </Text>
          </View>
        </View>

        <Text style={styles.heroEyebrow}>
          CAMPUS FACILITY SUPPORT
        </Text>

        <Text style={styles.heroTitle}>
          Reports & Insights
        </Text>

        <Text style={styles.heroSubtitle}>
          Track complaint volume, monitor resolutions, and review
          maintenance activity across campus.
        </Text>

        <View style={styles.heroFooter}>
          <View style={styles.heroFooterItem}>
            <Ionicons
              name="documents-outline"
              size={16}
              color="#E7E0FF"
            />

            <Text style={styles.heroFooterText}>
              {totalCount} total tickets
            </Text>
          </View>

          <View style={styles.heroFooterItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#E7E0FF"
            />

            <Text style={styles.heroFooterText}>
              {completionRate}% resolved
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.sectionHeading}>
        <View>
          <Text
            style={[
              styles.sectionTitle,
              { color: palette.text },
            ]}
          >
            Performance Overview
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: palette.secondary },
            ]}
          >
            Current complaint statistics
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {renderMetric({
          title: 'Total',
          value: totalCount,
          subtitle: 'All requests',
          icon: 'layers-outline',
          color: '#5B8CFF',
          tint: 'rgba(91,140,255,0.14)',
          filter: 'All',
        })}

        {renderMetric({
          title: 'Pending',
          value: pendingCount,
          subtitle: 'Awaiting action',
          icon: 'time-outline',
          color: '#F5A524',
          tint: 'rgba(245,165,36,0.14)',
          filter: 'Pending',
        })}

        {renderMetric({
          title: 'Active',
          value: activeCount,
          subtitle: 'Assigned / ongoing',
          icon: 'construct-outline',
          color: '#7C5CFF',
          tint: 'rgba(124,92,255,0.14)',
          filter: 'Assigned',
        })}

        {renderMetric({
          title: 'Closed',
          value: completedCount,
          subtitle: 'Resolved issues',
          icon: 'checkmark-circle-outline',
          color: '#22B879',
          tint: 'rgba(34,184,121,0.14)',
          filter: 'Completed',
        })}
      </View>

      {/* Resolution summary */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="analytics-outline"
              size={21}
              color={palette.primary}
            />
          </View>

          <View style={styles.summaryHeadingText}>
            <Text
              style={[
                styles.summaryTitle,
                { color: palette.text },
              ]}
            >
              Resolution Overview
            </Text>

            <Text
              style={[
                styles.summarySubtitle,
                { color: palette.secondary },
              ]}
            >
              Distribution by current status
            </Text>
          </View>

          <View
            style={[
              styles.ratePill,
              {
                backgroundColor: isDark
                  ? '#243B32'
                  : '#E4F8EF',
              },
            ]}
          >
            <Text
              style={[
                styles.ratePillText,
                { color: palette.success },
              ]}
            >
              {completionRate}%
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: isDark
                ? '#2A3043'
                : '#EEF0F6',
            },
          ]}
        >
          {totalCount > 0 && (
            <>
              <View
                style={[
                  styles.progressSegment,
                  {
                    width: `${completionRate}%`,
                    backgroundColor: palette.success,
                  },
                ]}
              />

              <View
                style={[
                  styles.progressSegment,
                  {
                    width: `${activeRate}%`,
                    backgroundColor: palette.primary,
                  },
                ]}
              />

              <View
                style={[
                  styles.progressSegment,
                  {
                    width: `${pendingRate}%`,
                    backgroundColor: palette.warning,
                  },
                ]}
              />
            </>
          )}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: palette.success },
              ]}
            />
            <Text
              style={[
                styles.legendText,
                { color: palette.secondary },
              ]}
            >
              Closed {completedCount}
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: palette.primary },
              ]}
            />
            <Text
              style={[
                styles.legendText,
                { color: palette.secondary },
              ]}
            >
              Active {activeCount}
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: palette.warning },
              ]}
            />
            <Text
              style={[
                styles.legendText,
                { color: palette.secondary },
              ]}
            >
              Pending {pendingCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Service category breakdown */}
      <View
        style={[
          styles.categoryCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.categoryHeader}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: palette.text },
              ]}
            >
              Service Categories
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: palette.secondary },
              ]}
            >
              Complaints grouped by issue type
            </Text>
          </View>

          <View
            style={[
              styles.categoryTotal,
              { backgroundColor: palette.primaryLight },
            ]}
          >
            <Text
              style={[
                styles.categoryTotalText,
                { color: palette.primary },
              ]}
            >
              {sortedCategories.length}
            </Text>
          </View>
        </View>

        {sortedCategories.length === 0 ? (
          <Text
            style={[
              styles.noCategories,
              { color: palette.secondary },
            ]}
          >
            No category data available yet.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {sortedCategories.map(([category, count]) => {
              const info = THEME?.categoryIcons?.[category] || {
                icon: '🔧',
              };

              return (
                <View
                  key={category}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isDark
                        ? '#10172A'
                        : '#F8F9FD',
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>
                    {info.icon}
                  </Text>

                  <Text
                    style={[
                      styles.categoryName,
                      { color: palette.text },
                    ]}
                    numberOfLines={1}
                  >
                    {category}
                  </Text>

                  <View
                    style={[
                      styles.categoryCountBadge,
                      { backgroundColor: palette.primaryLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryCountText,
                        { color: palette.primary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Audit history */}
      <View style={styles.auditHeading}>
        <View style={styles.auditHeadingText}>
          <Text
            style={[
              styles.sectionTitle,
              { color: palette.text },
            ]}
          >
            Audit Trail & History
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: palette.secondary },
            ]}
          >
            {filteredReports.length} matching tickets
          </Text>
        </View>

        <View
          style={[
            styles.auditIcon,
            { backgroundColor: palette.primaryLight },
          ]}
        >
          <Ionicons
            name="receipt-outline"
            size={19}
            color={palette.primary}
          />
        </View>
      </View>

      {/* Status filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map((status) => {
          const active = selectedStatus === status.value;

          return (
            <Pressable
              key={status.value}
              onPress={() => setSelectedStatus(status.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.filterPill,
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
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: active
                      ? '#FFFFFF'
                      : palette.text,
                  },
                ]}
              >
                {status.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ResponsiveContainer>
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
        {/* Hamburger only; no back button */}
        <AppHeader
          title="Reports & Analytics"
          subtitle="Campus maintenance metrics"
          onMenuPress={() =>
            navigation.dispatch(DrawerActions.openDrawer())
          }
          showProfile={false}
          showNotification={false}
        />

        {loading && reports.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.loadingContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[palette.primary]}
                tintColor={palette.primary}
              />
            }
          >
            <MetricsSkeleton />
          </ScrollView>
        ) : error && reports.length === 0 ? (
          <View style={styles.errorContainer}>
            <ErrorState
              message={error}
              onRetry={fetchReports}
            />
          </View>
        ) : (
          <FlatList
            data={filteredReports}
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
                  onPress={() => openTicket(item)}
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
                  icon="stats-chart-outline"
                  title="No records found"
                  message={
                    selectedStatus === 'All'
                      ? 'There are no complaint records to display yet.'
                      : `No complaints found under "${STATUS_FILTERS.find(
                          (item) =>
                            item.value === selectedStatus
                        )?.label || selectedStatus}".`
                  }
                />
              </View>
            }
            ListFooterComponent={
              <View style={{ height: 25 }} />
            }
          />
        )}
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  loadingContainer: {
    padding: 16,
    paddingTop: 20,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },

  // Hero
  heroCard: {
    backgroundColor: PURPLE,
    borderRadius: 23,
    padding: 18,
    marginBottom: 23,
    overflow: 'hidden',
    position: 'relative',
  },

  heroDecorationOne: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 88,
    top: -98,
    right: -45,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  heroDecorationTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -80,
    right: 70,
    backgroundColor: 'rgba(30,15,95,0.2)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  heroIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8DF5BD',
  },

  heroPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
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
    letterSpacing: -0.5,
    marginTop: 6,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 310,
  },

  heroFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    marginTop: 17,
    paddingTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },

  heroFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  heroFooterText: {
    color: '#E7E0FF',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Heading
  sectionHeading: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 10.5,
    marginTop: 4,
    lineHeight: 16,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  metricCard: {
    width: '48.4%',
    minHeight: 150,
    padding: 13,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },

  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  metricIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricValue: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  metricTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  metricSubtitle: {
    fontSize: 9.5,
    marginTop: 5,
  },

  metricAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },

  // Summary progress
  summaryCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 16,
    marginBottom: 17,
  },

  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
    gap: 10,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,92,255,0.12)',
  },

  summaryHeadingText: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  summarySubtitle: {
    fontSize: 10,
    marginTop: 4,
  },

  ratePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
  },

  ratePillText: {
    fontSize: 11,
    fontWeight: '900',
  },

  progressTrack: {
    height: 10,
    borderRadius: 7,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  progressSegment: {
    height: '100%',
  },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
    marginTop: 15,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Categories
  categoryCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 15,
    marginBottom: 23,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  categoryTotal: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryTotalText: {
    fontSize: 12,
    fontWeight: '900',
  },

  categoryScroll: {
    gap: 9,
    paddingRight: 5,
  },

  categoryChip: {
    minWidth: 130,
    maxWidth: 190,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 7,
  },

  categoryEmoji: {
    fontSize: 17,
  },

  categoryName: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '800',
  },

  categoryCountBadge: {
    minWidth: 21,
    height: 21,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  categoryCountText: {
    fontSize: 9,
    fontWeight: '900',
  },

  noCategories: {
    fontSize: 11,
    paddingVertical: 10,
  },

  // Audit list
  auditHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  auditHeadingText: {
    flex: 1,
  },

  auditIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterRow: {
    gap: 8,
    paddingBottom: 16,
    paddingRight: 4,
  },

  filterPill: {
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  filterPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  ticketWrapper: {
    marginBottom: 11,
  },

  emptyWrapper: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 6,
    marginTop: 4,
  },
});

export default ReportsScreen;