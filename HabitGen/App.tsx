import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { HabitProvider } from './src/context/HabitContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import AdBanner from './src/components/AdBanner';
import { storage } from './src/utils/storage';
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

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [appState, setAppState] = useState<AppState>('splash');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Initialize services
    adMob.initialize();
    revenueCatService.initialize().then(() => {
      setIsPremium(revenueCatService.isPremium());
    });

    // Listen for premium status changes
    const unsub = revenueCatService.onCustomerInfoUpdate(() => {
      setIsPremium(revenueCatService.isPremium());
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
    if (prefs.onboardingComplete) {
      setAppState('main');
    } else {
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    screenLock.requestPermission();
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
            <AppNavigator />
            <AdBanner isPremium={isPremium} />
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
