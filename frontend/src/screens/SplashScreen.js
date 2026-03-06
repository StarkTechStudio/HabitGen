import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Flame } from 'lucide-react';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { preferences } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (preferences?.onboardingDone) {
        navigate('/today', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, preferences]);

  return (
    <div data-testid="splash-screen" className="flex flex-col items-center justify-center min-h-screen bg-black px-8 max-w-[430px] mx-auto">
      <div className="animate-flicker mb-6">
        <Flame size={72} className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
      </div>
      <h1 className="font-heading text-5xl font-black text-white text-center mb-3 tracking-tighter uppercase">
        HABIT<span className="fire-text">GEN</span>
      </h1>
      <div className="w-12 h-0.5 fire-gradient rounded-full mb-6" />
      <p className="text-zinc-400 text-center text-base leading-relaxed max-w-xs italic">
        "I am setting up a goal. I commit to complete it."
      </p>
      <div className="mt-12 flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: `${i*0.3}s` }} />
        ))}
      </div>
    </div>
  );
}
