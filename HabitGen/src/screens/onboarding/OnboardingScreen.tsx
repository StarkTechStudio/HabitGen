import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../utils/storage';
import { GOALS } from '../../types';
import TimePickerStep from '../../components/TimePickerStep';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const handleFinish = async () => {
    await storage.setUserPreferences({
      wakeUpTime,
      bedTime,
      defaultGoal: selectedGoals[0] || '',
      theme: 'dark',
      onboardingComplete: true,
      isPremium: false,
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
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {[0, 1, 2].map(i => (
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
            if (step < 2) setStep(s => s + 1);
            else handleFinish();
          }}
          disabled={!canProceed()}>
          <Text style={styles.nextButtonText}>
            {step < 2 ? 'Continue' : "Let's Go!"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  stepEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  goalCard: {
    width: (width - 72) / 3,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  goalEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 1.5,
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
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
