import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';
import PaywallModal from '../components/PaywallModal';

const JOURNEYS = [
  { id: 'weight', title: 'Lose 2 kg in 21 Days', desc: 'Daily exercises + diet tracking', icon: 'activity', color: C.destructive, days: 21,
    tasks: [{ d:1, t:'30 min morning walk + 2L water', m:30 },{ d:2, t:'15 min HIIT workout', m:15 },{ d:3, t:'45 min yoga', m:45 },{ d:4, t:'20 min strength', m:20 },{ d:5, t:'30 min cycling', m:30 }]},
  { id: 'code', title: 'Learn React in 30 Days', desc: 'Build projects daily', icon: 'code', color: C.blue, days: 30,
    tasks: [{ d:1, t:'Setup + Hello World', m:45 },{ d:2, t:'Components & Props', m:45 },{ d:3, t:'State & Events', m:45 },{ d:4, t:'useEffect & APIs', m:60 },{ d:5, t:'Build a Todo App', m:60 }]},
  { id: 'mind', title: '14 Days of Mindfulness', desc: 'Build a meditation practice', icon: 'heart', color: C.secondary, days: 14,
    tasks: [{ d:1, t:'5 min breathing', m:5 },{ d:2, t:'10 min guided meditation', m:10 },{ d:3, t:'15 min body scan', m:15 },{ d:4, t:'10 min gratitude journal', m:10 },{ d:5, t:'20 min silent meditation', m:20 }]},
];

export default function JourneyScreen() {
  const { isPremium, setIsPremium } = useApp();
  const [paywall, setPaywall] = useState(false);
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState({});

  const handleClick = (j) => {
    if (!isPremium) return setPaywall(true);
    setOpen(open === j.id ? null : j.id);
  };
  const toggleTask = (jid, d) => setDone(p => ({ ...p, [`${jid}-${d}`]: !p[`${jid}-${d}`] }));

  return (
    <SafeAreaView style={styles.safe} testID="journey-screen">
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>JOURNEYS</Text>
        <Text style={styles.sub}>Guided paths to achieve your goals</Text>

        {!isPremium && (
          <TouchableOpacity style={styles.banner} onPress={() => setPaywall(true)} testID="unlock-premium-banner">
            <Feather name="award" size={22} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Unlock Premium Journeys</Text>
              <Text style={styles.bannerSub}>Guided programs, analytics & more</Text>
            </View>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}

        {JOURNEYS.map(j => {
          const isOpen = open === j.id;
          const doneCount = j.tasks.filter(t => done[`${j.id}-${t.d}`]).length;
          return (
            <View key={j.id} style={styles.card}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => handleClick(j)} testID={`journey-${j.id}`}>
                <View style={[styles.jIcon, { backgroundColor: j.color + '20' }]}>
                  <Feather name={j.icon} size={20} color={j.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jTitle}>{j.title}</Text>
                  <Text style={styles.jDesc}>{j.desc}</Text>
                  {isPremium && (
                    <View style={styles.jProgress}>
                      <View style={styles.jBar}><View style={[styles.jBarFill, { width: `${(doneCount/j.tasks.length)*100}%`, backgroundColor: j.color }]} /></View>
                      <Text style={styles.jPct}>{doneCount}/{j.tasks.length}</Text>
                    </View>
                  )}
                </View>
                {!isPremium ? <Feather name="lock" size={16} color={C.textFaint} /> : <Feather name="chevron-right" size={16} color={C.textFaint} style={isOpen && { transform: [{ rotate: '90deg' }] }} />}
              </TouchableOpacity>
              {isOpen && isPremium && (
                <View style={styles.tasks}>
                  {j.tasks.map(task => {
                    const isDone = done[`${j.id}-${task.d}`];
                    return (
                      <TouchableOpacity key={task.d} style={[styles.taskRow, isDone && styles.taskDone]} onPress={() => toggleTask(j.id, task.d)} testID={`task-${j.id}-${task.d}`}>
                        <View style={[styles.taskCheck, isDone && styles.taskCheckDone]}>
                          {isDone && <Feather name="check" size={12} color="#fff" />}
                        </View>
                        <Text style={[styles.taskText, isDone && { textDecorationLine: 'line-through', color: C.textFaint }]} numberOfLines={1}>Day {task.d}: {task.t}</Text>
                        <Text style={styles.taskMin}>{task.m}m</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
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
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: C.primary, borderRadius: 18, marginBottom: 20 },
  bannerTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  card: { backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 18, marginBottom: 12, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  jIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  jTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  jDesc: { color: C.textFaint, fontSize: 11, marginTop: 2 },
  jProgress: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  jBar: { flex: 1, height: 3, backgroundColor: C.surfaceHl, borderRadius: 2, overflow: 'hidden' },
  jBarFill: { height: '100%', borderRadius: 2 },
  jPct: { color: C.textFaint, fontSize: 10 },
  tasks: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(9,9,11,0.3)' },
  taskDone: { borderColor: 'rgba(34,197,94,0.2)', backgroundColor: 'rgba(34,197,94,0.03)' },
  taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: C.secondary, borderColor: C.secondary },
  taskText: { flex: 1, color: C.textMuted, fontSize: 12 },
  taskMin: { color: C.textFaint, fontSize: 10 },
});
