import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { C } from '../constants/theme';
import { useApp } from '../context/AppContext';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TodayScreen from '../screens/TodayScreen';
import JourneyScreen from '../screens/JourneyScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AccountScreen from '../screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = { Today: 'target', Journey: 'map', History: 'clock', Account: 'user' };

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICONS[route.name]} size={size - 4} color={color} />
        ),
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.92)',
          borderTopWidth: 0,
          borderRadius: 32,
          marginHorizontal: 16,
          marginBottom: 16,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderWidth: 1,
          borderColor: C.borderLight,
          elevation: 0,
          shadowOpacity: 0,
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { preferences, loading } = useApp();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Main" component={TabNavigator} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
