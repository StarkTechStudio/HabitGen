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
} from 'react-native';
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
  { id: 'messages', label: 'Messages', emoji: '\u{1F4AC}' },
  { id: 'calculator', label: 'Calculator', emoji: '\u{1F5A9}' },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
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
    const secondOpt = SECOND_APP_OPTIONS.find(o => o.id === secondApp)!;
    const configs: AllowedAppConfig[] = [
      { id: 'phone', label: 'Phone', emoji: '\u{1F4DE}', launchType: 'phone' },
      { id: secondApp, label: secondOpt.label, emoji: secondOpt.emoji, launchType: secondApp as 'messages' | 'calculator' },
    ];
    if (selectedMusicApp) {
      configs.push({
        id: `music_${selectedMusicApp.packageName}`,
        label: selectedMusicApp.label,
        emoji: '\u{1F3B5}',
        launchType: 'music_package',
        packageName: selectedMusicApp.packageName,
      });
    }
    screenLock.setAppConfigs(configs);
    await storage.setUserPreferences({
      wakeUpTime,
      bedTime,
      defaultGoal: selectedGoals[0] || '',
      theme: 'dark',
      onboardingComplete: true,
      isPremium: false,
      allowedApps: configs.map(c => c.id),
      allowedAppConfigs: configs,
      allowLockScreenTimer: true,
    });
    onComplete();
  };

  const canProceed = () => {
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return selectedMusicApp !== null;
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
            <Text style={styles.stepEmoji}>{'\u{1F4F1}'}</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              Focus Mode Apps
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Choose 3 apps you can access while the timer is running
            </Text>

            {/* App 1: Phone (fixed) */}
            <View style={styles.appSection}>
              <Text style={[styles.appSectionLabel, { color: theme.colors.textSecondary }]}>
                App 1 — Always available
              </Text>
              <View style={[styles.fixedAppCard, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
                <Text style={styles.appCardEmoji}>{'\u{1F4DE}'}</Text>
                <Text style={[styles.appCardLabel, { color: theme.colors.text }]}>Phone</Text>
                <View style={[styles.lockedBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.lockedBadgeText}>Default</Text>
                </View>
              </View>
            </View>

            {/* App 2: Messages or Calculator */}
            <View style={styles.appSection}>
              <Text style={[styles.appSectionLabel, { color: theme.colors.textSecondary }]}>
                App 2 — Choose one
              </Text>
              <View style={styles.appOptionsRow}>
                {SECOND_APP_OPTIONS.map(opt => {
                  const isSelected = secondApp === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.appOptionCard,
                        {
                          backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setSecondApp(opt.id)}>
                      <Text style={styles.appCardEmoji}>{opt.emoji}</Text>
                      <Text style={[styles.appCardLabel, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* App 3: Music apps from device */}
            <View style={styles.appSection}>
              <Text style={[styles.appSectionLabel, { color: theme.colors.textSecondary }]}>
                App 3 — Choose a music app
              </Text>
              {loadingMusic ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
              ) : installedMusicApps.length === 0 ? (
                <Text style={[styles.noAppsText, { color: theme.colors.textSecondary }]}>
                  No music apps found on your device
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.musicScrollContent}>
                  {installedMusicApps.map(app => {
                    const isSelected = selectedMusicApp?.packageName === app.packageName;
                    return (
                      <TouchableOpacity
                        key={app.packageName}
                        style={[
                          styles.musicAppCard,
                          {
                            backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => setSelectedMusicApp(app)}>
                        <Text style={styles.appCardEmoji}>{'\u{1F3B5}'}</Text>
                        <Text
                          style={[
                            styles.musicAppLabel,
                            { color: isSelected ? theme.colors.primary : theme.colors.text },
                          ]}
                          numberOfLines={2}>
                          {app.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
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
  appSection: {
    width: '100%',
    marginBottom: 18,
  },
  appSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fixedAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  appCardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  appCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  lockedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  appOptionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  musicScrollContent: {
    paddingRight: 12,
    gap: 10,
  },
  musicAppCard: {
    width: (width - 76) / 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  musicAppLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  noAppsText: {
    fontSize: 14,
    textAlign: 'center',
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
