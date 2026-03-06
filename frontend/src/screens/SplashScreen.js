import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={styles.container} testID="splash-screen">
      <Feather name="trending-up" size={64} color={C.primary} style={{ marginBottom: 20 }} />
      <Text style={styles.title}>HABIT<Text style={styles.titleAccent}>GEN</Text></Text>
      <View style={styles.divider} />
      <Text style={styles.pledge}>"I am setting up a goal.{'\n'}I commit to complete it."</Text>
      <View style={styles.dots}>
        {[0,1,2].map(i => <View key={i} style={styles.dot} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  titleAccent: { color: C.primary },
  divider: { width: 48, height: 3, backgroundColor: C.primary, borderRadius: 2, marginVertical: 16 },
  pledge: { color: C.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 24, fontStyle: 'italic' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 48 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, opacity: 0.7 },
});
