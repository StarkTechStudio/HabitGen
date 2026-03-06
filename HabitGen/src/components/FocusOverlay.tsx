import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { screenLock } from '../api/screenlock';

const { width, height } = Dimensions.get('window');

interface FocusOverlayProps {
  isActive: boolean;
  habitName: string;
  habitEmoji: string;
  timeRemaining: string;
  onRequestStop: () => void;
}

const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isActive,
  habitName,
  habitEmoji,
  timeRemaining,
  onRequestStop,
}) => {
  const { theme } = useTheme();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isActive) {
      screenLock.startLock();
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Prevent hardware back button on Android
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Don't allow going back during focus mode
        return true;
      });

      return () => {
        backHandler.remove();
        screenLock.stopLock();
      };
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, opacity]);

  if (!isActive) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.emoji}>{habitEmoji}</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Focus Mode Active
        </Text>
        <Text style={[styles.habitName, { color: theme.colors.primary }]}>
          {habitName}
        </Text>
        <Text style={[styles.timer, { color: theme.colors.text }]}>
          {timeRemaining}
        </Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          Stay focused! Leaving now will penalize your streak.
        </Text>

        <TouchableOpacity
          style={[styles.stopButton, { borderColor: theme.colors.error }]}
          onPress={onRequestStop}>
          <Text style={[styles.stopText, { color: theme.colors.error }]}>
            Emergency Stop
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  habitName: { fontSize: 20, fontWeight: '600', marginBottom: 24 },
  timer: { fontSize: 56, fontWeight: '800', marginBottom: 24, fontVariant: ['tabular-nums'] },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  stopButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  stopText: { fontSize: 16, fontWeight: '700' },
});

export default FocusOverlay;
