import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    const result = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  const handleGoogleAuth = () => {
    // Google OAuth requires native module setup
    // For Supabase, this would use supabase.auth.signInWithOAuth({ provider: 'google' })
    Alert.alert(
      'Google Sign In',
      'Google OAuth requires native module configuration.\n\n' +
        'To enable:\n' +
        '1. Configure Google OAuth in Supabase Dashboard\n' +
        '2. Add Google Sign-In SDK to your native project\n' +
        '3. Set up OAuth redirect URLs\n\n' +
        'For now, please use email/password authentication.',
      [{ text: 'OK' }],
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>{'\u{1F511}'}</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {isSignUp
            ? 'Sign up to sync your habits across devices'
            : 'Sign in to access your synced data'}
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '15' }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Google OAuth button */}
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={handleGoogleAuth}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={[styles.googleText, { color: theme.colors.text }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: loading
                ? theme.colors.textMuted
                : theme.colors.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}>
          <Text style={[styles.toggleText, { color: theme.colors.textSecondary }]}>
            {isSignUp
              ? 'Already have an account? '
              : "Don't have an account? "}
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  cancelText: { fontSize: 16, fontWeight: '500' },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: { fontSize: 13, textAlign: 'center' },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 10,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleText: { fontSize: 15, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    fontSize: 15,
    marginBottom: 12,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  toggleButton: { marginTop: 18 },
  toggleText: { fontSize: 13 },
});

export default AuthScreen;
