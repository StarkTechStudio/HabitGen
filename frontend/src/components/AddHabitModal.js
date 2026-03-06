import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, CATEGORIES } from '../constants/theme';
import { useApp } from '../context/AppContext';

const DURATIONS = [
  { label: '15 min', value: 900 },
  { label: '25 min', value: 1500 },
  { label: '45 min', value: 2700 },
  { label: '60 min', value: 3600 },
];

export default function AddHabitModal({ visible, onClose }) {
  const { addHabit } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('study');
  const [duration, setDuration] = useState(2700);

  const handleSubmit = () => {
    if (!name.trim()) return;
    addHabit({ name: name.trim(), category, timerDuration: duration, breakDuration: 300 });
    setName(''); setCategory('study'); setDuration(2700);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent testID="add-habit-modal">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>NEW HABIT</Text>
            <TouchableOpacity onPress={onClose} testID="close-add-habit"><Feather name="x" size={24} color={C.textDim} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>HABIT NAME</Text>
            <TextInput
              testID="habit-name-input"
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning workout"
              placeholderTextColor={C.textFaint}
            />

            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  testID={`category-${cat.id}`}
                  onPress={() => setCategory(cat.id)}
                  style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
                >
                  <Feather name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.catLabel, category === cat.id && { color: '#fff' }]}>{cat.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>SESSION DURATION</Text>
            <View style={styles.durRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d.value}
                  testID={`duration-${d.value}`}
                  onPress={() => setDuration(d.value)}
                  style={[styles.durBtn, duration === d.value && styles.durBtnActive]}
                >
                  <Text style={[styles.durText, duration === d.value && { color: '#fff' }]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            testID="save-habit-btn"
            onPress={handleSubmit}
            disabled={!name.trim()}
            style={[styles.saveBtn, !name.trim() && { opacity: 0.4 }]}
          >
            <Text style={styles.saveBtnText}>CREATE HABIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modal: { backgroundColor: 'rgba(9,9,11,0.98)', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: C.borderLight, padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  label: { color: C.textFaint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8, marginTop: 16 },
  input: { height: 48, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 16, color: '#fff', fontSize: 15 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { width: '23%', aspectRatio: 1, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', gap: 4 },
  catBtnActive: { borderColor: 'rgba(249,115,22,0.5)', backgroundColor: 'rgba(249,115,22,0.08)' },
  catLabel: { fontSize: 9, color: C.textDim, fontWeight: '500' },
  durRow: { flexDirection: 'row', gap: 8 },
  durBtn: { flex: 1, height: 40, borderRadius: 20, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  durBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  durText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  saveBtn: { height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
