import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import DurationScrollWheel from './DurationScrollWheel';
import FocusOverlay from './FocusOverlay';
import { screenLock } from '../api/screenlock';

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
  const { habits, startTimer, stopTimer, timerState } = useHabits();
  const habit = habits.find(h => h.id === habitId);

  const [selectedDuration, setSelectedDuration] = useState(
    habit?.sessionPresets?.[0] || 25,
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);

  // Break tracking: each 30-min slot gets 1 break
  // breakSlots[i] = true means break for that slot was taken or expired
  const [breakSlots, setBreakSlots] = useState<boolean[]>([]);
  const totalDurationRef = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getBreakCount = useCallback((durationMin: number): number => {
    return Math.floor(durationMin / 30);
  }, []);

  // If we arrive on this screen while a timer is already running (e.g. from Today tab banner),
  // hydrate the local running state from the global timerState.
  useEffect(() => {
    if (!habit) return;
    if (!timerState || !timerState.isRunning || timerState.habitId !== habitId) return;

    const durationMin = Math.round(timerState.totalSeconds / 60);
    const remainingSec = timerState.remainingSeconds;
    const breakCount = getBreakCount(durationMin);

    totalDurationRef.current = durationMin;
    setSelectedDuration(durationMin);
    setTimeLeft(remainingSec);
    setIsRunning(true);
    setShowFocusOverlay(true);

    const elapsedMinutes = Math.floor(
      (timerState.totalSeconds - timerState.remainingSeconds) / 60,
    );
    const initialSlots: boolean[] = Array(breakCount).fill(false);
    for (let i = 0; i < breakCount; i++) {
      const segmentEndMin = (i + 1) * 30;
      if (elapsedMinutes >= segmentEndMin) {
        initialSlots[i] = true; // slots in fully elapsed segments are expired
      }
    }
    setBreakSlots(initialSlots);
  }, [timerState, habit, habitId, getBreakCount]);

  const beginFocusSession = useCallback(() => {
    const breakCount = getBreakCount(selectedDuration);
    totalDurationRef.current = selectedDuration;
    setBreakSlots(Array(breakCount).fill(false));
    setTimeLeft(selectedDuration * 60);
    setIsRunning(true);
    setShowFocusOverlay(true);
    startTimer(habitId, selectedDuration);
  }, [selectedDuration, getBreakCount, habitId, startTimer]);

  const handleStart = async () => {
    const breakCount = getBreakCount(selectedDuration);

    Alert.alert(
      'Start Focus Session',
      `${habit?.emoji} ${habit?.name} \u{2022} ${selectedDuration} min\n\n` +
        'Once you start:\n' +
        '\u{2022} Your phone will be locked\n' +
        '\u{2022} Only the timer will be visible\n' +
        '\u{2022} No buttons will work except Stop\n\n' +
        `You'll get ${breakCount} break(s) of 5 min each.\n` +
        'Stopping early will decrease your streak by 1.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start Focus',
          onPress: () => beginFocusSession(),
        },
      ],
    );
  };

  // Block back button while timer is running
  useEffect(() => {
    if (!isRunning) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [isRunning]);

  // Main timer countdown
  useEffect(() => {
    if (isRunning && !isOnBreak && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
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

  // Break timer countdown
  useEffect(() => {
    if (isOnBreak && breakTimeLeft > 0) {
      breakIntervalRef.current = setInterval(() => {
        setBreakTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(breakIntervalRef.current!);
            setIsOnBreak(false);
            screenLock.startLock();
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

  // Calculate elapsed minutes in the current focus session
  const elapsedSeconds = totalDurationRef.current * 60 - timeLeft;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // Find which break buttons to show.
  // Each 30-min segment [i*30, (i+1)*30) grants one 5-min break.
  // If a break in that segment is not taken before the segment ends, it expires.
  const availableBreaks: number[] = [];
  if (isRunning && !isOnBreak) {
    for (let i = 0; i < breakSlots.length; i++) {
      const segmentStartMin = i * 30;
      const segmentEndMin = (i + 1) * 30;
      if (
        elapsedMinutes >= segmentStartMin &&
        elapsedMinutes < segmentEndMin &&
        !breakSlots[i]
      ) {
        availableBreaks.push(i);
      }
    }
  }

  // Auto-expire breaks that have passed their 30-min segment window
  useEffect(() => {
    if (!isRunning || isOnBreak) return;
    setBreakSlots(prev => {
      const updated = [...prev];
      let changed = false;
      for (let i = 0; i < updated.length; i++) {
        const segmentEndMin = (i + 1) * 30;
        if (elapsedMinutes >= segmentEndMin && !updated[i]) {
          updated[i] = true; // expired
          changed = true;
        }
      }
      return changed ? updated : prev;
    });
  }, [elapsedMinutes, isRunning, isOnBreak]);

  const handleTakeBreak = (slotIndex: number) => {
    setBreakSlots(prev => {
      const updated = [...prev];
      updated[slotIndex] = true;
      return updated;
    });
    setIsOnBreak(true);
    setBreakTimeLeft(5 * 60);
    screenLock.stopLock();
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
    const totalBreakCount = breakSlots.length;
    const usedBreakCount = breakSlots.filter(Boolean).length;
    const remainingBreaks = Math.max(totalBreakCount - usedBreakCount, 0);

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Focus overlay */}
        <FocusOverlay
          isActive={showFocusOverlay && !isOnBreak}
          habitName={habit.name}
          habitEmoji={habit.emoji}
          timeRemaining={formatTime(timeLeft)}
          onRequestStop={handleStopEarly}
          showBreakSection={breakSlots.length > 0}
          breakButtonEnabled={availableBreaks.length > 0}
          remainingBreaks={remainingBreaks}
          onTakeBreak={() => {
            if (availableBreaks.length > 0) {
              handleTakeBreak(availableBreaks[0]);
            }
          }}
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
              Timer will resume automatically when break ends.
            </Text>
          </View>
        )}

      </View>
    );
  }

  // Setup state
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

      <View style={styles.habitInfo}>
        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
        <Text style={[styles.habitName, { color: theme.colors.text }]}>
          {habit.name}
        </Text>
      </View>

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
                    selectedDuration === preset ? '#FFF' : theme.colors.text,
                },
              ]}>
              {preset} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DurationScrollWheel value={selectedDuration} onChange={setSelectedDuration} />

      <View style={styles.startSection}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleStart}>
          <Text style={styles.startButtonText}>
            Start Focus {'\u{2022}'} {selectedDuration} min
          </Text>
        </TouchableOpacity>
        <Text style={[styles.breakNote, { color: theme.colors.textMuted }]}>
          {getBreakCount(selectedDuration)} break(s) available {'\u{2022}'} 5 min each
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
  breakTimer: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'] as any,
    marginBottom: 16,
  },
  breakSubtext: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  breakInfo: { fontSize: 13, textAlign: 'center' },
});

export default TimerScreen;
