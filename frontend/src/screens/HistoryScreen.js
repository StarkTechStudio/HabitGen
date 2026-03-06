import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function HistoryScreen() {
  const { habits, sessions, getStreak } = useApp();
  const toDS = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = toDS(d);
      const count = sessions.filter(s => s.completed && toDS(new Date(s.endTime)) === ds).length;
      days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }
    return days;
  }, [sessions]);

  const maxCount = Math.max(...last7.map(d => d.count), 1);
  const totalMin = Math.round(sessions.filter(s => s.completed).reduce((a, s) => a + (s.duration || 0), 0) / 60);
  const totalSessions = sessions.filter(s => s.completed).length;
  const bestStreak = useMemo(() => habits.reduce((m, h) => Math.max(m, getStreak(h.id)), 0), [habits, getStreak]);

  const missedDays = useMemo(() => {
    if (!habits.length) return 0;
    let m = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (!sessions.some(s => s.completed && toDS(new Date(s.endTime)) === toDS(d))) m++;
    }
    return m;
  }, [sessions, habits]);

  return (
    <SafeAreaView style={styles.safe} testID="history-screen">
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>HISTORY</Text>
        <Text style={styles.sub}>Your habit tracking journey</Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'clock', color: C.blue, val: totalMin, label: 'TOTAL MINUTES' },
            { icon: 'trending-up', color: C.secondary, val: totalSessions, label: 'SESSIONS' },
            { icon: 'zap', color: C.primary, val: bestStreak, label: 'BEST STREAK' },
            { icon: 'alert-circle', color: C.destructive, val: missedDays, label: 'MISSED (7D)' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Feather name={s.icon} size={16} color={s.color} />
              <Text style={[styles.statVal, s.icon === 'zap' && { color: C.primary }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* 7-Day Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Feather name="calendar" size={14} color={C.primary} />
            <Text style={styles.chartTitle}>LAST 7 DAYS</Text>
          </View>
          <View style={styles.chart}>
            {last7.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.chartBarBg}>
                  <View style={[styles.chartBarFill, { height: `${(d.count / maxCount) * 100}%` }]} />
                </View>
                <Text style={styles.chartLabel}>{d.day}</Text>
                <Text style={styles.chartVal}>{d.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Streaks per habit */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={{ fontSize: 14 }}>&#x1F525;</Text>
            <Text style={styles.chartTitle}>HABIT STREAKS</Text>
          </View>
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>No habits tracked yet</Text>
          ) : habits.map(h => {
            const str = getStreak(h.id);
            const hSessions = sessions.filter(s => s.habitId === h.id && s.completed).length;
            return (
              <View key={h.id} style={styles.streakRow} testID={`history-habit-${h.id}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.streakName} numberOfLines={1}>{h.name}</Text>
                  <Text style={styles.streakSub}>{hSessions} sessions total</Text>
                </View>
                <View style={styles.streakVal}>
                  {str > 0 && <Text style={{ fontSize: 14 }}>&#x1F525;</Text>}
                  <Text style={[styles.streakNum, str > 0 && { color: C.primary }]}>{str}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent sessions */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>RECENT SESSIONS</Text>
          {sessions.filter(s => s.completed).length === 0 ? (
            <Text style={styles.emptyText}>No sessions yet</Text>
          ) : sessions.filter(s => s.completed).sort((a,b) => new Date(b.endTime) - new Date(a.endTime)).slice(0, 15).map(s => {
            const h = habits.find(hh => hh.id === s.habitId);
            const d = new Date(s.endTime);
            return (
              <View key={s.id} style={styles.sessionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionName}>{h?.name || 'Unknown'}</Text>
                  <Text style={styles.sessionDate}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.sessionDur}>{s.duration ? `${Math.round(s.duration/60)}m` : 'Manual'}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, padding: 16, paddingTop: 20 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  sub: { color: C.textMuted, fontSize: 14, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 18, padding: 14, gap: 4 },
  statVal: { color: '#fff', fontSize: 22, fontWeight: '900' },
  statLabel: { color: C.textFaint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  chartCard: { backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 18, padding: 16, marginBottom: 12 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  chartTitle: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', height: 120, gap: 4 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBarBg: { width: '70%', height: 80, backgroundColor: C.surfaceHl, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', backgroundColor: C.primary, borderRadius: 6, minHeight: 2 },
  chartLabel: { color: C.textDim, fontSize: 10, marginTop: 6, fontWeight: '500' },
  chartVal: { color: C.textFaint, fontSize: 9, marginTop: 2 },
  emptyText: { color: C.textFaint, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  streakRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(39,39,42,0.4)' },
  streakName: { color: '#fff', fontSize: 14, fontWeight: '500' },
  streakSub: { color: C.textFaint, fontSize: 10, marginTop: 2 },
  streakVal: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakNum: { fontSize: 20, fontWeight: '900', color: C.textFaint },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(39,39,42,0.3)' },
  sessionName: { color: C.textMuted, fontSize: 13 },
  sessionDate: { color: C.textFaint, fontSize: 10, marginTop: 2 },
  sessionDur: { color: C.textFaint, fontSize: 12 },
});
