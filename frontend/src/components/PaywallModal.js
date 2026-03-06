import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';

const FEATURES = [
  { icon: 'zap', text: 'No Ads — Focus without distractions' },
  { icon: 'map', text: 'Custom Journeys — Guided goal paths' },
  { icon: 'bar-chart-2', text: 'Deep Analytics — Track everything' },
  { icon: 'award', text: 'Priority Goals & Difficulty Ratings' },
];

export default function PaywallModal({ visible, onClose, onSubscribe }) {
  return (
    <Modal visible={visible} animationType="fade" transparent testID="paywall-modal">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} testID="close-paywall">
            <Feather name="x" size={24} color={C.textDim} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Feather name="award" size={32} color="#fff" />
          </View>
          <Text style={styles.title}>GO PREMIUM</Text>
          <Text style={styles.subtitle}>Unlock your full potential</Text>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={16} color="#fff" />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.yearBtn} onPress={() => onSubscribe?.('yearly')} testID="subscribe-yearly">
            <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>SAVE 3x</Text></View>
            <Text style={styles.yearBtnText}>{'\u20B9'}1,400 / Year</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.monthBtn} onPress={() => onSubscribe?.('monthly')} testID="subscribe-monthly">
            <Text style={styles.monthBtnText}>{'\u20B9'}120 / Month</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>Subscription via RevenueCat. Cancel anytime.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(9,9,11,0.95)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 28, padding: 24, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  iconWrap: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 8 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: C.textMuted, fontSize: 14, marginTop: 4, marginBottom: 20 },
  features: { width: '100%', gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'rgba(9,9,11,0.6)', borderWidth: 1, borderColor: C.borderLight, borderRadius: 14 },
  featureIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, color: C.textMuted, fontSize: 13 },
  yearBtn: { width: '100%', height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  yearBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  saveBadge: { position: 'absolute', top: -8, right: 16, backgroundColor: C.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  saveBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  monthBtn: { width: '100%', height: 48, borderRadius: 24, backgroundColor: C.surfaceHl, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  monthBtnText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
  disclaimer: { color: C.textFaint, fontSize: 10, textAlign: 'center' },
});
