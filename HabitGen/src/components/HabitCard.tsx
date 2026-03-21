import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { Habit, Streak } from '../types';
import { useNavigation } from '@react-navigation/native';

interface HabitCardProps {
  habit: Habit;
  streak: Streak;
  isTimerRunning: boolean;
  todayCompleted: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  fitness: '#10B981',
  reading: '#0D7377',
  meditation: '#8B5CF6',
  coding: '#3B82F6',
  writing: '#F59E0B',
  music: '#EC4899',
  cooking: '#F97316',
  language: '#06B6D4',
  art: '#A855F7',
  sleep: '#6366F1',
  hydration: '#0EA5E9',
  focus: '#0D7377',
  trading: '#10B981',
  dancing: '#EC4899',
  content: '#F43F5E',
  boxing: '#EF4444',
  horseriding: '#78716C',
  bikeriding: '#22C55E',
};

const getCategoryFromHabit = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('run') || lower.includes('exercise') || lower.includes('workout') || lower.includes('gym')) return 'MORNING';
  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) return 'WELLNESS';
  if (lower.includes('read') || lower.includes('book') || lower.includes('study') || lower.includes('learn')) return 'KNOWLEDGE';
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('breath') || lower.includes('yoga')) return 'MINDFULNESS';
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('rest')) return 'EVENING';
  if (lower.includes('code') || lower.includes('program') || lower.includes('develop')) return 'PRODUCTIVITY';
  return 'DAILY';
};

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak,
  isTimerRunning,
  todayCompleted,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const category = getCategoryFromHabit(habit.name);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
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
      <View style={styles.cardTop}>
        <View style={styles.leftContent}>
          <Text style={[styles.categoryLabel, { color: theme.colors.accent }]}>
            {category}
          </Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{habit.name}</Text>
          {habit.habitMode === 'focus' && (
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>
              {habit.sessionPresets[0] || habit.customDuration} min focus session
            </Text>
          )}
          {streak.currentStreak > 0 && (
            <View style={styles.streakRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={theme.colors.primary} />
              </Svg>
              <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                {streak.currentStreak} DAY STREAK
              </Text>
            </View>
          )}
          {isTimerRunning && (
            <Text style={[styles.runningText, { color: theme.colors.accent }]}>
              Timer running...
            </Text>
          )}
        </View>
        {/* Right side: completion indicator or play button */}
        {todayCompleted ? (
          <View style={[styles.checkCircle, { backgroundColor: theme.colors.primary }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        ) : !isTimerRunning ? (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.colors.primaryLight }]}
            onPress={() => navigation.navigate('Timer', { habitId: habit.id })}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M5 3l14 9-14 9V3z" fill={theme.colors.primary} />
            </Svg>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 6,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  runningText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HabitCard;
