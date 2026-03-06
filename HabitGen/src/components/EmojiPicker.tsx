import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
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
      '\u{1F60E}', '\u{1F913}', '\u{1F929}', '\u{1F973}',
    ],
  },
  {
    name: 'Activities',
    emojis: [
      '\u{1F3AF}', '\u{1F3CB}\u{FE0F}', '\u{1F3C3}', '\u{1F6B4}', '\u{1F3CA}', '\u{1F9D8}',
      '\u{1F4AA}', '\u{1F3C6}', '\u{1F3C5}', '\u{26BD}', '\u{1F3C0}', '\u{1F3BE}',
      '\u{1F3B5}', '\u{1F3A8}', '\u{1F3AD}', '\u{1F3AE}', '\u{265F}\u{FE0F}', '\u{1F3B2}',
      '\u{1F3B3}', '\u{1F3B8}', '\u{1F3B9}', '\u{1F941}', '\u{1F3BA}', '\u{1F3BB}',
      '\u{1F57A}', '\u{1F483}', '\u{1F93C}', '\u{1F94A}', // Dancing, Boxing
      '\u{1F3C7}', '\u{1F6B5}', '\u{1F3C4}', '\u{26F7}\u{FE0F}', // Horse riding, MTB, Surfing, Skiing
      '\u{1F93A}', '\u{1F938}', '\u{1F6F9}', '\u{1F3CC}\u{FE0F}', // Fencing, Gymnastics, Skateboard, Golf
    ],
  },
  {
    name: 'Work',
    emojis: [
      '\u{1F4BB}', '\u{1F4BB}', '\u{2328}\u{FE0F}', '\u{1F5A5}\u{FE0F}', // Coding, Laptop, Keyboard, Desktop
      '\u{1F4C8}', '\u{1F4B9}', '\u{1F4B0}', '\u{1F4B5}', // Trading, Charts, Money
      '\u{1F3AC}', '\u{1F4F9}', '\u{1F399}\u{FE0F}', '\u{1F3A4}', // Content creation, Video, Podcast, Mic
      '\u{270F}\u{FE0F}', '\u{1F4DD}', '\u{1F4D6}', '\u{1F4DA}', // Writing, Notes, Books
      '\u{1F4F1}', '\u{1F4F7}', '\u{1F4A1}', '\u{1F52C}', // Phone, Camera, Idea, Microscope
      '\u{1F52D}', '\u{1F4CA}', '\u{231A}', '\u{23F0}', // Telescope, Charts, Watch, Alarm
      '\u{2699}\u{FE0F}', '\u{1F527}', '\u{1F4E6}', '\u{1F381}', // Gear, Wrench, Package, Gift
      '\u{1F5C2}\u{FE0F}', '\u{1F4CB}', '\u{1F4C5}', '\u{1F4CC}', // Folder, Clipboard, Calendar, Pin
    ],
  },
  {
    name: 'Transport',
    emojis: [
      '\u{1F697}', '\u{1F3CD}\u{FE0F}', '\u{1F6B2}', '\u{1F6F5}', // Car, Motorcycle, Bicycle, Scooter
      '\u{2708}\u{FE0F}', '\u{1F680}', '\u{1F6F8}', '\u{1F6A2}', // Plane, Rocket, UFO, Ship
      '\u{1F682}', '\u{1F68C}', '\u{1F695}', '\u{1F6B6}', // Train, Bus, Taxi, Walking
      '\u{1F3E0}', '\u{1F3D7}\u{FE0F}', '\u{26F2}', '\u{1F3DE}\u{FE0F}', // Home, Construction, Fountain, Park
      '\u{1F30D}', '\u{1F30A}', '\u{26F0}\u{FE0F}', '\u{1F3D4}\u{FE0F}', // Globe, Wave, Mountain, Snow Mt
    ],
  },
  {
    name: 'Nature',
    emojis: [
      '\u{2600}\u{FE0F}', '\u{1F319}', '\u{2B50}', '\u{1F31F}', '\u{1F308}', '\u{2601}\u{FE0F}',
      '\u{1F332}', '\u{1F33F}', '\u{1F33A}', '\u{1F33B}', '\u{1F341}', '\u{1F340}',
      '\u{1F525}', '\u{1F4A7}', '\u{26A1}', '\u{2744}\u{FE0F}',
      '\u{1F431}', '\u{1F436}', '\u{1F98B}', '\u{1F426}', '\u{1F42C}', '\u{1F984}',
      '\u{1F40E}', '\u{1F418}', '\u{1F981}', '\u{1F43B}', // Horse, Elephant, Lion, Bear
    ],
  },
  {
    name: 'Food',
    emojis: [
      '\u{1F34E}', '\u{1F34F}', '\u{1F34A}', '\u{1F34B}', '\u{1F34D}', '\u{1F353}',
      '\u{1F347}', '\u{1F349}', '\u{1F95D}', '\u{1F951}', '\u{1F373}', '\u{1F354}',
      '\u{1F355}', '\u{1F35C}', '\u{1F382}', '\u{2615}', '\u{1F375}', '\u{1F37A}',
      '\u{1F379}', '\u{1F378}', '\u{1F36B}', '\u{1F36D}', '\u{1F36A}', '\u{1F369}',
      '\u{1F96A}', '\u{1F9C3}', '\u{1F957}', '\u{1F35E}', // Sandwich, Juice, Salad, Bread
    ],
  },
  {
    name: 'Symbols',
    emojis: [
      '\u{2764}\u{FE0F}', '\u{1F9E1}', '\u{1F49B}', '\u{1F49A}', '\u{1F499}', '\u{1F49C}',
      '\u{1F5A4}', '\u{1F90D}', '\u{1F90E}', '\u{1F4AF}', '\u{1F4A5}', '\u{1F4AB}',
      '\u{2728}', '\u{1F31E}', '\u{1F4AA}', '\u{1F44D}', '\u{1F44A}', '\u{270C}\u{FE0F}',
      '\u{1F91E}', '\u{1F44F}', '\u{1F64C}', '\u{1F680}', '\u{1F48E}', '\u{1F3C1}',
      '\u{2705}', '\u{274C}', '\u{26A0}\u{FE0F}', '\u{267B}\u{FE0F}', // Check, X, Warning, Recycle
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}>
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
      </ScrollView>

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
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700' },
  categoryScroll: { marginBottom: 14 },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
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
