import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Habit, Streak } from '../types';
import { useNavigation } from '@react-navigation/native';

interface HabitCardProps {
  habit: Habit;
  streak: Streak;
  isTimerRunning: boolean;
  todayCompleted: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak,
  isTimerRunning,
  todayCompleted,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: todayCompleted
            ? theme.colors.success + '60'
            : isTimerRunning
            ? theme.colors.primary + '60'
            : theme.colors.border,
        },
      ]}
      onPress={() => {
        if (isTimerRunning) {
          navigation.navigate('Timer', { habitId: habit.id });
        } else {
          navigation.navigate('HabitDetail', { habitId: habit.id });
        }
      }}
      activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>{habit.emoji}</Text>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{habit.name}</Text>
            {habit.habitMode === 'focus' && (
              <View style={[styles.modeBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.modeBadgeText, { color: theme.colors.primary }]}>
                  {'\u{1F3AF}'} Focus
                </Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            {streak.currentStreak > 0 && (
              <Text style={[styles.streakText, { color: theme.colors.accent }]}>
                {'\u{1F525}'} {streak.currentStreak} day streak
              </Text>
            )}
            {todayCompleted && (
              <Text style={[styles.doneText, { color: theme.colors.success }]}>
                {'\u{2705}'} Done today
              </Text>
            )}
            {isTimerRunning && (
              <Text style={[styles.runningText, { color: theme.colors.primary }]}>
                Timer running...
              </Text>
            )}
          </View>
        </View>
      </View>
      {!isTimerRunning && !todayCompleted && (
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Timer', { habitId: habit.id })}>
          <Text style={styles.playIcon}>{'\u{25B6}\u{FE0F}'}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emoji: { fontSize: 36, marginRight: 14 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  modeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  modeBadgeText: { fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  streakText: { fontSize: 12, fontWeight: '600' },
  doneText: { fontSize: 12, fontWeight: '600' },
  runningText: { fontSize: 12, fontWeight: '600' },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 16 },
});

export default HabitCard;
