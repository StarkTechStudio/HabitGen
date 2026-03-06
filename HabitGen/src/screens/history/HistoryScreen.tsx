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
      const date = new Date(d);
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
      return {
        day,
        count: daySessions.length,
        totalMinutes: Math.round(
          daySessions.reduce((sum, s) => sum + s.duration, 0) / 60,
        ),
      };
    });
  }, [last7Days, sessions, selectedHabitId]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .filter(s => !selectedHabitId || s.habitId === selectedHabitId)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 20);
  }, [sessions, selectedHabitId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
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
                        height: Math.max(barHeight, 4),
                        backgroundColor:
                          d.count > 0
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        borderRadius: 6,
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>
                    {dayLabels[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Session log */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recent Sessions
        </Text>
        {recentSessions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No sessions recorded yet
            </Text>
          </View>
        ) : (
          recentSessions.map(session => {
            const habit = habits.find(h => h.id === session.habitId);
            const mins = Math.round(session.duration / 60);
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
                    {session.date} {'\u{2022}'} {time} {'\u{2022}'} {mins}m
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: session.completed
                        ? theme.colors.success + '20'
                        : theme.colors.error + '20',
                    },
                  ]}>
                  <Text
                    style={{
                      color: session.completed
                        ? theme.colors.success
                        : theme.colors.error,
                      fontSize: 11,
                      fontWeight: '700',
                    }}>
                    {session.completed ? 'Done' : 'Quit'}
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  filterRow: { marginBottom: 20 },
  filterContent: { gap: 8 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
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
  barValue: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  bar: { width: 20, minHeight: 4 },
  barLabel: { fontSize: 11, marginTop: 6, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyCard: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  sessionEmoji: { fontSize: 28, marginRight: 12 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 15, fontWeight: '600' },
  sessionMeta: { fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bottomSpacer: { height: 100 },
});

export default HistoryScreen;
