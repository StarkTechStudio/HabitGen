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
    background: '#F0F5F3',
    surface: '#FFFFFF',
    surfaceVariant: '#E8F0EC',
    primary: '#0D7377',
    primaryLight: '#E0F2EF',
    secondary: '#134E4A',
    accent: '#2DD4BF',
    text: '#134E4A',
    textSecondary: '#3D6B66',
    textMuted: '#7A9994',
    border: '#D0E0DB',
    card: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    tabBar: '#FFFFFF',
    tabBarInactive: '#8A9E9B',
    statusBar: '#F0F5F3',
    overlay: 'rgba(0,0,0,0.4)',
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0A1A19',
    surface: '#132625',
    surfaceVariant: '#1C3634',
    primary: '#2DD4BF',
    primaryLight: '#1A3533',
    secondary: '#E8F5F0',
    accent: '#5EEAD4',
    text: '#E8F5F0',
    textSecondary: '#94B8B0',
    textMuted: '#5C7D76',
    border: '#2A4744',
    card: '#132625',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    tabBar: '#0A1A19',
    tabBarInactive: '#5C7D76',
    statusBar: '#0A1A19',
    overlay: 'rgba(0,0,0,0.7)',
  },
};
