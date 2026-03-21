import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import TodayScreen from '../screens/today/TodayScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import AccountScreen from '../screens/account/AccountScreen';
import Svg, { Path } from 'react-native-svg';

const Tab = createBottomTabNavigator();

// SVG Icon components
const CalendarIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChartIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SparkleIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l2.09 6.26L20 10.27l-4.91 3.82L16.18 22 12 18.27 7.82 22l1.09-7.91L4 10.27l5.91-2.01L12 2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PersonIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TabIcon: React.FC<{ routeName: string; focused: boolean; color: string }> = ({
  routeName,
  focused,
  color,
}) => {
  const size = 22;
  switch (routeName) {
    case 'Today':
      return <CalendarIcon color={color} size={size} />;
    case 'History':
      return <ChartIcon color={color} size={size} />;
    case 'Journeys':
      return <SparkleIcon color={color} size={size} />;
    case 'Account':
      return <PersonIcon color={color} size={size} />;
    default:
      return null;
  }
};

const TabNavigator: React.FC = () => {
  const { theme } = useTheme();

  const bottomPadding = Platform.OS === 'android' ? 12 : 28;
  const tabBarHeight = Platform.OS === 'android' ? 68 : 85;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
          if (focused) {
            return (
              <View style={[styles.activeIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
                <TabIcon routeName={route.name} focused={focused} color={theme.colors.primary} />
              </View>
            );
          }
          return <TabIcon routeName={route.name} focused={focused} color={color} />;
        },
      })}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Journeys" component={JourneyScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconWrap: {
    width: 42,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
