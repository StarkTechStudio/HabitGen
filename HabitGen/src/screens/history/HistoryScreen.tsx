import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';

const { width } = Dimensions.get('window');
const BAR_COUNT = 7;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { habits, sessions } = useHabits();
  const insets = useSafeAreaInsets();
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
      return DAYS[date.getDay()];
    });
  }, [last7Days]);

  const chartData = useMemo(() => {
    return last7Days.map(day => {
      const daySessions = sessions.filter(
        s => s.date === day && s.completed &&
          (!selectedHabitId || s.habitId === selectedHabitId),
      );
      const totalMinutes = Math.round(
        daySessions.reduce((sum, s) => sum + s.duration, 0) / 60,
      );
      return { day, count: daySessions.length, totalMinutes };
    });
  }, [last7Days, sessions, selectedHabitId]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Show only COMPLETED sessions, one per habit (latest), no quit
  const recentSessions = useMemo(() => {
    const completed = sessions.filter(
      s => s.completed && (!selectedHabitId || s.habitId === selectedHabitId),
    );
    const latestPerHabit = new Map<string, typeof completed[0]>();
    for (const s of completed) {
      const existing = latestPerHabit.get(s.habitId);
      if (!existing || s.startTime > existing.startTime) {
        latestPerHabit.set(s.habitId, s);
      }
    }
    return Array.from(latestPerHabit.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 15);
  }, [sessions, selectedHabitId]);

  function fmtDur(sec: number) {
    const m = Math.round(sec / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem} min` : `${h}h`;
  }

  const topInset = insets.top + (Platform.OS === 'web' ? 0 : 0);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: topInset, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerInner}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>History</Text>
          <View style={[styles.headerBadge, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.headerBadgeText, { color: theme.colors.primary }]}>Last 7 days</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly bar chart */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weekly Overview</Text>
          <View style={styles.barChart}>
            {chartData.map((day, i) => {
              const barH = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 2);
              const isToday = i === BAR_COUNT - 1;
              return (
                <View key={day.day} style={styles.barCol}>
                  <Text style={[styles.barVal, { color: theme.colors.textMuted }]}>
                    {day.count > 0 ? day.count : ''}
                  </Text>
                  <View style={[styles.barBg, { backgroundColor: `${theme.colors.border}80` }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barH}%` as any,
                          backgroundColor: isToday ? theme.colors.primary : day.count > 2 ? theme.colors.success : day.count > 0 ? theme.colors.warning : theme.colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, { color: isToday ? theme.colors.primary : theme.colors.textMuted }, isToday && { fontWeight: '800' }]}>
                    {dayLabels[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats cards */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Habits', val: habits.length, emoji: '📋', color: theme.colors.primary },
            { label: 'Sessions Done', val: sessions.filter(s => s.completed).length, emoji: '✅', color: theme.colors.success },
            { label: 'Best Streak', val: Math.max(0, ...habits.map(h => h.streak || 0)), emoji: '🔥', color: '#FF7043' },
            { label: 'Hours Focused', val: Math.round(sessions.filter(s => s.completed).reduce((a, s) => a + s.duration, 0) / 3600), emoji: '⏰', color: '#26C6DA' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
              <Text style={[styles.statVal, { color: theme.colors.text }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Habit filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedHabitId(null)}
            style={[styles.filterPill, !selectedHabitId && { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.filterPillText, { color: !selectedHabitId ? '#fff' : theme.colors.textSecondary }]}>All</Text>
          </TouchableOpacity>
          {habits.map(h => (
            <TouchableOpacity
              key={h.id}
              onPress={() => setSelectedHabitId(h.id === selectedHabitId ? null : h.id)}
              style={[styles.filterPill, selectedHabitId === h.id && { backgroundColor: h.color || theme.colors.primary }]}
            >
              <Text style={{ fontSize: 14 }}>{h.emoji}</Text>
              <Text style={[styles.filterPillText, { color: selectedHabitId === h.id ? '#fff' : theme.colors.textSecondary }]}>{h.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Sessions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Sessions</Text>

        {recentSessions.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.colors.surface }]}>
            <Text style={{ fontSize: 40 }}>📅</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No sessions yet</Text>
          </View>
        ) : (
          recentSessions.map(session => {
            const habit = habits.find(h => h.id === session.habitId);
            const cardColors = theme.colors.cardColors;
            const cardColor = habit?.color || cardColors[0];
            return (
              <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.colors.surface, borderLeftColor: cardColor }]}>
                <View style={[styles.sessionEmoji, { backgroundColor: cardColor }]}>
                  <Text style={{ fontSize: 20 }}>{habit?.emoji || '🎯'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionName, { color: theme.colors.text }]}>{habit?.name || 'Unknown'}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={[styles.sessionMetaText, { color: theme.colors.success }]}>✓ Done</Text>
                    <Text style={[styles.sessionMetaText, { color: theme.colors.textMuted }]}>
                      ⏱ {fmtDur(session.duration)}
                    </Text>
                    <Text style={[styles.sessionMetaText, { color: theme.colors.textMuted }]}>
                      {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: '900',
  },
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: { padding: 16 },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barVal: { fontSize: 10, fontWeight: '700', height: 14 },
  barBg: {
    flex: 1,
    width: '70%',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    minHeight: 4,
  },
  barFill: { borderRadius: 6 },
  barDay: { fontSize: 10, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 42) / 2,
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statVal: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 8, paddingRight: 8, marginBottom: 16 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  filterPillText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },
  empty: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 14, fontWeight: '600' },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionEmoji: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sessionMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sessionMetaText: { fontSize: 11, fontWeight: '600' },
});
