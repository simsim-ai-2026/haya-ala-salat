import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getItem, setItem } from '@/lib/storage';
// Type-only: keeps lib/i18n free of any runtime dependency on this module.
import type { LanguageCode } from '@/lib/i18n';
import type { MuezzinId } from '@/lib/muezzin';
import type { CalculationMethodKey, Coords, MadhabKey } from '@/lib/prayer-times';

const SETTINGS_KEY = 'settings';

export type Settings = {
  method: CalculationMethodKey;
  madhab: MadhabKey;
  use24Hour: boolean;
  language: LanguageCode;
  /** Which adhan recitation to play. `none` keeps the app silent. */
  muezzin: MuezzinId;
  /**
   * Whether the user wants prayer reminders. The OS permission is the real
   * authority — this only records the intent, so the app knows not to re-prompt
   * and Settings can reflect the choice. Nothing schedules notifications yet.
   */
  notificationsEnabled: boolean;
  /**
   * Where prayer times are calculated for. Until `hasSetLocation` is true these
   * are only a starting point for the map picker, never a schedule the user has
   * agreed to — prayer times are wrong by minutes for every km of error.
   */
  coords: Coords;
  locationName: string;
  /** False until the user has confirmed a location; gates the app on first run. */
  hasSetLocation: boolean;
  /** False until language and calculation method have been chosen. */
  hasCompletedSetup: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  method: 'MuslimWorldLeague',
  madhab: 'shafi',
  use24Hour: true,
  language: 'en',
  muezzin: 'none',
  notificationsEnabled: false,
  coords: { latitude: 33.5731, longitude: -7.5898 },
  locationName: 'Casablanca, Morocco',
  hasSetLocation: false,
  hasCompletedSetup: false,
};

type SettingsContextValue = {
  settings: Settings;
  /** True until the persisted settings have been read back from AsyncStorage. */
  isLoading: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getItem<Partial<Settings>>(SETTINGS_KEY).then((stored) => {
      if (cancelled) return;
      // Merge rather than replace so settings added in a later release get defaults.
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((previous) => {
      const next = { ...previous, ...patch };
      void setItem(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    void setItem(SETTINGS_KEY, DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, isLoading, updateSettings, resetSettings }),
    [settings, isLoading, updateSettings, resetSettings]
  );

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): SettingsContextValue {
  const context = use(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside a <SettingsProvider>');
  }
  return context;
}
