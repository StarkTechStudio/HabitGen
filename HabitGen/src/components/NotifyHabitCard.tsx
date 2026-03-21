import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Habit, NotificationSession } from '../types';
import { useNavigation } from '@react-navigation/native';

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
  const completedCount = todaySessions.filter(
    s => s.status === 'completed',
  ).length;
  const skippedCount = todaySessions.filter(
    s => s.status === 'skipped',
  ).length;
  const notifyActive = habit.notifyActive === true;

  const progressPercent =
    totalNotifications > 0
      ? Math.min(1, completedCount / totalNotifications)
      : 0;

  const formatInterval = (mins: number): string => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    if (mins >= 1) {
      return `${Math.round(mins)}m`;
    }
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
    setStopping(true);
    await onStopNotify(habit.id);
    setStopping(false);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: allDone
            ? theme.colors.success + '60'
            : theme.colors.border,
        },
      ]}
      onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
      activeOpacity={0.7}>
      {/* Top row: emoji + info */}
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {habit.name}
            </Text>
            <View
              style={[
                styles.modeBadge,
                { backgroundColor: theme.colors.primary + '20' },
              ]}>
              <Text
                style={[styles.modeBadgeText, { color: theme.colors.primary }]}>
                {'\u{1F514}'} Notify
              </Text>
            </View>
          </View>
          <Text style={[styles.scheduleText, { color: theme.colors.textMuted }]}>
            {totalNotifications}x {'\u{2022}'} every {formatInterval(intervalMinutes)} {'\u{2022}'} {formatInterval(durationMinutes)} window
          </Text>
        </View>
      </View>

      {/* Completed/Total and skipped/Total */}
      <View style={styles.statsRow}>
        <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
          {completedCount}/{totalNotifications} completed
        </Text>
        <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
          {skippedCount}/{totalNotifications} skipped
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View
          style={[
            styles.progressBarBg,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: allDone
                  ? theme.colors.success
                  : theme.colors.primary,
                width: `${progressPercent * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Start / Stop button */}
      <View style={styles.actionRow}>
        {notifyActive ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.error + '18', borderColor: theme.colors.error },
            ]}
            onPress={handleStop}
            disabled={stopping}
            activeOpacity={0.7}>
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
              {stopping ? '...' : '\u{23F9}\u{FE0F}'} Stop
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.success + '18', borderColor: theme.colors.success },
            ]}
            onPress={handleStart}
            disabled={starting}
            activeOpacity={0.7}>
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>
              {starting ? '...' : '\u{25B6}\u{FE0F}'} Start
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Done badge */}
      {allDone && totalNotifications > 0 && (
        <View
          style={[
            styles.doneBadge,
            { backgroundColor: theme.colors.success + '18' },
          ]}>
          <Text style={[styles.doneBadgeText, { color: theme.colors.success }]}>
            {'\u{2705}'} All notifications completed for today!
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: { fontSize: 36, marginRight: 14 },
  infoCol: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modeBadgeText: { fontSize: 11, fontWeight: '700' },
  scheduleText: { fontSize: 12, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statsText: { fontSize: 13, fontWeight: '600' },
  progressSection: { marginTop: 8 },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  actionButtonText: { fontSize: 14, fontWeight: '700' },
  doneBadge: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBadgeText: { fontSize: 13, fontWeight: '700' },
});

export default NotifyHabitCard;
