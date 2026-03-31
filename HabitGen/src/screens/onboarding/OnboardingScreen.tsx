import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../utils/storage';
import { GOALS } from '../../types';
import type { AllowedAppConfig } from '../../types';
import WakeTimePickerStep from '../../components/WakeTimePickerStep';
import BedTimePickerStep from '../../components/BedTimePickerStep';
import { screenLock, InstalledMusicApp } from '../../api/screenlock';
import { MascotOnboarding } from '../../components/MascotSVG';

const { width, height } = Dimensions.get('window');
const PURPLE = '#5B4FE8';
const TOTAL_STEPS = 3;

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0=splash, 1=wake, 2=bed, 3=goals
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('20:00');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [installedMusicApps, setInstalledMusicApps] = useState<InstalledMusicApp[]>([]);
  const [selectedMusicApp, setSelectedMusicApp] = useState<InstalledMusicApp | null>(null);

  useEffect(() => {
    screenLock.getInstalledMusicApps().then(apps => {
      setInstalledMusicApps(apps);
      if (apps.length > 0) setSelectedMusicApp(apps[0]);
    });
  }, []);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const handleFinish = async () => {
    const allowedApps: AllowedAppConfig = {
      phone: true,
      messages: true,
      musicApp: selectedMusicApp ?? undefined,
    };
    await storage.updateUserPreferences({
      wakeUpTime,
      bedTime,
      goals: selectedGoals,
      allowedApps,
      onboardingCompleted: true,
    });
    onComplete();
  };

  const topPad = insets.top + (Platform.OS === 'android' ? 16 : 0);

  /* ── SPLASH (step 0) ── */
  if (step === 0) {
    return (
      <View style={[s0.root, { backgroundColor: PURPLE, paddingTop: topPad }]}>
        <View style={s0.mascotWrap}>
          <MascotOnboarding size={Math.min(width * 0.78, 200)} />
        </View>

        <Text style={s0.title}>Build healthy{'\n'}habits with us</Text>

        <View style={[s0.bottom, { paddingBottom: insets.bottom + 32 }]}>
          <TouchableOpacity onPress={() => setStep(1)} style={s0.cta} activeOpacity={0.85}>
            <Text style={[s0.ctaText, { color: PURPLE }]}>Get started</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFinish} style={s0.haveAccount}>
            <Text style={s0.haveAccountText}>I have an account</Text>
          </TouchableOpacity>
          <Text style={s0.legal}>
            By starting or signing in, you agree{'\n'}to our <Text style={s0.legalLink}>Terms of use</Text>
          </Text>
        </View>
      </View>
    );
  }

  /* ── STEPS ── */
  const visualStep = step - 1;

  return (
    <View style={[s1.root, { backgroundColor: PURPLE, paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[s1.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s1.mascotSmall}>
          <MascotOnboarding size={Math.min(width * 0.4, 110)} />
        </View>

        {/* Step dots */}
        <View style={s1.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[s1.dot, i === visualStep && s1.dotActive, i < visualStep && s1.dotDone]} />
          ))}
        </View>

        {/* White card */}
        <View style={s1.card}>
          {step === 1 && (
            <>
              <Text style={s1.cardTitle}>Wake up time ☀️</Text>
              <Text style={s1.cardSub}>Habits only notify you after this time</Text>
              <WakeTimePickerStep value={wakeUpTime} onChange={setWakeUpTime} theme={theme} />
            </>
          )}
          {step === 2 && (
            <>
              <Text style={s1.cardTitle}>Bedtime 🌙</Text>
              <Text style={s1.cardSub}>No reminders after this time</Text>
              <BedTimePickerStep value={bedTime} onChange={setBedTime} theme={theme} />
            </>
          )}
          {step === 3 && (
            <>
              <Text style={s1.cardTitle}>Your goals 🎯</Text>
              <Text style={s1.cardSub}>What do you want to work on?</Text>
              <View style={s1.goalsGrid}>
                {GOALS.map(goal => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => toggleGoal(goal.id)}
                    style={[s1.goalChip, selectedGoals.includes(goal.id) && s1.goalChipActive]}
                  >
                    <Text style={{ fontSize: 18 }}>{goal.emoji}</Text>
                    <Text style={[s1.goalLabel, selectedGoals.includes(goal.id) && s1.goalLabelActive]}>
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => { if (step < TOTAL_STEPS) setStep(s => s + 1); else handleFinish(); }}
          style={s1.cta}
          activeOpacity={0.85}
        >
          <Text style={[s1.ctaText, { color: PURPLE }]}>
            {step < TOTAL_STEPS ? 'Next →' : "Let's go!"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep(s => Math.max(0, s - 1))} style={s1.backBtn}>
          <Text style={s1.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OnboardingScreen;

const s0 = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  mascotWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 12 },
  title: {
    fontSize: Math.min(width * 0.092, 36),
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.115, 44),
    paddingHorizontal: 28,
    marginBottom: 36,
  },
  bottom: { width: '100%', paddingHorizontal: 26, alignItems: 'center' },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 18,
  },
  ctaText: { fontSize: 18, fontWeight: '800' },
  haveAccount: { paddingVertical: 6, marginBottom: 20 },
  haveAccountText: { fontSize: 14, fontWeight: '600', color: '#fff', textDecorationLine: 'underline' },
  legal: { fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 18 },
  legalLink: { textDecorationLine: 'underline', color: 'rgba(255,255,255,0.75)' },
});

const s1 = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  mascotSmall: { marginBottom: 12 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#fff', width: 28, borderRadius: 4 },
  dotDone: { backgroundColor: 'rgba(255,255,255,0.7)' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: { fontSize: Math.min(width * 0.06, 22), fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#F5F5F7', borderWidth: 2, borderColor: 'transparent',
  },
  goalChipActive: { backgroundColor: '#EEF0FF', borderColor: '#5B4FE8' },
  goalLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  goalLabelActive: { color: '#5B4FE8' },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  ctaText: { fontSize: 18, fontWeight: '800' },
  backBtn: { paddingVertical: 12 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
