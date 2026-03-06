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
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import AuthScreen from '../../components/AuthScreen';
import PremiumScreen from '../../components/PremiumScreen';

const AccountScreen: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  if (showAuth) {
    return <AuthScreen onClose={() => setShowAuth(false)} />;
  }

  if (showPremium) {
    return (
      <PremiumScreen
        onClose={() => setShowPremium(false)}
        onPurchased={() => {
          setShowPremium(false);
          storage.updateUserPreferences({ isPremium: true });
        }}
      />
    );
  }

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your habits, sessions, and streaks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            Alert.alert('Done', 'All data has been cleared. Restart the app to begin fresh.');
          },
        },
      ],
    );
  };

  interface SettingItem {
    label: string;
    emoji: string;
    onPress: () => void;
    accent?: boolean;
    destructive?: boolean;
    rightText?: string;
  }

  interface SettingSection {
    title: string;
    items: SettingItem[];
  }

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: user
        ? [
            {
              label: `Signed in as ${user.email}`,
              emoji: '\u{2705}',
              onPress: () => {},
            },
            {
              label: 'Sign Out',
              emoji: '\u{1F6AA}',
              onPress: () => {
                Alert.alert('Sign Out', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', onPress: signOut, style: 'destructive' },
                ]);
              },
              destructive: true,
            },
          ]
        : [
            {
              label: 'Sign In / Sign Up',
              emoji: '\u{1F511}',
              onPress: () => setShowAuth(true),
            },
          ],
    },
    {
      title: 'Premium',
      items: [
        {
          label: 'Upgrade to Premium',
          emoji: '\u{2B50}',
          onPress: () => setShowPremium(true),
          accent: true,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          label: `Theme: ${themeMode === 'dark' ? 'Dark' : 'Light'}`,
          emoji: themeMode === 'dark' ? '\u{1F319}' : '\u{2600}\u{FE0F}',
          onPress: toggleTheme,
          rightText: 'Toggle',
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          label: 'Export Data',
          emoji: '\u{1F4E4}',
          onPress: () => Alert.alert('Export', 'Data export feature coming soon.'),
        },
        {
          label: 'Clear All Data',
          emoji: '\u{1F5D1}\u{FE0F}',
          onPress: handleClearData,
          destructive: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          label: 'HabitGen v1.0.0',
          emoji: '\u{1F4F1}',
          onPress: () => {},
        },
        {
          label: 'Rate HabitGen',
          emoji: '\u{2764}\u{FE0F}',
          onPress: () => Alert.alert('Thanks!', 'Rating feature will open your app store.'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Account</Text>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={styles.avatarText}>{'\u{1F525}'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>
              {user ? user.email?.split('@')[0] : 'HabitGen User'}
            </Text>
            <Text style={[styles.profileSub, { color: theme.colors.textMuted }]}>
              {user ? 'Synced' : 'Free Tier - Local Only'}
            </Text>
          </View>
        </View>

        {settingSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingRow,
                    idx < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.6}>
                  <Text style={styles.settingEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.settingLabel,
                      {
                        color: item.destructive
                          ? theme.colors.error
                          : item.accent
                          ? theme.colors.accent
                          : theme.colors.text,
                      },
                    ]}>
                    {item.label}
                  </Text>
                  {item.rightText && (
                    <Text style={[styles.rightText, { color: theme.colors.primary }]}>
                      {item.rightText}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 20 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 28 },
  profileInfo: { marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileSub: { fontSize: 13, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingEmoji: { fontSize: 20, marginRight: 14 },
  settingLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
  rightText: { fontSize: 13, fontWeight: '600' },
  bottomSpacer: { height: 100 },
});

export default AccountScreen;
