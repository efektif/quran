import { Platform } from 'react-native';

interface StorageInterface {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): void;
  contains(key: string): boolean;
}

// Web localStorage wrapper
class WebStorage implements StorageInterface {
  getString(key: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const value = window.localStorage.getItem(key);
    return value ?? undefined;
  }

  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }

  contains(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) !== null;
  }
}

// Lazy-load native storage to avoid web bundling issues
let nativeStorage: StorageInterface | null = null;
const getNativeStorage = (): StorageInterface => {
  if (nativeStorage) {
    return nativeStorage;
  }
  // Dynamic require to prevent web from bundling this
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv');
  nativeStorage = createMMKV() as StorageInterface;
  return nativeStorage;
};

// Platform-aware storage factory
const createStorage = (): StorageInterface => {
  if (Platform.OS === 'web') {
    return new WebStorage();
  }
  return getNativeStorage();
};

export const storage: StorageInterface = createStorage();
