import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
  const notifyCompleted = notifySessions.filter(s => s.status === 'completed').length;
  const notifySkipped = notifySessions.filter(s => s.status === 'skipped').length;
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
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke={theme.colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
              Back
            </Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {!isNotifyMode && (
              <TouchableOpacity
                onPress={onEdit}
                disabled={isTimerRunning}
                style={{ opacity: isTimerRunning ? 0.4 : 1 }}>
                <Text style={[styles.editText, { color: theme.colors.primary }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isTimerRunning || notifyActive}
              style={{ opacity: isTimerRunning || notifyActive ? 0.4 : 1 }}>
              <Text style={[styles.deleteText, { color: theme.colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Habit info */}
        <View style={styles.habitInfo}>
          <View style={[styles.emojiWrap, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={styles.emoji}>{habit.emoji}</Text>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {habit.name}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                {habit.habitMode === 'focus' ? 'Focus' : 'Notify'}
              </Text>
            </View>
            {habit.difficulty && (
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                  {habit.difficulty}
                </Text>
              </View>
            )}
            {habit.priority && (
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                  {habit.priority} priority
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notify mode detail */}
        {isNotifyMode && habit.notifyConfig && (
          <>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Notification Schedule
              </Text>
              <View style={styles.infoCardRow}>
                <View style={styles.infoCardItem}>
                  <Text style={[styles.infoCardValue, { color: theme.colors.primary }]}>
                    {formatInterval(habit.notifyConfig.durationMinutes)}
                  </Text>
                  <Text style={[styles.infoCardLabel, { color: theme.colors.textMuted }]}>
                    Duration
                  </Text>
                </View>
                <View style={[styles.infoCardDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.infoCardItem}>
                  <Text style={[styles.infoCardValue, { color: theme.colors.primary }]}>
                    {formatInterval(intervalMinutes)}
                  </Text>
                  <Text style={[styles.infoCardLabel, { color: theme.colors.textMuted }]}>
                    Every
                  </Text>
                </View>
                <View style={[styles.infoCardDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.infoCardItem}>
                  <Text style={[styles.infoCardValue, { color: theme.colors.accent }]}>
                    {totalNotifications}
                  </Text>
                  <Text style={[styles.infoCardLabel, { color: theme.colors.textMuted }]}>
                    Notifications
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Today's Progress
              </Text>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: notifyCompleted >= totalNotifications
                        ? theme.colors.success
                        : theme.colors.accent,
                      width: totalNotifications > 0
                        ? `${Math.min(1, notifyCompleted / totalNotifications) * 100}%`
                        : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                {notifyCompleted}/{totalNotifications} completed
                {notifySkipped > 0 && ` | ${notifySkipped} skipped`}
              </Text>
            </View>
          </>
        )}

        {/* Focus mode stats */}
        {!isNotifyMode && (
          <>
            <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {streak.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Current Streak
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                  {streak.longestStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Best Streak
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                  {totalMinutes}m
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                  Total Time
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sessions</Text>
              <Text style={[styles.sessionsCount, { color: theme.colors.textSecondary }]}>
                {completedSessions.length} completed / {habitSessions.length} total
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              onPress={onStartTimer}>
              <Text style={styles.startButtonText}>
                {isTimerRunning ? 'View Timer' : 'Start Session'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Streak info for notify habits too */}
        {isNotifyMode && (
          <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {streak.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Current Streak
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: { fontSize: 16, fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 16 },
  editText: { fontSize: 16, fontWeight: '600' },
  deleteText: { fontSize: 16, fontWeight: '600' },
  habitInfo: { alignItems: 'center', marginBottom: 28 },
  emojiWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: { fontSize: 48 },
  name: { fontSize: 28, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  infoCardRow: { flexDirection: 'row' },
  infoCardItem: { flex: 1, alignItems: 'center' },
  infoCardValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  infoCardLabel: { fontSize: 11, fontWeight: '500' },
  infoCardDivider: { width: 1, marginVertical: 4 },
  progressBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressText: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1, marginVertical: 4 },
  sessionsCount: { fontSize: 14 },
  startButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  error: { fontSize: 16, textAlign: 'center', marginTop: 40 },
});

export default HabitDetailScreen;
