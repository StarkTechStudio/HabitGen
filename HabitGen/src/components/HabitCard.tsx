import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Habit, Streak } from '../types';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

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

  // Use habit's color if set, otherwise pick from theme card colors
  const cardColors = theme.colors.cardColors;
  const cardColor = habit.color || cardColors[Math.abs(habit.id.charCodeAt(0) + habit.id.charCodeAt(1)) % cardColors.length];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor, width: CARD_WIDTH }]}
      onPress={() => {
        if (isTimerRunning) {
          navigation.navigate('Timer', { habitId: habit.id });
        } else {
          navigation.navigate('HabitDetail', { habitId: habit.id });
        }
      }}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
          {todayCompleted ? (
            <Text style={{ fontSize: 12 }}>✓</Text>
          ) : isTimerRunning ? (
            <View style={[styles.activeDot, { backgroundColor: '#4CAF50' }]} />
          ) : (
            <View style={[styles.inactiveDot]} />
          )}
        </View>
      </View>

      <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
      {habit.description ? (
        <Text style={styles.habitDesc} numberOfLines={2}>{habit.description}</Text>
      ) : (
        <Text style={styles.habitDesc} numberOfLines={1}>
          {habit.habitMode === 'focus' ? '🎯 Focus mode' : '🔔 Notify mode'}
        </Text>
      )}

      <View style={styles.bottomRow}>
        {streak.currentStreak > 0 && (
          <View style={styles.streakPill}>
            <Text style={{ fontSize: 10 }}>🔥</Text>
            <Text style={styles.streakText}>{streak.currentStreak}</Text>
          </View>
        )}
        {isTimerRunning && (
          <View style={[styles.timerBadge]}>
            <Text style={styles.timerText}>⏱ Active</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default HabitCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 0,
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
    marginBottom: 3,
  },
  habitDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 10,
    lineHeight: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
  },
  timerBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B5E20',
  },
});
