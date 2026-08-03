import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type CompassHeading = {
  /** Degrees clockwise from north, or null until the first reading arrives. */
  heading: number | null;
  /** 3 high · 2 medium · 1 low · 0 unusable. Android moves through these freely. */
  accuracy: number;
  /** False on web, and on any device whose compass refuses to start. */
  isAvailable: boolean;
  /**
   * True when only magnetic north was available. Qibla bearings are computed
   * from true north, so a reading like this is off by the local magnetic
   * declination — up to ~15° in parts of the world. Worth telling the user.
   */
  isMagneticOnly: boolean;
};

/** `watchHeadingAsync` is native-only; web has no implementation at all. */
const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

const INITIAL = { heading: null, accuracy: 0, isMagneticOnly: false };

/**
 * Subscribes to the device compass for as long as the screen is mounted.
 *
 * The subscription is deliberately not shared or cached: a magnetometer that
 * keeps running behind an unmounted screen costs battery for nothing.
 */
export function useCompassHeading(): CompassHeading {
  const [reading, setReading] = useState<Omit<CompassHeading, 'isAvailable'>>(INITIAL);
  const [isAvailable, setIsAvailable] = useState(SUPPORTED);

  useEffect(() => {
    if (!SUPPORTED) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    Location.watchHeadingAsync((update) => {
      // trueHeading is -1 without foreground location permission. The user can
      // have reached this screen having only ever picked a city on the map, so
      // that is a normal state, not an error — fall back to magnetic north.
      const hasTrueNorth = update.trueHeading >= 0;

      setReading({
        heading: hasTrueNorth ? update.trueHeading : update.magHeading,
        accuracy: update.accuracy,
        isMagneticOnly: !hasTrueNorth,
      });
    })
      .then((created) => {
        // Unmounting before the promise settles would otherwise leak the watch.
        if (cancelled) created.remove();
        else subscription = created;
      })
      .catch(() => setIsAvailable(false));

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { ...reading, isAvailable };
}
