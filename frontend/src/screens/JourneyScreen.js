import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PaywallModal from '../components/PaywallModal';
import { Crown, Lock, MapPin, Dumbbell, Target, ChevronRight, Check } from 'lucide-react';

const SAMPLE_JOURNEYS = [
  {
    id: 'weight-loss',
    title: 'Lose 2 kg in 21 Days',
    desc: 'Daily exercises + diet tracking',
    icon: Dumbbell,
    color: '#ef4444',
    days: 21,
    tasks: [
      { day: 1, task: '30 min morning walk + 2L water', timer: 1800 },
      { day: 2, task: '15 min HIIT workout', timer: 900 },
      { day: 3, task: '45 min yoga session', timer: 2700 },
      { day: 4, task: '20 min strength training', timer: 1200 },
      { day: 5, task: '30 min cycling', timer: 1800 },
    ],
  },
  {
    id: 'coding-mastery',
    title: 'Learn React in 30 Days',
    desc: 'Build projects daily',
    icon: Target,
    color: '#3b82f6',
    days: 30,
    tasks: [
      { day: 1, task: 'Setup environment + Hello World', timer: 2700 },
      { day: 2, task: 'Components & Props', timer: 2700 },
      { day: 3, task: 'State & Events', timer: 2700 },
      { day: 4, task: 'useEffect & API calls', timer: 3600 },
      { day: 5, task: 'Build a Todo App', timer: 3600 },
    ],
  },
  {
    id: 'mindfulness',
    title: '14 Days of Mindfulness',
    desc: 'Build a meditation practice',
    icon: MapPin,
    color: '#22c55e',
    days: 14,
    tasks: [
      { day: 1, task: '5 min breathing exercise', timer: 300 },
      { day: 2, task: '10 min guided meditation', timer: 600 },
      { day: 3, task: '15 min body scan', timer: 900 },
      { day: 4, task: '10 min gratitude journaling', timer: 600 },
      { day: 5, task: '20 min silent meditation', timer: 1200 },
    ],
  },
];

export default function JourneyScreen() {
  const { isPremium, setIsPremium } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  const handleJourneyClick = (journey) => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setSelectedJourney(selectedJourney?.id === journey.id ? null : journey);
  };

  const toggleTask = (journeyId, day) => {
    const key = `${journeyId}-${day}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div data-testid="journey-screen" className="p-4 pt-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight">Journeys</h1>
          {!isPremium && <Lock size={18} className="text-zinc-500" />}
        </div>
        <p className="text-zinc-400 text-sm">Guided paths to achieve your goals</p>
      </div>

      {!isPremium && (
        <button
          data-testid="unlock-premium-banner"
          onClick={() => setShowPaywall(true)}
          className="w-full p-4 fire-gradient rounded-2xl flex items-center gap-3 mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:opacity-95 transition-all"
        >
          <Crown size={24} className="text-white shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm">Unlock Premium Journeys</p>
            <p className="text-white/70 text-xs">Get guided programs, analytics & more</p>
          </div>
          <ChevronRight size={20} className="text-white/70" />
        </button>
      )}

      <div className="space-y-4">
        {SAMPLE_JOURNEYS.map(journey => {
          const Icon = journey.icon;
          const isOpen = selectedJourney?.id === journey.id;
          const journeyCompleted = journey.tasks.filter(t => completedTasks[`${journey.id}-${t.day}`]).length;
          return (
            <div key={journey.id} className="glass-card rounded-2xl overflow-hidden transition-all">
              <button
                data-testid={`journey-${journey.id}`}
                onClick={() => handleJourneyClick(journey)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: journey.color + '20' }}>
                  <Icon size={22} style={{ color: journey.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{journey.title}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{journey.desc}</p>
                  {isPremium && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(journeyCompleted / journey.tasks.length) * 100}%`, backgroundColor: journey.color }} />
                      </div>
                      <span className="text-[10px] text-zinc-500">{journeyCompleted}/{journey.tasks.length}</span>
                    </div>
                  )}
                </div>
                <div className="text-zinc-600">
                  {!isPremium ? <Lock size={16} /> : <ChevronRight size={16} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                </div>
              </button>
              {isOpen && isPremium && (
                <div className="px-4 pb-4 space-y-2 animate-slide-up">
                  {journey.tasks.map(task => {
                    const done = completedTasks[`${journey.id}-${task.day}`];
                    return (
                      <button
                        key={task.day}
                        data-testid={`task-${journey.id}-day-${task.day}`}
                        onClick={() => toggleTask(journey.id, task.day)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          done ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          done ? 'bg-green-500 border-green-500' : 'border-zinc-700'
                        }`}>
                          {done && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>Day {task.day}: {task.task}</p>
                        </div>
                        <span className="text-[10px] text-zinc-600">{Math.round(task.timer / 60)}m</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSubscribe={(plan) => { setIsPremium(true); setShowPaywall(false); }}
        />
      )}
    </div>
  );
}
