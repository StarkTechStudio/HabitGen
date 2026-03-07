import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../utils/storage';
import { GOALS } from '../../types';
import TimePickerStep from '../../components/TimePickerStep';
import { screenLock } from '../../api/screenlock';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 4;

const FOCUS_APPS = [
  { id: 'phone', label: 'Phone', emoji: '\u{1F4DE}', locked: true },
  { id: 'messages', label: 'Messages', emoji: '\u{1F4AC}', locked: true },
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
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [allowedApps, setAllowedApps] = useState<string[]>(['phone', 'messages', 'youtube']);

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
    });
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
            <TimePickerStep value={wakeUpTime} onChange={setWakeUpTime} />
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
            <TimePickerStep value={bedTime} onChange={setBedTime} />
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
              Choose up to 3 apps accessible during focus sessions.
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
      {/* Progress indicator */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {step > 0 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            onPress={() => setStep(s => s - 1)}>
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed()
                ? theme.colors.primary
                : theme.colors.border,
              flex: step === 0 ? 1 : undefined,
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
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
