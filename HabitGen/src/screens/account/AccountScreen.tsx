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
import Svg, { Path } from 'react-native-svg';
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
    icon: string;
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
            { label: userName, icon: 'person', onPress: () => {} },
            { label: `${user.email}`, icon: 'mail', onPress: () => {} },
            {
              label: 'Sign Out',
              icon: 'logout',
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
            { label: 'Sign In / Sign Up', icon: 'login', onPress: () => setShowAuth(true) },
          ],
    },
    {
      title: 'Premium',
      items: isPremium
        ? [
            {
              label: 'Premium Active',
              icon: 'crown',
              onPress: () => Alert.alert('Premium', 'You have full access to all premium features!'),
              accent: true,
            },
            {
              label: 'Manage Subscription',
              icon: 'settings',
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
              icon: 'refresh',
              onPress: async () => {
                const restored = await revenueCatService.restorePurchases();
                Alert.alert(
                  restored ? 'Restored' : 'No Purchases Found',
                  restored ? 'Your premium access has been restored.' : 'No previous purchases found.',
                );
                refreshPremium();
              },
            },
          ]
        : [
            {
              label: 'Upgrade to Premium',
              icon: 'star',
              onPress: () => {
                if (!user) {
                  Alert.alert('Sign in required', 'Please sign in or create an account before upgrading to Premium.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => setShowAuth(true) },
                  ]);
                  return;
                }
                setShowPremium(true);
              },
              accent: true,
            },
            {
              label: 'Restore Purchases',
              icon: 'refresh',
              onPress: async () => {
                const restored = await revenueCatService.restorePurchases();
                Alert.alert(
                  restored ? 'Restored' : 'No Purchases Found',
                  restored ? 'Your premium access has been restored.' : 'No previous purchases found.',
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
          icon: themeMode === 'dark' ? 'moon' : 'sun',
          onPress: toggleTheme,
          rightText: 'Toggle',
        },
      ],
    },
    {
      title: 'Schedule',
      items: [
        { label: 'Wake Up Time', icon: 'sun', onPress: () => setEditTimeType('wake'), rightText: wakeUpTime },
        { label: 'Bed Time', icon: 'moon', onPress: () => setEditTimeType('bed'), rightText: bedTime },
      ],
    },
    {
      title: 'Data',
      items: [
        { label: 'Clear All Data', icon: 'trash', onPress: handleClearData, destructive: true },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'HabitGen v1.0.0', icon: 'info', onPress: () => {} },
        { label: 'Rate HabitGen', icon: 'heart', onPress: () => Alert.alert('Thanks!', 'Rating feature will open your app store.') },
      ],
    },
  ];

  const getIconSvg = (icon: string, color: string) => {
    switch (icon) {
      case 'person':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'mail':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'logout':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'login':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'crown':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zM5 20h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'star':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'settings':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={1.8} /><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={1.8} /></Svg>;
      case 'refresh':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'sun':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'moon':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'trash':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'info':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      case 'heart':
        return <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + bottomSafe }]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z" fill={theme.colors.primary} />
            </Svg>
            <Text style={[styles.brandName, { color: theme.colors.primary }]}>Habitgen</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>Account</Text>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={theme.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
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
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
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
                  <View style={styles.settingIconWrap}>
                    {getIconSvg(
                      item.icon,
                      item.destructive
                        ? theme.colors.error
                        : item.accent
                        ? theme.colors.accent
                        : theme.colors.primary,
                    )}
                  </View>
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

      <Modal visible={editTimeType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editTimeType === 'wake' ? 'Wake Up Time' : 'Bed Time'}
            </Text>
            {editTimeType === 'wake' && (
              <WakeTimePickerStep value={wakeUpTime} onChange={setWakeUpTime} />
            )}
            {editTimeType === 'bed' && (
              <BedTimePickerStep value={bedTime} onChange={setBedTime} />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={() => setEditTimeType(null)}>
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  title: { fontSize: 32, fontWeight: '900', marginBottom: 18, letterSpacing: -0.5 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: { marginLeft: 14 },
  profileName: { fontSize: 17, fontWeight: '800' },
  profileSub: { fontSize: 12, marginTop: 2 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
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
    fontWeight: '800',
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
  modalButtonPrimary: { borderWidth: 0 },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  modalButtonTextPrimary: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});

export default AccountScreen;
