import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import DurationScrollWheel from './DurationScrollWheel';
import FocusOverlay from './FocusOverlay';
import { screenLock } from '../api/screenlock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TimerScreenProps {
  habitId: string;
  onClose: () => void;
}

const formatTime = (totalSec: number): string => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const TimerScreen: React.FC<TimerScreenProps> = ({ habitId, onClose }) => {
  const { theme } = useTheme();
  const { habits, startTimer, stopTimer } = useHabits();
  const habit = habits.find(h => h.id === habitId);

  const [selectedDuration, setSelectedDuration] = useState(
    habit?.sessionPresets?.[0] || 25,
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);

  // Break button tracking
  const [totalBreaks, setTotalBreaks] = useState(0);
  const [usedBreaks, setUsedBreaks] = useState(0);
  const [currentSlotBreaks, setCurrentSlotBreaks] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate total break slots for the duration
  const getBreaksForDuration = useCallback((durationMin: number): number => {
    return Math.floor(durationMin / 30);
  }, []);

  // Start timer
  const handleStart = () => {
    const totalBreaksAvail = getBreaksForDuration(selectedDuration);
    Alert.alert(
      'Start Focus Session',
      `${habit?.emoji} ${habit?.name} \u{2022} ${selectedDuration} min\n\n` +
        'Once you start, your screen will be locked:\n\n' +
        '\u{2705} Phone and SMS are allowed\n' +
        '\u{2705} One additional app of your choice\n' +
        '\u{274C} Social media apps are blocked\n\n' +
        `You'll get ${totalBreaksAvail} break(s) of 5 min each.\n\n` +
        'Stopping early will decrease your streak by 1.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Focus',
          onPress: () => {
            screenLock.requestPermission().then(() => {
              setTotalBreaks(totalBreaksAvail);
              setUsedBreaks(0);
              setCurrentSlotBreaks(0);
              setTimeLeft(selectedDuration * 60);
              setIsRunning(true);
              setShowFocusOverlay(true);
              startTimer(habitId, selectedDuration);
            });
          },
        },
      ],
    );
  };

  // Timer countdown
  useEffect(() => {
    if (isRunning && !isOnBreak && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete - unlock and add streak
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setShowFocusOverlay(false);
            screenLock.stopLock();
            stopTimer(true);
            Alert.alert(
              'Session Complete!',
              `${habit?.emoji} Great job! Your streak has been increased by 1.`,
              [{ text: 'Done', onPress: onClose }],
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isOnBreak, timeLeft, habit, habitId, onClose, stopTimer]);

  // Calculate elapsed minutes for break availability
  const elapsedMinutes = selectedDuration - Math.ceil(timeLeft / 60);
  const currentSlot = Math.floor(elapsedMinutes / 30);
  const breakAvailableForSlot = currentSlot > usedBreaks && usedBreaks < totalBreaks;

  // Break countdown
  useEffect(() => {
    if (isOnBreak && breakTimeLeft > 0) {
      breakIntervalRef.current = setInterval(() => {
        setBreakTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(breakIntervalRef.current!);
            setIsOnBreak(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [isOnBreak, breakTimeLeft]);

  const handleTakeBreak = () => {
    setIsOnBreak(true);
    setBreakTimeLeft(5 * 60); // 5 minute break
    setUsedBreaks(prev => prev + 1);
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
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
            setIsRunning(false);
            setIsOnBreak(false);
            setShowFocusOverlay(false);
            screenLock.stopLock();
            stopTimer(false);
            onClose();
          },
        },
      ],
    );
  };

  if (!habit) return null;

  // Running state
  if (isRunning) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Focus overlay in foreground */}
        <FocusOverlay
          isActive={showFocusOverlay && !isOnBreak}
          habitName={habit.name}
          habitEmoji={habit.emoji}
          timeRemaining={formatTime(timeLeft)}
          onRequestStop={handleStopEarly}
        />

        {/* Break overlay */}
        {isOnBreak && (
          <View style={[styles.breakOverlay, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.breakEmoji}>{'\u{2615}'}</Text>
            <Text style={[styles.breakTitle, { color: theme.colors.text }]}>
              Break Time
            </Text>
            <Text style={[styles.breakTimer, { color: theme.colors.success }]}>
              {formatTime(breakTimeLeft)}
            </Text>
            <Text style={[styles.breakSubtext, { color: theme.colors.textSecondary }]}>
              Timer is paused. Relax and recharge!
            </Text>
            <Text style={[styles.breakInfo, { color: theme.colors.textMuted }]}>
              Timer will automatically resume when break ends.
            </Text>
          </View>
        )}

        {/* Break button floating above focus overlay */}
        {!isOnBreak && breakAvailableForSlot && (
          <View style={styles.breakButtonContainer}>
            <TouchableOpacity
              style={[styles.breakButton, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}
              onPress={handleTakeBreak}>
              <Text style={[styles.breakButtonText, { color: theme.colors.success }]}>
                {'\u{2615}'} Take 5 min Break ({usedBreaks}/{totalBreaks} used)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Setup state
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Focus Session
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Habit info */}
      <View style={styles.habitInfo}>
        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
        <Text style={[styles.habitName, { color: theme.colors.text }]}>
          {habit.name}
        </Text>
      </View>

      {/* Preset durations */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
        Quick Select
      </Text>
      <View style={styles.presetRow}>
        {(habit.sessionPresets || [25, 50, 90]).map(preset => (
          <TouchableOpacity
            key={preset}
            onPress={() => setSelectedDuration(preset)}
            style={[
              styles.presetButton,
              {
                backgroundColor:
                  selectedDuration === preset
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor:
                  selectedDuration === preset
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}>
            <Text
              style={[
                styles.presetText,
                {
                  color:
                    selectedDuration === preset
                      ? '#FFF'
                      : theme.colors.text,
                },
              ]}>
              {preset} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom duration scroll */}
      <DurationScrollWheel
        value={selectedDuration}
        onChange={setSelectedDuration}
      />

      {/* Start button */}
      <View style={styles.startSection}>
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleStart}>
          <Text style={styles.startButtonText}>
            Start Focus {'\u{2022}'} {selectedDuration} min
          </Text>
        </TouchableOpacity>
        <Text style={[styles.breakNote, { color: theme.colors.textMuted }]}>
          {getBreaksForDuration(selectedDuration)} break(s) available {'\u{2022}'} 5 min each
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
  },
  closeText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  habitInfo: { alignItems: 'center', marginVertical: 20 },
  habitEmoji: { fontSize: 52, marginBottom: 8 },
  habitName: { fontSize: 22, fontWeight: '700' },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 24,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  presetText: { fontSize: 15, fontWeight: '700' },
  startSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  breakNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  breakOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  breakEmoji: { fontSize: 64, marginBottom: 16 },
  breakTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  breakTimer: { fontSize: 56, fontWeight: '200', fontVariant: ['tabular-nums'] as any, marginBottom: 16 },
  breakSubtext: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  breakInfo: { fontSize: 13, textAlign: 'center' },
  breakButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 90,
    left: 24,
    right: 24,
    zIndex: 10001,
  },
  breakButton: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  breakButtonText: { fontSize: 15, fontWeight: '700' },
});

export default TimerScreen;
