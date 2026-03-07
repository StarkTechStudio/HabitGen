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
    background: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceVariant: '#EBEBF0',
    primary: '#FF2D55',
    primaryLight: '#FFF0F3',
    secondary: '#1C1C1E',
    accent: '#FF9500',
    text: '#1C1C1E',
    textSecondary: '#48484A',
    textMuted: '#8E8E93',
    border: '#D1D1D6',
    card: '#FFFFFF',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9F0A',
    tabBar: '#FFFFFF',
    tabBarInactive: '#8E8E93',
    statusBar: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.4)',
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    primary: '#FF375F',
    primaryLight: '#2A0A12',
    secondary: '#F2F2F7',
    accent: '#FFD60A',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textMuted: '#636366',
    border: '#38383A',
    card: '#1C1C1E',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    tabBar: '#1C1C1E',
    tabBarInactive: '#636366',
    statusBar: '#000000',
    overlay: 'rgba(0,0,0,0.7)',
  },
};
