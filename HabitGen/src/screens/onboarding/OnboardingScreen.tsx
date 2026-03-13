import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../utils/storage';
import { GOALS } from '../../types';
import WakeTimePickerStep from '../../components/WakeTimePickerStep';
import BedTimePickerStep from '../../components/BedTimePickerStep';
import { screenLock } from '../../api/screenlock';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 4;

const FOCUS_APPS = [
  { id: 'phone', label: 'Phone', emoji: '\u{1F4DE}', locked: true },
  { id: 'messages', label: 'Messages', emoji: '\u{1F4AC}', locked: true },
  { id: 'gmail', label: 'Gmail', emoji: '\u{2709}\u{FE0F}', locked: false },
  { id: 'youtube', label: 'YouTube', emoji: '\u{1F4FA}', locked: false },
  { id: 'maps', label: 'Maps', emoji: '\u{1F5FA}\u{FE0F}', locked: false },
  { id: 'music', label: 'Music', emoji: '\u{1F3B5}', locked: false },
  { id: 'calculator', label: 'Calculator', emoji: '\u{1F522}', locked: false },
  { id: 'camera', label: 'Camera', emoji: '\u{1F4F7}', locked: false },
  { id: 'clock', label: 'Clock', emoji: '\u{23F0}', locked: false },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  // Default times: 07:00 for wake-up, 20:00 for bedtime
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('20:00');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [allowedApps, setAllowedApps] = useState<string[]>(['phone', 'messages', 'gmail']);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const toggleApp = (id: string) => {
    const app = FOCUS_APPS.find(a => a.id === id);
    if (app?.locked) return; // Phone & Messages are always allowed
    setAllowedApps(prev => {
      if (prev.includes(id)) return prev.filter(a => a !== id);
      if (prev.length >= 3) return prev; // Max 3 apps
      return [...prev, id];
    });
  };

  const handleFinish = async () => {
    const appLabels = allowedApps.map(id => FOCUS_APPS.find(a => a.id === id)?.label || id);
    screenLock.setAllowedApps(appLabels);

    await storage.setUserPreferences({
      wakeUpTime,
      bedTime,
      defaultGoal: selectedGoals[0] || '',
      theme: 'dark',
      onboardingComplete: true,
      isPremium: false,
      allowedApps,
      allowLockScreenTimer: true,
    });

    // On Android, proactively ask for Device Admin permission once during onboarding
    if (Platform.OS === 'android') {
      Alert.alert(
        'Enable Screen Lock',
        'HabitGen can lock your phone during focus and sleep sessions so you stay fully focused.\n\n' +
          '\u2022 This uses Android\u2019s Device Admin permission.\n' +
          '\u2022 You can always disable it later from system settings.\n\n' +
          'Would you like to enable this now?',
        [
          { text: 'Not Now', style: 'cancel', onPress: onComplete },
          {
            text: 'Enable',
            onPress: () => {
              screenLock.requestDeviceAdmin();
              onComplete();
            },
          },
        ],
      );
      return;
    }

    onComplete();
  };

  const canProceed = () => {
    if (step === 2) return selectedGoals.length > 0;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>{'\u{2600}\u{FE0F}'}</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              When do you wake up?
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              We'll schedule your habits around your routine
            </Text>
            <WakeTimePickerStep value={wakeUpTime} onChange={setWakeUpTime} />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>{'\u{1F319}'}</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              When do you go to bed?
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              This helps us set reasonable goals for your day
            </Text>
            <BedTimePickerStep value={bedTime} onChange={setBedTime} />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>{'\u{1F3AF}'}</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              What are your goals?
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Select one or more to get started
            </Text>
            <View style={styles.goalsGrid}>
              {GOALS.map(goal => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => toggleGoal(goal.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                    <Text
                      style={[
                        styles.goalLabel,
                        { color: isSelected ? '#FFF' : theme.colors.text },
                      ]}>
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>{'\u{1F512}'}</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Focus Mode Apps
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Choose up to 3 apps accessible during focus sessions (Phone + Messages + one more).
              Phone and Messages are always allowed.
            </Text>
            <View style={styles.appsGrid}>
              {FOCUS_APPS.map(app => {
                const isSelected = allowedApps.includes(app.id);
                const isLocked = app.locked;
                return (
                  <TouchableOpacity
                    key={app.id}
                    style={[
                      styles.appCard,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                        opacity: isLocked ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => toggleApp(app.id)}
                    activeOpacity={0.7}
                    disabled={isLocked}>
                    <Text style={styles.appEmoji}>{app.emoji}</Text>
                    <Text
                      style={[
                        styles.appLabel,
                        { color: isSelected ? '#FFF' : theme.colors.text },
                      ]}>
                      {app.label}
                    </Text>
                    {isLocked && (
                      <Text style={[styles.appRequired, { color: isSelected ? '#FFF' : theme.colors.textMuted }]}>
                        Required
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.appNote, { color: theme.colors.textMuted }]}>
              {allowedApps.length}/3 apps selected
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top bar with back chevron (steps > 0) + centered progress dots */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep(s => s - 1)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backArrow}>{'\u276E'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.progressContainer}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i <= step ? theme.colors.primary : theme.colors.border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Navigation button (full-width like first screen) */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed()
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
          onPress={() => {
            if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
            else handleFinish();
          }}
          disabled={!canProceed()}>
          <Text style={styles.nextButtonText}>
            {step < TOTAL_STEPS - 1 ? 'Continue' : "Let's Go!"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Extra top padding so progress dots always sit clearly below
    // camera/notch areas (e.g. Pixel 9, iPhone Dynamic Island)
    paddingTop: Platform.OS === 'ios' ? 80 : 64,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  topBarLeft: {
    position: 'absolute',
    left: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '200',
    includeFontPadding: false,
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  stepContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  stepEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  goalCard: {
    width: (width - 76) / 3,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  appCard: {
    width: (width - 76) / 3,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  appLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  appRequired: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  appNote: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 60,
    paddingTop: 12,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
