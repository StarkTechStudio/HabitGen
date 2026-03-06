import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, getCategoryColor, getCategoryIcon } from '../constants/theme';

export default function HabitCard({ habit, streak, completedToday, onStartTimer, onComplete, onDelete }) {
  const color = getCategoryColor(habit.category);
  const icon = getCategoryIcon(habit.category);

  return (
    <View style={styles.card} testID={`habit-card-${habit.id}`}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        {streak > 0 ? (
          <Text style={styles.streak}>
            <Text style={styles.fire}>&#x1F525; </Text>
            <Text style={styles.streakNum}>{streak} day{streak !== 1 ? 's' : ''}</Text>
          </Text>
        ) : (
          <Text style={styles.noStreak}>No streak yet</Text>
        )}
      </View>
      <View style={styles.actions}>
        {!completedToday ? (
          <TouchableOpacity style={styles.checkBtn} onPress={onComplete} testID={`complete-habit-${habit.id}`}>
            <Feather name="check" size={16} color={C.textDim} />
          </TouchableOpacity>
        ) : (
          <View style={styles.doneBtn}>
            <Feather name="check" size={16} color={C.secondary} />
          </View>
        )}
        <TouchableOpacity style={styles.playBtn} onPress={onStartTimer} testID={`start-timer-${habit.id}`}>
          <Feather name="play" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.delBtn} onPress={onDelete} testID={`delete-habit-${habit.id}`}>
          <Feather name="trash-2" size={14} color={C.textFaint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 18, marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: C.text, fontSize: 14, fontWeight: '600' },
  streak: { flexDirection: 'row', marginTop: 2 },
  fire: { fontSize: 12 },
  streakNum: { fontSize: 12, fontWeight: '700', color: C.primary },
  noStreak: { fontSize: 11, color: C.textFaint, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  doneBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary },
  delBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
