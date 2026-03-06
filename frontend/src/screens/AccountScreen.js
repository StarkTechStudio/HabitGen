import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase';
import { storage } from '../services/storage';
import PaywallModal from '../components/PaywallModal';

export default function AccountScreen() {
  const { user, setUser, isPremium, setIsPremium, preferences, habits } = useApp();
  const [paywall, setPaywall] = useState(false);
  const [notifs, setNotifs] = useState(true);
  // Login state
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess('Account created! Check email to verify.');
        setIsSignUp(false);
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setUser({ email, id: data.user?.id, accessToken: data.session?.access_token });
        setShowLogin(false); setEmail(''); setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Auth failed');
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleClear = () => {
    const doClear = async () => { await storage.clearAll(); if (Platform.OS === 'web') window.location.reload(); };
    if (Platform.OS === 'web') { if (window.confirm('Delete all data?')) doClear(); }
    else Alert.alert('Clear Data', 'Delete all habits, sessions, and preferences?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: doClear }]);
  };

  return (
    <SafeAreaView style={styles.safe} testID="account-screen">
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>ACCOUNT</Text>
        <Text style={styles.sub}>Manage your settings</Text>

        {/* Profile */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'H'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.email || 'Guest User'}</Text>
              <Text style={styles.profileSub}>{isPremium ? 'Premium' : 'Free'} · {habits.length} habits</Text>
            </View>
            {isPremium && <Feather name="award" size={20} color={C.primary} />}
          </View>
        </View>

        {/* Login / Logout */}
        {!user && !showLogin && (
          <TouchableOpacity style={styles.loginBtn} onPress={() => setShowLogin(true)} testID="show-login-btn">
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.loginBtnText}>Sign In to Sync Data</Text>
          </TouchableOpacity>
        )}

        {showLogin && !user && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={C.textFaint} style={styles.inputIcon} />
              <TextInput testID="email-input" style={styles.input} value={email} onChangeText={setEmail}
                placeholder="Email" placeholderTextColor={C.textFaint} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color={C.textFaint} style={styles.inputIcon} />
              <TextInput testID="password-input" style={[styles.input, { flex: 1 }]} value={password} onChangeText={setPassword}
                placeholder="Password" placeholderTextColor={C.textFaint} secureTextEntry={!showPw} />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} testID="toggle-password">
                <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color={C.textFaint} />
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.error} testID="auth-error">{error}</Text> : null}
            {success ? <Text style={styles.success} testID="auth-success">{success}</Text> : null}
            <TouchableOpacity style={styles.fireBtn} onPress={handleAuth} disabled={loading} testID="auth-submit-btn">
              {loading ? <Text style={styles.fireBtnText}>...</Text> :
                <Text style={styles.fireBtnText}>{isSignUp ? 'SIGN UP' : 'SIGN IN'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }} testID="toggle-auth-mode">
              <Text style={styles.toggleText}>{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowLogin(false)}>
              <Text style={[styles.toggleText, { marginTop: 8 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upgrade */}
        {!isPremium && (
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => setPaywall(true)} testID="upgrade-btn">
            <Feather name="award" size={20} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeBtnTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeBtnSub}>No ads, journeys, analytics & more</Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
        {isPremium && (
          <View style={styles.card}>
            <View style={styles.premRow}>
              <Feather name="award" size={18} color={C.primary} />
              <View style={{ flex: 1 }}><Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Premium Active</Text></View>
              <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ACTIVE</Text></View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => setNotifs(!notifs)} testID="notification-toggle">
            <Feather name={notifs ? 'bell' : 'bell-off'} size={18} color={notifs ? C.primary : C.textFaint} />
            <Text style={styles.settingText}>Notifications</Text>
            <View style={[styles.toggle, notifs && styles.toggleOn]}>
              <View style={[styles.toggleDot, notifs && styles.toggleDotOn]} />
            </View>
          </TouchableOpacity>
          {preferences && (
            <>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Feather name="sun" size={18} color={C.yellow} />
                <Text style={styles.settingText}>Wake Up</Text>
                <Text style={styles.settingVal}>{preferences.wakeUpTime}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Feather name="moon" size={18} color={C.purple} />
                <Text style={styles.settingText}>Bed Time</Text>
                <Text style={styles.settingVal}>{preferences.bedTime}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <Feather name="target" size={18} color={C.primary} />
                <Text style={styles.settingText}>Primary Goal</Text>
                <Text style={[styles.settingVal, { textTransform: 'capitalize' }]}>{preferences.defaultGoal}</Text>
              </View>
            </>
          )}
        </View>

        {/* Danger */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {user && (
            <>
              <TouchableOpacity style={styles.settingRow} onPress={handleLogout} testID="sign-out-btn">
                <Feather name="log-out" size={18} color={C.textMuted} />
                <Text style={styles.settingText}>Sign Out</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )}
          <TouchableOpacity style={styles.settingRow} onPress={handleClear} testID="clear-data-btn">
            <Feather name="trash-2" size={18} color={C.destructive} />
            <Text style={[styles.settingText, { color: C.destructive }]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>HabitGen v1.0.0</Text>
      </ScrollView>
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} onSubscribe={() => { setIsPremium(true); setPaywall(false); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, padding: 16, paddingTop: 20 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  sub: { color: C.textMuted, fontSize: 14, marginBottom: 20 },
  card: { backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  profileName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  profileSub: { color: C.textFaint, fontSize: 12, marginTop: 2 },
  loginBtn: { flexDirection: 'row', height: 52, borderRadius: 26, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, height: 48, paddingHorizontal: 14, marginBottom: 10 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  error: { color: C.destructive, fontSize: 12, marginBottom: 8 },
  success: { color: C.secondary, fontSize: 12, marginBottom: 8 },
  fireBtn: { height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  fireBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  toggleText: { color: C.textMuted, fontSize: 13, textAlign: 'center' },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: C.primary, borderRadius: 18, marginBottom: 12 },
  upgradeBtnTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  upgradeBtnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  premRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeBadge: { backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { color: C.secondary, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  sectionLabel: { color: C.textFaint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  settingText: { flex: 1, color: '#fff', fontSize: 14 },
  settingVal: { color: C.textMuted, fontSize: 14 },
  divider: { height: 1, backgroundColor: 'rgba(39,39,42,0.4)', marginHorizontal: -16, paddingHorizontal: 16 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: C.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: C.primary },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleDotOn: { alignSelf: 'flex-end' },
  version: { color: C.textFaint, fontSize: 11, textAlign: 'center', marginTop: 16, marginBottom: 8 },
});
