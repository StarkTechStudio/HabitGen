import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';
import HabitCard from '../components/HabitCard';
import TimerModal from '../components/TimerModal';
import AddHabitModal from '../components/AddHabitModal';

export default function TodayScreen() {
  const { habits, sessions, getStreak, completeHabit, isCompletedToday, deleteHabit } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [timerHabit, setTimerHabit] = useState(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }, []);

  const completedCount = useMemo(() => habits.filter(h => isCompletedToday(h.id)).length, [habits, isCompletedToday]);
  const totalStreaks = useMemo(() => habits.reduce((s, h) => s + getStreak(h.id), 0), [habits, getStreak]);
  const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'; };
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safe} testID="today-screen">
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{dateStr.toUpperCase()}</Text>
        <Text style={styles.greeting}>{greeting()}</Text>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Feather name="target" size={18} color={C.primary} />
            <Text style={styles.statNum}>{habits.length}</Text>
            <Text style={styles.statLabel}>HABITS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={{ fontSize: 16 }}>&#x1F525;</Text>
            <Text style={[styles.statNum, { color: C.primary }]}>{totalStreaks}</Text>
            <Text style={styles.statLabel}>STREAKS</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="check-circle" size={18} color={C.secondary} />
            <Text style={styles.statNum}>{completedCount}/{habits.length}</Text>
            <Text style={styles.statLabel}>TODAY</Text>
          </View>
        </View>

        {/* Progress */}
        {habits.length > 0 && (
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>TODAY'S PROGRESS</Text>
              <Text style={[styles.progressPct, { color: C.primary }]}>{pct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
          </View>
        )}

        {/* Habits */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MY HABITS</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} testID="add-habit-btn">
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="plus-circle" size={48} color={C.surfaceHl} />
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptyHint}>Tap + to add your first habit</Text>
          </View>
        ) : (
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={getStreak(habit.id)}
              completedToday={isCompletedToday(habit.id)}
              onStartTimer={() => setTimerHabit(habit.id)}
              onComplete={() => completeHabit(habit.id)}
              onDelete={() => deleteHabit(habit.id)}
            />
          ))
        )}
      </ScrollView>

      <AddHabitModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <TimerModal habitId={timerHabit} visible={!!timerHabit} onClose={() => setTimerHabit(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, padding: 16, paddingTop: 20 },
  date: { color: C.textFaint, fontSize: 11, fontWeight: '600', letterSpacing: 2 },
  greeting: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 20 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 18, padding: 14, alignItems: 'center', gap: 4 },
  statNum: { color: '#fff', fontSize: 22, fontWeight: '900' },
  statLabel: { color: C.textFaint, fontSize: 9, fontWeight: '600', letterSpacing: 2 },
  progressWrap: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: C.textFaint, fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  progressPct: { fontSize: 12, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: C.surface, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { color: C.textFaint, fontSize: 14 },
  emptyHint: { color: C.textFaint, fontSize: 12, opacity: 0.6 },
});
