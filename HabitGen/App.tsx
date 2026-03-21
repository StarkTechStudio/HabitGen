import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { StatusBar, View, Platform, AppState } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { HabitProvider } from './src/context/HabitContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import AdBanner from './src/components/AdBanner';
import SleepLockOverlay from './src/components/SleepLockOverlay';
import { storage } from './src/utils/storage';
import { isInSleepWindow } from './src/utils/helpers';
import { adMob } from './src/api/admob';
import { revenueCatService } from './src/api/revenuecat';
import { screenLock } from './src/api/screenlock';
import { notificationService } from './src/api/notificationService';
import { handleNotificationAction } from './src/api/notificationHandlers';

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

    const unsubNotifee = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (
        type === EventType.PRESS ||
        type === EventType.ACTION_PRESS ||
        type === EventType.DELIVERED
      ) {
        await handleNotificationAction(type, detail);
      }
    });

    return () => {
      unsub();
      unsubNotifee();
    };
  }, []);

  const refreshPremium = useCallback(async () => {
    await revenueCatService.refreshCustomerInfo();
    const premium = revenueCatService.isPremium();
    setIsPremium(premium);
    await storage.updateUserPreferences({ isPremium: premium });
  }, []);

  const handleSplashFinish = async () => {
    const prefs = await storage.getUserPreferences();
    if (prefs.allowedAppConfigs?.length) {
      screenLock.setAppConfigs(prefs.allowedAppConfigs);
    }

    await notificationService.initialize();
    const hasPermission = await notificationService.requestPermission();
    if (prefs.onboardingComplete) {
      if (hasPermission) {
        await notificationService.scheduleAllHabits();
      }
    }

    const next: AppState = prefs.onboardingComplete ? 'main' : 'onboarding';
    setAppState(next);
  };

  const handleOnboardingComplete = () => {
    setAppState('main');
  };

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
