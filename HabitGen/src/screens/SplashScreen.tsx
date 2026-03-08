import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}>
        <Text style={styles.fireEmoji}>{'\u{1F525}'}</Text>
        <Text style={[styles.appName, { color: '#FFF' }]}>HabitGen</Text>
        <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.8)' }]}>
          Build better habits, one day at a time
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  logoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fireEmoji: {
    fontSize: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '400',
  },
});

export default SplashScreen;
