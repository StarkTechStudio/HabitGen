import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';
import ProgressRing from './ProgressRing';

export default function TimerModal({ habitId, visible, onClose }) {
  const { habits, timerState, setTimerState, addSession } = useApp();
  const habit = habits.find(h => h.id === habitId);
  const intervalRef = useRef(null);
  const [, setTick] = useState(0);

  const isActive = timerState && timerState.habitId === habitId;
  const duration = isActive ? timerState.duration : (habit?.timerDuration || 2700);
  const isRunning = isActive && !timerState.pausedAt;
  const isPaused = isActive && timerState.pausedAt && !timerState.onBreak;
  const isOnBreak = isActive && timerState.onBreak;

  const getElapsed = useCallback(() => {
    if (!isActive) return 0;
    const end = timerState.pausedAt || Date.now();
    return (end - timerState.startedAt - timerState.totalPausedMs) / 1000;
  }, [isActive, timerState]);

  const remaining = Math.max(0, (isActive ? timerState.duration : duration) - getElapsed());
  const progress = isActive ? Math.min(getElapsed() / timerState.duration, 1) : 0;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setTick(t => t + 1), 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (isActive && remaining <= 0 && isRunning) finishTimer(true);
  });

  const finishTimer = useCallback((auto) => {
    if (!isActive) return;
    const elapsed = getElapsed();
    const pct = elapsed / timerState.duration;
    addSession({
      id: Date.now().toString() + Math.random().toString(36).slice(2,6),
      habitId, startTime: new Date(timerState.startedAt).toISOString(),
      endTime: new Date().toISOString(), duration: Math.round(elapsed),
      completed: pct >= 0.8, completionPct: Math.round(pct * 100), type: 'timer',
    });
    setTimerState(null);
  }, [isActive, timerState, habitId, getElapsed, addSession, setTimerState]);

  const startTimer = (dur) => {
    setTimerState({ habitId, startedAt: Date.now(), pausedAt: null, totalPausedMs: 0, duration: dur, mode: 'work', onBreak: false });
  };

  const pauseTimer = () => {
    if (!isActive) return;
    setTimerState({ ...timerState, pausedAt: Date.now() });
  };

  const resumeTimer = () => {
    if (!isActive || !timerState.pausedAt) return;
    const pd = Date.now() - timerState.pausedAt;
    setTimerState({ ...timerState, pausedAt: null, totalPausedMs: timerState.totalPausedMs + pd, onBreak: false });
  };

  const stopTimer = () => {
    if (isActive && getElapsed() > 5) finishTimer(false);
    else setTimerState(null);
  };

  const takeBreak = () => {
    if (!isActive || !isRunning) return;
    setTimerState({ ...timerState, pausedAt: Date.now(), onBreak: true });
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  if (!habit) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent testID="timer-modal">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{isOnBreak ? 'BREAK TIME' : habit.name?.toUpperCase()}</Text>
            <TouchableOpacity onPress={onClose} testID="close-timer"><Feather name="x" size={24} color={C.textDim} /></TouchableOpacity>
          </View>

          <View style={styles.ringWrap}>
            <ProgressRing progress={progress} size={200} strokeWidth={10} color={isOnBreak ? C.secondary : C.primary} />
            <View style={styles.ringCenter}>
              <Text style={styles.time}>{fmt(remaining)}</Text>
              <Text style={styles.status}>{isRunning ? 'RUNNING' : isOnBreak ? 'ON BREAK' : isActive ? 'PAUSED' : 'READY'}</Text>
            </View>
          </View>
          {isActive && <Text style={styles.pctText}>{Math.round(progress*100)}% complete (80% needed)</Text>}

          {/* NOT STARTED */}
          {!isActive && (
            <View style={styles.controls}>
              <TouchableOpacity style={styles.fireBtn} onPress={() => startTimer(duration)} testID="start-work-timer">
                <Text style={styles.fireBtnText}>START {Math.round(duration/60)} MIN</Text>
              </TouchableOpacity>
              <View style={styles.presetRow}>
                {[{ l: '15m', v: 900 }, { l: '25m', v: 1500 }, { l: '45m', v: 2700 }].map(p => (
                  <TouchableOpacity key={p.v} style={styles.presetBtn} onPress={() => startTimer(p.v)} testID={`start-${p.v}-timer`}>
                    <Text style={styles.presetText}>{p.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* RUNNING */}
          {isRunning && (
            <View style={styles.controls}>
              <View style={styles.row}>
                <TouchableOpacity style={styles.secBtn} onPress={pauseTimer} testID="pause-timer">
                  <Feather name="pause" size={18} color="#fff" /><Text style={styles.secBtnText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stopBtn} onPress={stopTimer} testID="stop-timer">
                  <Feather name="square" size={16} color={C.destructive} /><Text style={styles.stopBtnText}>Stop</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.breakBtn} onPress={takeBreak} testID="take-break-btn">
                <Feather name="coffee" size={16} color={C.secondary} /><Text style={styles.breakBtnText}>Take a Break</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PAUSED (not break) */}
          {isPaused && (
            <View style={styles.controls}>
              <View style={styles.row}>
                <TouchableOpacity style={styles.fireBtn} onPress={resumeTimer} testID="resume-timer">
                  <Feather name="play" size={18} color="#fff" /><Text style={styles.fireBtnText}> Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stopBtn} onPress={stopTimer} testID="stop-timer">
                  <Feather name="square" size={16} color={C.destructive} /><Text style={styles.stopBtnText}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ON BREAK — only Resume button */}
          {isOnBreak && (
            <View style={styles.controls}>
              <TouchableOpacity style={styles.fireBtn} onPress={resumeTimer} testID="resume-from-break">
                <Feather name="play" size={18} color="#fff" /><Text style={styles.fireBtnText}> Resume Timer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(9,9,11,0.95)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 28, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  ringWrap: { alignItems: 'center', marginBottom: 16, position: 'relative' },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  time: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  status: { color: C.textFaint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 4 },
  pctText: { textAlign: 'center', color: C.textFaint, fontSize: 11, marginBottom: 16 },
  controls: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  fireBtn: { flexDirection: 'row', height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', flex: 1 },
  fireBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  secBtn: { flex: 1, flexDirection: 'row', height: 56, borderRadius: 28, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', gap: 8 },
  secBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  stopBtn: { flexDirection: 'row', height: 56, paddingHorizontal: 24, borderRadius: 28, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center', justifyContent: 'center', gap: 6 },
  stopBtnText: { color: C.destructive, fontSize: 15, fontWeight: '700' },
  breakBtn: { flexDirection: 'row', height: 44, borderRadius: 22, backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', alignItems: 'center', justifyContent: 'center', gap: 8 },
  breakBtnText: { color: C.secondary, fontSize: 13, fontWeight: '600' },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: { flex: 1, height: 44, borderRadius: 22, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  presetText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
});
