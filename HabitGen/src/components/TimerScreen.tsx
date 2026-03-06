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
const TIMER_SIZE = width * 0.65;

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
  const [breakAvailable, setBreakAvailable] = useState(false);
  const [breakExpired, setBreakExpired] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastBreakOfferedAt = useRef(0);

  const isRunning = timerState?.habitId === habitId && timerState.isRunning;
  const isBreak = timerState?.breakMode || false;

  // Tick timer every second
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tickTimer]);

  // Show focus overlay when timer starts (not during break)
  useEffect(() => {
    if (isRunning && !isBreak) {
      setShowFocusOverlay(true);
    } else if (isBreak) {
      setShowFocusOverlay(false);
    }
  }, [isRunning, isBreak]);

  // Check for 30-minute break availability and auto-expiry
  useEffect(() => {
    if (!timerState || !isRunning || isBreak) return;

    const elapsed = timerState.totalSeconds - timerState.remainingSeconds;
    const elapsedMins = elapsed / 60;
    const breakInterval = 30;
    const currentBreakWindow = Math.floor(elapsedMins / breakInterval);

    // New 30-min window reached and not the initial one
    if (currentBreakWindow > 0 && currentBreakWindow > lastBreakOfferedAt.current) {
      // Offer break
      lastBreakOfferedAt.current = currentBreakWindow;
      setBreakAvailable(true);
      setBreakExpired(false);

      // Auto-expire break after the window passes (next 30-min block)
      // Break is available until the next 30 seconds
      const timeoutId = setTimeout(() => {
        setBreakAvailable(false);
        setBreakExpired(true);
      }, 30000); // 30 seconds to accept break

      return () => clearTimeout(timeoutId);
    }
  }, [timerState, isRunning, isBreak]);

  // Auto-popup break offer
  useEffect(() => {
    if (breakAvailable && isRunning && !isBreak) {
      Alert.alert(
        'Break Time!',
        'You\'ve been focused for 30 minutes. Take a 5-minute break?\n\nThis offer expires soon.',
        [
          {
            text: 'Skip Break',
            style: 'cancel',
            onPress: () => {
              setBreakAvailable(false);
              setBreakExpired(true);
            },
          },
          {
            text: 'Take 5 min Break',
            onPress: () => {
              setBreakAvailable(false);
              setBreakExpired(false);
              setShowFocusOverlay(false);
              startBreak();
            },
          },
        ],
      );
    }
  }, [breakAvailable, isRunning, isBreak, startBreak]);

  // Timer completion check
  useEffect(() => {
    if (
      timerState?.habitId === habitId &&
      !timerState.isRunning &&
      timerState.remainingSeconds === 0
    ) {
      setShowFocusOverlay(false);
      screenLock.stopLock();
      if (timerState.breakMode) {
        Alert.alert('Break Over!', 'Your 5-minute break is done. Focus mode will resume.', [
          { text: 'OK' },
        ]);
      } else {
        stopTimer(true);
        Alert.alert(
          'Session Complete!',
          `Great job! You completed your ${habit?.emoji} ${habit?.name} session.\n\nYour streak has been increased by 1!`,
          [{ text: 'Done', onPress: onClose }],
        );
      }
    }
  }, [timerState, habitId, habit, stopTimer, onClose]);

  // Pulse animation
  useEffect(() => {
    if (isRunning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
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
      `${habit?.emoji} ${habit?.name} \u{2022} ${selectedDuration} min\n\n` +
        'Once you start, your screen will be locked:\n\n' +
        '\u{2705} Phone and SMS are allowed\n' +
        '\u{2705} One additional app of your choice\n' +
        '\u{274C} Social media apps are blocked\n\n' +
        'You can stop and unlock anytime, but stopping early will decrease your streak by 1.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Focus',
          onPress: () => {
            screenLock.requestPermission().then(() => {
              lastBreakOfferedAt.current = 0;
              startTimer(habitId, selectedDuration);
            });
          },
        },
      ],
    );
  };

  const handleStopEarly = () => {
    Alert.alert(
      'Stop & Unlock?',
      'You will lose 1 streak day.\n\nThe screen will be unlocked and your session will be marked as incomplete.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Stop & Lose Streak',
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

  const progress = timerState
    ? 1 - timerState.remainingSeconds / timerState.totalSeconds
    : 0;

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Habit not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <View style={[styles.focusBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.focusText, { color: theme.colors.primary }]}>
              {isBreak ? '\u{2615} Break' : '\u{1F512} Focus Mode'}
            </Text>
          </View>
        )}
      </View>

      {/* Habit info */}
      <View style={styles.habitInfo}>
        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
        <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
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
            style={[styles.timerText, { color: isBreak ? theme.colors.accent : theme.colors.primary }]}>
            {formatTime(timerState?.remainingSeconds || 0)}
          </Text>
          <Text style={[styles.timerLabel, { color: theme.colors.textMuted }]}>
            {isBreak ? 'break remaining' : 'remaining'}
          </Text>
          <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[styles.progressBarFill, {
                backgroundColor: isBreak ? theme.colors.accent : theme.colors.primary,
                width: `${progress * 100}%`,
              }]}
            />
          </View>
        </Animated.View>
      ) : (
        <View style={styles.durationPicker}>
          <Text style={[styles.selectLabel, { color: theme.colors.textSecondary }]}>
            Select Duration
          </Text>
          <View style={styles.presetsRow}>
            {(habit.sessionPresets.length > 0 ? habit.sessionPresets : DEFAULT_SESSION_PRESETS).map(mins => (
              <TouchableOpacity
                key={mins}
                style={[styles.presetChip, {
                  backgroundColor: selectedDuration === mins && !showCustomWheel ? theme.colors.primary : theme.colors.surface,
                  borderColor: selectedDuration === mins && !showCustomWheel ? theme.colors.primary : theme.colors.border,
                }]}
                onPress={() => { setSelectedDuration(mins); setShowCustomWheel(false); }}>
                <Text style={[styles.presetText, {
                  color: selectedDuration === mins && !showCustomWheel ? '#FFF' : theme.colors.text,
                }]}>
                  {mins} min
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.presetChip, {
                backgroundColor: showCustomWheel ? theme.colors.primary : theme.colors.surface,
                borderColor: showCustomWheel ? theme.colors.primary : theme.colors.border,
              }]}
              onPress={() => setShowCustomWheel(!showCustomWheel)}>
              <Text style={[styles.presetText, { color: showCustomWheel ? '#FFF' : theme.colors.text }]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {showCustomWheel && (
            <DurationScrollWheel value={selectedDuration} onChange={setSelectedDuration} />
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {isRunning ? (
          <View style={styles.runningActions}>
            {isBreak ? (
              <Text style={[styles.breakNote, { color: theme.colors.accent }]}>
                {'\u{2615}'} Enjoy your break!
              </Text>
            ) : null}
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '60' }]}
              onPress={handleStopEarly}>
              <Text style={[styles.stopButtonText, { color: theme.colors.error }]}>
                Stop & Unlock Screen
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleStart}>
            <Text style={styles.startButtonText}>
              Start Focus {'\u{2022}'} {selectedDuration} min
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '500' },
  focusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  focusText: { fontSize: 13, fontWeight: '700' },
  habitInfo: { alignItems: 'center', marginBottom: 24 },
  habitEmoji: { fontSize: 52, marginBottom: 6 },
  habitName: { fontSize: 22, fontWeight: '700' },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  timerText: { fontSize: 44, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLabel: { fontSize: 13, marginTop: 4 },
  progressBarBg: { width: '55%', height: 5, borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  durationPicker: { paddingHorizontal: 24, flex: 1 },
  selectLabel: { fontSize: 15, fontWeight: '600', marginBottom: 14, textAlign: 'center' },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 18 },
  presetChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  presetText: { fontSize: 15, fontWeight: '700' },
  actionsContainer: { paddingHorizontal: 24, paddingBottom: 36 },
  startButton: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  startButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  runningActions: { gap: 10 },
  breakNote: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  stopButton: { paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
  stopButtonText: { fontSize: 15, fontWeight: '700' },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },
});

export default TimerScreen;
