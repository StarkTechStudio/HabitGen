import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PaywallModal from '../components/PaywallModal';
import { Crown, Bell, BellOff, ChevronRight, LogOut, Moon, Sun, Clock, Target, Trash2, ExternalLink } from 'lucide-react';

export default function AccountScreen() {
  const { user, setUser, isPremium, setIsPremium, preferences, setPreferences, habits } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleNotificationToggle = () => {
    if (!notifications && 'Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') setNotifications(true);
      });
    } else {
      setNotifications(!notifications);
    }
  };

  const handleClearData = () => {
    if (window.confirm('This will delete all your habits, sessions, and preferences. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div data-testid="account-screen" className="p-4 pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-4xl font-black text-white uppercase tracking-tight mb-1">Account</h1>
        <p className="text-zinc-400 text-sm">Manage your settings</p>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full fire-gradient flex items-center justify-center shrink-0">
            <span className="text-xl font-heading font-black text-white">
              {user?.email?.[0]?.toUpperCase() || 'H'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold">{user?.email || 'Guest User'}</p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {isPremium ? 'Premium Member' : 'Free Plan'} &middot; {habits.length} habits
            </p>
          </div>
          {isPremium && <Crown size={20} className="text-orange-500 shrink-0" />}
        </div>
      </div>

      {/* Subscription */}
      {!isPremium && (
        <button
          data-testid="upgrade-btn"
          onClick={() => setShowPaywall(true)}
          className="w-full fire-gradient rounded-2xl p-4 flex items-center gap-3 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:opacity-95 transition-all"
        >
          <Crown size={22} className="text-white shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm">Upgrade to Premium</p>
            <p className="text-white/70 text-xs">No ads, journeys, analytics & more</p>
          </div>
          <ChevronRight size={18} className="text-white/70" />
        </button>
      )}

      {isPremium && (
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={18} className="text-orange-500" />
              <div>
                <p className="text-white font-semibold text-sm">Premium Active</p>
                <p className="text-zinc-500 text-xs">All features unlocked</p>
              </div>
            </div>
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-semibold uppercase tracking-wider">Active</span>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="glass-card rounded-2xl overflow-hidden mb-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest px-4 pt-4 pb-2">Settings</p>

        <button
          data-testid="notification-toggle"
          onClick={handleNotificationToggle}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            {notifications ? <Bell size={18} className="text-orange-500" /> : <BellOff size={18} className="text-zinc-500" />}
            <span className="text-sm text-white">Notifications</span>
          </div>
          <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all ${notifications ? 'bg-orange-500' : 'bg-zinc-700'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="h-px bg-zinc-800/50 mx-4" />

        {preferences && (
          <>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Sun size={18} className="text-yellow-400" />
                <span className="text-sm text-white">Wake Up</span>
              </div>
              <span className="text-sm text-zinc-400">{preferences.wakeUpTime}</span>
            </div>
            <div className="h-px bg-zinc-800/50 mx-4" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-purple-400" />
                <span className="text-sm text-white">Bed Time</span>
              </div>
              <span className="text-sm text-zinc-400">{preferences.bedTime}</span>
            </div>
            <div className="h-px bg-zinc-800/50 mx-4" />
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Target size={18} className="text-orange-500" />
                <span className="text-sm text-white">Primary Goal</span>
              </div>
              <span className="text-sm text-zinc-400 capitalize">{preferences.defaultGoal}</span>
            </div>
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl overflow-hidden mb-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest px-4 pt-4 pb-2">Account</p>

        {user && (
          <>
            <button
              data-testid="sign-out-btn"
              onClick={() => setUser(null)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-all"
            >
              <LogOut size={18} className="text-zinc-400" />
              <span className="text-sm text-white">Sign Out</span>
            </button>
            <div className="h-px bg-zinc-800/50 mx-4" />
          </>
        )}

        <button
          data-testid="clear-data-btn"
          onClick={handleClearData}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/5 transition-all"
        >
          <Trash2 size={18} className="text-red-400" />
          <span className="text-sm text-red-400">Clear All Data</span>
        </button>
      </div>

      {/* App info */}
      <div className="text-center mt-8 mb-4">
        <p className="text-zinc-700 text-xs">HabitGen v1.0.0</p>
        <p className="text-zinc-800 text-[10px] mt-0.5">Built with React &middot; Offline First</p>
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
