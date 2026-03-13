import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
} from 'react-native-purchases';

// RevenueCat requires separate API keys per platform. Get them from:
// RevenueCat Dashboard > Project Settings > API Keys > [Your iOS/Android app]
const ANDROID_API_KEY = 'test_ghPtiGxQAYDDKQKmwpcDeivBIHN';
// Use your iOS public API key from RevenueCat (starts with appl_). If paywall fails on iOS, add the iOS app in RevenueCat and set IOS_API_KEY here.
const IOS_API_KEY = 'test_ghPtiGxQAYDDKQKmwpcDeivBIHN';

const ENTITLEMENT_ID = 'HabitGen Pro';

function getApiKey(): string {
  return Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
}

type CustomerInfoCallback = (info: CustomerInfo) => void;

class RevenueCatService {
  private initialized = false;
  private customerInfo: CustomerInfo | null = null;
  private listeners: CustomerInfoCallback[] = [];

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey: getApiKey(), appUserID: userId });
      this.initialized = true;

      Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
        this.customerInfo = info;
        this.listeners.forEach(cb => cb(info));
      });

      await this.refreshCustomerInfo();
    } catch (e) {
      console.warn('[RevenueCat] Init failed:', e);
    }
  }

  async refreshCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const info = await Purchases.getCustomerInfo();
      this.customerInfo = info;
      return info;
    } catch {
      return null;
    }
  }

  isPremium(): boolean {
    if (!this.customerInfo) return false;
    // Check for our entitlement
    const active = this.customerInfo.entitlements.active;
    return !!(active[ENTITLEMENT_ID] || active.premium || active['pro']);
  }

  getCustomerInfo(): CustomerInfo | null {
    return this.customerInfo;
  }

  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      return await Purchases.getOfferings();
    } catch (e) {
      console.warn('[RevenueCat] Get offerings failed:', e);
      return null;
    }
  }

  onCustomerInfoUpdate(cb: CustomerInfoCallback): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  async logIn(userId: string): Promise<void> {
    try {
      const result = await Purchases.logIn(userId);
      this.customerInfo = result.customerInfo;
      this.listeners.forEach(cb => cb(result.customerInfo));
    } catch (e) {
      console.warn('[RevenueCat] Login failed:', e);
    }
  }

  async logOut(): Promise<void> {
    try {
      const info = await Purchases.logOut();
      this.customerInfo = info;
      this.listeners.forEach(cb => cb(info));
    } catch (e) {
      console.warn('[RevenueCat] Logout failed:', e);
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const info = await Purchases.restorePurchases();
      this.customerInfo = info;
      this.listeners.forEach(cb => cb(info));
      return this.isPremium();
    } catch {
      return false;
    }
  }

  async syncPurchases(): Promise<void> {
    try {
      await Purchases.syncPurchases();
      await this.refreshCustomerInfo();
    } catch (e) {
      console.warn('[RevenueCat] Sync failed:', e);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getEntitlementId(): string {
    return ENTITLEMENT_ID;
  }
}

export const revenueCatService = new RevenueCatService();
export { ENTITLEMENT_ID };
