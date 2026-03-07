import {
  Platform,
  AppState,
  Alert,
  NativeModules,
  NativeEventSubscription,
} from 'react-native';

type FocusCallback = (isFocused: boolean) => void;

// Default allowed apps
const DEFAULT_ALLOWED_APPS = ['Phone', 'Messages', 'YouTube'];

class ScreenLockService {
  private isLocked = false;
  private listeners: FocusCallback[] = [];
  private appStateSubscription: NativeEventSubscription | null = null;
  private allowedApps: string[] = DEFAULT_ALLOWED_APPS;

  async requestPermission(): Promise<boolean> {
    return new Promise(resolve => {
      if (Platform.OS === 'android') {
        Alert.alert(
          'Enable Focus Mode',
          'HabitGen will lock your screen during focus sessions.\n\n' +
            'While active:\n' +
            '\u{2022} Your screen stays locked to HabitGen\n' +
            `\u{2022} Allowed apps: ${this.allowedApps.join(', ')}\n` +
            '\u{2022} All other apps will be blocked\n\n' +
            'You can stop anytime, but your streak will be penalized.',
          [{ text: 'Enable Focus Mode', onPress: () => resolve(true) }],
        );
      } else {
        Alert.alert(
          'Enable Focus Mode',
          'HabitGen will enter Focus Mode during sessions.\n\n' +
            'For full screen lock on iOS:\n' +
            '\u{2022} Go to Settings > Accessibility > Guided Access\n' +
            '\u{2022} Enable Guided Access\n' +
            '\u{2022} Triple-click side button to start\n\n' +
            `Allowed apps: ${this.allowedApps.join(', ')}`,
          [{ text: 'Got it', onPress: () => resolve(true) }],
        );
      }
    });
  }

  setAllowedApps(apps: string[]): void {
    this.allowedApps = apps;
  }

  getAllowedApps(): string[] {
    return this.allowedApps;
  }

  async startLock(): Promise<void> {
    this.isLocked = true;

    if (Platform.OS === 'android') {
      // Try to use native screen pinning
      try {
        if (NativeModules.ScreenLockModule) {
          NativeModules.ScreenLockModule.startLockTask();
        }
      } catch (e) {
        console.warn('[ScreenLock] Native lock not available:', e);
      }
    }

    // Monitor app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (this.isLocked && nextAppState === 'background') {
          this.notifyListeners(false);
        } else if (this.isLocked && nextAppState === 'active') {
          this.notifyListeners(true);
        }
      },
    );

    this.notifyListeners(true);
  }

  async stopLock(): Promise<void> {
    this.isLocked = false;

    if (Platform.OS === 'android') {
      try {
        if (NativeModules.ScreenLockModule) {
          NativeModules.ScreenLockModule.stopLockTask();
        }
      } catch (e) {
        console.warn('[ScreenLock] Native unlock not available:', e);
      }
    }

    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    this.notifyListeners(false);
  }

  getIsLocked(): boolean {
    return this.isLocked;
  }

  addListener(callback: FocusCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(isFocused: boolean): void {
    this.listeners.forEach(l => l(isFocused));
  }
}

export const screenLock = new ScreenLockService();
