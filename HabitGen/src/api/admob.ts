// Google AdMob Integration Placeholder
// Replace with actual AdMob SDK when ready for production
// npm install react-native-google-mobile-ads

// Test Ad Unit IDs (official Google test IDs)
export const AD_UNITS = {
  // Banner ads
  BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  // Interstitial ads
  INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  // Rewarded ads
  REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
};

import { Platform } from 'react-native';

class AdMobService {
  private initialized = false;

  async initialize(): Promise<void> {
    // TODO: Replace with actual AdMob initialization
    // await mobileAds().initialize();
    this.initialized = true;
    console.log('[AdMob] Placeholder initialized with test IDs');
  }

  getBannerAdUnitId(): string {
    return Platform.OS === 'ios' ? AD_UNITS.BANNER_IOS : AD_UNITS.BANNER_ANDROID;
  }

  getInterstitialAdUnitId(): string {
    return Platform.OS === 'ios'
      ? AD_UNITS.INTERSTITIAL_IOS
      : AD_UNITS.INTERSTITIAL_ANDROID;
  }

  getRewardedAdUnitId(): string {
    return Platform.OS === 'ios' ? AD_UNITS.REWARDED_IOS : AD_UNITS.REWARDED_ANDROID;
  }

  async showInterstitial(): Promise<void> {
    // TODO: Replace with actual interstitial
    // const interstitial = InterstitialAd.createForAdRequest(this.getInterstitialAdUnitId());
    // interstitial.load();
    console.log('[AdMob] Placeholder interstitial shown');
  }

  async showRewarded(): Promise<boolean> {
    // TODO: Replace with actual rewarded ad
    // const rewarded = RewardedAd.createForAdRequest(this.getRewardedAdUnitId());
    // rewarded.load();
    console.log('[AdMob] Placeholder rewarded ad shown');
    return true;
  }
}

export const adMob = new AdMobService();
