import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import HabitCard from '../components/HabitCard';
import TimerModal from '../components/TimerModal';
import AddHabitModal from '../components/AddHabitModal';
import { Plus, Flame, Target, Timer } from 'lucide-react';

export default function TodayScreen() {
  const { habits, sessions, getStreak, completeHabit, isCompletedToday, deleteHabit } = useApp();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [activeTimerHabit, setActiveTimerHabit] = useState(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }, []);

  const todaySessions = useMemo(() =>
    sessions.filter(s => s.endTime?.startsWith(todayStr) && s.completed),
    [sessions, todayStr]
  );

  const totalStreaks = useMemo(() =>
    habits.reduce((sum, h) => sum + getStreak(h.id), 0),
    [habits, getStreak]
  );

  const completedToday = useMemo(() =>
    habits.filter(h => isCompletedToday(h.id)).length,
    [habits, isCompletedToday]
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div data-testid="today-screen" className="p-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight">{greeting()}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <Target size={18} className="text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-heading font-black text-white">{habits.length}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Habits</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Flame size={18} className="text-orange-500 mx-auto mb-2 animate-flicker" />
          <p className="text-2xl font-heading font-black fire-text">{totalStreaks}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Streaks</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Timer size={18} className="text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-heading font-black text-white">{completedToday}/{habits.length}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Today</p>
        </div>
      </div>

      {/* Progress bar */}
      {habits.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Today's Progress</span>
            <span className="text-xs font-bold fire-text">{habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full fire-gradient rounded-full transition-all duration-700 ease-out"
              style={{ width: `${habits.length > 0 ? (completedToday / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl font-bold text-white uppercase tracking-wide">My Habits</h2>
          <button
            data-testid="add-habit-btn"
            onClick={() => setShowAddHabit(true)}
            className="w-10 h-10 fire-gradient rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:opacity-90 transition-all active:scale-95"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-16">
            <Flame size={48} className="text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No habits yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Tap + to add your first habit</p>
          </div>
        ) : (
          <div>
            {habits.map((habit, i) => (
              <div key={habit.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <HabitCard
                  habit={habit}
                  streak={getStreak(habit.id)}
                  completedToday={isCompletedToday(habit.id)}
                  onStartTimer={() => setActiveTimerHabit(habit.id)}
                  onComplete={() => completeHabit(habit.id)}
                  onDelete={() => deleteHabit(habit.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddHabit && <AddHabitModal onClose={() => setShowAddHabit(false)} />}
      {activeTimerHabit && <TimerModal habitId={activeTimerHabit} onClose={() => setActiveTimerHabit(null)} />}
    </div>
  );
}
