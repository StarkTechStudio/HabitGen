import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';

const HistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { habits, sessions } = useHabits();

  // Week day labels
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const completionsPerDay = useMemo(() => {
    return last7Days.map(day => {
      const daySessions = sessions.filter(s => s.date === day && s.completed);
      return daySessions.length;
    });
  }, [last7Days, sessions]);

  // Current streak calculation
  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date === dayStr && s.completed);
      if (daySessions.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [sessions, habits]);

  // Longest streak
  const longestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    let maxStreak = 0;
    return habits.reduce((max, h) => {
      // Simple: check consecutive days with completed sessions
      let currentMax = 0;
      let count = 0;
      for (let i = 365; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const completed = sessions.some(s => s.habitId === h.id && s.date === dayStr && s.completed);
        if (completed) {
          count++;
          currentMax = Math.max(currentMax, count);
        } else {
          count = 0;
        }
      }
      return Math.max(max, currentMax);
    }, maxStreak);
  }, [sessions, habits]);

  // Total completed
  const totalCompleted = useMemo(() => {
    return sessions.filter(s => s.completed).length;
  }, [sessions]);

  // Activity heatmap data (last 4 weeks, simplified)
  const heatmapData = useMemo(() => {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dayStr = date.toISOString().split('T')[0];
        const count = sessions.filter(s => s.date === dayStr && s.completed).length;
        week.push(count);
      }
      weeks.push(week);
    }
    return weeks;
  }, [sessions]);

  const maxHeatmapVal = useMemo(() => {
    return Math.max(...heatmapData.flat(), 1);
  }, [heatmapData]);

  // Avg completion rate
  const avgCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const completed = sessions.filter(s => s.date === dayStr && s.completed).length;
      last30.push(completed);
    }
    const total = last30.reduce((s, v) => s + v, 0);
    const max = habits.length * 30;
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }, [sessions, habits]);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" fill={theme.colors.primary} />
            </Svg>
            <Text style={[styles.brandName, { color: theme.colors.primary }]}>Habitgen</Text>
          </View>
          <TouchableOpacity style={[styles.profileBtn, { backgroundColor: theme.colors.primary }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>History & Stats</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your journey through {currentMonth}
          </Text>
        </View>

        {/* Current Momentum Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardLabel, { color: theme.colors.accent }]}>CURRENT MOMENTUM</Text>
          <View style={styles.streakHeader}>
            <Text style={[styles.streakValue, { color: theme.colors.text }]}>
              {currentStreak} Day Streak
            </Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={theme.colors.primary} />
            </Svg>
          </View>
          {/* Day circles */}
          <View style={styles.dayCirclesRow}>
            {dayLabels.map((label, i) => {
              const count = completionsPerDay[i] || 0;
              const isCompleted = count > 0;
              const isToday = i === 6;
              return (
                <View key={`day-${i}`} style={styles.dayCircleCol}>
                  <Text style={[styles.dayLabel, { color: theme.colors.textMuted }]}>
                    {label}
                  </Text>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: isCompleted
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                        borderWidth: isToday && !isCompleted ? 2 : 0,
                        borderColor: theme.colors.accent,
                      },
                    ]}>
                    {isCompleted && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M20 6L9 17l-5-5" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                    {isToday && !isCompleted && (
                      <Text style={[styles.dayNumber, { color: theme.colors.accent }]}>
                        {count}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Activity Heatmap Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.heatmapHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {currentMonth} Activity
            </Text>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>Less</Text>
              {[0.15, 0.35, 0.6, 0.85, 1].map((opacity, i) => (
                <View
                  key={`legend-${i}`}
                  style={[
                    styles.legendBlock,
                    { backgroundColor: theme.colors.primary, opacity },
                  ]}
                />
              ))}
              <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>More</Text>
            </View>
          </View>
          {/* Heatmap grid */}
          <View style={styles.heatmapGrid}>
            {['MON', 'WED', 'FRI'].map((rowLabel, rowIdx) => (
              <View key={rowLabel} style={styles.heatmapRow}>
                <Text style={[styles.heatmapRowLabel, { color: theme.colors.textMuted }]}>
                  {rowLabel}
                </Text>
                {heatmapData.map((week, weekIdx) => {
                  const dayIdx = rowIdx * 2;
                  const val = week[dayIdx] || 0;
                  const intensity = maxHeatmapVal > 0 ? val / maxHeatmapVal : 0;
                  return (
                    <View
                      key={`hm-${weekIdx}-${rowIdx}`}
                      style={[
                        styles.heatmapCell,
                        {
                          backgroundColor: val > 0
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                          opacity: val > 0 ? Math.max(0.25, intensity) : 1,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <View style={styles.heatmapFooter}>
            <Text style={[styles.avgText, { color: theme.colors.textMuted }]}>
              Avg. completion rate: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{avgCompletionRate}%</Text>
            </Text>
            <Text style={[styles.viewDetails, { color: theme.colors.accent }]}>
              View Details {'>'}
            </Text>
          </View>
        </View>

        {/* Longest Streak Card */}
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.statIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={theme.colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={[styles.statCardLabel, { color: theme.colors.textMuted }]}>LONGEST STREAK</Text>
          <Text style={[styles.statCardValue, { color: theme.colors.text }]}>
            {longestStreak} <Text style={styles.statCardUnit}>days</Text>
          </Text>
          <Text style={[styles.statCardNote, { color: theme.colors.accent }]}>
            {longestStreak > 0 ? 'Keep pushing for a new record!' : 'Start building your streak today'}
          </Text>
        </View>

        {/* Total Completed Card */}
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#F59E0B" />
            </Svg>
          </View>
          <Text style={[styles.statCardLabel, { color: theme.colors.textMuted }]}>TOTAL COMPLETED</Text>
          <Text style={[styles.statCardValue, { color: theme.colors.text }]}>
            {totalCompleted} <Text style={styles.statCardUnit}>habits</Text>
          </Text>
          <Text style={[styles.statCardNote, { color: theme.colors.textSecondary }]}>
            Since you started your journey
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  streakValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  dayCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircleCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '600',
  },
  legendBlock: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  heatmapGrid: {
    gap: 6,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heatmapRowLabel: {
    fontSize: 10,
    fontWeight: '600',
    width: 30,
  },
  heatmapCell: {
    flex: 1,
    height: 28,
    borderRadius: 5,
  },
  heatmapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  avgText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: '700',
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 4,
  },
  statCardUnit: {
    fontSize: 20,
    fontWeight: '400',
  },
  statCardNote: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomSpacer: { height: 100 },
});

export default HistoryScreen;
