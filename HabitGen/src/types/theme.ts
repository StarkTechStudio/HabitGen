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
  };
}

export const LightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F0F1F3',
    primary: '#FF6B35',
    primaryLight: '#FFF0E8',
    secondary: '#1A1A2E',
    accent: '#FFB800',
    text: '#1A1A2E',
    textSecondary: '#5A5A6E',
    textMuted: '#9A9AAE',
    border: '#E8E8EE',
    card: '#FFFFFF',
    error: '#E53E3E',
    success: '#38A169',
    warning: '#DD6B20',
    tabBar: '#FFFFFF',
    tabBarInactive: '#9A9AAE',
    statusBar: '#F8F9FA',
    overlay: 'rgba(0,0,0,0.5)',
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    surfaceVariant: '#252540',
    primary: '#FF6B35',
    primaryLight: '#2A1A10',
    secondary: '#E8E8EE',
    accent: '#FFB800',
    text: '#F0F0F5',
    textSecondary: '#A0A0B8',
    textMuted: '#6A6A80',
    border: '#2A2A40',
    card: '#1A1A2E',
    error: '#FC8181',
    success: '#68D391',
    warning: '#F6AD55',
    tabBar: '#1A1A2E',
    tabBarInactive: '#6A6A80',
    statusBar: '#0D0D1A',
    overlay: 'rgba(0,0,0,0.7)',
  },
};
