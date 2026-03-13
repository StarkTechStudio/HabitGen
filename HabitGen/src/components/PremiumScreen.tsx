import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumScreenProps {
  onClose: () => void;
  onPurchased: () => void;
}

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onClose, onPurchased }) => {
  const { theme } = useTheme();
  // On iOS, delay mounting the Paywall to avoid freeze/crash when shown inside Modal (known RN + RevenueCat UI issue)
  const [showPaywall, setShowPaywall] = useState(Platform.OS !== 'ios');

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const t = setTimeout(() => setShowPaywall(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <Modal
      visible
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.paywallContainer}>
          {showPaywall ? (
            <RevenueCatUI.Paywall
              onDismiss={onClose}
              onPurchaseCompleted={() => onPurchased()}
              onRestoreCompleted={() => onPurchased()}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading paywall...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 48,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeBtn: { alignSelf: 'flex-start' },
  closeText: { fontSize: 16, fontWeight: '500' },
  paywallContainer: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 15 },
});

export default PremiumScreen;
