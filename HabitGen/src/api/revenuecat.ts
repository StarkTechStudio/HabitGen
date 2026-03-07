import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

const API_KEY = 'test_ghPtiGxQAYDDKQKmwpcDeivBIHN';
const ENTITLEMENT_ID = 'premium';

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

      Purchases.configure({ apiKey: API_KEY, appUserID: userId });
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
    return !!this.customerInfo.entitlements.active[ENTITLEMENT_ID];
  }

  getCustomerInfo(): CustomerInfo | null {
    return this.customerInfo;
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
    } catch (e) {
      console.warn('[RevenueCat] Login failed:', e);
    }
  }

  async logOut(): Promise<void> {
    try {
      const info = await Purchases.logOut();
      this.customerInfo = info;
    } catch (e) {
      console.warn('[RevenueCat] Logout failed:', e);
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const info = await Purchases.restorePurchases();
      this.customerInfo = info;
      return this.isPremium();
    } catch {
      return false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const revenueCatService = new RevenueCatService();
export { ENTITLEMENT_ID };
