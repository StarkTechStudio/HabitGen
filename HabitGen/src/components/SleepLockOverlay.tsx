import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  BackHandler,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { screenLock } from '../api/screenlock';

interface SleepLockOverlayProps {
  onCancel: () => void;
}

const SleepLockOverlay: React.FC<SleepLockOverlayProps> = ({ onCancel }) => {
  const { theme } = useTheme();

  useEffect(() => {
    screenLock.startLock();
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      sub.remove();
      screenLock.stopLock();
    };
  }, []);

  return (
    <View style={[styles.overlay, { backgroundColor: '#0D0D0D' }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{'\u{1F634}'}</Text>
        <Text style={styles.title}>Sleeping time</Text>
        <Text style={styles.subtitle}>
          Your phone is locked for your sleep routine.
        </Text>
        <Text style={styles.hint}>
          Only Phone, Messages & Gmail are available until you cancel.
        </Text>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.error }]}
          onPress={onCancel}
          activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: theme.colors.error }]}>
            Cancel & Unlock
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  hint: {
    fontSize: 13,
    color: '#636366',
    textAlign: 'center',
    marginBottom: 32,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '700',
  },
});

export default SleepLockOverlay;
