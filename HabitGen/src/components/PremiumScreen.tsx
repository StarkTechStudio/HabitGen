import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { revenueCat, PurchasePackage } from '../api/revenuecat';

interface PremiumScreenProps {
  onClose: () => void;
  onPurchased: () => void;
}

const PREMIUM_FEATURES = [
  { emoji: '\u{1F3AF}', title: 'Difficulty Levels', desc: 'Set easy, medium, or hard for each habit' },
  { emoji: '\u{2B06}\u{FE0F}', title: 'Priority Goals', desc: 'Organize habits by priority' },
  { emoji: '\u{1F680}', title: 'Premium Journeys', desc: 'Access all guided programs' },
  { emoji: '\u{1F6AB}', title: 'No Ads', desc: 'Enjoy an ad-free experience' },
  { emoji: '\u{1F4CA}', title: 'Advanced Analytics', desc: 'Deep insights into your habits' },
  { emoji: '\u{2601}\u{FE0F}', title: 'Cloud Sync', desc: 'Sync data across all your devices' },
];

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onClose, onPurchased }) => {
  const { theme } = useTheme();
  const [offerings, setOfferings] = useState<PurchasePackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    revenueCat.getOfferings().then(setOfferings);
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    const success = await revenueCat.purchasePremium();
    setLoading(false);
    if (success) {
      Alert.alert('Welcome to Premium!', 'All features are now unlocked.', [
        { text: 'Awesome!', onPress: onPurchased },
      ]);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const success = await revenueCat.restorePurchases();
    setLoading(false);
    if (success) {
      Alert.alert('Restored!', 'Your premium access has been restored.', [
        { text: 'OK', onPress: onPurchased },
      ]);
    } else {
      Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{'\u{2B50}'}</Text>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            Go Premium
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
            Unlock the full power of HabitGen
          </Text>
        </View>

        {/* Features */}
        {PREMIUM_FEATURES.map(feature => (
          <View
            key={feature.title}
            style={[styles.featureRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                {feature.desc}
              </Text>
            </View>
          </View>
        ))}

        {/* Price */}
        {offerings.length > 0 && (
          <View style={[styles.priceCard, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary }]}>
            <Text style={[styles.priceText, { color: theme.colors.primary }]}>
              {offerings[0].product.priceString}
            </Text>
            <Text style={[styles.priceDesc, { color: theme.colors.textSecondary }]}>
              Cancel anytime
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: theme.colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handlePurchase}
          disabled={loading}>
          <Text style={styles.purchaseText}>
            {loading ? 'Processing...' : 'Subscribe Now'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={[styles.restoreText, { color: theme.colors.textMuted }]}>
            Restore Purchases
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { marginBottom: 20 },
  closeText: { fontSize: 16, fontWeight: '500' },
  hero: { alignItems: 'center', marginBottom: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroTitle: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
  heroSubtitle: { fontSize: 16 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  featureEmoji: { fontSize: 28, marginRight: 14 },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700' },
  featureDesc: { fontSize: 13, marginTop: 2 },
  priceCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    marginTop: 24,
    marginBottom: 20,
  },
  priceText: { fontSize: 28, fontWeight: '800' },
  priceDesc: { fontSize: 13, marginTop: 4 },
  purchaseButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  purchaseText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  restoreButton: { alignItems: 'center', marginTop: 16 },
  restoreText: { fontSize: 14 },
});

export default PremiumScreen;
