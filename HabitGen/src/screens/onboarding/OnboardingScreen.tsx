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
  ActivityIndicator,
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

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 4;

const SECOND_APP_OPTIONS = [
  { id: 'messages', label: 'Messages', emoji: '💬' },
  { id: 'calculator', label: 'Calculator', emoji: '🧮' },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const MASCOT_EMOJIS = ['🧘', '💪', '🏃', '⭐', '🎯'];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('20:00');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [secondApp, setSecondApp] = useState<string>('calculator');
  const [installedMusicApps, setInstalledMusicApps] = useState<InstalledMusicApp[]>([]);
  const [selectedMusicApp, setSelectedMusicApp] = useState<InstalledMusicApp | null>(null);
  const [loadingMusic, setLoadingMusic] = useState(false);

  useEffect(() => {
    setLoadingMusic(true);
    screenLock.getInstalledMusicApps().then(apps => {
      setInstalledMusicApps(apps);
      if (apps.length > 0) setSelectedMusicApp(apps[0]);
      setLoadingMusic(false);
    });
  }, []);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const handleFinish = async () => {
    const secondOpt = SECOND_APP_OPTIONS.find(o => o.id === secondApp);
    const allowedApps: AllowedAppConfig = {
      phone: true,
      messages: true,
      secondApp: secondOpt ? { id: secondApp, label: secondOpt.label } : undefined,
      musicApp: selectedMusicApp ?? undefined,
    };
    await storage.updateUserPreferences({
      wakeUpTime,
      bedTime,
      goals: selectedGoals,
      allowedApps,
      name: name.trim() || undefined,
      onboardingCompleted: true,
    });
    onComplete();
  };

  const canGoNext = () => {
    if (step === 0) return true;
    if (step === 1) return true;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  const gradColors = theme.colors.onboardingGradient;

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.cardTitle}>What's your name?</Text>
            <Text style={styles.cardSub}>We'll personalize your experience</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Your first name..."
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={20}
              returnKeyType="done"
            />
            <Text style={[styles.skipHint, { color: 'rgba(255,255,255,0.7)' }]}>
              Optional — tap Next to skip
            </Text>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.cardTitle}>Wake up time ☀️</Text>
            <Text style={styles.cardSub}>Habits only notify you after this time</Text>
            <View style={styles.pickerWrap}>
              <WakeTimePickerStep
                value={wakeUpTime}
                onChange={setWakeUpTime}
                theme={theme}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.cardTitle}>Bedtime 🌙</Text>
            <Text style={styles.cardSub}>No reminders after this time</Text>
            <View style={styles.pickerWrap}>
              <BedTimePickerStep
                value={bedTime}
                onChange={setBedTime}
                theme={theme}
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.cardTitle}>Your goals 🎯</Text>
            <Text style={styles.cardSub}>What do you want to work on?</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map(goal => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  style={[
                    styles.goalChip,
                    selectedGoals.includes(goal.id) && styles.goalChipActive,
                  ]}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={[styles.goalLabel, selectedGoals.includes(goal.id) && styles.goalLabelActive]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: gradColors[0] }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 0 : 20), paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot */}
        <View style={styles.mascotSection}>
          <View style={styles.mascotCircle}>
            <Text style={styles.mascotEmoji}>{MASCOT_EMOJIS[step] || '🧘'}</Text>
            <View style={[styles.sparkle, { top: 4, right: 12 }]}>
              <Text style={{ fontSize: 14 }}>✨</Text>
            </View>
            <View style={[styles.sparkle, { bottom: 12, left: 4 }]}>
              <Text style={{ fontSize: 10 }}>⭐</Text>
            </View>
          </View>
          <Text style={styles.mainTitle}>Build healthy</Text>
          <Text style={styles.mainTitle}>habits with us</Text>
        </View>

        {/* Step dots */}
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
          ))}
        </View>

        {/* Card */}
        <View style={styles.card}>{renderStepContent()}</View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          onPress={() => {
            if (!canGoNext()) return;
            if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
            else handleFinish();
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, { color: theme.colors.primary }]}>
            {step < TOTAL_STEPS - 1 ? 'Next →' : "Let's go!"}
          </Text>
        </TouchableOpacity>

        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}

        {step === 0 && (
          <Text style={styles.legalText}>
            By continuing, you agree to our Terms of use
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mascotSection: { alignItems: 'center', marginBottom: 20 },
  mascotCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  mascotEmoji: { fontSize: 72 },
  sparkle: { position: 'absolute' },
  mainTitle: {
    fontSize: Math.min(width * 0.09, 36),
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.11, 44),
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 28,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
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
  stepContent: { width: '100%' },
  cardTitle: {
    fontSize: Math.min(width * 0.06, 22),
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontWeight: '400',
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1.5,
    backgroundColor: '#F5F5F7',
  },
  skipHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    color: '#9CA3AF',
  },
  pickerWrap: { width: '100%', minHeight: 150 },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalChipActive: {
    backgroundColor: '#EEF0FF',
    borderColor: '#5B4FE8',
  },
  goalEmoji: { fontSize: 18 },
  goalLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  goalLabelActive: { color: '#5B4FE8' },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
  },
  backBtn: { paddingVertical: 12, marginBottom: 8 },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  legalText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
