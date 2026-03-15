import {
  Platform,
  AppState,
  Alert,
  NativeModules,
  NativeEventSubscription,
} from 'react-native';

type FocusCallback = (isFocused: boolean) => void;

const DEFAULT_ALLOWED_APPS = ['Phone', 'Messages', 'Gmail'];

function getNativeModule(): {
  enableFocusLock: () => void;
  disableFocusLock: () => void;
  requestDeviceAdmin: () => void;
  isDeviceAdminEnabled: () => Promise<boolean>;
  removeDeviceAdmin: () => Promise<boolean>;
} | null {
  try {
    const mod = NativeModules?.ScreenLockModule;
    return mod && typeof mod.enableFocusLock === 'function' ? mod : null;
  } catch {
    return null;
  }
}

class ScreenLockService {
  private isLocked = false;
  private listeners: FocusCallback[] = [];
  private appStateSubscription: NativeEventSubscription | null = null;
  private allowedApps: string[] = DEFAULT_ALLOWED_APPS;

  async isDeviceAdminEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
      const mod = getNativeModule();
      if (mod) return await mod.isDeviceAdminEnabled();
    } catch {}
    return false;
  }

  requestDeviceAdmin(): void {
    if (Platform.OS !== 'android') return;
    try {
      const mod = getNativeModule();
      if (mod) mod.requestDeviceAdmin();
    } catch {}
  }

  async requestPermission(): Promise<boolean> {
    return new Promise(resolve => {
      if (Platform.OS === 'android') {
        Alert.alert(
          'Enable Focus Mode',
          'During focus sessions:\n\n' +
            '\u{2022} Your phone will be locked\n' +
            '\u{2022} Only the timer will be visible on screen\n' +
            '\u{2022} No buttons (home/back/recents) will work\n' +
            '\u{2022} Power button won\'t turn off the screen\n\n' +
            'The phone returns to normal when the timer ends or you tap Stop.',
          [{text: 'Got it', onPress: () => resolve(true)}],
        );
      } else {
        Alert.alert(
          'Enable Focus Mode',
          'For full screen lock on iOS:\n' +
            '\u{2022} Go to Settings > Accessibility > Guided Access\n' +
            '\u{2022} Enable Guided Access\n' +
            '\u{2022} Triple-click side button to start',
          [{text: 'Got it', onPress: () => resolve(true)}],
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
      try {
        const mod = getNativeModule();
        if (mod) mod.enableFocusLock();
      } catch (e) {
        console.warn('[ScreenLock] Native lock not available:', e);
      }
    }

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
        const mod = getNativeModule();
        if (mod) mod.disableFocusLock();
      } catch (e) {
        console.warn('[ScreenLock] Native unlock not available:', e);
      }
    }

    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    this.notifyListeners(false);
  }

  /**
   * Used when the user explicitly chooses to uninstall HabitGen from inside the app.
   * This removes Device Admin so Android will allow uninstall without extra steps.
   */
  async prepareForUninstall(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const mod = getNativeModule();
      if (mod && typeof mod.removeDeviceAdmin === 'function') {
        await mod.removeDeviceAdmin();
        return true;
      }
    } catch (e) {
      console.warn('[ScreenLock] Failed to remove device admin before uninstall:', e);
    }
    return false;
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
