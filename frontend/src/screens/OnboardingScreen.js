import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronRight, ChevronLeft, Sun, Moon as MoonIcon, Target, BookOpen, Code, Moon, Lightbulb, Bike, Camera, Dumbbell, Plus, Check } from 'lucide-react';

const GOALS = [
  { id: 'study', name: 'Study', icon: BookOpen, color: '#f97316' },
  { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
  { id: 'sleeping', name: 'Sleeping', icon: Moon, color: '#a855f7' },
  { id: 'learning', name: 'Learning New Skill', icon: Lightbulb, color: '#eab308' },
  { id: 'ride', name: 'Bike/Car Ride', icon: Bike, color: '#22c55e' },
  { id: 'content', name: 'Content Creation', icon: Camera, color: '#ec4899' },
  { id: 'workout', name: 'Workout', icon: Dumbbell, color: '#ef4444' },
  { id: 'custom', name: 'Custom Habit', icon: Plus, color: '#a1a1aa' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: `${String(i).padStart(2, '0')}:00`, label: `${h}:00 ${ampm}` };
});

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { savePreferences, addHabit } = useApp();
  const [step, setStep] = useState(0);
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [primaryGoal, setPrimaryGoal] = useState(null);

  const toggleGoal = (id) => {
    setSelectedGoals(prev => {
      if (prev.includes(id)) {
        if (primaryGoal === id) setPrimaryGoal(prev.filter(g => g !== id)[0] || null);
        return prev.filter(g => g !== id);
      }
      const next = [...prev, id];
      if (!primaryGoal) setPrimaryGoal(id);
      return next;
    });
  };

  const handleComplete = () => {
    const prefs = { wakeUpTime, bedTime, goals: selectedGoals, defaultGoal: primaryGoal || selectedGoals[0] };
    savePreferences(prefs);
    selectedGoals.forEach(goalId => {
      const goal = GOALS.find(g => g.id === goalId);
      if (goal && goal.id !== 'custom') {
        addHabit({ name: goal.name, category: goalId, timerDuration: 2700, breakDuration: 300 });
      }
    });
    navigate('/today', { replace: true });
  };

  const canNext = step === 0 || step === 1 || (step === 2 && selectedGoals.length > 0);

  return (
    <div data-testid="onboarding-screen" className="min-h-screen flex flex-col p-6">
      {/* Progress */}
      <div className="flex gap-2 mb-8 mt-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${i <= step ? 'fire-gradient' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
              <Sun size={28} className="text-orange-500" />
            </div>
            <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight mb-2">
              Wake Up Time
            </h1>
            <p className="text-zinc-400 text-sm mb-8">When do you usually start your day?</p>
            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {HOURS.filter(h => {
                const hour = parseInt(h.value);
                return hour >= 4 && hour <= 12;
              }).map(h => (
                <button
                  key={h.value}
                  data-testid={`wake-time-${h.value}`}
                  onClick={() => setWakeUpTime(h.value)}
                  className={`h-12 rounded-xl text-sm font-semibold transition-all ${
                    wakeUpTime === h.value
                      ? 'fire-gradient text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
              <MoonIcon size={28} className="text-purple-400" />
            </div>
            <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight mb-2">
              Bed Time
            </h1>
            <p className="text-zinc-400 text-sm mb-8">When do you usually go to sleep?</p>
            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
              {HOURS.filter(h => {
                const hour = parseInt(h.value);
                return hour >= 20 || hour <= 2;
              }).map(h => (
                <button
                  key={h.value}
                  data-testid={`bed-time-${h.value}`}
                  onClick={() => setBedTime(h.value)}
                  className={`h-12 rounded-xl text-sm font-semibold transition-all ${
                    bedTime === h.value
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
              <Target size={28} className="text-orange-500" />
            </div>
            <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight mb-2">
              Your Goals
            </h1>
            <p className="text-zinc-400 text-sm mb-2">Select habits you want to build. Tap twice to set as primary.</p>
            <p className="text-zinc-600 text-xs mb-6">Select at least one goal</p>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(goal => {
                const Icon = goal.icon;
                const selected = selectedGoals.includes(goal.id);
                const isPrimary = primaryGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    data-testid={`goal-${goal.id}`}
                    onClick={() => {
                      if (selected && !isPrimary) {
                        setPrimaryGoal(goal.id);
                      } else {
                        toggleGoal(goal.id);
                      }
                    }}
                    className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-200 ${
                      selected
                        ? isPrimary
                          ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
                          : 'border-orange-500/30 bg-orange-500/5'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    {isPrimary && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Primary</span>
                    )}
                    {selected && !isPrimary && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-orange-400" />
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + '20' }}>
                      <Icon size={24} style={{ color: goal.color }} />
                    </div>
                    <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-zinc-400'}`}>{goal.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pb-4">
        {step > 0 && (
          <button
            data-testid="onboarding-back"
            onClick={() => setStep(s => s - 1)}
            className="h-14 px-6 bg-zinc-800 border border-zinc-700 rounded-full font-semibold text-zinc-300 flex items-center gap-2 hover:bg-zinc-700 transition-all"
          >
            <ChevronLeft size={18} /> Back
          </button>
        )}
        <button
          data-testid="onboarding-next"
          onClick={() => step < 2 ? setStep(s => s + 1) : handleComplete()}
          disabled={!canNext}
          className="flex-1 h-14 fire-gradient rounded-full font-heading font-bold text-white uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:opacity-90 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {step < 2 ? (
            <>Next <ChevronRight size={18} /></>
          ) : (
            <>Let's Go <span className="text-xl">&#x1F525;</span></>
          )}
        </button>
      </div>
    </div>
  );
}
