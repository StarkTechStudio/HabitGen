import { X, Check, Crown, Zap, BarChart3, Route } from 'lucide-react';

const FEATURES = [
  { icon: Zap, text: 'No Ads — Focus without distractions' },
  { icon: Route, text: 'Custom Journeys — Guided goal paths' },
  { icon: BarChart3, text: 'Deep Analytics — Track everything' },
  { icon: Crown, text: 'Priority Goals & Difficulty Ratings' },
];

export default function PaywallModal({ onClose, onSubscribe }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-fade-in" data-testid="paywall-modal">
      <div className="w-full max-w-[400px] mx-4 glass rounded-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div />
          <button data-testid="close-paywall" onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24} /></button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 fire-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Crown size={32} className="text-white" />
          </div>
          <h2 className="font-heading text-3xl font-black text-white uppercase tracking-tight">Go Premium</h2>
          <p className="text-zinc-400 text-sm mt-2">Unlock your full potential</p>
        </div>

        <div className="space-y-3 mb-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3 glass-card rounded-xl">
                <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-sm text-zinc-300">{f.text}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 mb-4">
          <button
            data-testid="subscribe-yearly"
            onClick={() => onSubscribe?.('yearly')}
            className="w-full h-14 fire-gradient rounded-full font-heading font-bold text-white uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:opacity-90 transition-all relative"
          >
            <span className="absolute -top-2 right-4 bg-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Save 3x</span>
            &#x20B9;1,400 / Year
          </button>
          <button
            data-testid="subscribe-monthly"
            onClick={() => onSubscribe?.('monthly')}
            className="w-full h-12 bg-zinc-800 border border-zinc-700 rounded-full font-semibold text-zinc-300 hover:bg-zinc-700 transition-all"
          >
            &#x20B9;120 / Month
          </button>
        </div>

        <p className="text-center text-[11px] text-zinc-600">
          Subscription managed via RevenueCat. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
