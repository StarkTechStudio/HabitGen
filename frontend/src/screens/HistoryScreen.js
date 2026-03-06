import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Flame, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function HistoryScreen() {
  const { habits, sessions, getStreak } = useApp();

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const completed = sessions.filter(s => {
        if (!s.completed) return false;
        const sd = new Date(s.endTime);
        const sStr = `${sd.getFullYear()}-${String(sd.getMonth()+1).padStart(2,'0')}-${String(sd.getDate()).padStart(2,'0')}`;
        return sStr === dateStr;
      }).length;
      days.push({ date: dateStr, day: dayLabel, completed });
    }
    return days;
  }, [sessions]);

  const totalSessions = sessions.filter(s => s.completed).length;
  const totalMinutes = Math.round(sessions.filter(s => s.completed).reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
  const missedDays = useMemo(() => {
    if (habits.length === 0) return 0;
    let missed = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const hasSessions = sessions.some(s => {
        if (!s.completed) return false;
        const sd = new Date(s.endTime);
        return `${sd.getFullYear()}-${String(sd.getMonth()+1).padStart(2,'0')}-${String(sd.getDate()).padStart(2,'0')}` === dateStr;
      });
      if (!hasSessions) missed++;
    }
    return missed;
  }, [sessions, habits]);

  const longestStreak = useMemo(() =>
    habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0),
    [habits, getStreak]
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-lg px-3 py-2 text-xs">
        <p className="text-white font-semibold">{payload[0].value} sessions</p>
      </div>
    );
  };

  return (
    <div data-testid="history-screen" className="p-4 pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight mb-1">History</h1>
        <p className="text-zinc-400 text-sm">Your habit tracking journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4">
          <Clock size={16} className="text-blue-400 mb-2" />
          <p className="text-xl font-heading font-black text-white">{totalMinutes}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Minutes</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <TrendingUp size={16} className="text-green-400 mb-2" />
          <p className="text-xl font-heading font-black text-white">{totalSessions}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Sessions</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <Flame size={16} className="text-orange-500 mb-2 animate-flicker" />
          <p className="text-xl font-heading font-black fire-text">{longestStreak}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Best Streak</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <AlertCircle size={16} className="text-red-400 mb-2" />
          <p className="text-xl font-heading font-black text-white">{missedDays}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Missed (7d)</p>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-orange-500" /> Last 7 Days
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} barSize={24}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="completed" fill="url(#fireGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="fireGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak per Habit */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> Habit Streaks
        </h3>
        {habits.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">No habits tracked yet</p>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => {
              const streak = getStreak(habit.id);
              const habitSessions = sessions.filter(s => s.habitId === habit.id && s.completed).length;
              return (
                <div key={habit.id} data-testid={`history-habit-${habit.id}`} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{habit.name}</p>
                    <p className="text-[10px] text-zinc-500">{habitSessions} sessions total</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {streak > 0 && <span className="animate-flicker text-sm">&#x1F525;</span>}
                    <span className={`font-heading font-bold text-lg ${streak > 0 ? 'fire-text' : 'text-zinc-600'}`}>{streak}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-4">Recent Sessions</h3>
        {sessions.filter(s => s.completed).length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">No sessions yet</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sessions
              .filter(s => s.completed)
              .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
              .slice(0, 20)
              .map(session => {
                const habit = habits.find(h => h.id === session.habitId);
                const date = new Date(session.endTime);
                return (
                  <div key={session.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-300">{habit?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-zinc-600">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {session.duration ? `${Math.round(session.duration / 60)}m` : 'Manual'}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
