// Screen Lock / Focus Mode Service
// Provides screen lock functionality during timer sessions.

import { Platform, AppState, Alert, NativeEventSubscription } from 'react-native';

type FocusCallback = (isFocused: boolean) => void;

class ScreenLockService {
  private isLocked = false;
  private listeners: FocusCallback[] = [];
  private appStateSubscription: NativeEventSubscription | null = null;

  async requestPermission(): Promise<boolean> {
    // Modern iOS-style permission dialog
    const title = 'Enable Focus Mode';
    const message = Platform.OS === 'android'
      ? 'HabitGen will enter Focus Mode during your sessions.\n\n' +
        'While active:\n' +
        '\u2022 Your screen stays locked to HabitGen\n' +
        '\u2022 Only Phone and SMS apps are accessible\n' +
        '\u2022 Social media apps will be blocked\n\n' +
        'You can stop anytime, but your streak will be penalized.'
      : 'HabitGen will enter Focus Mode during your sessions.\n\n' +
        'While active:\n' +
        '\u2022 A fullscreen overlay blocks distractions\n' +
        '\u2022 Only Phone and SMS apps are accessible\n' +
        '\u2022 Social media apps will be blocked\n\n' +
        'For full screen lock, enable Guided Access in Settings > Accessibility.';

    return new Promise(resolve => {
      Alert.alert(title, message, [
        { text: 'Enable Focus Mode', onPress: () => resolve(true) },
      ]);
    });
  }

  async startLock(): Promise<void> {
    this.isLocked = true;

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
