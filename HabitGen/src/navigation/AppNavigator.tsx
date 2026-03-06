import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import CreateHabitForm from '../components/CreateHabitForm';
import HabitDetailScreen from '../components/HabitDetailScreen';
import TimerScreen from '../components/TimerScreen';
import AuthScreen from '../components/AuthScreen';
import PremiumScreen from '../components/PremiumScreen';
import { useHabits } from '../context/HabitContext';
import { storage } from '../utils/storage';

export type RootStackParamList = {
  Main: undefined;
  CreateHabit: { habitId?: string } | undefined;
  HabitDetail: { habitId: string };
  Timer: { habitId: string };
  Auth: undefined;
  Premium: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const CreateHabitScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { habits } = useHabits();
  const habitId = route.params?.habitId;
  const editHabit = habitId ? habits.find((h: any) => h.id === habitId) : undefined;

  return (
    <CreateHabitForm
      onClose={() => navigation.goBack()}
      editHabit={editHabit}
    />
  );
};

const HabitDetailWrapper: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { habitId } = route.params;
  return (
    <HabitDetailScreen
      habitId={habitId}
      onClose={() => navigation.goBack()}
      onEdit={() => navigation.navigate('CreateHabit', { habitId })}
      onStartTimer={() => navigation.navigate('Timer', { habitId })}
    />
  );
};

const TimerWrapper: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { habitId } = route.params;
  return (
    <TimerScreen
      habitId={habitId}
      onClose={() => navigation.goBack()}
    />
  );
};

const AuthWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  return <AuthScreen onClose={() => navigation.goBack()} />;
};

const PremiumWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <PremiumScreen
      onClose={() => navigation.goBack()}
      onPurchased={() => {
        storage.updateUserPreferences({ isPremium: true });
        navigation.goBack();
      }}
    />
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="CreateHabit"
          component={CreateHabitScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailWrapper}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="Timer"
          component={TimerWrapper}
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthWrapper}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Premium"
          component={PremiumWrapper}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
