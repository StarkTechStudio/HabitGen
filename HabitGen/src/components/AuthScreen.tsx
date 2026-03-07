import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';

type AuthMode = 'login' | 'signup' | 'verify';

interface AuthScreenProps {
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await signIn(email.trim(), password);
        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          onClose();
        }
      } else {
        const result = await signUp(email.trim(), password);
        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          // After signup, show verification screen
          setMode('verify');
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            client_id: '506503251834-mvkrt8qs19g7eufms57mratf1r3rn1cp.apps.googleusercontent.com',
          },
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      Alert.alert('Sent', 'Verification email resent. Check your inbox.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to resend.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          Alert.alert('Not Verified', 'Please verify your email first.');
        } else {
          throw error;
        }
      } else if (data.user) {
        Alert.alert('Success', 'Email verified! Redirecting...');
        setTimeout(onClose, 1000);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Verification check failed.');
    } finally {
      setLoading(false);
    }
  };

  // Email verification screen
  if (mode === 'verify') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.verifyContainer}>
          <Text style={styles.verifyEmoji}>{'\u{1F4E7}'}</Text>
          <Text style={[styles.verifyTitle, { color: theme.colors.text }]}>
            Verify Your Email
          </Text>
          <Text style={[styles.verifyText, { color: theme.colors.textSecondary }]}>
            We've sent a verification link to:
          </Text>
          <Text style={[styles.verifyEmail, { color: theme.colors.primary }]}>
            {email}
          </Text>
          <Text style={[styles.verifyInstructions, { color: theme.colors.textMuted }]}>
            Please click the link in your email to verify your account.
            Once verified, tap the button below.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCheckVerification}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleResendVerification}
            disabled={loading}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              Resend Verification Email
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {mode === 'login'
              ? 'Sign in to sync your habits'
              : 'Sign up to sync across devices'}
          </Text>

          {/* Google OAuth button */}
          <TouchableOpacity
            style={[styles.googleButton, { borderColor: theme.colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={loading}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Name field for signup */}
          {mode === 'signup' && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEmailAuth}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeText: { fontSize: 16, fontWeight: '500' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 16 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 28 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleButtonText: { fontSize: 15, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13 },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14 },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, fontWeight: '600' },
  verifyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  verifyEmoji: { fontSize: 64, marginBottom: 20 },
  verifyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  verifyText: { fontSize: 15, textAlign: 'center', marginBottom: 6 },
  verifyEmail: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
  verifyInstructions: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
});

export default AuthScreen;
