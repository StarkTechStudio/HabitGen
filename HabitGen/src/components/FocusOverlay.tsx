import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { screenLock } from '../api/screenlock';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const RING_SIZE = SCREEN_WIDTH * 0.58;

interface FocusOverlayProps {
  isActive: boolean;
  habitName: string;
  habitEmoji: string;
  timeRemaining: string;
  onRequestStop: () => void;
  /** Show break section (always shown when session has breaks) */
  showBreakSection: boolean;
  /** Button enabled only when a break is available in the current 30-min segment */
  breakButtonEnabled: boolean;
  remainingBreaks: number;
  onTakeBreak: () => void;
}

const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isActive,
  habitName,
  habitEmoji,
  timeRemaining,
  onRequestStop,
  showBreakSection,
  breakButtonEnabled,
  remainingBreaks,
  onTakeBreak,
}) => {
  const { theme } = useTheme();
  const allowedApps = screenLock.getAllowedApps();
  const opacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      screenLock.startLock();
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Rotating ring animation
      const rotate = Animated.loop(
        Animated.timing(ringRotate, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      );
      rotate.start();

      // Subtle pulse
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
      );
      pulse.start();

      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

      return () => {
        backHandler.remove();
        screenLock.stopLock();
        rotate.stop();
        pulse.stop();
      };
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, opacity, ringRotate, pulseScale]);

  if (!isActive) return null;

  const spin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={[styles.content, { backgroundColor: '#000' }]}>
        {/* iOS-style status pill */}
        <View style={styles.statusPill}>
          <View style={[styles.liveDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.statusText}>Focus Mode Active</Text>
        </View>

        {/* Center timer display */}
        <View style={styles.centerContent}>
          {/* Animated gradient ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ rotate: spin }],
              },
            ]}>
            <View style={[styles.ringSegment, styles.ringTop, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.ringSegment, styles.ringRight, { backgroundColor: theme.colors.primary + '60' }]} />
            <View style={[styles.ringSegment, styles.ringBottom, { backgroundColor: theme.colors.primary + '30' }]} />
            <View style={[styles.ringSegment, styles.ringLeft, { backgroundColor: theme.colors.primary + '15' }]} />
          </Animated.View>

          {/* Timer island */}
          <Animated.View
            style={[
              styles.timerIsland,
              {
                backgroundColor: '#1C1C1E',
                transform: [{ scale: pulseScale }],
              },
            ]}>
            <Text style={styles.islandEmoji}>{habitEmoji}</Text>
            <Text style={styles.islandTimer} selectable={false}>{timeRemaining}</Text>
            <Text style={[styles.islandLabel, { color: theme.colors.primary }]} selectable={false}>
              {habitName}
            </Text>
          </Animated.View>
        </View>

        {/* Break section: always fixed when session has breaks; button disabled until next 30 min after use */}
        {showBreakSection && (
          <View style={styles.breakSection}>
            <Text style={styles.breakRemainingText}>
              You have {remainingBreaks} break{remainingBreaks === 1 ? '' : 's'} left
            </Text>
            <TouchableOpacity
              style={[styles.breakButton, !breakButtonEnabled && styles.breakButtonDisabled]}
              onPress={breakButtonEnabled ? onTakeBreak : undefined}
              activeOpacity={breakButtonEnabled ? 0.8 : 1}
              disabled={!breakButtonEnabled}>
              <Text style={[styles.breakButtonText, !breakButtonEnabled && styles.breakButtonTextDisabled]}>
                {'\u2615'} Take 5 min Break
              </Text>
            </TouchableOpacity>
            <Text style={styles.breakHelperText}>
              Break available every 30 minutes.{'\n'}
              Unused breaks will expire automatically.
            </Text>
          </View>
        )}

        {/* Allowed apps section */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: '#1C1C1E' }]}>
            <Text style={styles.infoTitle}>Allowed during focus</Text>
            <View style={styles.allowedRow}>
              {allowedApps.slice(0, 3).map((app, i) => (
                <View key={app} style={[styles.allowedChip, { backgroundColor: '#1A3A1A' }]}>
                  <Text style={styles.allowedText}>
                    {app === 'Phone' ? '\u{1F4DE}' : app === 'Messages' ? '\u{1F4AC}' : app === 'Gmail' ? '\u{2709}\u{FE0F}' : ''} {app}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.blockedRow, { backgroundColor: '#3A1A1A', borderRadius: 10, padding: 8, marginTop: 6 }]}>
              <Text style={styles.blockedText}>
                {'\u{1F6AB}'} Social media apps are blocked
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <Text style={styles.warningText}>
            Stopping early will penalize your streak by 1 day
          </Text>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={onRequestStop}
            activeOpacity={0.7}>
            <Text style={styles.stopText}>Stop Timer & Unlock Screen</Text>
          </TouchableOpacity>
        </View>
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
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 58 : 44,
    paddingBottom: 12,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: RING_SIZE + 16,
    height: RING_SIZE + 16,
    borderRadius: (RING_SIZE + 16) / 2,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  ringSegment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
  },
  ringTop: { top: 0, left: 0, borderTopLeftRadius: (RING_SIZE + 16) / 2 },
  ringRight: { top: 0, right: 0, borderTopRightRadius: (RING_SIZE + 16) / 2 },
  ringBottom: { bottom: 0, right: 0, borderBottomRightRadius: (RING_SIZE + 16) / 2 },
  ringLeft: { bottom: 0, left: 0, borderBottomLeftRadius: (RING_SIZE + 16) / 2 },
  timerIsland: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  islandEmoji: { fontSize: 44, marginBottom: 8 },
  islandTimer: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 3,
  },
  islandLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  breakSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  breakRemainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  breakButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#34C759',
    backgroundColor: '#34C75920',
    alignItems: 'center',
  },
  breakButtonDisabled: {
    borderColor: '#48484A',
    backgroundColor: '#2C2C2E',
    opacity: 0.7,
  },
  breakButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34C759',
  },
  breakButtonTextDisabled: {
    color: '#8E8E93',
  },
  breakHelperText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 10,
  },
  allowedRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  allowedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  allowedText: { fontSize: 13, fontWeight: '600', color: '#34C759' },
  blockedRow: {},
  blockedText: { fontSize: 13, fontWeight: '600', color: '#FF453A' },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#636366',
    marginBottom: 14,
    textAlign: 'center',
  },
  stopButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF453A40',
    backgroundColor: '#FF453A10',
    alignItems: 'center',
  },
  stopText: { fontSize: 16, fontWeight: '600', color: '#FF453A' },
});

export default FocusOverlay;
