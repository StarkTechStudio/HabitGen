import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Habit, DEFAULT_SESSION_PRESETS, Difficulty, Priority, HabitMode } from '../types';
import { generateId } from '../utils/helpers';
import EmojiPicker from './EmojiPicker';
import DurationScrollWheel from './DurationScrollWheel';
import NotifyDurationFrequencyPicker from './NotifyDurationFrequencyPicker';
import PremiumScreen from './PremiumScreen';
import AuthScreen from './AuthScreen';
import { storage } from '../utils/storage';
import { usePremium } from '../../App';
import { useAuth } from '../context/AuthContext';

interface CreateHabitFormProps {
  onClose: () => void;
  editHabit?: Habit;
}

const CreateHabitForm: React.FC<CreateHabitFormProps> = ({ onClose, editHabit }) => {
  const { theme } = useTheme();
  const { addHabit, updateHabit, habits } = useHabits();
  const { isPremium, refreshPremium } = usePremium();
  const { user } = useAuth();
  const [name, setName] = useState(editHabit?.name || '');
  const [emoji, setEmoji] = useState(editHabit?.emoji || '\u{1F3AF}');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Habit mode: focus or notify (mandatory selection)
  const [habitMode, setHabitMode] = useState<HabitMode>(
    editHabit?.habitMode || 'focus',
  );
  // Single selection for preset duration
  const [selectedPreset, setSelectedPreset] = useState<number>(
    editHabit?.sessionPresets[0] || 30,
  );
  const [customDuration, setCustomDuration] = useState(
    editHabit?.customDuration || 30,
  );
  const [showCustomWheel, setShowCustomWheel] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(
    editHabit?.difficulty,
  );
  const [priority, setPriority] = useState<Priority | undefined>(
    editHabit?.priority,
  );
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Notify config state
  const [notifyDuration, setNotifyDuration] = useState(
    editHabit?.notifyConfig?.durationMinutes || 60,
  );
  const [notifyFrequency, setNotifyFrequency] = useState(
    editHabit?.notifyConfig?.frequencyCount || 1,
  );

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    // Check for duplicate habit name (case insensitive)
    const isDuplicate = habits.some(
      h => h.name.toLowerCase() === trimmedName.toLowerCase() && h.id !== editHabit?.id,
    );
    if (isDuplicate) {
      Alert.alert('Duplicate Habit', 'A habit with this name already exists. Please choose a different name.');
      return;
    }

    // Validate notify settings
    if (habitMode === 'notify') {
      if (notifyDuration < 15) {
        Alert.alert('Invalid Duration', 'Minimum notification duration is 15 minutes.');
        return;
      }
      if (notifyFrequency < 1 || notifyFrequency > 24) {
        Alert.alert('Invalid Frequency', 'Notification frequency must be between 1 and 24.');
        return;
      }
    }

    const habit: Habit = {
      id: editHabit?.id || generateId(),
      name: trimmedName,
      emoji,
      habitMode,
      sessionPresets: habitMode === 'focus'
        ? (showCustomWheel ? [customDuration] : [selectedPreset])
        : [],
      customDuration: habitMode === 'focus'
        ? (showCustomWheel ? customDuration : selectedPreset)
        : 0,
      difficulty,
      priority,
      createdAt: editHabit?.createdAt || new Date().toISOString(),
      ...(habitMode === 'notify' && {
        notifyConfig: {
          durationMinutes: notifyDuration,
          frequencyCount: notifyFrequency,
        },
      }),
    };

    if (editHabit) {
      await updateHabit(habit);
    } else {
      await addHabit(habit);
    }
    onClose();
  };

  if (showEmojiPicker) {
    return (
      <EmojiPicker
        onSelect={e => {
          setEmoji(e);
          setShowEmojiPicker(false);
        }}
        onClose={() => setShowEmojiPicker(false)}
      />
    );
  }

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
        }}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {editHabit ? 'Edit Habit' : 'New Habit'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveText, { color: theme.colors.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emoji selector */}
        <TouchableOpacity
          style={[styles.emojiSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => setShowEmojiPicker(true)}>
          <Text style={styles.selectedEmoji}>{emoji}</Text>
          <Text style={[styles.emojiHint, { color: theme.colors.textMuted }]}>
            Tap to change
          </Text>
        </TouchableOpacity>

        {/* Name input */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Habit Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Morning Meditation"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={50}
        />

        {/* ====== HABIT MODE SELECTOR (Mandatory) ====== */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Habit Mode
        </Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            onPress={() => setHabitMode('focus')}
            style={[
              styles.modeCard,
              {
                backgroundColor:
                  habitMode === 'focus'
                    ? theme.colors.primary + '18'
                    : theme.colors.surface,
                borderColor:
                  habitMode === 'focus'
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}>
            <Text style={styles.modeEmoji}>{'\u{1F3AF}'}</Text>
            <Text
              style={[
                styles.modeTitle,
                {
                  color:
                    habitMode === 'focus'
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}>
              Focus
            </Text>
            <Text
              style={[styles.modeDesc, { color: theme.colors.textMuted }]}>
              Timer & screen lock
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHabitMode('notify')}
            style={[
              styles.modeCard,
              {
                backgroundColor:
                  habitMode === 'notify'
                    ? theme.colors.primary + '18'
                    : theme.colors.surface,
                borderColor:
                  habitMode === 'notify'
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}>
            <Text style={styles.modeEmoji}>{'\u{1F514}'}</Text>
            <Text
              style={[
                styles.modeTitle,
                {
                  color:
                    habitMode === 'notify'
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}>
              Notify
            </Text>
            <Text
              style={[styles.modeDesc, { color: theme.colors.textMuted }]}>
              Recurring reminders
            </Text>
          </TouchableOpacity>
        </View>

        {/* ====== FOCUS MODE OPTIONS ====== */}
        {habitMode === 'focus' && (
          <>
            {/* Duration presets - SINGLE SELECTION */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Session Duration
            </Text>
            <View style={styles.presetsRow}>
              {DEFAULT_SESSION_PRESETS.map(mins => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: selectedPreset === mins && !showCustomWheel
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: selectedPreset === mins && !showCustomWheel
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPreset(mins);
                    setShowCustomWheel(false);
                  }}>
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color: selectedPreset === mins && !showCustomWheel
                          ? '#FFF'
                          : theme.colors.text,
                      },
                    ]}>
                    {mins} min
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: showCustomWheel
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: showCustomWheel
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => setShowCustomWheel(!showCustomWheel)}>
                <Text
                  style={[
                    styles.presetText,
                    { color: showCustomWheel ? '#FFF' : theme.colors.text },
                  ]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomWheel && (
              <DurationScrollWheel
                value={customDuration}
                onChange={setCustomDuration}
              />
            )}
          </>
        )}

        {/* ====== NOTIFY MODE OPTIONS ====== */}
        {habitMode === 'notify' && (
          <NotifyDurationFrequencyPicker
            durationMinutes={notifyDuration}
            frequencyCount={notifyFrequency}
            onDurationChange={setNotifyDuration}
            onFrequencyChange={setNotifyFrequency}
          />
        )}

        {/* Difficulty (Premium) */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Difficulty{' '}
          {!isPremium && <Text style={[styles.premiumTag, { color: theme.colors.accent }]}>PRO</Text>}
        </Text>
        {isPremium ? (
          <View style={styles.optionsRow}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficulty(d)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: difficulty === d ? theme.colors.primary : theme.colors.surface,
                    borderColor: difficulty === d ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.optionText,
                    { color: difficulty === d ? '#FFF' : theme.colors.text },
                  ]}>
                  {d === 'easy' ? '\u{1F7E2}' : d === 'medium' ? '\u{1F7E1}' : '\u{1F534}'}{' '}
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!user) {
                setShowAuth(true);
              } else {
                setShowPaywall(true);
              }
            }}>
            <View style={[styles.optionsRow, { opacity: 0.45 }]}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <View
                  key={d}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.textMuted },
                    ]}>
                    {d === 'easy' ? '\u{1F7E2}' : d === 'medium' ? '\u{1F7E1}' : '\u{1F534}'}{' '}
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.lockOverlay, { backgroundColor: theme.colors.accent + '15', borderColor: theme.colors.accent + '40' }]}>
              <Text style={[styles.lockText, { color: theme.colors.accent }]}>
                {'\u{1F512}'} Upgrade to PRO to unlock
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Priority (Premium) */}
        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          Priority{' '}
          {!isPremium && <Text style={[styles.premiumTag, { color: theme.colors.accent }]}>PRO</Text>}
        </Text>
        {isPremium ? (
          <View style={styles.optionsRow}>
            {(['low', 'medium', 'high'] as Priority[]).map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: priority === p ? theme.colors.primary : theme.colors.surface,
                    borderColor: priority === p ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.optionText,
                    { color: priority === p ? '#FFF' : theme.colors.text },
                  ]}>
                  {p === 'low' ? '\u{2B07}\u{FE0F}' : p === 'medium' ? '\u{27A1}\u{FE0F}' : '\u{2B06}\u{FE0F}'}{' '}
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!user) {
                setShowAuth(true);
              } else {
                setShowPaywall(true);
              }
            }}>
            <View style={[styles.optionsRow, { opacity: 0.45 }]}>
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <View
                  key={p}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.textMuted },
                    ]}>
                    {p === 'low' ? '\u{2B07}\u{FE0F}' : p === 'medium' ? '\u{27A1}\u{FE0F}' : '\u{2B06}\u{FE0F}'}{' '}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.lockOverlay, { backgroundColor: theme.colors.accent + '15', borderColor: theme.colors.accent + '40' }]}>
              <Text style={[styles.lockText, { color: theme.colors.accent }]}>
                {'\u{1F512}'} Upgrade to PRO to unlock
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  cancelText: { fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700' },
  emojiSelector: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  selectedEmoji: { fontSize: 56, marginBottom: 8 },
  emojiHint: { fontSize: 13 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  premiumTag: { fontSize: 10, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  // ---- Mode Selector ----
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 2,
  },
  modeEmoji: { fontSize: 30, marginBottom: 6 },
  modeTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  modeDesc: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  // ---- Presets ----
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  presetText: { fontSize: 15, fontWeight: '600' },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  optionChip: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  optionText: { fontSize: 14, fontWeight: '600' },
  lockOverlay: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  lockText: { fontSize: 13, fontWeight: '700' },
});

export default CreateHabitForm;
