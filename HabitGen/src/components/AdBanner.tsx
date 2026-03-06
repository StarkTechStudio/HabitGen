import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { adMob } from '../api/admob';

interface AdBannerProps {
  isPremium?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ isPremium = false }) => {
  const { theme } = useTheme();

  // Don't show ads for premium users
  if (isPremium) return null;

  const adUnitId = adMob.getBannerAdUnitId();

  // TODO: Replace with actual AdMob BannerAd component
  // import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  // return <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>
        Ad Placeholder ({adUnitId.slice(-8)})
      </Text>
      <Text style={[styles.subtext, { color: theme.colors.textMuted }]}>
        Upgrade to Premium to remove ads
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  text: { fontSize: 11, fontWeight: '600' },
  subtext: { fontSize: 10, marginTop: 2 },
});

export default AdBanner;
