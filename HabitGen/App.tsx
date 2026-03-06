import React, { useState, useEffect } from 'react';
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
import { revenueCat } from './src/api/revenuecat';
import { screenLock } from './src/api/screenlock';

type AppState = 'splash' | 'onboarding' | 'main';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [appState, setAppState] = useState<AppState>('splash');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Initialize services
    adMob.initialize();
    revenueCat.configure();
  }, []);

  const handleSplashFinish = async () => {
    const prefs = await storage.getUserPreferences();
    setIsPremium(prefs.isPremium);
    if (prefs.onboardingComplete) {
      setAppState('main');
    } else {
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    // Request screen lock permission after onboarding
    screenLock.requestPermission();
    setAppState('main');
  };

  return (
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
