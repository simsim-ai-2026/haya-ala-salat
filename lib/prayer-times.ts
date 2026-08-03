import {
  CalculationMethod,
  Coordinates,
  Madhab,
  Prayer,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';

export type Coords = { latitude: number; longitude: number };

export type CalculationMethodKey = keyof typeof CalculationMethod;
export type MadhabKey = (typeof Madhab)[keyof typeof Madhab];
export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

/** The five obligatory prayers, in order. Sunrise is tracked but is not a prayer. */
export const PRAYER_ORDER: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

// Display names live in lib/i18n.ts under the `prayer.*` keys, so that they are
// translated alongside the rest of the UI rather than in two places.

/** Methods exposed in Settings, with the regions they are normally used in. */
export const CALCULATION_METHODS: { key: CalculationMethodKey; label: string }[] = [
  { key: 'MuslimWorldLeague', label: 'Muslim World League' },
  { key: 'Egyptian', label: 'Egyptian General Authority' },
  { key: 'Karachi', label: 'University of Karachi' },
  { key: 'UmmAlQura', label: 'Umm al-Qura, Makkah' },
  { key: 'Dubai', label: 'Dubai' },
  { key: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
  { key: 'NorthAmerica', label: 'ISNA, North America' },
  { key: 'Kuwait', label: 'Kuwait' },
  { key: 'Qatar', label: 'Qatar' },
  { key: 'Singapore', label: 'Singapore' },
  { key: 'Tehran', label: 'Tehran' },
  { key: 'Turkey', label: 'Diyanet, Turkey' },
];

export type PrayerCalculationOptions = {
  method: CalculationMethodKey;
  madhab: MadhabKey;
};

function buildParameters({ method, madhab }: PrayerCalculationOptions) {
  const params = CalculationMethod[method]();
  params.madhab = madhab;
  return params;
}

export function getPrayerTimes(
  coords: Coords,
  options: PrayerCalculationOptions,
  date: Date = new Date()
): PrayerTimes {
  return new PrayerTimes(
    new Coordinates(coords.latitude, coords.longitude),
    date,
    buildParameters(options)
  );
}

export type PrayerEntry = {
  name: PrayerName;
  time: Date;
  isNext: boolean;
  isCurrent: boolean;
};

/** Flattens an adhan `PrayerTimes` into a render-ready, ordered list. */
export function toSchedule(prayerTimes: PrayerTimes, now: Date = new Date()): PrayerEntry[] {
  const current = prayerTimes.currentPrayer(now);
  const next = prayerTimes.nextPrayer(now);

  return PRAYER_ORDER.map((name) => ({
    name,
    time: prayerTimes[name],
    isCurrent: current === name,
    isNext: next === name,
  }));
}

/**
 * The upcoming prayer. `nextPrayer` returns `none` once Isha has passed, in which
 * case the next prayer is tomorrow's Fajr.
 */
export function getNextPrayer(
  coords: Coords,
  options: PrayerCalculationOptions,
  now: Date = new Date()
): { name: PrayerName; time: Date } {
  const today = getPrayerTimes(coords, options, now);
  const next = today.nextPrayer(now);

  if (next !== Prayer.None) {
    return { name: next, time: today[next] };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { name: 'fajr', time: getPrayerTimes(coords, options, tomorrow).fajr };
}

/** Midpoint of the night and the last third — useful for Qiyam reminders. */
export function getSunnahTimes(prayerTimes: PrayerTimes): SunnahTimes {
  return new SunnahTimes(prayerTimes);
}

/** Bearing to the Kaaba, in degrees clockwise from true north. */
export function getQiblaDirection(coords: Coords): number {
  return Qibla(new Coordinates(coords.latitude, coords.longitude));
}

export function formatTime(date: Date, use24Hour: boolean, locale?: string): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  });
}

/** `HH:MM:SS` remaining until `target`, clamped at zero. */
export function formatCountdown(target: Date, now: Date = new Date()): string {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}
