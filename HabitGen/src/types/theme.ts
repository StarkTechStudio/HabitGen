export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceVariant: string;
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    card: string;
    error: string;
    success: string;
    warning: string;
    tabBar: string;
    tabBarInactive: string;
    statusBar: string;
    overlay: string;
    onboarding: string;
    onboardingGradient: string[];
    cardColors: string[];
  };
}

export const LightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceVariant: '#EBEBF0',
    primary: '#5B4FE8',
    primaryLight: '#EEF0FF',
    secondary: '#1A1A2E',
    accent: '#FF7043',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    card: '#FFFFFF',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
    tabBar: '#FFFFFF',
    tabBarInactive: '#9CA3AF',
    statusBar: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.4)',
    onboarding: '#5B4FE8',
    onboardingGradient: ['#5B4FE8', '#7B72F0', '#9D96F5'],
    cardColors: [
      '#FFD54F', '#A5D6A7', '#80DEEA', '#F48FB1',
      '#FFAB91', '#CE93D8', '#80CBC4', '#90CAF9',
      '#BCAAA4', '#EF9A9A',
    ],
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0F0F1A',
    surface: '#1C1C2E',
    surfaceVariant: '#252540',
    primary: '#7B72F0',
    primaryLight: '#1A1830',
    secondary: '#F0F0FF',
    accent: '#FF8A65',
    text: '#F0F0FF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#2D2D50',
    card: '#1C1C2E',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
    tabBar: '#1C1C2E',
    tabBarInactive: '#6B7280',
    statusBar: '#0F0F1A',
    overlay: 'rgba(0,0,0,0.6)',
    onboarding: '#3D33C4',
    onboardingGradient: ['#3D33C4', '#5B4FE8', '#7B72F0'],
    cardColors: [
      '#B8860B', '#2E7D32', '#00695C', '#880E4F',
      '#BF360C', '#4A148C', '#004D40', '#0D47A1',
      '#3E2723', '#B71C1C',
    ],
  },
};
