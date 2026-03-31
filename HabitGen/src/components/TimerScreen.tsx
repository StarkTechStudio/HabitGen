import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import DurationScrollWheel from './DurationScrollWheel';
import FocusOverlay from './FocusOverlay';
import { screenLock } from '../api/screenlock';

const { width } = Dimensions.get('window');

const TIPS = [
  '🎵 Calm music can help you focus',
  '🌬️ Mindful breathing helps you relax',
  '💧 Water is important for productivity',
  '📴 Put your phone face-down',
  '🌿 Take a deep breath and begin',
  '⏱️ Focus on one task at a time',
];

interface TimerScreenProps {
  habitId: string;
  onClose: () => void;
}

const formatTime = (totalSec: number): { min: string; sec: string } => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return { min: String(m).padStart(2, '0'), sec: String(s).padStart(2, '0') };
};

const TimerScreen: React.FC<TimerScreenProps> = ({ habitId, onClose }) => {
  const { theme } = useTheme();
  const { habits, startTimer, stopTimer, timerState } = useHabits();
  const insets = useSafeAreaInsets();
  const habit = habits.find(h => h.id === habitId);

  const [selectedDuration, setSelectedDuration] = useState(
    habit?.sessionPresets?.[0] || 25,
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);

  const [breakSlots, setBreakSlots] = useState<boolean[]>([]);
  const totalDurationRef = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getBreakCount = useCallback((durationMin: number): number => {
    return Math.floor(durationMin / 30);
  }, []);

  useEffect(() => {
    if (isRunning) {
      const slots = getBreakCount(selectedDuration);
      setBreakSlots(new Array(slots).fill(false));
      totalDurationRef.current = selectedDuration * 60;
    }
  }, [isRunning, selectedDuration, getBreakCount]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isRunning) {
          Alert.alert('Session Active', 'Stop the timer before leaving?', [
            { text: 'Continue', style: 'cancel' },
            { text: 'Stop & Leave', style: 'destructive', onPress: handleStop },
          ]);
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && !isOnBreak) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleComplete();
            return 0;
          }
          const elapsed = totalDurationRef.current - (prev - 1);
          const elapsedMin = elapsed / 60;
          setBreakSlots(slots => {
            const slotIndex = Math.floor(elapsedMin / 30) - 1;
            if (slotIndex >= 0 && slotIndex < slots.length && !slots[slotIndex]) {
              const newSlots = [...slots];
              // Break available signal is handled via render
            }
            return slots;
          });
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isOnBreak]);

  const handleStart = async () => {
    const result = await startTimer(habitId, selectedDuration);
    if (!result.ok) {
      Alert.alert('Cannot Start', result.error || 'Failed to start timer');
      return;
    }
    setTimeLeft(selectedDuration * 60);
    setIsRunning(true);
    setShowFocusOverlay(true);
    try {
      await screenLock.lockScreen();
    } catch {}
  };

  const handleStop = async () => {
    Alert.alert(
      'Stop Session?',
      'You will lose your streak progress for this session.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            clearInterval(intervalRef.current!);
            clearInterval(breakIntervalRef.current!);
            setIsRunning(false);
            setIsOnBreak(false);
            setShowFocusOverlay(false);
            try { await screenLock.unlockScreen(); } catch {}
            await stopTimer(habitId, false);
            onClose();
          },
        },
      ],
    );
  };

  const handleComplete = async () => {
    clearInterval(intervalRef.current!);
    setIsRunning(false);
    setShowFocusOverlay(false);
    try { await screenLock.unlockScreen(); } catch {}
    await stopTimer(habitId, true);
    Alert.alert('Session Complete! 🎉', "Great work! Your streak has been updated.", [
      { text: 'Done', onPress: onClose },
    ]);
  };

  const handleBreak = (slotIdx: number) => {
    if (breakSlots[slotIdx]) return;
    setBreakSlots(prev => {
      const n = [...prev]; n[slotIdx] = true; return n;
    });
    setIsOnBreak(true);
    setBreakTimeLeft(300);
    clearInterval(intervalRef.current!);
    breakIntervalRef.current = setInterval(() => {
      setBreakTimeLeft(t => {
        if (t <= 1) {
          clearInterval(breakIntervalRef.current!);
          setIsOnBreak(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const { min, sec } = formatTime(isOnBreak ? breakTimeLeft : timeLeft);

  // Determine which break slots are available
  const elapsed = isRunning || isOnBreak ? (totalDurationRef.current - timeLeft) / 60 : 0;
  const availableBreaks = breakSlots.map((taken, i) => {
    const slotMin = (i + 1) * 30;
    return !taken && elapsed >= slotMin;
  });

  const accentColor = '#8CDE8C'; // Green for active session like the reference

  if (!habit) return null;

  if (!isRunning && !isOnBreak) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeBtnText, { color: theme.colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.setupScroll, { paddingBottom: insets.bottom + 40 }]}>
          <Text style={[styles.habitTitle, { color: theme.colors.text }]}>{habit.emoji} {habit.name}</Text>
          <Text style={[styles.setupSub, { color: theme.colors.textSecondary }]}>Choose your session duration</Text>

          <View style={styles.presetRow}>
            {(habit.sessionPresets || [15, 30, 45, 60]).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedDuration(p)}
                style={[
                  styles.presetBtn,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                  selectedDuration === p && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
              >
                <Text style={[styles.presetText, { color: theme.colors.text }, selectedDuration === p && { color: '#fff' }]}>
                  {p} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.customLabel, { color: theme.colors.textSecondary }]}>Custom duration</Text>
          <DurationScrollWheel
            value={selectedDuration}
            onChange={setSelectedDuration}
            theme={theme}
          />

          <View style={[styles.infoBox, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.infoText, { color: theme.colors.primary }]}>
              ⏱️ {selectedDuration} min session · {getBreakCount(selectedDuration)} break{getBreakCount(selectedDuration) !== 1 ? 's' : ''} included
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>▶ Start Focus Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: accentColor, paddingTop: insets.top }]}>
      {/* Close */}
      <TouchableOpacity onPress={handleStop} style={styles.closeBtn}>
        <Text style={[styles.closeBtnText, { color: 'rgba(0,0,0,0.5)' }]}>✕</Text>
      </TouchableOpacity>

      <Text style={[styles.habitTitle, { color: '#1A1A2E' }]}>{habit.emoji} {habit.name}</Text>

      {/* Mascot */}
      <View style={styles.mascotCircle}>
        <Text style={{ fontSize: 80 }}>🧘</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerRow}>
        <Text style={[styles.timerMin, { color: '#1A1A2E' }]}>{min}</Text>
        <Text style={[styles.timerSep, { color: '#1A1A2E' }]}>min</Text>
        <Text style={[styles.timerSec, { color: '#1A1A2E' }]}>{sec}</Text>
        <Text style={[styles.timerSep, { color: '#1A1A2E' }]}>s</Text>
      </View>

      {isOnBreak && (
        <View style={styles.breakBadge}>
          <Text style={styles.breakBadgeText}>☕ Break time! {Math.floor(breakTimeLeft / 60)}:{String(breakTimeLeft % 60).padStart(2, '0')}</Text>
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsBox}>
        {TIPS.slice(0, 3).map((tip, i) => (
          <Text key={i} style={styles.tipText}>{tip}</Text>
        ))}
      </View>

      {/* Break buttons */}
      {availableBreaks.some(a => a) && !isOnBreak && (
        <View style={styles.breakRow}>
          {availableBreaks.map((avail, i) =>
            avail ? (
              <TouchableOpacity
                key={i}
                onPress={() => handleBreak(i)}
                style={styles.breakBtn}
              >
                <Text style={styles.breakBtnText}>☕ Take 5min Break</Text>
              </TouchableOpacity>
            ) : null,
          )}
        </View>
      )}

      {/* Finish button */}
      <TouchableOpacity
        style={styles.finishBtn}
        onPress={handleComplete}
        activeOpacity={0.85}
      >
        <Text style={styles.finishBtnText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TimerScreen;

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  closeBtn: { alignSelf: 'flex-start', padding: 12, marginTop: 8 },
  closeBtnText: { fontSize: 22, fontWeight: '600' },
  habitTitle: {
    fontSize: Math.min(width * 0.06, 22),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  setupScroll: { alignItems: 'center', paddingTop: 8, width: '100%' },
  setupSub: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  presetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
  },
  presetText: { fontSize: 14, fontWeight: '700' },
  customLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12, alignSelf: 'flex-start' },
  infoBox: {
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    marginTop: 8,
  },
  infoText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  startBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#5B4FE8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  mascotCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 20,
  },
  timerMin: { fontSize: Math.min(width * 0.2, 72), fontWeight: '900', lineHeight: Math.min(width * 0.22, 80) },
  timerSep: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  timerSec: { fontSize: Math.min(width * 0.12, 48), fontWeight: '900', lineHeight: Math.min(width * 0.14, 56) },
  breakBadge: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  breakBadgeText: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  tipsBox: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  breakRow: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  breakBtn: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  breakBtnText: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  finishBtn: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  finishBtnText: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
});
