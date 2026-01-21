import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface StorageInterface {
  getString(key: string): string | null;
  set(key: string, value: string): void;
}

// Web localStorage wrapper
class WebStorage implements StorageInterface {
  getString(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }
}

// Native SecureStore wrapper (synchronous-like via caching)
class NativeStorage implements StorageInterface {
  private cache = new Map<string, string>();
  private initialized = false;

  getString(key: string): string | null {
    // Return from cache if available
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }
    // Async load happens in background, return null for first call
    if (!this.initialized) {
      this.loadFromStore(key);
    }
    return null;
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
    SecureStore.setItemAsync(key, value).catch(console.error);
  }

  private async loadFromStore(key: string): Promise<void> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        this.cache.set(key, value);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load from SecureStore:', error);
    }
  }

  // Pre-load a key (call this early in app lifecycle)
  async preload(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        this.cache.set(key, value);
      }
      this.initialized = true;
      return value;
    } catch (error) {
      console.error('Failed to preload from SecureStore:', error);
      return null;
    }
  }
}

// Platform-aware storage
const nativeStorage = new NativeStorage();

export const storage: StorageInterface = Platform.OS === 'web'
  ? new WebStorage()
  : nativeStorage;

// Export preload for native
export const preloadStorage = Platform.OS === 'web'
  ? async (_key: string) => null
  : (key: string) => nativeStorage.preload(key);
