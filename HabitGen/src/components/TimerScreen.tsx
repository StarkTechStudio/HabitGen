import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { formatTime } from '../utils/helpers';
import { DEFAULT_SESSION_PRESETS } from '../types';
import { screenLock } from '../api/screenlock';
import DurationScrollWheel from './DurationScrollWheel';
import FocusOverlay from './FocusOverlay';

const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;

interface TimerScreenProps {
  habitId: string;
  onClose: () => void;
}

const TimerScreen: React.FC<TimerScreenProps> = ({ habitId, onClose }) => {
  const { theme } = useTheme();
  const { habits, timerState, startTimer, stopTimer, tickTimer, startBreak } = useHabits();
  const habit = habits.find(h => h.id === habitId);
  const [selectedDuration, setSelectedDuration] = useState(
    habit?.sessionPresets[0] || 30,
  );
  const [showCustomWheel, setShowCustomWheel] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isRunning = timerState?.habitId === habitId && timerState.isRunning;
  const isBreak = timerState?.breakMode || false;

  // Tick timer every second
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tickTimer]);

  // Show focus overlay when timer starts
  useEffect(() => {
    if (isRunning && !isBreak) {
      setShowFocusOverlay(true);
    } else {
      setShowFocusOverlay(false);
    }
  }, [isRunning, isBreak]);

  // Timer completion check
  useEffect(() => {
    if (
      timerState?.habitId === habitId &&
      !timerState.isRunning &&
      timerState.remainingSeconds === 0
    ) {
      setShowFocusOverlay(false);
      if (timerState.breakMode) {
        Alert.alert('Break Over!', 'Your 5-minute break is done.', [
          { text: 'OK' },
        ]);
      } else {
        stopTimer(true);
        Alert.alert(
          'Session Complete!',
          `Great job! You completed your ${habit?.emoji} ${habit?.name} session.`,
          [{ text: 'Done', onPress: onClose }],
        );
      }
    }
  }, [timerState, habitId, habit, stopTimer, onClose]);

  // Pulse animation when running
  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [isRunning, pulseAnim]);

  const handleStart = () => {
    Alert.alert(
      'Start Focus Session',
      `Starting ${selectedDuration} minute ${habit?.name} session.\n\n` +
        'Focus Mode will activate:\n' +
        '- Screen will be locked to this app\n' +
        '- Stopping early will penalize your streak\n\n' +
        'Stay focused!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            screenLock.requestPermission().then(() => {
              startTimer(habitId, selectedDuration);
            });
          },
        },
      ],
    );
  };

  const handleStopEarly = () => {
    Alert.alert(
      'Stop Session Early?',
      'Stopping your session early will:\n\n' +
        '- Reduce your streak by 1 day\n' +
        '- Mark this session as incomplete\n\n' +
        'Are you sure you want to quit?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Stop & Penalize',
          style: 'destructive',
          onPress: () => {
            setShowFocusOverlay(false);
            screenLock.stopLock();
            stopTimer(false);
            onClose();
          },
        },
      ],
    );
  };

  const handleBreak = () => {
    const elapsed = (timerState?.totalSeconds || 0) - (timerState?.remainingSeconds || 0);
    const elapsedMins = elapsed / 60;
    if (elapsedMins >= 30) {
      setShowFocusOverlay(false);
      startBreak();
    } else {
      Alert.alert(
        'Not Yet',
        `You can take a 5-minute break after 30 minutes.\n${Math.ceil(30 - elapsedMins)} minutes remaining.`,
      );
    }
  };

  const progress = timerState
    ? 1 - timerState.remainingSeconds / timerState.totalSeconds
    : 0;

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Habit not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Focus overlay (screen lock) */}
      <FocusOverlay
        isActive={showFocusOverlay}
        habitName={habit.name}
        habitEmoji={habit.emoji}
        timeRemaining={formatTime(timerState?.remainingSeconds || 0)}
        onRequestStop={handleStopEarly}
      />

      {/* Header */}
      <View style={styles.header}>
        {!isRunning && (
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
              {'\u{2190}'} Back
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {isRunning && (
          <View style={styles.focusBadge}>
            <Text style={[styles.focusText, { color: theme.colors.primary }]}>
              {isBreak ? '\u{2615} Break' : '\u{1F512} Focus Mode'}
            </Text>
          </View>
        )}
      </View>

      {/* Habit info */}
      <View style={styles.habitInfo}>
        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
        <Text style={[styles.habitName, { color: theme.colors.text }]}>
          {habit.name}
        </Text>
      </View>

      {/* Timer display */}
      {isRunning || (timerState?.remainingSeconds === 0 && timerState?.habitId === habitId) ? (
        <Animated.View
          style={[
            styles.timerCircle,
            {
              borderColor: isBreak ? theme.colors.accent : theme.colors.primary,
              transform: [{ scale: pulseAnim }],
            },
          ]}>
          <Text
            style={[
              styles.timerText,
              { color: isBreak ? theme.colors.accent : theme.colors.primary },
            ]}>
            {formatTime(timerState?.remainingSeconds || 0)}
          </Text>
          <Text style={[styles.timerLabel, { color: theme.colors.textMuted }]}>
            {isBreak ? 'break remaining' : 'remaining'}
          </Text>
          <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: isBreak ? theme.colors.accent : theme.colors.primary,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.durationPicker}>
          <Text style={[styles.selectLabel, { color: theme.colors.textSecondary }]}>
            Select Duration
          </Text>
          <View style={styles.presetsRow}>
            {(habit.sessionPresets.length > 0
              ? habit.sessionPresets
              : DEFAULT_SESSION_PRESETS
            ).map(mins => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor:
                      selectedDuration === mins && !showCustomWheel
                        ? theme.colors.primary
                        : theme.colors.surface,
                    borderColor:
                      selectedDuration === mins && !showCustomWheel
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedDuration(mins);
                  setShowCustomWheel(false);
                }}>
                <Text
                  style={[
                    styles.presetText,
                    {
                      color:
                        selectedDuration === mins && !showCustomWheel
                          ? '#FFF'
                          : theme.colors.text,
                    },
                  ]}>
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.presetChip,
                {
                  backgroundColor: showCustomWheel
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: showCustomWheel
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => setShowCustomWheel(!showCustomWheel)}>
              <Text
                style={[
                  styles.presetText,
                  { color: showCustomWheel ? '#FFF' : theme.colors.text },
                ]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {showCustomWheel && (
            <DurationScrollWheel
              value={selectedDuration}
              onChange={setSelectedDuration}
            />
          )}
        </View>
      )}

      {/* Actions - NO pause/stop buttons during timer (only on focus overlay) */}
      <View style={styles.actionsContainer}>
        {isRunning ? (
          <View style={styles.runningActions}>
            {isBreak ? (
              <Text style={[styles.breakNote, { color: theme.colors.accent }]}>
                {'\u{2615}'} Enjoy your break! Timer will resume after.
              </Text>
            ) : (
              <TouchableOpacity
                style={[styles.breakButton, { borderColor: theme.colors.accent }]}
                onPress={handleBreak}>
                <Text style={[styles.breakButtonText, { color: theme.colors.accent }]}>
                  {'\u{2615}'} Take Break (5 min)
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: theme.colors.error }]}
              onPress={handleStopEarly}>
              <Text style={styles.stopButtonText}>
                Stop & Penalize Streak
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleStart}>
            <Text style={styles.startButtonText}>
              Start {selectedDuration}m Focus Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backText: { fontSize: 16, fontWeight: '500' },
  focusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  focusText: { fontSize: 14, fontWeight: '700' },
  habitInfo: { alignItems: 'center', marginBottom: 30 },
  habitEmoji: { fontSize: 56, marginBottom: 8 },
  habitName: { fontSize: 24, fontWeight: '700' },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  timerText: { fontSize: 48, fontWeight: '800' },
  timerLabel: { fontSize: 14, marginTop: 4 },
  progressBarBg: {
    width: '60%',
    height: 6,
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  durationPicker: { paddingHorizontal: 24, flex: 1 },
  selectLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  presetText: { fontSize: 16, fontWeight: '700' },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  runningActions: { gap: 12 },
  breakNote: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  breakButton: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  breakButtonText: { fontSize: 16, fontWeight: '700' },
  stopButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  stopButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },
});

export default TimerScreen;
