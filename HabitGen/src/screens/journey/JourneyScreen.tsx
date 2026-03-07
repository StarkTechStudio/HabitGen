import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import PremiumScreen from '../../components/PremiumScreen';
import { usePremium } from '../../../App';

interface Journey {
  id: string;
  title: string;
  emoji: string;
  description: string;
  days: number;
  painPoint: string;
  features: string[];
}

const journeys: Journey[] = [
  {
    id: 'hydration',
    title: 'Hydration Habit',
    emoji: '\u{1F4A7}',
    description: 'Hourly water reminders with sound alarm. Never forget to hydrate.',
    days: 14,
    painPoint: 'Forgetting to drink enough water throughout the day',
    features: [
      'Hourly notification reminders',
      'Sound alarm with Complete/Cancel buttons',
      'Cancel penalizes streak (-1), Complete adds (+1)',
      'Daily water intake tracking',
    ],
  },
  {
    id: 'screen_detox',
    title: 'Screen Time Detox',
    emoji: '\u{1F4F5}',
    description: 'Reduce social media usage with timed lockouts and mindful breaks.',
    days: 21,
    painPoint: 'Spending too much time on social media and phone',
    features: [
      'Scheduled phone-free intervals',
      'Social media blocking reminders',
      'Mindful break suggestions',
      'Weekly screen time reports',
    ],
  },
  {
    id: 'sleep',
    title: 'Better Sleep Routine',
    emoji: '\u{1F634}',
    description: 'Wind-down reminders and consistent sleep schedule training.',
    days: 30,
    painPoint: 'Irregular sleep schedule and poor sleep quality',
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
    features: [
      'Guided session lengths (5 min to 30 min)',
      'Daily mindfulness reminders',
      'Streak-based progression',
      'Calm breathing exercises',
    ],
  },
  {
    id: 'fitness',
    title: 'Fitness Foundations',
    emoji: '\u{1F4AA}',
    description: 'Progressive daily workouts from beginner to intermediate.',
    days: 21,
    painPoint: 'Sedentary lifestyle and lack of exercise motivation',
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
    description: 'Design and stick to a powerful 60-minute morning ritual.',
    days: 21,
    painPoint: 'Waking up groggy and rushing through mornings',
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
    features: [
      'Hourly posture check alerts',
      'Quick stretch exercises',
      'Desk ergonomics tips',
      'Streak-based motivation',
    ],
  },
];

const JourneyScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isPremium, refreshPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

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

  const handleJourneyPress = (journey: Journey) => {
    setSelectedJourney(journey);
    if (isPremium) {
      Alert.alert(
        `${journey.emoji} ${journey.title}`,
        `${journey.painPoint}\n\nThis ${journey.days}-day journey includes:\n${journey.features.map(f => `\u{2022} ${f}`).join('\n')}`,
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Start Journey', onPress: () => Alert.alert('Coming Soon', 'Journey tracking is being developed.') },
        ],
      );
    } else {
      Alert.alert(
        `${journey.emoji} ${journey.title}`,
        `${journey.painPoint}\n\nThis ${journey.days}-day journey includes:\n${journey.features.map(f => `\u{2022} ${f}`).join('\n')}\n\nThis is a Premium feature.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock Premium',
            onPress: () => setShowPaywall(true),
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Journeys</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Guided programs for your biggest pain points
        </Text>

        {journeys.map(journey => (
          <TouchableOpacity
            key={journey.id}
            style={[
              styles.journeyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => handleJourneyPress(journey)}>
            <View style={styles.journeyHeader}>
              <Text style={styles.journeyEmoji}>{journey.emoji}</Text>
              <View style={styles.journeyInfo}>
                <View style={styles.titleRow}>
                  <Text style={[styles.journeyTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {journey.title}
                  </Text>
                  {!isPremium && (
                    <View style={[styles.premiumBadge, { backgroundColor: theme.colors.accent + '20' }]}>
                      <Text style={[styles.premiumText, { color: theme.colors.accent }]}>
                        {'\u{1F512}'} PRO
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.journeyDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {journey.description}
                </Text>
                <Text style={[styles.painPoint, { color: theme.colors.textMuted }]} numberOfLines={1}>
                  Pain point: {journey.painPoint}
                </Text>
              </View>
            </View>
            <View style={[styles.journeyFooter, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.daysText, { color: theme.colors.textMuted }]}>
                {journey.days} days
              </Text>
              <Text style={[styles.startText, { color: isPremium ? theme.colors.success : theme.colors.accent }]}>
                {isPremium ? 'Start \u{2192}' : 'Unlock \u{2192}'}
              </Text>
            </View>
            {/* Locked overlay - only for non-premium */}
            {!isPremium && (
              <View style={styles.lockIcon}>
                <Text style={{ fontSize: 16 }}>{'\u{1F512}'}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  journeyCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  journeyHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    opacity: 0.65,
  },
  journeyEmoji: { fontSize: 36, marginRight: 14 },
  journeyInfo: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  journeyTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumText: { fontSize: 10, fontWeight: '800' },
  journeyDesc: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  painPoint: { fontSize: 11, fontStyle: 'italic' },
  journeyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    opacity: 0.65,
  },
  daysText: { fontSize: 12, fontWeight: '500' },
  startText: { fontSize: 13, fontWeight: '700' },
  lockIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottomSpacer: { height: 100 },
});

export default JourneyScreen;
