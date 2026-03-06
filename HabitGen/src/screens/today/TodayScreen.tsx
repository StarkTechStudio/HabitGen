import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { getGreeting, getTodayDateString } from '../../utils/helpers';
import HabitCard from '../../components/HabitCard';
import { useNavigation } from '@react-navigation/native';

const TodayScreen: React.FC = () => {
  const { theme } = useTheme();
  const { habits, sessions, timerState, getHabitStreak, refreshData } = useHabits();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const completedToday = todaySessions.filter(s => s.completed).length;
  const totalStreaks = habits.reduce(
    (sum, h) => sum + getHabitStreak(h.id).currentStreak,
    0,
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Today</Text>
        </View>

        {/* Active timer banner */}
        {timerState?.isRunning && (
          <TouchableOpacity
            style={[styles.timerBanner, { backgroundColor: theme.colors.primary }]}
            onPress={() =>
              navigation.navigate('Timer', { habitId: timerState.habitId })
            }>
            <Text style={styles.timerBannerText}>
              {'\u{1F512}'} Focus session in progress - Tap to view
            </Text>
          </TouchableOpacity>
        )}

        {/* Stats card */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {habits.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Habits
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {completedToday}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Done Today
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>
              {'\u{1F525}'} {totalStreaks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Total Streaks
            </Text>
          </View>
        </View>

        {/* Habits list */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Habits
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateHabit')}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {habits.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={styles.emptyEmoji}>{'\u{1F331}'}</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No habits yet
            </Text>
            <Text
              style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Tap "+ Add" to create your first habit and start building streaks
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CreateHabit')}>
              <Text style={styles.emptyButtonText}>Create First Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={getHabitStreak(habit.id)}
              isTimerRunning={
                timerState?.habitId === habit.id && timerState.isRunning
              }
              todayCompleted={todaySessions.some(
                s => s.habitId === habit.id && s.completed,
              )}
            />
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '800' },
  timerBanner: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  timerBannerText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  statDivider: { width: 1, marginVertical: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  bottomSpacer: { height: 120 },
});

export default TodayScreen;
