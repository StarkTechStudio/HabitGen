import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 48;
const CHART_HEIGHT = 160;
const BAR_COUNT = 7;

const HistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { habits, sessions } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const dayLabels = useMemo(() => {
    return last7Days.map(d => {
      const date = new Date(d + 'T12:00:00');
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    });
  }, [last7Days]);

  const chartData = useMemo(() => {
    return last7Days.map(day => {
      const daySessions = sessions.filter(
        s =>
          s.date === day &&
          s.completed &&
          (!selectedHabitId || s.habitId === selectedHabitId),
      );
      const totalMinutes = Math.round(
        daySessions.reduce((sum, s) => sum + s.duration, 0) / 60,
      );
      return {
        day,
        count: daySessions.length,
        totalMinutes,
      };
    });
  }, [last7Days, sessions, selectedHabitId]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Show only COMPLETED sessions, one per habit (latest), no quit
  const recentSessions = useMemo(() => {
    const completed = sessions
      .filter(s => s.completed && (!selectedHabitId || s.habitId === selectedHabitId));

    // Deduplicate: only latest session per habit
    const latestPerHabit = new Map<string, typeof completed[0]>();
    for (const s of completed) {
      const existing = latestPerHabit.get(s.habitId);
      if (!existing || s.startTime > existing.startTime) {
        latestPerHabit.set(s.habitId, s);
      }
    }

    return Array.from(latestPerHabit.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 20);
  }, [sessions, selectedHabitId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* FIXED HEADER */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>History</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Track your progress over time
        </Text>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              {
                backgroundColor: !selectedHabitId
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: !selectedHabitId
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedHabitId(null)}>
            <Text
              style={[
                styles.filterText,
                { color: !selectedHabitId ? '#FFF' : theme.colors.text },
              ]}>
              All
            </Text>
          </TouchableOpacity>
          {habits.map(h => (
            <TouchableOpacity
              key={h.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    selectedHabitId === h.id
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor:
                    selectedHabitId === h.id
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedHabitId(h.id)}>
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedHabitId === h.id ? '#FFF' : theme.colors.text,
                  },
                ]}>
                {h.emoji} {h.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bar chart */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Last 7 Days
          </Text>
          <View style={styles.chart}>
            {chartData.map((d, i) => {
              const barHeight = maxCount > 0 ? (d.count / maxCount) * (CHART_HEIGHT - 30) : 0;
              return (
                <View key={d.day} style={styles.barColumn}>
                  <Text style={[styles.barValue, { color: theme.colors.textMuted }]}>
                    {d.count > 0 ? d.count : ''}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 8),
                        backgroundColor:
                          d.count > 0
                            ? theme.colors.primary
                            : theme.colors.border,
                        borderRadius: 6,
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>
                    {dayLabels[i]}
                  </Text>
                  {d.totalMinutes > 0 && (
                    <Text style={[styles.barMinutes, { color: theme.colors.textMuted }]}>
                      {d.totalMinutes} min
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
          {/* Summary below chart */}
          <View style={styles.chartSummary}>
            <Text style={[styles.chartSummaryText, { color: theme.colors.textMuted }]}>
              {chartData.reduce((s, d) => s + d.count, 0)} sessions {'\u{2022}'}{' '}
              {chartData.reduce((s, d) => s + d.totalMinutes, 0)} min total
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recent Sessions
        </Text>
      </View>

      {/* SCROLLABLE SESSIONS ONLY */}
      <ScrollView
        style={styles.sessionsList}
        contentContainerStyle={styles.sessionsContent}
        showsVerticalScrollIndicator={false}>
        {recentSessions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No completed sessions yet. Start a habit timer to see your progress here.
            </Text>
          </View>
        ) : (
          recentSessions.map(session => {
            const habit = habits.find(h => h.id === session.habitId);
            const durationSecs = session.duration;
            const mins = Math.round(durationSecs / 60);
            const durationStr = `${mins} min`;
            const time = new Date(session.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <View
                key={session.id}
                style={[
                  styles.sessionRow,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={styles.sessionEmoji}>
                  {habit?.emoji || '\u{2753}'}
                </Text>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionName, { color: theme.colors.text }]}>
                    {habit?.name || 'Unknown'}
                  </Text>
                  <Text style={[styles.sessionMeta, { color: theme.colors.textMuted }]}>
                    {session.date} {'\u{2022}'} {time} {'\u{2022}'} {durationStr}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: theme.colors.success + '20' },
                  ]}>
                  <Text
                    style={{
                      color: theme.colors.success,
                      fontSize: 11,
                      fontWeight: '700',
                    }}>
                    Done
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  filterRow: { marginBottom: 16 },
  filterContent: { gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterText: { fontSize: 12, fontWeight: '600' },
  chartCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
  },
  barColumn: {
    width: (CHART_WIDTH - 40) / BAR_COUNT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
  bar: { width: 18, minHeight: 4 },
  barLabel: { fontSize: 10, marginTop: 5, fontWeight: '500' },
  barMinutes: { fontSize: 8, marginTop: 2, fontWeight: '500' },
  chartSummary: { marginTop: 10, alignItems: 'center' },
  chartSummaryText: { fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  sessionsList: { flex: 1 },
  sessionsContent: { paddingHorizontal: 20 },
  emptyCard: {
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  sessionEmoji: { fontSize: 26, marginRight: 12 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '600' },
  sessionMeta: { fontSize: 11, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bottomSpacer: { height: 100 },
});

export default HistoryScreen;
