import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Habit, NotificationSession } from '../types';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

interface NotifyHabitCardProps {
  habit: Habit;
  todaySessions: NotificationSession[];
  onStartNotify: (habitId: string) => Promise<{ ok: boolean; error?: string }>;
  onStopNotify: (habitId: string) => Promise<void>;
}

const NotifyHabitCard: React.FC<NotifyHabitCardProps> = ({
  habit,
  todaySessions,
  onStartNotify,
  onStopNotify,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [starting, setStarting] = React.useState(false);
  const [stopping, setStopping] = React.useState(false);

  if (!habit.notifyConfig) return null;

  const { durationMinutes, frequencyCount } = habit.notifyConfig;
  const totalNotifications = frequencyCount;
  const intervalMinutes = frequencyCount > 0 ? durationMinutes / frequencyCount : 0;
  const completedCount = todaySessions.filter(s => s.status === 'completed').length;
  const skippedCount = todaySessions.filter(s => s.status === 'skipped').length;
  const notifyActive = habit.notifyActive === true;

  const progressPercent =
    totalNotifications > 0
      ? Math.min(1, completedCount / totalNotifications)
      : 0;

  const formatInterval = (mins: number): string => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return m > 0 ? `${h}h ${m} min` : `${h}h`;
    }
    if (mins >= 1) return `${Math.round(mins)} min`;
    return `${Math.round(mins * 60)}s`;
  };

  const allDone = completedCount + skippedCount >= totalNotifications;

  const handleStart = async () => {
    setStarting(true);
    const result = await onStartNotify(habit.id);
    setStarting(false);
    if (!result.ok && result.error) {
      Alert.alert('Cannot Start', result.error);
    }
  };

  const handleStop = async () => {
    Alert.alert('Stop Habit', 'Stop notifications for this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: async () => {
          setStopping(true);
          await onStopNotify(habit.id);
          setStopping(false);
        },
      },
    ]);
  };

  const cardColors = theme.colors.cardColors;
  const cardColor = habit.color || cardColors[Math.abs(habit.id.charCodeAt(0) + habit.id.charCodeAt(1)) % cardColors.length];

  const skipWarning =
    totalNotifications > 0 && todaySessions.length > 0 &&
    skippedCount / todaySessions.length >= 0.2;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor, width: CARD_WIDTH }]}
      onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
          {notifyActive ? (
            <View style={[styles.activeDot, { backgroundColor: '#4CAF50' }]} />
          ) : (
            <View style={styles.inactiveDot} />
          )}
        </View>
      </View>

      <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
      <Text style={styles.habitFreq}>
        {frequencyCount}× · every {formatInterval(intervalMinutes)}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progressPercent * 100}%` as any }]} />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>✓ {completedCount}/{totalNotifications}</Text>
        {habit.streak > 0 && (
          <View style={styles.streakPill}>
            <Text style={{ fontSize: 9 }}>🔥</Text>
            <Text style={styles.streakText}>{habit.streak}</Text>
          </View>
        )}
      </View>

      {skipWarning && (
        <Text style={styles.warnText}>⚠️ 20%+ skipped</Text>
      )}

      {/* Action buttons */}
      {notifyActive ? (
        <TouchableOpacity
          style={styles.stopBtn}
          onPress={handleStop}
          disabled={stopping}
          activeOpacity={0.8}
        >
          {stopping ? (
            <ActivityIndicator size="small" color="rgba(0,0,0,0.5)" />
          ) : (
            <Text style={styles.stopBtnText}>■ Stop</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.startBtn, (allDone) && { opacity: 0.6 }]}
          onPress={handleStart}
          disabled={starting || allDone}
          activeOpacity={0.8}
        >
          {starting ? (
            <ActivityIndicator size="small" color="rgba(0,0,0,0.5)" />
          ) : (
            <Text style={styles.startBtnText}>{allDone ? '✓ Done' : '▶ Start'}</Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default NotifyHabitCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inactiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  habitFreq: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 8,
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B35',
  },
  warnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 6,
  },
  startBtn: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.6)',
  },
  stopBtn: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  stopBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.6)',
  },
});
