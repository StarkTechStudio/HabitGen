import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: [
      '\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F606}', '\u{1F605}',
      '\u{1F602}', '\u{1F923}', '\u{1F60A}', '\u{1F607}', '\u{1F642}', '\u{1F643}',
      '\u{1F609}', '\u{1F60C}', '\u{1F60D}', '\u{1F970}', '\u{1F618}', '\u{1F617}',
      '\u{1F619}', '\u{1F61A}', '\u{1F60B}', '\u{1F61B}', '\u{1F61C}', '\u{1F92A}',
    ],
  },
  {
    name: 'Activities',
    emojis: [
      '\u{1F3AF}', '\u{1F3CB}\u{FE0F}', '\u{1F3C3}', '\u{1F6B4}', '\u{1F3CA}', '\u{1F9D8}',
      '\u{1F4AA}', '\u{1F3C6}', '\u{1F3C5}', '\u{26BD}', '\u{1F3C0}', '\u{1F3BE}',
      '\u{1F3B5}', '\u{1F3A8}', '\u{1F3AD}', '\u{1F3AE}', '\u{265F}\u{FE0F}', '\u{1F3B2}',
      '\u{1F3B3}', '\u{1F3B8}', '\u{1F3B9}', '\u{1F941}', '\u{1F3BA}', '\u{1F3BB}',
    ],
  },
  {
    name: 'Objects',
    emojis: [
      '\u{1F4DA}', '\u{1F4BB}', '\u{270F}\u{FE0F}', '\u{1F4DD}', '\u{1F4D6}', '\u{1F4F1}',
      '\u{2328}\u{FE0F}', '\u{1F4F7}', '\u{1F4A1}', '\u{1F52C}', '\u{1F52D}', '\u{1F4CA}',
      '\u{231A}', '\u{23F0}', '\u{1F4B0}', '\u{1F3E0}', '\u{2708}\u{FE0F}', '\u{1F697}',
      '\u{1F6F8}', '\u{2699}\u{FE0F}', '\u{1F527}', '\u{1F4E6}', '\u{1F381}', '\u{1F3A9}',
    ],
  },
  {
    name: 'Nature',
    emojis: [
      '\u{2600}\u{FE0F}', '\u{1F319}', '\u{2B50}', '\u{1F31F}', '\u{1F308}', '\u{2601}\u{FE0F}',
      '\u{1F332}', '\u{1F33F}', '\u{1F33A}', '\u{1F33B}', '\u{1F341}', '\u{1F340}',
      '\u{1F30D}', '\u{1F30A}', '\u{1F525}', '\u{1F4A7}', '\u{26A1}', '\u{2744}\u{FE0F}',
      '\u{1F431}', '\u{1F436}', '\u{1F98B}', '\u{1F426}', '\u{1F42C}', '\u{1F984}',
    ],
  },
  {
    name: 'Food',
    emojis: [
      '\u{1F34E}', '\u{1F34F}', '\u{1F34A}', '\u{1F34B}', '\u{1F34D}', '\u{1F353}',
      '\u{1F347}', '\u{1F349}', '\u{1F95D}', '\u{1F951}', '\u{1F373}', '\u{1F354}',
      '\u{1F355}', '\u{1F35C}', '\u{1F382}', '\u{2615}', '\u{1F375}', '\u{1F37A}',
      '\u{1F379}', '\u{1F378}', '\u{1F36B}', '\u{1F36D}', '\u{1F36A}', '\u{1F369}',
    ],
  },
  {
    name: 'Symbols',
    emojis: [
      '\u{2764}\u{FE0F}', '\u{1F9E1}', '\u{1F49B}', '\u{1F49A}', '\u{1F499}', '\u{1F49C}',
      '\u{1F5A4}', '\u{1F90D}', '\u{1F90E}', '\u{1F4AF}', '\u{1F4A5}', '\u{1F4AB}',
      '\u{2728}', '\u{1F31E}', '\u{1F4AA}', '\u{1F44D}', '\u{1F44A}', '\u{270C}\u{FE0F}',
      '\u{1F91E}', '\u{1F44F}', '\u{1F64C}', '\u{1F680}', '\u{1F48E}', '\u{1F3C1}',
    ],
  },
];

const EMOJI_SIZE = (width - 48 - 42) / 7;

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
            {'\u{2190}'} Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Choose Emoji
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Category tabs */}
      <View style={styles.categoryRow}>
        {EMOJI_CATEGORIES.map((cat, i) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryTab,
              {
                backgroundColor:
                  selectedCategory === i
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor:
                  selectedCategory === i
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(i)}>
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === i ? '#FFF' : theme.colors.textSecondary,
                },
              ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emoji grid */}
      <FlatList
        data={EMOJI_CATEGORIES[selectedCategory].emojis}
        numColumns={7}
        keyExtractor={(item, idx) => `${item}_${idx}`}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.emojiCell, { width: EMOJI_SIZE, height: EMOJI_SIZE }]}
            onPress={() => onSelect(item)}>
            <Text style={styles.emojiText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700' },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: { fontSize: 12, fontWeight: '600' },
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emojiCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: { fontSize: 28 },
});

export default EmojiPicker;
