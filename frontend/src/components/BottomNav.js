import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Map, User, Clock, Settings } from 'lucide-react';

const tabs = [
  { path: '/today', label: 'Today', icon: CalendarDays },
  { path: '/journey', label: 'Journey', icon: Map },
  { path: '/login', label: 'Login', icon: User },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/account', label: 'Account', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      data-testid="bottom-navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[398px] h-16 glass rounded-full flex items-center justify-around z-50 shadow-2xl"
    >
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            data-testid={`nav-tab-${tab.label.toLowerCase()}`}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200 ${
              isActive
                ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
