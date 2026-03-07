import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AdBannerProps {
  isPremium?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ isPremium }) => {
  const { theme } = useTheme();

  if (isPremium) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      ]}>
      <Text style={[styles.adLabel, { color: theme.colors.textMuted }]}>
        Ad Placeholder
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    // Positioned above the tab bar, the tab bar already has Android nav padding
    // So the ad sits between content and tab bar
    marginBottom: Platform.OS === 'android' ? 0 : 0,
  },
  adLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AdBanner;
