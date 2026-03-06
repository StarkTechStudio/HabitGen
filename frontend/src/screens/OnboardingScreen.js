import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, CATEGORIES } from '../constants/theme';
import { useApp } from '../context/AppContext';

const HOURS_AM = Array.from({ length: 9 }, (_, i) => {
  const h = i + 4;
  return { value: `${String(h).padStart(2,'0')}:00`, label: `${h > 12 ? h-12 : h}:00 ${h < 12 ? 'AM' : 'PM'}` };
});
const HOURS_PM = [20,21,22,23,0,1,2].map(h => ({
  value: `${String(h).padStart(2,'0')}:00`,
  label: `${h === 0 ? 12 : h > 12 ? h-12 : h}:00 ${h < 12 && h !== 0 ? 'AM' : 'PM'}`
}));

export default function OnboardingScreen() {
  const { savePreferences, addHabit } = useApp();
  const [step, setStep] = useState(0);
  const [wakeUp, setWakeUp] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [goals, setGoals] = useState([]);
  const [primary, setPrimary] = useState(null);

  const toggle = (id) => {
    setGoals(prev => {
      if (prev.includes(id)) {
        if (primary === id) setPrimary(prev.filter(g => g !== id)[0] || null);
        return prev.filter(g => g !== id);
      }
      if (!primary) setPrimary(id);
      return [...prev, id];
    });
  };

  const finish = () => {
    // Add habits first
    goals.forEach(gid => {
      const g = CATEGORIES.find(c => c.id === gid);
      if (g && g.id !== 'custom') addHabit({ name: g.name, category: gid, timerDuration: 2700, breakDuration: 300 });
    });
    // Save preferences (triggers re-render in AppNavigator to show tabs)
    savePreferences({ wakeUpTime: wakeUp, bedTime, goals, defaultGoal: primary || goals[0] });
  };

  const canNext = step < 2 || goals.length > 0;

  return (
    <SafeAreaView style={styles.safe} testID="onboarding-screen">
      <View style={styles.container}>
        <View style={styles.progress}>
          {[0,1,2].map(i => <View key={i} style={[styles.bar, i <= step && styles.barActive]} />)}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(249,115,22,0.1)' }]}>
                <Feather name="sun" size={28} color={C.primary} />
              </View>
              <Text style={styles.heading}>WAKE UP TIME</Text>
              <Text style={styles.sub}>When do you usually start your day?</Text>
              <View style={styles.grid}>
                {HOURS_AM.map(h => (
                  <TouchableOpacity key={h.value} testID={`wake-time-${h.value}`} onPress={() => setWakeUp(h.value)}
                    style={[styles.timeBtn, wakeUp === h.value && styles.timeBtnActive]}>
                    <Text style={[styles.timeBtnText, wakeUp === h.value && { color: '#fff' }]}>{h.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
                <Feather name="moon" size={28} color={C.purple} />
              </View>
              <Text style={styles.heading}>BED TIME</Text>
              <Text style={styles.sub}>When do you usually go to sleep?</Text>
              <View style={styles.grid}>
                {HOURS_PM.map(h => (
                  <TouchableOpacity key={h.value} testID={`bed-time-${h.value}`} onPress={() => setBedTime(h.value)}
                    style={[styles.timeBtn, bedTime === h.value && styles.timeBtnPurple]}>
                    <Text style={[styles.timeBtnText, bedTime === h.value && { color: '#fff' }]}>{h.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(249,115,22,0.1)' }]}>
                <Feather name="target" size={28} color={C.primary} />
              </View>
              <Text style={styles.heading}>YOUR GOALS</Text>
              <Text style={styles.sub}>Select habits you want to build</Text>
              <Text style={{ color: C.textFaint, fontSize: 11, marginBottom: 16 }}>Tap twice to set as primary</Text>
              <View style={styles.goalGrid}>
                {CATEGORIES.map(cat => {
                  const sel = goals.includes(cat.id);
                  const isPri = primary === cat.id;
                  return (
                    <TouchableOpacity key={cat.id} testID={`goal-${cat.id}`}
                      onPress={() => { sel && !isPri ? setPrimary(cat.id) : toggle(cat.id); }}
                      style={[styles.goalBtn, sel && styles.goalBtnSel, isPri && styles.goalBtnPri]}>
                      {isPri && <View style={styles.priBadge}><Text style={styles.priBadgeText}>PRIMARY</Text></View>}
                      {sel && !isPri && <View style={styles.checkBadge}><Feather name="check" size={10} color={C.primary} /></View>}
                      <View style={[styles.goalIcon, { backgroundColor: cat.color + '20' }]}>
                        <Feather name={cat.icon} size={22} color={cat.color} />
                      </View>
                      <Text style={[styles.goalLabel, sel && { color: '#fff' }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.nav}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s-1)} testID="onboarding-back">
              <Feather name="chevron-left" size={18} color={C.textMuted} /><Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            testID="onboarding-next"
            style={[styles.nextBtn, !canNext && { opacity: 0.4 }]}
            disabled={!canNext}
            onPress={() => step < 2 ? setStep(s => s+1) : finish()}
          >
            <Text style={styles.nextBtnText}>{step < 2 ? 'NEXT' : "LET'S GO"}</Text>
            <Feather name={step < 2 ? 'chevron-right' : 'zap'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, padding: 20 },
  progress: { flexDirection: 'row', gap: 6, marginBottom: 24, marginTop: 8 },
  bar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.surfaceHl },
  barActive: { backgroundColor: C.primary },
  scroll: { flex: 1 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  sub: { color: C.textMuted, fontSize: 14, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: { width: '31%', height: 48, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  timeBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  timeBtnPurple: { backgroundColor: C.purple, borderColor: C.purple },
  timeBtnText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalBtn: { width: '47%', borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, padding: 16, alignItems: 'center', gap: 8, position: 'relative' },
  goalBtnSel: { borderColor: 'rgba(249,115,22,0.3)', backgroundColor: 'rgba(249,115,22,0.05)' },
  goalBtnPri: { borderColor: C.primary, backgroundColor: 'rgba(249,115,22,0.08)' },
  priBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: C.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  priBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  checkBadge: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(249,115,22,0.15)', alignItems: 'center', justifyContent: 'center' },
  goalIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalLabel: { fontSize: 12, fontWeight: '500', color: C.textMuted, textAlign: 'center' },
  nav: { flexDirection: 'row', gap: 10, marginTop: 16, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', height: 56, paddingHorizontal: 20, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, borderRadius: 28, alignItems: 'center', gap: 4 },
  backBtnText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
  nextBtn: { flex: 1, flexDirection: 'row', height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', gap: 6 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
