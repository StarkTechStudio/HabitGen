import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect as SvgRect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import PremiumScreen from '../../components/PremiumScreen';
import TimePickerStep from '../../components/TimePickerStep';
import AuthScreen from '../../components/AuthScreen';
import { usePremium } from '../../../App';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import type { SleepSchedule } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface Journey {
  id: string;
  title: string;
  emoji: string;
  description: string;
  days: number;
  painPoint: string;
  features: string[];
  habitCount: number;
  gradient: string[];
}

const journeys: Journey[] = [
  {
    id: 'hydration',
    title: 'Hydration Habit',
    emoji: '\u{1F4A7}',
    description: 'Hourly water reminders with sound alarm. Never forget to hydrate.',
    days: 14,
    painPoint: 'Forgetting to drink enough water throughout the day',
    habitCount: 4,
    gradient: ['#0D7377', '#2DD4BF'],
    features: [
      'Hourly notification reminders',
      'Sound alarm with Complete/Cancel buttons',
      'Cancel penalizes streak (-1), Complete adds (+1)',
      'Daily water intake tracking',
    ],
  },
  {
    id: 'screen_detox',
    title: 'Digital Detox',
    emoji: '\u{1F4F5}',
    description: 'Reclaim your attention and reconnect with the physical world around you.',
    days: 21,
    painPoint: 'Spending too much time on social media and phone',
    habitCount: 5,
    gradient: ['#134E4A', '#0D7377'],
    features: [
      'Scheduled phone-free intervals',
      'Social media blocking reminders',
      'Mindful break suggestions',
      'Weekly screen time reports',
    ],
  },
  {
    id: 'sleep',
    title: 'Better Sleep',
    emoji: '\u{1F634}',
    description: 'Master your evening rituals for the deep, restorative rest you deserve.',
    days: 30,
    painPoint: 'Irregular sleep schedule and poor sleep quality',
    habitCount: 7,
    gradient: ['#1E3A5F', '#0D7377'],
    features: [
      'Bedtime wind-down alerts (30 min before)',
      'Blue light reminder notifications',
      'Morning wake-up consistency tracking',
      'Sleep quality self-rating',
    ],
  },
  {
    id: 'meditation',
    title: '30-Day Meditation',
    emoji: '\u{1F9D8}',
    description: 'Progressive daily sessions from 5 to 30 minutes.',
    days: 30,
    painPoint: 'Stress, anxiety, and inability to focus',
    habitCount: 6,
    gradient: ['#0D7377', '#5EEAD4'],
    features: [
      'Guided session lengths (5 min to 30 min)',
      'Daily mindfulness reminders',
      'Streak-based progression',
      'Calm breathing exercises',
    ],
  },
  {
    id: 'fitness',
    title: 'Fitness Kickstart',
    emoji: '\u{1F4AA}',
    description: 'Build a sustainable foundation for strength and vital energy.',
    days: 21,
    painPoint: 'Sedentary lifestyle and lack of exercise motivation',
    habitCount: 4,
    gradient: ['#134E4A', '#2DD4BF'],
    features: [
      'Daily workout reminders',
      'Progressive difficulty increase',
      'Rest day scheduling',
      'Body weight exercise routines',
    ],
  },
  {
    id: 'reading',
    title: 'Daily Reading',
    emoji: '\u{1F4D6}',
    description: 'Build a 20-minute daily reading habit with progress tracking.',
    days: 30,
    painPoint: 'Not reading enough or struggling to make time for books',
    habitCount: 4,
    gradient: ['#3D6B66', '#0D7377'],
    features: [
      'Daily reading time reminders',
      'Page/chapter tracking',
      'Reading streak calendar',
      'Book completion milestones',
    ],
  },
  {
    id: 'morning',
    title: 'Morning Routine',
    emoji: '\u{2600}\u{FE0F}',
    description: 'Start your day with purpose and stillness before the world wakes up.',
    days: 21,
    painPoint: 'Waking up groggy and rushing through mornings',
    habitCount: 6,
    gradient: ['#0D7377', '#134E4A'],
    features: [
      'Step-by-step morning checklist',
      'Wake-up alarm integration',
      'Morning journaling prompts',
      'Progress streak tracking',
    ],
  },
  {
    id: 'focus',
    title: 'Deep Focus Sprint',
    emoji: '\u{1F3AF}',
    description: 'Master deep work with Pomodoro-based focus sessions.',
    days: 14,
    painPoint: 'Constant distractions and inability to concentrate',
    habitCount: 4,
    gradient: ['#1E3A5F', '#2DD4BF'],
    features: [
      'Timed deep work blocks',
      'Distraction logging',
      'Break scheduling (5 min/30 min)',
      'Focus score tracking',
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude Journal',
    emoji: '\u{1F64F}',
    description: 'Daily gratitude practice for improved mental health.',
    days: 30,
    painPoint: 'Negative thinking patterns and lack of appreciation',
    habitCount: 3,
    gradient: ['#134E4A', '#5EEAD4'],
    features: [
      'Evening gratitude prompts',
      'Three things I\'m grateful for',
      'Weekly reflection summaries',
      'Mood improvement tracking',
    ],
  },
  {
    id: 'posture',
    title: 'Posture Correction',
    emoji: '\u{1F9CD}',
    description: 'Hourly posture check reminders with stretch exercises.',
    days: 14,
    painPoint: 'Back pain from poor sitting posture all day',
    habitCount: 3,
    gradient: ['#0D7377', '#3D6B66'],
    features: [
      'Hourly posture check alerts',
      'Quick stretch exercises',
      'Desk ergonomics tips',
      'Streak-based motivation',
    ],
  },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const JourneyScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isPremium, refreshPremium } = usePremium();
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [showSleepScheduleForm, setShowSleepScheduleForm] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState('22:00');
  const [sleepEndTime, setSleepEndTime] = useState('07:00');
  const [sleepDays, setSleepDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if (showSleepScheduleForm) {
      storage.getSleepSchedule().then(s => {
        if (s) {
          setSleepStartTime(s.startTime);
          setSleepEndTime(s.endTime);
          setSleepDays(s.days.length ? s.days : [0, 1, 2, 3, 4, 5, 6]);
        }
      });
    }
  }, [showSleepScheduleForm]);

  const toggleSleepDay = (day: number) => {
    setSleepDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b),
    );
  };

  const handleSaveSleepSchedule = async () => {
    const schedule: SleepSchedule = {
      enabled: true,
      startTime: sleepStartTime,
      endTime: sleepEndTime,
      days: sleepDays,
    };
    await storage.setSleepSchedule(schedule);
    setShowSleepScheduleForm(false);
    Alert.alert(
      'Sleep Schedule Set',
      `Your phone will be locked for sleeping from ${sleepStartTime} to ${sleepEndTime} on ${sleepDays.map(d => DAY_LABELS[d]).join(', ')}.\n\nYou can cancel the lock anytime when it activates.`,
    );
  };

  if (showAuth) {
    return <AuthScreen onClose={() => setShowAuth(false)} />;
  }

  if (showPaywall) {
    return (
      <PremiumScreen
        onClose={() => setShowPaywall(false)}
        onPurchased={() => {
          setShowPaywall(false);
          refreshPremium();
          if (selectedJourney) {
            Alert.alert(
              'Journey Unlocked!',
              `You can now start "${selectedJourney.title}". Notifications and reminders will be set up.`,
            );
          }
        }}
      />
    );
  }

  if (showSleepScheduleForm) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.sleepFormHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => setShowSleepScheduleForm(false)}>
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.sleepFormTitle, { color: theme.colors.text }]}>Better Sleep Routine</Text>
          <TouchableOpacity onPress={handleSaveSleepSchedule}>
            <Text style={[styles.saveText, { color: theme.colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.sleepFormContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sleepFormDesc, { color: theme.colors.textSecondary }]}>
            Your phone will be locked during this time. Only Phone, Messages & Gmail will be available. Tap Cancel when the lock is active to unlock.
          </Text>
          <Text style={[styles.sleepLabel, { color: theme.colors.textSecondary }]}>Start time (bedtime)</Text>
          <TimePickerStep value={sleepStartTime} onChange={setSleepStartTime} />
          <Text style={[styles.sleepLabel, { color: theme.colors.textSecondary }]}>End time (wake)</Text>
          <TimePickerStep value={sleepEndTime} onChange={setSleepEndTime} />
          <Text style={[styles.sleepLabel, { color: theme.colors.textSecondary }]}>Days of the week</Text>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((label, i) => {
              const selected = sleepDays.includes(i);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleSleepDay(i)}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}>
                  <Text style={[styles.dayChipText, { color: selected ? '#FFF' : theme.colors.text }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSaveSleepSchedule}>
            <Text style={styles.saveButtonText}>Save sleep schedule</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const handleJourneyPress = (journey: Journey) => {
    setSelectedJourney(journey);
    if (isPremium) {
      if (journey.id === 'sleep') {
        setShowSleepScheduleForm(true);
      } else {
        Alert.alert(
          `${journey.emoji} ${journey.title}`,
          `${journey.painPoint}\n\nThis ${journey.days}-day journey includes:\n${journey.features.map(f => `\u{2022} ${f}`).join('\n')}\n\nSet a daily reminder time to stay on track.`,
          [
            { text: 'Close', style: 'cancel' },
            {
              text: 'Start Journey',
              onPress: () => {
                Alert.alert(
                  'Journey Started!',
                  `${journey.emoji} ${journey.title} has been activated.\nDaily reminders will help you stay on track for ${journey.days} days.`,
                );
              },
            },
          ],
        );
      }
    } else {
      Alert.alert(
        `${journey.emoji} ${journey.title}`,
        `${journey.painPoint}\n\nThis ${journey.days}-day journey includes:\n${journey.features.map(f => `\u{2022} ${f}`).join('\n')}\n\nThis is a Premium feature.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock Premium',
            onPress: () => {
              if (!user) {
                setShowAuth(true);
              } else {
                setShowPaywall(true);
              }
            },
          },
        ],
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" fill={theme.colors.primary} />
            </Svg>
            <Text style={[styles.brandName, { color: theme.colors.primary }]}>Habitgen</Text>
          </View>
          <TouchableOpacity>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke={theme.colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.titleLine1, { color: theme.colors.text }]}>Curated</Text>
          <Text style={[styles.titleLine2, { color: theme.colors.primary }]}>Journeys</Text>
          <Text style={[styles.titleDesc, { color: theme.colors.textSecondary }]}>
            Transform your life through intentional collections designed by experts to help you find balance, clarity, and strength.
          </Text>
        </View>

        {/* Journey Cards */}
        {journeys.map(journey => (
          <TouchableOpacity
            key={journey.id}
            style={styles.journeyCard}
            activeOpacity={0.85}
            onPress={() => handleJourneyPress(journey)}>
            {/* Gradient background using Svg */}
            <View style={styles.journeyCardInner}>
              <Svg width={CARD_WIDTH} height={200} style={styles.journeyBgSvg}>
                <Defs>
                  <SvgLinearGradient id={`grad-${journey.id}`} x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={journey.gradient[0]} stopOpacity="0.95" />
                    <Stop offset="1" stopColor={journey.gradient[1]} stopOpacity="0.85" />
                  </SvgLinearGradient>
                </Defs>
                <SvgRect width={CARD_WIDTH} height={200} rx={20} fill={`url(#grad-${journey.id})`} />
              </Svg>
              <View style={styles.journeyCardContent}>
                <View style={styles.journeyBadge}>
                  <Text style={styles.journeyBadgeText}>{journey.habitCount} HABITS</Text>
                </View>
                <Text style={styles.journeyEmoji}>{journey.emoji}</Text>
                <Text style={styles.journeyTitle}>{journey.title}</Text>
                <Text style={styles.journeyDesc} numberOfLines={2}>{journey.description}</Text>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => handleJourneyPress(journey)}>
                  <Text style={styles.joinBtnText}>
                    {isPremium ? 'Join Journey' : 'Unlock Journey'}
                  </Text>
                </TouchableOpacity>
              </View>
              {!isPremium && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockBadgeText}>PRO</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Personalized Section */}
        <View style={styles.personalizedSection}>
          <Text style={[styles.personalizedTitle, { color: theme.colors.text }]}>
            Personalized for you
          </Text>

          <View style={[styles.personalizedCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.personalizedIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2l2.09 6.26L20 10.27l-4.91 3.82L16.18 22 12 18.27 7.82 22l1.09-7.91L4 10.27l5.91-2.01L12 2z" fill={theme.colors.primary} />
              </Svg>
            </View>
            <Text style={[styles.personalizedCardTitle, { color: theme.colors.text }]}>
              Smart Matching
            </Text>
            <Text style={[styles.personalizedCardDesc, { color: theme.colors.textSecondary }]}>
              Based on your activity, we suggest journeys that fill the gaps in your daily flow.
            </Text>
          </View>

          <View style={[styles.personalizedCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.personalizedIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={theme.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={[styles.personalizedCardTitle, { color: theme.colors.text }]}>
              Community Driven
            </Text>
            <Text style={[styles.personalizedCardDesc, { color: theme.colors.textSecondary }]}>
              Join over 10,000 others who have successfully completed these paths this month.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  titleLine1: {
    fontSize: 28,
    fontWeight: '700',
  },
  titleLine2: {
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  titleDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  journeyCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  journeyCardInner: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  journeyBgSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  journeyCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  journeyBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  journeyBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  journeyEmoji: {
    fontSize: 28,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  journeyTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  journeyDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  joinBtn: {
    backgroundColor: 'rgba(45, 212, 191, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  personalizedSection: {
    marginTop: 24,
  },
  personalizedTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 16,
  },
  personalizedCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  personalizedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  personalizedCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  personalizedCardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  bottomSpacer: { height: 100 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  // Sleep form styles (kept from original)
  sleepFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  cancelText: { fontSize: 16, fontWeight: '500' },
  sleepFormTitle: { fontSize: 18, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700' },
  sleepFormContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  sleepFormDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  sleepLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    marginBottom: 24,
  },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dayChipText: { fontSize: 13, fontWeight: '600' },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default JourneyScreen;
