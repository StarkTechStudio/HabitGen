import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { useTheme } from '../context/ThemeContext';

interface PremiumScreenProps {
  onClose: () => void;
  onPurchased: () => void;
}

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onClose, onPurchased }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>Close</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paywallContainer}>
        <RevenueCatUI.Paywall
          onDismiss={onClose}
          onPurchaseCompleted={() => onPurchased()}
          onRestoreCompleted={() => onPurchased()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeBtn: { alignSelf: 'flex-start' },
  closeText: { fontSize: 16, fontWeight: '500' },
  paywallContainer: { flex: 1 },
});

export default PremiumScreen;
