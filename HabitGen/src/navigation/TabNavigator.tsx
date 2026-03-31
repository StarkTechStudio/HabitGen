import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import TodayScreen from '../screens/today/TodayScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import AccountScreen from '../screens/account/AccountScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

type TabIconName = 'Today' | 'Journey' | 'History' | 'Account';

const TAB_ICONS: Record<TabIconName, { active: string; inactive: string }> = {
  Today:   { active: '🏠', inactive: '⬜' },
  Journey: { active: '🗺️', inactive: '🗺️' },
  History: { active: '📊', inactive: '📈' },
  Account: { active: '👤', inactive: '👤' },
};

const TAB_UNICODE: Record<TabIconName, { active: string; inactive: string }> = {
  Today:   { active: '\u{1F3E0}', inactive: '\u{2B1C}' },
  Journey: { active: '\u{1F5FA}', inactive: '\u{1F5FA}' },
  History: { active: '\u{1F4CA}', inactive: '\u{1F4C8}' },
  Account: { active: '\u{1F464}', inactive: '\u{1F465}' },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showAdd, setShowAdd] = useState(false);

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0) + 6;

  const tabBarBg = theme.colors.tabBar;
  const active = theme.colors.primary;
  const inactive = theme.colors.tabBarInactive;

  return (
    <View style={[styles.tabBar, { backgroundColor: tabBarBg, paddingBottom: bottomPad, borderTopColor: theme.colors.border }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const name = route.name as TabIconName;
        const icons = TAB_UNICODE[name] ?? { active: '●', inactive: '○' };

        if (index === 1) {
          return (
            <React.Fragment key={route.key}>
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 22 }}>{isFocused ? icons.active : icons.inactive}</Text>
                <Text style={[styles.tabLabel, { color: isFocused ? active : inactive }]}>{name}</Text>
              </TouchableOpacity>
              <View style={styles.fabWrapper} key="fab-button">
                <TouchableOpacity
                  style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    navigation.navigate('Today', { openAddHabit: true });
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.fabIcon}>＋</Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 22 }}>{isFocused ? icons.active : icons.inactive}</Text>
            <Text style={[styles.tabLabel, { color: isFocused ? active : inactive }]}>{name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Journey" component={JourneyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: Math.min(width * 0.028, 10),
    fontWeight: '700',
    marginTop: 3,
  },
  fabWrapper: {
    width: 80,
    alignItems: 'center',
    marginTop: -22,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4FE8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 34,
    fontWeight: '300',
  },
});
