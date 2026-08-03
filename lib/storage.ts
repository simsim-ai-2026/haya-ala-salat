import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin JSON wrapper around AsyncStorage. Every key the app persists lives under
 * the `has:` namespace so it is easy to inspect and to wipe selectively.
 */
const NAMESPACE = 'has:';

const namespaced = (key: string) => `${NAMESPACE}${key}`;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(namespaced(key));
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch (error) {
    console.warn(`[storage] failed to read "${key}"`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(namespaced(key), JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] failed to write "${key}"`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(namespaced(key));
  } catch (error) {
    console.warn(`[storage] failed to remove "${key}"`, error);
  }
}

/** Removes only the keys this app owns, leaving the rest of AsyncStorage intact. */
export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(NAMESPACE));
    if (ours.length > 0) {
      await AsyncStorage.multiRemove(ours);
    }
  } catch (error) {
    console.warn('[storage] failed to clear', error);
  }
}
