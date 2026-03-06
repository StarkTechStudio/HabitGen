import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import TodayScreen from '../screens/today/TodayScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import AccountScreen from '../screens/account/AccountScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Today: { active: '\u{2600}\u{FE0F}', inactive: '\u{263A}\u{FE0F}' },
  Journey: { active: '\u{1F680}', inactive: '\u{1F6F8}' },
  History: { active: '\u{1F4CA}', inactive: '\u{1F4C8}' },
  Account: { active: '\u{1F464}', inactive: '\u{1F465}' },
};

const TabIcon: React.FC<{ routeName: string; focused: boolean }> = ({
  routeName,
  focused,
}) => {
  const icons = TAB_ICONS[routeName];
  return <Text style={{ fontSize: 22 }}>{focused ? icons.active : icons.inactive}</Text>;
};

const TabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
      })}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
