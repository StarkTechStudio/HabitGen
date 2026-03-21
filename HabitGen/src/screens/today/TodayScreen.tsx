import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { getGreeting, getTodayDateString } from '../../utils/helpers';
import HabitCard from '../../components/HabitCard';
import NotifyHabitCard from '../../components/NotifyHabitCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../../api/notificationService';
import { storage } from '../../utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TodayScreen: React.FC = () => {
  const { theme } = useTheme();
  const {
    habits,
    sessions,
    timerState,
    getHabitStreak,
    refreshData,
    getNotifSessionsForHabit,
    startNotifyHabit,
    stopNotifyHabit,
  } = useHabits();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const completedToday = todaySessions.filter(s => s.completed).length;

  // Split habits by mode
  const focusHabits = habits.filter(h => h.habitMode !== 'notify');
  const notifyHabits = habits.filter(h => h.habitMode === 'notify');

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedFocusHabits = [...focusHabits].sort((a, b) => {
    const aP = a.priority ? priorityOrder[a.priority] : 1;
    const bP = b.priority ? priorityOrder[b.priority] : 1;
    return aP - bP;
  });

  const totalStreaks = habits.reduce(
    (sum, h) => sum + getHabitStreak(h.id).currentStreak,
    0,
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Process pending queue first, then auto-skip, then refresh
    const pending = await storage.getAndClearPendingNotifActions();
    for (const { sessionId, status } of pending) {
      await storage.updateNotificationSession(sessionId, {
        status,
        respondedAt: Date.now(),
      });
    }
    await notificationService.markPassedAsSkipped();
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  useFocusEffect(
    React.useCallback(() => {
      const run = async () => {
        // Process pending queue first, then auto-skip, then refresh
        const pending = await storage.getAndClearPendingNotifActions();
        for (const { sessionId, status } of pending) {
          await storage.updateNotificationSession(sessionId, {
            status,
            respondedAt: Date.now(),
          });
        }
        await notificationService.markPassedAsSkipped();
        await refreshData();
      };
      run();
    }, [refreshData]),
  );

  // Count notify completions for today stats
  const notifyCompletedToday = notifyHabits.reduce((sum, h) => {
    const ns = getNotifSessionsForHabit(h.id, todayStr);
    const totalNotifications = h.notifyConfig?.frequencyCount ?? 0;
    const completed = ns.filter(s => s.status === 'completed').length;
    return sum + (completed >= totalNotifications && totalNotifications > 0 ? 1 : 0);
  }, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* FIXED HEADER - does not scroll */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerContent}>
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
              {completedToday + notifyCompletedToday}
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

        {/* Section header */}
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
      </View>

      {/* SCROLLABLE HABITS ONLY */}
      <ScrollView
        style={styles.habitsList}
        contentContainerStyle={styles.habitsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }>
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
          <>
            {/* Focus habits */}
            {sortedFocusHabits.length > 0 && (
              <>
                {notifyHabits.length > 0 && (
                  <Text
                    style={[styles.subsectionTitle, { color: theme.colors.textMuted }]}>
                    {'\u{1F3AF}'} Focus Habits
                  </Text>
                )}
                {sortedFocusHabits.map(habit => (
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
                ))}
              </>
            )}

            {/* Notify habits */}
            {notifyHabits.length > 0 && (
              <>
                {sortedFocusHabits.length > 0 && (
                  <Text
                    style={[
                      styles.subsectionTitle,
                      { color: theme.colors.textMuted, marginTop: 12 },
                    ]}>
                    {'\u{1F514}'} Notify Habits
                  </Text>
                )}
                {notifyHabits.map(habit => (
                  <NotifyHabitCard
                    key={habit.id}
                    habit={habit}
                    todaySessions={getNotifSessionsForHabit(habit.id, todayStr)}
                    onStartNotify={startNotifyHabit}
                    onStopNotify={stopNotifyHabit}
                  />
                ))}
              </>
            )}
          </>
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
    paddingBottom: 4,
  },
  headerContent: { marginBottom: 16 },
  greeting: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  title: { fontSize: 30, fontWeight: '800' },
  timerBanner: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  timerBannerText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1, marginVertical: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  habitsList: { flex: 1 },
  habitsContent: { paddingHorizontal: 20, paddingTop: 4 },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 18 },
  emptyButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  bottomSpacer: { height: 100 },
});

export default TodayScreen;
