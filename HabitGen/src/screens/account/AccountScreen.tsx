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
  Switch,
  Dimensions,
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

const { width } = Dimensions.get('window');

interface RowProps {
  emoji: string;
  emojiColor: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  theme: any;
}

function SettingRow({ emoji, emojiColor, label, sublabel, right, onPress, theme }: RowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, { backgroundColor: theme.colors.surface }]} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: `${emojiColor}20` }]}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
        {sublabel && <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>{sublabel}</Text>}
      </View>
      {right ?? <Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );
}

const AccountScreen: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { habits, sessions, refreshData } = useHabits();
  const { isPremium, refreshPremium } = usePremium();
  const [showAuth, setShowAuth] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [editTimeType, setEditTimeType] = useState<'wake' | 'bed' | null>(null);
  const [userName, setUserName] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    storage.getUserPreferences().then(prefs => {
      if (prefs.wakeUpTime) setWakeUpTime(prefs.wakeUpTime);
      if (prefs.bedTime) setBedTime(prefs.bedTime);
      if (prefs.name) setUserName(prefs.name);
    });
  }, []);

  const bottomSafe = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 0);
  const topInset = insets.top + (Platform.OS === 'web' ? 0 : 0);

  const totalStreak = Math.max(0, ...habits.map(h => h.streak || 0));
  const completedSessions = sessions.filter(s => s.completed).length;
  const avatarLetter = (userName || user?.email || 'U')[0].toUpperCase();

  if (showAuth) return <AuthScreen onClose={() => setShowAuth(false)} />;

  if (showPremium) {
    return (
      <PremiumScreen
        onClose={() => setShowPremium(false)}
        onPurchased={() => { setShowPremium(false); refreshPremium(); }}
      />
    );
  }

  if (editTimeType === 'wake') {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: topInset }]}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setEditTimeType(null)} style={styles.pickerBack}>
            <Text style={[styles.pickerBackText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Wake Up Time ☀️</Text>
        </View>
        <WakeTimePickerStep value={wakeUpTime} onChange={v => { setWakeUpTime(v); storage.updateUserPreferences({ wakeUpTime: v }); }} theme={theme} />
        <TouchableOpacity style={[styles.pickerDone, { backgroundColor: theme.colors.primary }]} onPress={() => setEditTimeType(null)}>
          <Text style={styles.pickerDoneText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (editTimeType === 'bed') {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: topInset }]}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setEditTimeType(null)} style={styles.pickerBack}>
            <Text style={[styles.pickerBackText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Bedtime 🌙</Text>
        </View>
        <BedTimePickerStep value={bedTime} onChange={v => { setBedTime(v); storage.updateUserPreferences({ bedTime: v }); }} theme={theme} />
        <TouchableOpacity style={[styles.pickerDone, { backgroundColor: theme.colors.primary }]} onPress={() => setEditTimeType(null)}>
          <Text style={styles.pickerDoneText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* Fixed header */}
      <View style={[styles.header, { paddingTop: topInset, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Account</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomSafe + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View style={[styles.profileHero, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <View>
            <Text style={styles.heroName}>{userName || (user ? user.email?.split('@')[0] : 'Friend')}</Text>
            <Text style={styles.heroEmail}>{user?.email || 'Not signed in'}</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: totalStreak, label: 'Best Streak', emoji: '🔥' },
            { val: completedSessions, label: 'Sessions', emoji: '✅' },
            { val: habits.length, label: 'Habits', emoji: '📋' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Text style={[styles.statVal, { color: theme.colors.text }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Account section */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>ACCOUNT</Text>
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          {!user ? (
            <SettingRow emoji="🔑" emojiColor="#5B4FE8" label="Sign In / Create Account" sublabel="Sync your data across devices" onPress={() => setShowAuth(true)} theme={theme} />
          ) : (
            <>
              <SettingRow emoji="👤" emojiColor="#5B4FE8" label={user.email || 'Signed In'} sublabel="Your account" theme={theme} />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <SettingRow emoji="🚪" emojiColor="#FF5252" label="Sign Out" onPress={() => Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: signOut }])} theme={theme} />
            </>
          )}
        </View>

        {/* Premium */}
        {!isPremium && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>UPGRADE</Text>
            <View style={[styles.section, { borderColor: theme.colors.border }]}>
              <SettingRow emoji="⭐" emojiColor="#FFC107" label="Go Premium" sublabel="Unlock all features & remove ads" onPress={() => setShowPremium(true)} theme={theme} />
            </View>
          </>
        )}

        {/* Preferences */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>PREFERENCES</Text>
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <SettingRow
            emoji="🌙"
            emojiColor="#7B72F0"
            label="Dark Mode"
            sublabel={`Currently ${themeMode}`}
            right={<Switch value={themeMode === 'dark'} onValueChange={toggleTheme} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} thumbColor="#fff" />}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingRow emoji="☀️" emojiColor="#FFC107" label={`Wake up: ${wakeUpTime}`} sublabel="Tap to change" onPress={() => setEditTimeType('wake')} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingRow emoji="🌙" emojiColor="#7B72F0" label={`Bedtime: ${bedTime}`} sublabel="Tap to change" onPress={() => setEditTimeType('bed')} theme={theme} />
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <SettingRow emoji="ℹ️" emojiColor="#42A5F5" label="HabitGen" sublabel="Version 1.0.0 · com.starktechstudio.habitgen" theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingRow emoji="⭐" emojiColor="#FFC107" label="Rate the App" sublabel="Your feedback helps us improve" onPress={() => Alert.alert('Thanks!', 'Rating available in the App Store/Play Store.')} theme={theme} />
        </View>

        {/* Danger */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>DANGER ZONE</Text>
        <View style={[styles.section, { borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: '#FFF0F0' }]}
            onPress={() => Alert.alert('Clear All Data', 'This will permanently delete all habits, streaks, and sessions. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear Everything', style: 'destructive', onPress: async () => { await storage.clearAll?.(); refreshData(); } }])}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: '#FF525220' }]}>
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: '#FF5252' }]}>Clear All Data</Text>
              <Text style={[styles.rowSub, { color: '#FF525280' }]}>Delete all habits, streaks and history</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: '900',
  },
  scroll: { padding: 16 },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarLetter: { fontSize: 26, fontWeight: '900', color: '#fff' },
  heroName: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 2 },
  heroEmail: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '400' },
  premiumBadge: {
    backgroundColor: '#FFC107',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  premiumBadgeText: { fontSize: 11, fontWeight: '800', color: '#1A1A2E' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4,
  },
  section: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '700', marginBottom: 1 },
  rowSub: { fontSize: 12, fontWeight: '400' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  pickerBack: { padding: 4 },
  pickerBackText: { fontSize: 16, fontWeight: '700' },
  pickerTitle: { fontSize: 20, fontWeight: '800' },
  pickerDone: {
    margin: 20,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pickerDoneText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
