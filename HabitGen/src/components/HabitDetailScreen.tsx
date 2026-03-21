import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { getTodayDateString } from '../utils/helpers';

interface HabitDetailScreenProps {
  habitId: string;
  onClose: () => void;
  onEdit: () => void;
  onStartTimer: () => void;
}

const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({
  habitId,
  onClose,
  onEdit,
  onStartTimer,
}) => {
  const { theme } = useTheme();
  const {
    habits,
    sessions,
    timerState,
    deleteHabit,
    getHabitStreak,
    getNotifSessionsForHabit,
  } = useHabits();
  const habit = habits.find(h => h.id === habitId);
  const streak = getHabitStreak(habitId);
  const isTimerRunning = timerState?.habitId === habitId && timerState?.isRunning;

  const habitSessions = sessions
    .filter(s => s.habitId === habitId)
    .sort((a, b) => b.startTime - a.startTime);

  const completedSessions = habitSessions.filter(s => s.completed);
  const totalMinutes = Math.round(
    habitSessions.reduce((sum, s) => sum + s.duration, 0) / 60,
  );

  // Notify mode data
  const todayStr = getTodayDateString();
  const isNotifyMode = habit?.habitMode === 'notify';
  const notifySessions = isNotifyMode
    ? getNotifSessionsForHabit(habitId, todayStr)
    : [];
  const totalNotifications =
    isNotifyMode && habit?.notifyConfig?.frequencyCount
      ? habit.notifyConfig.frequencyCount
      : 0;
  const intervalMinutes =
    isNotifyMode && habit?.notifyConfig?.frequencyCount
      ? habit.notifyConfig.durationMinutes / habit.notifyConfig.frequencyCount
      : 0;
  const notifyCompleted = notifySessions.filter(
    s => s.status === 'completed',
  ).length;
  const notifySkipped = notifySessions.filter(
    s => s.status === 'skipped',
  ).length;
  const notifyActive = isNotifyMode && habit?.notifyActive === true;

  const formatInterval = (mins: number): string => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    if (mins >= 1) {
      return `${Math.round(mins)} min`;
    }
    return `${Math.round(mins * 60)} sec`;
  };

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.error, { color: theme.colors.error }]}>
          Habit not found
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    if (isTimerRunning) {
      Alert.alert('Cannot Delete', 'Please stop the timer before deleting this habit.');
      return;
    }
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habitId);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
              {'\u{2190}'} Back
            </Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={onEdit}
              disabled={isTimerRunning || notifyActive}
              style={{ opacity: isTimerRunning || notifyActive ? 0.4 : 1 }}>
              <Text style={[styles.editText, { color: theme.colors.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isTimerRunning}
              style={{ opacity: isTimerRunning ? 0.4 : 1 }}>
              <Text style={[styles.deleteText, { color: theme.colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Habit info */}
        <View style={styles.habitInfo}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {habit.name}
          </Text>
          <View style={styles.badgeRow}>
            {/* Mode badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.primary + '20' },
              ]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                {habit.habitMode === 'focus' ? '\u{1F3AF} Focus' : '\u{1F514} Notify'}
              </Text>
            </View>
            {habit.difficulty && (
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                  {habit.difficulty === 'easy'
                    ? '\u{1F7E2}'
                    : habit.difficulty === 'medium'
                    ? '\u{1F7E1}'
                    : '\u{1F534}'}{' '}
                  {habit.difficulty}
                </Text>
              </View>
            )}
            {habit.priority && (
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                  {habit.priority === 'low'
                    ? '\u{2B07}\u{FE0F}'
                    : habit.priority === 'medium'
                    ? '\u{27A1}\u{FE0F}'
                    : '\u{2B06}\u{FE0F}'}{' '}
                  {habit.priority} priority
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ====== NOTIFY MODE DETAIL ====== */}
        {isNotifyMode && habit.notifyConfig && (
          <>
            {/* Notify config card */}
            <View
              style={[
                styles.notifyConfigCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Text style={[styles.notifyConfigTitle, { color: theme.colors.text }]}>
                Notification Schedule
              </Text>
              <View style={styles.notifyConfigRow}>
                <View style={styles.notifyConfigItem}>
                  <Text
                    style={[
                      styles.notifyConfigValue,
                      { color: theme.colors.primary },
                    ]}>
                    {formatInterval(habit.notifyConfig.durationMinutes)}
                  </Text>
                  <Text
                    style={[
                      styles.notifyConfigLabel,
                      { color: theme.colors.textMuted },
                    ]}>
                    Duration
                  </Text>
                </View>
                <View
                  style={[
                    styles.notifyConfigDivider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <View style={styles.notifyConfigItem}>
                  <Text
                    style={[
                      styles.notifyConfigValue,
                      { color: theme.colors.primary },
                    ]}>
                    {formatInterval(intervalMinutes)}
                  </Text>
                  <Text
                    style={[
                      styles.notifyConfigLabel,
                      { color: theme.colors.textMuted },
                    ]}>
                    Every
                  </Text>
                </View>
                <View
                  style={[
                    styles.notifyConfigDivider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <View style={styles.notifyConfigItem}>
                  <Text
                    style={[
                      styles.notifyConfigValue,
                      { color: theme.colors.accent },
                    ]}>
                    {totalNotifications}
                  </Text>
                  <Text
                    style={[
                      styles.notifyConfigLabel,
                      { color: theme.colors.textMuted },
                    ]}>
                    Notifications
                  </Text>
                </View>
              </View>
            </View>

            {/* Today's progress */}
            <View
              style={[
                styles.notifyProgressCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Text
                style={[styles.notifyProgressTitle, { color: theme.colors.text }]}>
                Today's Progress
              </Text>
              {/* Progress bar */}
              <View
                style={[
                  styles.progressBarBg,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor:
                        notifyCompleted >= totalNotifications
                          ? theme.colors.success
                          : theme.colors.primary,
                      width:
                        totalNotifications > 0
                          ? `${Math.min(1, notifyCompleted / totalNotifications) * 100}%`
                          : '0%',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  { color: theme.colors.textSecondary },
                ]}>
                {notifyCompleted}/{totalNotifications} completed
                {notifySkipped > 0 && ` \u{2022} ${notifySkipped} skipped`}
              </Text>
            </View>
          </>
        )}

        {/* ====== FOCUS MODE STATS ====== */}
        {!isNotifyMode && (
          <>
            {/* Stats */}
            <View
              style={[
                styles.statsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                  {'\u{1F525}'} {streak.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Current Streak
                </Text>
              </View>
              <View
                style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {streak.longestStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Best Streak
                </Text>
              </View>
              <View
                style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                  {totalMinutes} min
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Total Time
                </Text>
              </View>
            </View>

            {/* Sessions count */}
            <View
              style={[
                styles.sessionsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Text style={[styles.sessionsTitle, { color: theme.colors.text }]}>
                Sessions
              </Text>
              <Text style={[styles.sessionsCount, { color: theme.colors.textSecondary }]}>
                {completedSessions.length} completed / {habitSessions.length} total
              </Text>
            </View>

            {/* Start timer button */}
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              onPress={onStartTimer}>
              <Text style={styles.startButtonText}>
                {isTimerRunning ? 'View Timer' : 'Start Session'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Streak info even for notify habits */}
        {isNotifyMode && (
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {'\u{1F525}'} {streak.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Current Streak
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {streak.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Best Streak
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  backText: { fontSize: 16, fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 16 },
  editText: { fontSize: 16, fontWeight: '600' },
  deleteText: { fontSize: 16, fontWeight: '600' },
  habitInfo: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 64, marginBottom: 12 },
  name: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  // Notify config card
  notifyConfigCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  notifyConfigTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  notifyConfigRow: { flexDirection: 'row' },
  notifyConfigItem: { flex: 1, alignItems: 'center' },
  notifyConfigValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  notifyConfigLabel: { fontSize: 11, fontWeight: '500' },
  notifyConfigDivider: { width: 1, marginVertical: 4 },
  // Notify progress
  notifyProgressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  notifyProgressTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  progressBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  // Stats
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1, marginVertical: 4 },
  sessionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  sessionsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sessionsCount: { fontSize: 14 },
  startButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  error: { fontSize: 16, textAlign: 'center', marginTop: 40 },
});

export default HabitDetailScreen;
