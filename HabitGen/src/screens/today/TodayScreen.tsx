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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { getGreeting, getTodayDateString } from '../../utils/helpers';
import HabitCard from '../../components/HabitCard';
import NotifyHabitCard from '../../components/NotifyHabitCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../../api/notificationService';
import { storage } from '../../utils/storage';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekStrip() {
  const today = new Date();
  const days = [];
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ num: d.getDate(), label: WEEKDAYS[d.getDay()], isToday: i === 0 });
  }
  return days;
}

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
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const completedToday = todaySessions.filter(s => s.completed).length;

  useFocusEffect(useCallback(() => {
    storage.getUserPreferences().then(prefs => {
      if (prefs?.name) setUserName(prefs.name);
    });
  }, []));

  useFocusEffect(
    useCallback(() => {
      const processPending = async () => {
        const pending = await storage.getAndClearPendingNotifications?.() ?? [];
        for (const action of pending) {
          if (action.type === 'complete') await notificationService.completeNotification(action.habitId);
          if (action.type === 'skip') await notificationService.skipNotification(action.habitId);
        }
        refreshData();
      };
      processPending();
    }, [refreshData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

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

  const strip = getWeekStrip();
  const greeting = getGreeting(userName);

  const topInset = insets.top + (Platform.OS === 'web' ? 0 : 0);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: topInset, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greetingText, { color: theme.colors.text }]} numberOfLines={2}>
              {greeting.split(',')[0] + ','}
            </Text>
            <Text style={[styles.greetingName, { color: theme.colors.text }]}>
              {userName || 'Friend'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.streakBadge, { backgroundColor: '#FFF0E8' }]}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <Text style={[styles.streakNum, { color: '#FF6B35' }]}>{totalStreaks}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CreateHabit')}
              activeOpacity={0.85}
            >
              <Text style={styles.addBtnText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
          {strip.map((d, i) => (
            <View key={i} style={[styles.dayPill, d.isToday && { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.dayNum, { color: d.isToday ? '#fff' : theme.colors.text }]}>{d.num}</Text>
              <Text style={[styles.dayLabel, { color: d.isToday ? 'rgba(255,255,255,0.8)' : theme.colors.textMuted }]}>{d.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable habits */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.habitContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { val: completedToday, label: 'Done', color: theme.colors.primary },
            { val: habits.length - completedToday, label: 'Pending', color: '#FF7043' },
            { val: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0, label: 'Rate %', color: '#26C6DA' },
          ].map(s => (
            <View key={s.label} style={[styles.statPill, { backgroundColor: s.color }]}>
              <Text style={styles.statPillNum}>{s.val}</Text>
              <Text style={styles.statPillLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Notify habits section */}
        {notifyHabits.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notify Habits</Text>
              <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.sectionBadgeText, { color: theme.colors.primary }]}>{notifyHabits.length}</Text>
              </View>
            </View>
            <View style={styles.gridWrap}>
              {notifyHabits.map(habit => {
                const sessions = getNotifSessionsForHabit(habit.id, todayStr);
                return (
                  <NotifyHabitCard
                    key={habit.id}
                    habit={habit}
                    todaySessions={sessions}
                    onStartNotify={startNotifyHabit}
                    onStopNotify={stopNotifyHabit}
                  />
                );
              })}
            </View>
          </>
        )}

        {/* Focus habits section */}
        {sortedFocusHabits.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Focus Habits</Text>
              <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.sectionBadgeText, { color: theme.colors.primary }]}>{sortedFocusHabits.length}</Text>
              </View>
            </View>
            <View style={styles.gridWrap}>
              {sortedFocusHabits.map(habit => {
                const streak = getHabitStreak(habit.id);
                const isRunning = timerState?.habitId === habit.id && timerState.isRunning;
                const todaySession = todaySessions.find(s => s.habitId === habit.id && s.completed);
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    streak={streak}
                    isTimerRunning={isRunning}
                    todayCompleted={!!todaySession}
                  />
                );
              })}
            </View>
          </>
        )}

        {/* Empty state */}
        {habits.length === 0 && (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: `${theme.colors.primary}18` }]}>
              <Text style={{ fontSize: 48 }}>🎯</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No habits yet</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Tap the + button to create{'\n'}your first habit
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('CreateHabit')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBtnText}>＋ Add Habit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TodayScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 12,
    gap: 12,
  },
  greetingText: {
    fontSize: Math.min(width * 0.045, 16),
    fontWeight: '600',
    lineHeight: 22,
  },
  greetingName: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: '900',
    lineHeight: 34,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakNum: {
    fontSize: 15,
    fontWeight: '800',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 30,
    fontWeight: '300',
  },
  dateStrip: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 6,
  },
  dayPill: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 52,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  habitContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statPillNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  statPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.05, 18),
    fontWeight: '800',
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
