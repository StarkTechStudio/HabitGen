import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const journeys = [
  {
    id: '1',
    title: '30-Day Meditation',
    emoji: '\u{1F9D8}',
    description: 'Build a daily meditation practice from scratch',
    days: 30,
    premium: true,
  },
  {
    id: '2',
    title: 'Fitness Foundations',
    emoji: '\u{1F4AA}',
    description: 'Get moving with progressive daily workouts',
    days: 21,
    premium: true,
  },
  {
    id: '3',
    title: 'Reading Challenge',
    emoji: '\u{1F4D6}',
    description: 'Read for 20 minutes every day for a month',
    days: 30,
    premium: false,
  },
  {
    id: '4',
    title: 'Deep Focus Sprint',
    emoji: '\u{1F3AF}',
    description: 'Master deep work with daily focus sessions',
    days: 14,
    premium: true,
  },
  {
    id: '5',
    title: 'Morning Routine',
    emoji: '\u{2600}\u{FE0F}',
    description: 'Design and stick to a powerful morning ritual',
    days: 21,
    premium: true,
  },
  {
    id: '6',
    title: 'Hydration Habit',
    emoji: '\u{1F4A7}',
    description: 'Track and improve your daily water intake',
    days: 14,
    premium: false,
  },
];

const JourneyScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Journeys</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Follow guided programs to build lasting habits
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
            activeOpacity={0.7}>
            <View style={styles.journeyHeader}>
              <Text style={styles.journeyEmoji}>{journey.emoji}</Text>
              <View style={styles.journeyInfo}>
                <View style={styles.titleRow}>
                  <Text style={[styles.journeyTitle, { color: theme.colors.text }]}>
                    {journey.title}
                  </Text>
                  {journey.premium && (
                    <View style={[styles.premiumBadge, { backgroundColor: theme.colors.accent + '20' }]}>
                      <Text style={[styles.premiumText, { color: theme.colors.accent }]}>
                        PRO
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.journeyDesc, { color: theme.colors.textSecondary }]}>
                  {journey.description}
                </Text>
              </View>
            </View>
            <View style={[styles.journeyFooter, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.daysText, { color: theme.colors.textMuted }]}>
                {journey.days} days
              </Text>
              <Text style={[styles.startText, { color: theme.colors.primary }]}>
                {journey.premium ? 'Unlock' : 'Start'}  {'\u{2192}'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  journeyCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  journeyHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  journeyEmoji: { fontSize: 40, marginRight: 16 },
  journeyInfo: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  journeyTitle: { fontSize: 17, fontWeight: '700' },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumText: { fontSize: 10, fontWeight: '800' },
  journeyDesc: { fontSize: 14, lineHeight: 20 },
  journeyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  daysText: { fontSize: 13, fontWeight: '500' },
  startText: { fontSize: 14, fontWeight: '700' },
  bottomSpacer: { height: 100 },
});

export default JourneyScreen;
