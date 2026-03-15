import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { StatusBar, View, Platform, AppState, Linking, Alert } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { HabitProvider } from './src/context/HabitContext';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import AdBanner from './src/components/AdBanner';
import SleepLockOverlay from './src/components/SleepLockOverlay';
import { storage } from './src/utils/storage';
import { isInSleepWindow } from './src/utils/helpers';
import { adMob } from './src/api/admob';
import { revenueCatService } from './src/api/revenuecat';
import { screenLock } from './src/api/screenlock';

type AppState = 'splash' | 'onboarding' | 'main';

// Premium context for global premium state
interface PremiumContextType {
  isPremium: boolean;
  refreshPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  refreshPremium: async () => {},
});

export const usePremium = () => useContext(PremiumContext);

const MainWithAds: React.FC<{ isPremium: boolean }> = ({ isPremium }) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : insets.bottom;
  const [sleepLockActive, setSleepLockActive] = useState(false);

  const checkSleepWindow = useCallback(async () => {
    const schedule = await storage.getSleepSchedule();
    if (schedule?.enabled && isInSleepWindow(schedule)) {
      setSleepLockActive(true);
    } else {
      setSleepLockActive(false);
    }
  }, []);

  useEffect(() => {
    checkSleepWindow();
    const interval = setInterval(checkSleepWindow, 60 * 1000);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') checkSleepWindow();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [checkSleepWindow]);

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      {!isPremium && (
        <View style={{ paddingBottom: bottomInset, backgroundColor: 'transparent' }}>
          <AdBanner isPremium={isPremium} />
        </View>
      )}
      {sleepLockActive && (
        <SleepLockOverlay onCancel={() => setSleepLockActive(false)} />
      )}
    </View>
  );
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [appState, setAppState] = useState<AppState>('splash');
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    adMob.initialize();
    revenueCatService.initialize().then(() => {
      setIsPremium(revenueCatService.isPremium());
    });

    const unsub = revenueCatService.onCustomerInfoUpdate((info) => {
      const premium = revenueCatService.isPremium();
      setIsPremium(premium);
      storage.updateUserPreferences({ isPremium: premium });
    });

    return unsub;
  }, []);

  const refreshPremium = useCallback(async () => {
    await revenueCatService.refreshCustomerInfo();
    const premium = revenueCatService.isPremium();
    setIsPremium(premium);
    await storage.updateUserPreferences({ isPremium: premium });
  }, []);

  const handleSplashFinish = async () => {
    const prefs = await storage.getUserPreferences();
    const next: AppState = prefs.onboardingComplete ? 'main' : 'onboarding';
    setAppState(next);
  };

  const handleOnboardingComplete = () => {
    setAppState('main');
  };

  const showUninstallDialog = useCallback(() => {
    if (navigationRef.isReady()) {
      (navigationRef as any).navigate('Main', { screen: 'Account' });
    }
    setTimeout(() => {
      Alert.alert(
        "Don't Uninstall Me!",
        'I am your Habit Builder Companion \u{1F622}\u{1F62D}',
        [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Uninstall',
            style: 'destructive',
            onPress: async () => {
              const hadAdmin = await screenLock.prepareForUninstall();
              const msg = hadAdmin
                ? 'Admin permission removed. You can now uninstall HabitGen from your home screen or app store.'
                : 'You can now uninstall HabitGen from your home screen or app store.';
              Alert.alert('Ready to Uninstall', msg);
            },
          },
        ],
      );
    }, 500);
  }, []);

  // Handle deep link for uninstall-helper (cold launch + warm resume)
  useEffect(() => {
    const handleUrl = (url: string) => {
      if (url.startsWith('habitgen://uninstall-helper')) {
        showUninstallDialog();
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const sub = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => sub.remove();
  }, [showUninstallDialog]);

  return (
    <PremiumContext.Provider value={{ isPremium, refreshPremium }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        {appState === 'splash' && (
          <SplashScreen onFinish={handleSplashFinish} />
        )}
        {appState === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
        {appState === 'main' && (
          <HabitProvider>
            <MainWithAds isPremium={isPremium} />
          </HabitProvider>
        )}
      </View>
    </PremiumContext.Provider>
  );
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
