import { BookOpen, Code, Moon, Lightbulb, Bike, Camera, Dumbbell, Star, Play, Check, Trash2 } from 'lucide-react';

const ICONS = {
  study: BookOpen, coding: Code, sleeping: Moon, learning: Lightbulb,
  ride: Bike, content: Camera, workout: Dumbbell, custom: Star,
};
const COLORS = {
  study: '#f97316', coding: '#3b82f6', sleeping: '#a855f7', learning: '#eab308',
  ride: '#22c55e', content: '#ec4899', workout: '#ef4444', custom: '#a1a1aa',
};

export default function HabitCard({ habit, streak, completedToday, onStartTimer, onComplete, onDelete }) {
  const Icon = ICONS[habit.category] || Star;
  const color = COLORS[habit.category] || '#a1a1aa';

  return (
    <div
      data-testid={`habit-card-${habit.id}`}
      className="flex items-center gap-3 p-4 glass-card rounded-2xl mb-3 transition-all duration-200 active:scale-[0.98] hover:border-orange-500/20"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '20' }}
      >
        <Icon size={20} style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{habit.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs">
              <span className="animate-flicker inline-block">&#x1F525;</span>
              <span className="fire-text font-bold">{streak} day{streak !== 1 ? 's' : ''}</span>
            </span>
          )}
          {streak === 0 && <span className="text-zinc-500 text-xs">No streak yet</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!completedToday ? (
          <button
            data-testid={`complete-habit-${habit.id}`}
            onClick={onComplete}
            className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-green-600 hover:border-green-500 transition-all"
          >
            <Check size={16} className="text-zinc-400 hover:text-white" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center">
            <Check size={16} className="text-green-400" />
          </div>
        )}
        <button
          data-testid={`start-timer-${habit.id}`}
          onClick={onStartTimer}
          className="w-9 h-9 rounded-full fire-gradient flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:opacity-90 transition-all"
        >
          <Play size={14} className="text-white ml-0.5" fill="white" />
        </button>
        <button
          data-testid={`delete-habit-${habit.id}`}
          onClick={onDelete}
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export { ICONS, COLORS };
