import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { getGreeting, getTodayDateString } from '../../utils/helpers';
import HabitCard from '../../components/HabitCard';
import NotifyHabitCard from '../../components/NotifyHabitCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../../api/notificationService';
import { storage } from '../../utils/storage';

// Circular Progress Component
const CircularProgress: React.FC<{
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  bgColor: string;
  children?: React.ReactNode;
}> = ({ size, strokeWidth, progress, color, bgColor, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
};

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

  const notifyCompletedToday = notifyHabits.reduce((sum, h) => {
    const ns = getNotifSessionsForHabit(h.id, todayStr);
    const totalNotifications = h.notifyConfig?.frequencyCount ?? 0;
    const completed = ns.filter(s => s.status === 'completed').length;
    return sum + (completed >= totalNotifications && totalNotifications > 0 ? 1 : 0);
  }, 0);

  const totalDone = completedToday + notifyCompletedToday;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? totalDone / totalHabits : 0;
  const remaining = Math.max(totalHabits - totalDone, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
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

  // Get the best streak across all habits
  const bestStreak = habits.reduce((max, h) => {
    const s = getHabitStreak(h.id);
    return s.currentStreak > max ? s.currentStreak : max;
  }, 0);

  // Weekly score (simple calc: % completed of the last 7 days)
  const weeklyScore = totalHabits > 0 ? Math.round(progressPercent * 100) : 0;

  const getMotivationalMessage = () => {
    if (totalDone === totalHabits && totalHabits > 0) return "Perfect day! All habits complete!";
    if (progressPercent >= 0.7) return "Almost there, keep pushing!";
    if (progressPercent >= 0.4) return "Great momentum, keep going!";
    if (totalDone > 0) return "Good start, keep it up!";
    return "Ready to crush it today?";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
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
          <View style={styles.headerLeft}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" fill={theme.colors.primary} />
            </Svg>
            <Text style={[styles.brandName, { color: theme.colors.primary }]}>Habitgen</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.profileBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Account')}>
              <PersonIcon color="#FFF" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingTitle, { color: theme.colors.text }]}>
            {totalDone > 0 ? 'Keep growing.' : `${getGreeting()}.`}
          </Text>
          <Text style={[styles.greetingSubtitle, { color: theme.colors.textSecondary }]}>
            {totalHabits > 0
              ? `${totalDone > 0 ? "You're almost there. " : ''}${totalDone} habit${totalDone !== 1 ? 's' : ''} down, ${remaining} to go.`
              : 'Start building your daily habits today.'}
          </Text>
        </View>

        {/* Add New Habit Button */}
        <TouchableOpacity
          style={[styles.addHabitBtn, { backgroundColor: theme.colors.accent }]}
          onPress={() => navigation.navigate('CreateHabit')}
          activeOpacity={0.8}>
          <Text style={styles.addHabitBtnText}>Add New Habit</Text>
        </TouchableOpacity>

        {/* Active timer banner */}
        {timerState?.isRunning && (
          <TouchableOpacity
            style={[styles.timerBanner, { backgroundColor: theme.colors.primary }]}
            onPress={() =>
              navigation.navigate('Timer', { habitId: timerState.habitId })
            }>
            <Text style={styles.timerBannerText}>
              Focus session in progress - Tap to view
            </Text>
          </TouchableOpacity>
        )}

        {/* Circular Progress */}
        {totalHabits > 0 && (
          <View style={styles.progressSection}>
            <CircularProgress
              size={180}
              strokeWidth={14}
              progress={progressPercent}
              color={theme.colors.accent}
              bgColor={theme.colors.surfaceVariant}>
              <View style={styles.progressCenter}>
                <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
                  {Math.round(progressPercent * 100)}%
                </Text>
                <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                  DAILY GOAL
                </Text>
              </View>
            </CircularProgress>
          </View>
        )}

        {/* Habits Section */}
        <View style={styles.habitsSection}>
          {habits.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill={theme.colors.accent} />
              </Svg>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No habits yet
              </Text>
              <Text
                style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
                Tap "Add New Habit" to create your first habit and start building streaks
              </Text>
            </View>
          ) : (
            <>
              {/* Focus habits */}
              {sortedFocusHabits.length > 0 && (
                <>
                  {notifyHabits.length > 0 && (
                    <Text
                      style={[styles.subsectionTitle, { color: theme.colors.textMuted }]}>
                      FOCUS HABITS
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
                        { color: theme.colors.textMuted, marginTop: 16 },
                      ]}>
                      NOTIFY HABITS
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
        </View>

        {/* Motivational Card */}
        {totalHabits > 0 && totalDone > 0 && (
          <View style={[styles.motivationCard, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.motivationTitle}>{getMotivationalMessage()}</Text>
            <Text style={styles.motivationDesc}>
              {totalDone >= 2
                ? `Completing your habits ${totalDone} days in a row builds momentum and transforms your life.`
                : 'Every small step counts. Keep going!'}
            </Text>
          </View>
        )}

        {/* Stats Row */}
        {totalHabits > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                CURRENT STREAK
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {bestStreak} Days
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                WEEKLY SCORE
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {weeklyScore}%
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                HABITS MASTERED
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {totalDone}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateHabit')}
        activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// Simple person icon for header
const PersonIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  addHabitBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  addHabitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timerBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  timerBannerText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  progressSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 38,
    fontWeight: '800',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  habitsSection: {
    paddingHorizontal: 20,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  motivationCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
  },
  motivationTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  motivationDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
  },
  statsRow: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  bottomSpacer: { height: 100 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});

export default TodayScreen;
