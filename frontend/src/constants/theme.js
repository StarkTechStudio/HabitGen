export const C = {
  bg: '#000000',
  surface: '#0a0a0a',
  surfaceHl: '#18181b',
  border: '#27272a',
  borderLight: 'rgba(255,255,255,0.08)',
  primary: '#f97316',
  primaryDark: '#dc2626',
  secondary: '#22c55e',
  destructive: '#ef4444',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  textFaint: '#52525b',
  purple: '#a855f7',
  blue: '#3b82f6',
  yellow: '#eab308',
  pink: '#ec4899',
  green: '#22c55e',
};

export const CATEGORIES = [
  { id: 'study', name: 'Study', icon: 'book-open', color: C.primary },
  { id: 'coding', name: 'Coding', icon: 'code', color: C.blue },
  { id: 'sleeping', name: 'Sleeping', icon: 'moon', color: C.purple },
  { id: 'learning', name: 'Learning New Skill', icon: 'zap', color: C.yellow },
  { id: 'ride', name: 'Bike/Car Ride', icon: 'navigation', color: C.green },
  { id: 'content', name: 'Content Creation', icon: 'camera', color: C.pink },
  { id: 'workout', name: 'Workout', icon: 'activity', color: C.destructive },
  { id: 'custom', name: 'Custom Habit', icon: 'plus', color: C.textMuted },
];

export const getCategoryColor = (cat) => CATEGORIES.find(c => c.id === cat)?.color || C.textMuted;
export const getCategoryIcon = (cat) => CATEGORIES.find(c => c.id === cat)?.icon || 'star';
