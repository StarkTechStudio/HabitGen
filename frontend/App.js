import React from 'react';
import { View, StatusBar } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </View>
  );
}
