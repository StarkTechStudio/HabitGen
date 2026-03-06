// Screen Lock / Focus Mode Service
// This module provides screen lock functionality during timer sessions.
//
// On Android: Uses Android's Screen Pinning (App Pinning) API
// On iOS: Uses Guided Access-like behavior with a fullscreen overlay
//
// For full native implementation, you would need:
// - Android: A native module that calls startLockTask() / stopLockTask()
// - iOS: Guided Access must be enabled by the user in Settings
//
// This placeholder provides the API surface and a JS-level focus overlay.

import { Platform, AppState, Alert, NativeEventSubscription } from 'react-native';

type FocusCallback = (isFocused: boolean) => void;

class ScreenLockService {
  private isLocked = false;
  private listeners: FocusCallback[] = [];
  private appStateSubscription: NativeEventSubscription | null = null;

  async requestPermission(): Promise<boolean> {
    // On Android, screen pinning requires SYSTEM_ALERT_WINDOW or device admin
    // On iOS, Guided Access is a system setting
    if (Platform.OS === 'android') {
      Alert.alert(
        'Focus Mode Permission',
        'HabitGen will enter Focus Mode during timer sessions to help you stay concentrated. ' +
          'The app will show a fullscreen overlay to discourage leaving.\n\n' +
          'For full screen lock, enable Screen Pinning in your device settings.',
        [{ text: 'OK, Got it' }],
      );
    } else {
      Alert.alert(
        'Focus Mode',
        'HabitGen will enter Focus Mode during timer sessions.\n\n' +
          'For full screen lock, enable Guided Access in Settings > Accessibility > Guided Access.',
        [{ text: 'OK, Got it' }],
      );
    }
    return true;
  }

  async startLock(): Promise<void> {
    this.isLocked = true;

    // Monitor app state changes to detect when user tries to leave
    this.appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (this.isLocked && nextAppState === 'background') {
          // User tried to leave during focus mode
          this.notifyListeners(false);
        } else if (this.isLocked && nextAppState === 'active') {
          this.notifyListeners(true);
        }
      },
    );

    this.notifyListeners(true);

    // TODO: For full Android screen pinning:
    // NativeModules.ScreenLockModule.startLockTask();
  }

  async stopLock(): Promise<void> {
    this.isLocked = false;
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    this.notifyListeners(false);

    // TODO: For full Android screen pinning:
    // NativeModules.ScreenLockModule.stopLockTask();
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
