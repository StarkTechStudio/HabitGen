import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import TodayScreen from './screens/TodayScreen';
import JourneyScreen from './screens/JourneyScreen';
import LoginScreen from './screens/LoginScreen';
import HistoryScreen from './screens/HistoryScreen';
import AccountScreen from './screens/AccountScreen';
import './App.css';

function MainLayout() {
  return (
    <div className="relative max-w-[430px] mx-auto min-h-screen bg-black">
      <div className="pb-24 min-h-screen">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={
        <div className="max-w-[430px] mx-auto min-h-screen bg-black">
          <OnboardingScreen />
        </div>
      } />
      <Route element={<MainLayout />}>
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/journey" element={<JourneyScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/account" element={<AccountScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
