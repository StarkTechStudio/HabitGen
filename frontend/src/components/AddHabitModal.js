import { useState } from 'react';
import { X, BookOpen, Code, Moon, Lightbulb, Bike, Camera, Dumbbell, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'study', name: 'Study', icon: BookOpen, color: '#f97316' },
  { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
  { id: 'sleeping', name: 'Sleeping', icon: Moon, color: '#a855f7' },
  { id: 'learning', name: 'Learning', icon: Lightbulb, color: '#eab308' },
  { id: 'ride', name: 'Ride', icon: Bike, color: '#22c55e' },
  { id: 'content', name: 'Content', icon: Camera, color: '#ec4899' },
  { id: 'workout', name: 'Workout', icon: Dumbbell, color: '#ef4444' },
  { id: 'custom', name: 'Custom', icon: Star, color: '#a1a1aa' },
];

const DURATIONS = [
  { label: '15 min', value: 900 },
  { label: '25 min', value: 1500 },
  { label: '45 min', value: 2700 },
  { label: '60 min', value: 3600 },
];

export default function AddHabitModal({ onClose }) {
  const { addHabit } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('study');
  const [duration, setDuration] = useState(2700);

  const handleSubmit = () => {
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      category,
      timerDuration: duration,
      breakDuration: 300,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 animate-fade-in" data-testid="add-habit-modal">
      <div className="w-full max-w-[430px] glass rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-2xl font-bold text-white uppercase tracking-wide">New Habit</h3>
          <button data-testid="close-add-habit" onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24} /></button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Habit Name</label>
          <input
            data-testid="habit-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning workout"
            className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  data-testid={`category-${cat.id}`}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    selected
                      ? 'border-orange-500/50 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <Icon size={18} style={{ color: cat.color }} />
                  <span className="text-[10px] text-zinc-400">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Session Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                data-testid={`duration-${d.value}`}
                onClick={() => setDuration(d.value)}
                className={`flex-1 h-10 rounded-full text-sm font-semibold transition-all ${
                  duration === d.value
                    ? 'fire-gradient text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          data-testid="save-habit-btn"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full h-14 fire-gradient rounded-full font-heading font-bold text-white uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:opacity-90 transition-all disabled:opacity-40 disabled:shadow-none"
        >
          Create Habit
        </button>
      </div>
    </div>
  );
}
