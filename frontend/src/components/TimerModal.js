import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, Coffee, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressRing from './ProgressRing';

export default function TimerModal({ habitId, onClose }) {
  const { habits, timerState, setTimerState, addSession } = useApp();
  const habit = habits.find(h => h.id === habitId);
  const intervalRef = useRef(null);
  const [now, setNow] = useState(Date.now());

  const isActiveTimer = timerState && timerState.habitId === habitId;
  const duration = isActiveTimer ? timerState.duration : (habit?.timerDuration || 2700);
  const breakDuration = habit?.breakDuration || 300;

  const getElapsed = useCallback(() => {
    if (!isActiveTimer) return 0;
    const t = timerState;
    const end = t.pausedAt || Date.now();
    return (end - t.startedAt - t.totalPausedMs) / 1000;
  }, [isActiveTimer, timerState]);

  const remaining = Math.max(0, (isActiveTimer ? timerState.duration : duration) - getElapsed());
  const progress = isActiveTimer ? getElapsed() / timerState.duration : 0;
  const isRunning = isActiveTimer && !timerState.pausedAt;
  const mode = isActiveTimer ? timerState.mode : 'work';

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setNow(Date.now()), 200);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, now]);

  useEffect(() => {
    if (isActiveTimer && remaining <= 0 && isRunning) {
      handleTimerComplete();
    }
  });

  const handleTimerComplete = useCallback(() => {
    if (!isActiveTimer) return;
    const elapsed = getElapsed();
    const completionPct = elapsed / timerState.duration;
    const completed = completionPct >= 0.8;
    addSession({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      habitId,
      startTime: new Date(timerState.startedAt).toISOString(),
      endTime: new Date().toISOString(),
      duration: Math.round(elapsed),
      completed,
      completionPct: Math.round(completionPct * 100),
      type: timerState.mode,
    });
    setTimerState(null);
  }, [isActiveTimer, timerState, habitId, getElapsed, addSession, setTimerState]);

  const startTimer = (dur, timerMode = 'work') => {
    setTimerState({
      habitId,
      startedAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
      duration: dur,
      mode: timerMode,
    });
  };

  const pauseTimer = () => {
    if (!isActiveTimer) return;
    setTimerState({ ...timerState, pausedAt: Date.now() });
  };

  const resumeTimer = () => {
    if (!isActiveTimer || !timerState.pausedAt) return;
    const pauseDuration = Date.now() - timerState.pausedAt;
    setTimerState({
      ...timerState,
      pausedAt: null,
      totalPausedMs: timerState.totalPausedMs + pauseDuration,
    });
  };

  const stopTimer = () => {
    if (isActiveTimer) {
      const elapsed = getElapsed();
      if (elapsed > 5) {
        const completionPct = elapsed / timerState.duration;
        addSession({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          habitId,
          startTime: new Date(timerState.startedAt).toISOString(),
          endTime: new Date().toISOString(),
          duration: Math.round(elapsed),
          completed: completionPct >= 0.8,
          completionPct: Math.round(completionPct * 100),
          type: timerState.mode,
        });
      }
    }
    setTimerState(null);
  };

  const startBreak = (dur) => startTimer(dur, 'break');

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-fade-in" data-testid="timer-modal">
      <div className="w-full max-w-[400px] mx-4 glass rounded-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl font-bold text-white uppercase tracking-wide">
            {mode === 'break' ? 'Break Time' : habit?.name || 'Timer'}
          </h3>
          <button data-testid="close-timer" onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <ProgressRing
              progress={progress}
              size={200}
              strokeWidth={10}
              color={mode === 'break' ? '#22c55e' : '#f97316'}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-heading font-black text-white tracking-tight">
                {formatTime(remaining)}
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                {isRunning ? 'Running' : isActiveTimer ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>
          {isActiveTimer && (
            <p className="text-xs text-zinc-500 mt-3">
              {Math.round(progress * 100)}% complete (80% needed)
            </p>
          )}
        </div>

        {!isActiveTimer ? (
          <div className="space-y-3">
            <button
              data-testid="start-work-timer"
              onClick={() => startTimer(duration)}
              className="w-full h-14 fire-gradient rounded-full font-heading font-bold text-white uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:opacity-90 transition-all"
            >
              Start {Math.round(duration / 60)} Min Session
            </button>
            <div className="flex gap-2">
              <button
                data-testid="start-15-timer"
                onClick={() => startTimer(900)}
                className="flex-1 h-11 bg-zinc-800 border border-zinc-700 rounded-full text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                15 min
              </button>
              <button
                data-testid="start-25-timer"
                onClick={() => startTimer(1500)}
                className="flex-1 h-11 bg-zinc-800 border border-zinc-700 rounded-full text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                25 min
              </button>
              <button
                data-testid="start-45-timer"
                onClick={() => startTimer(2700)}
                className="flex-1 h-11 bg-zinc-800 border border-zinc-700 rounded-full text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                45 min
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {isRunning ? (
                <button
                  data-testid="pause-timer"
                  onClick={pauseTimer}
                  className="flex-1 h-14 bg-zinc-800 border border-zinc-700 rounded-full font-bold text-white flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all"
                >
                  <Pause size={18} /> Pause
                </button>
              ) : (
                <button
                  data-testid="resume-timer"
                  onClick={resumeTimer}
                  className="flex-1 h-14 fire-gradient rounded-full font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <Play size={18} /> Resume
                </button>
              )}
              <button
                data-testid="stop-timer"
                onClick={stopTimer}
                className="h-14 px-6 bg-red-600/20 border border-red-500/30 rounded-full font-bold text-red-400 flex items-center justify-center gap-2 hover:bg-red-600/30 transition-all"
              >
                <Square size={16} fill="currentColor" /> Stop
              </button>
            </div>
            {mode === 'work' && (
              <div className="flex gap-2">
                <button
                  data-testid="break-5-min"
                  onClick={() => startBreak(300)}
                  className="flex-1 h-10 bg-green-900/30 border border-green-500/20 rounded-full text-sm font-semibold text-green-400 flex items-center justify-center gap-1.5 hover:bg-green-900/50 transition-all"
                >
                  <Coffee size={14} /> 5 min break
                </button>
                <button
                  data-testid="break-10-min"
                  onClick={() => startBreak(600)}
                  className="flex-1 h-10 bg-green-900/30 border border-green-500/20 rounded-full text-sm font-semibold text-green-400 flex items-center justify-center gap-1.5 hover:bg-green-900/50 transition-all"
                >
                  <Coffee size={14} /> 10 min break
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
