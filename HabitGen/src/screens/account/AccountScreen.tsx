import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { useHabits } from '../../context/HabitContext';
import AuthScreen from '../../components/AuthScreen';
import PremiumScreen from '../../components/PremiumScreen';
import WakeTimePickerStep from '../../components/WakeTimePickerStep';
import BedTimePickerStep from '../../components/BedTimePickerStep';
import { usePremium } from '../../../App';
import { revenueCatService } from '../../api/revenuecat';
import RevenueCatUI from 'react-native-purchases-ui';


const AccountScreen: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { refreshData } = useHabits();
  const { isPremium, refreshPremium } = usePremium();
  const [showAuth, setShowAuth] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [editTimeType, setEditTimeType] = useState<'wake' | 'bed' | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    storage.getUserPreferences().then(prefs => {
      if (prefs.wakeUpTime) setWakeUpTime(prefs.wakeUpTime);
      if (prefs.bedTime) setBedTime(prefs.bedTime);
    });
  }, []);
  const bottomSafe = Platform.OS === 'android' ? Math.max(insets.bottom, 24) : insets.bottom;

  if (showAuth) {
    return <AuthScreen onClose={() => setShowAuth(false)} />;
  }

  if (showPremium) {
    return (
      <PremiumScreen
        onClose={() => setShowPremium(false)}
        onPurchased={() => {
          setShowPremium(false);
          refreshPremium();
        }}
      />
    );
  }

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL your habits, sessions, streaks, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            await refreshData();
            Alert.alert('Data Cleared', 'All habits, streaks, and sessions have been deleted. Restart the app to begin fresh.');
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

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: user
        ? [
            {
              label: userName,
              emoji: '\u{1F464}',
              onPress: () => {},
            },
            {
              label: `${user.email}`,
              emoji: '\u{2709}\u{FE0F}',
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
      items: isPremium
        ? [
            {
              label: 'Premium Active',
              emoji: '\u{1F451}',
              onPress: () => Alert.alert('Premium', 'You have full access to all premium features!'),
              accent: true,
            },
            {
              label: 'Manage Subscription',
              emoji: '\u{2699}\u{FE0F}',
              onPress: async () => {
                try {
                  await RevenueCatUI.presentCustomerCenter();
                } catch (e) {
                  Alert.alert('Subscription', 'Manage your subscription in your device settings.');
                }
              },
            },
            {
              label: 'Restore Purchases',
              emoji: '\u{1F504}',
              onPress: async () => {
                const restored = await revenueCatService.restorePurchases();
                Alert.alert(
                  restored ? 'Restored' : 'No Purchases Found',
                  restored
                    ? 'Your premium access has been restored.'
                    : 'No previous purchases found.',
                );
                refreshPremium();
              },
            },
          ]
        : [
            {
              label: 'Upgrade to Premium',
              emoji: '\u{2B50}',
              onPress: () => {
                if (!user) {
                  Alert.alert(
                    'Sign in required',
                    'Please sign in or create an account before upgrading to Premium.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Sign In', onPress: () => setShowAuth(true) },
                    ],
                  );
                  return;
                }
                setShowPremium(true);
              },
              accent: true,
            },
            {
              label: 'Restore Purchases',
              emoji: '\u{1F504}',
              onPress: async () => {
                const restored = await revenueCatService.restorePurchases();
                Alert.alert(
                  restored ? 'Restored' : 'No Purchases Found',
                  restored
                    ? 'Your premium access has been restored.'
                    : 'No previous purchases found.',
                );
                refreshPremium();
              },
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
      title: 'Schedule',
      items: [
        {
          label: 'Wake Up Time',
          emoji: '\u{2600}\u{FE0F}',
          onPress: () => setEditTimeType('wake'),
          rightText: wakeUpTime,
        },
        {
          label: 'Bed Time',
          emoji: '\u{1F319}',
          onPress: () => setEditTimeType('bed'),
          rightText: bedTime,
        },
      ],
    },
    {
      title: 'Data',
      items: [
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + bottomSafe }]}
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

      <Modal
        visible={editTimeType !== null}
        transparent
        animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editTimeType === 'wake' ? 'Wake Up Time' : 'Bed Time'}
            </Text>
            {editTimeType === 'wake' && (
              <WakeTimePickerStep
                value={wakeUpTime}
                onChange={setWakeUpTime}
              />
            )}
            {editTimeType === 'bed' && (
              <BedTimePickerStep
                value={bedTime}
                onChange={setBedTime}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={() => setEditTimeType(null)}>
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
                onPress={async () => {
                  await storage.updateUserPreferences(
                    editTimeType === 'wake' ? { wakeUpTime } : { bedTime },
                  );
                  setEditTimeType(null);
                }}>
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 18 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 26 },
  profileInfo: { marginLeft: 14 },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileSub: { fontSize: 12, marginTop: 2 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  settingEmoji: { fontSize: 18, marginRight: 12 },
  settingLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  rightText: { fontSize: 12, fontWeight: '600' },
  bottomSpacer: { height: 24 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  modalButtonTextPrimary: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});

export default AccountScreen;
