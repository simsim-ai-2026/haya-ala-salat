import * as Location from 'expo-location';
import { Platform } from 'react-native';

import type { Coords } from '@/lib/prayer-times';

export type ResolvedPlace = {
  coords: Coords;
  name: string;
};

/** Fallback shown when reverse geocoding returns nothing useful. */
export function formatCoords({ latitude, longitude }: Coords): string {
  const ns = latitude >= 0 ? 'N' : 'S';
  const ew = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(3)}°${ns}, ${Math.abs(longitude).toFixed(3)}°${ew}`;
}

/**
 * Best available human-readable name for a point. Reverse geocoding needs the
 * network and is not available everywhere, so this never rejects — callers get
 * coordinates rendered as text instead of an error.
 */
export async function describeCoords(coords: Coords): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync(coords);
    if (!place) return formatCoords(coords);

    const locality = place.city ?? place.subregion ?? place.district ?? place.region;
    const parts = [locality, place.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : formatCoords(coords);
  } catch {
    return formatCoords(coords);
  }
}

export type PlaceSuggestion = {
  /** Stable key — `geocodeAsync` gives us no id of its own. */
  id: string;
  coords: Coords;
  /** Primary line, e.g. "Casablanca". */
  name: string;
  /** Secondary line, e.g. "Casablanca-Settat, Morocco". Possibly empty. */
  detail: string;
};

export type SearchResult =
  | { status: 'ok'; places: PlaceSuggestion[] }
  | { status: 'denied' }
  | { status: 'error' };

/** Below this, the platform geocoder mostly returns noise. */
export const MIN_QUERY_LENGTH = 3;

/** How many hits to label. Each one costs a reverse-geocode round trip. */
const MAX_SUGGESTIONS = 4;

function labelFor(place: Location.LocationGeocodedAddress, coords: Coords) {
  const name = place.city ?? place.name ?? place.subregion ?? place.region ?? place.country;
  const detail = [place.subregion ?? place.region, place.country]
    .filter((part): part is string => Boolean(part))
    .filter((part, index, all) => all.indexOf(part) === index && part !== name)
    .join(', ');

  return { name: name ?? formatCoords(coords), detail };
}

/**
 * Forward geocode a free-text query into labelled suggestions.
 *
 * The platform geocoder returns coordinates with no names attached, so each hit
 * is reverse geocoded to build a label. That doubles the round trips, which is
 * why callers must debounce — Apple's CLGeocoder throttles aggressively and
 * Android's errors outright when several requests are in flight.
 */
export async function searchPlaces(query: string): Promise<SearchResult> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return { status: 'ok', places: [] };

  try {
    // Android refuses to geocode at all without foreground location permission.
    if (Platform.OS === 'android') {
      const existing = await Location.getForegroundPermissionsAsync();
      if (!existing.granted) {
        const requested = await Location.requestForegroundPermissionsAsync();
        if (!requested.granted) return { status: 'denied' };
      }
    }

    const hits = await Location.geocodeAsync(trimmed);
    if (hits.length === 0) return { status: 'ok', places: [] };

    const seen = new Set<string>();
    const places: PlaceSuggestion[] = [];

    for (const hit of hits) {
      if (places.length >= MAX_SUGGESTIONS) break;

      const coords: Coords = { latitude: hit.latitude, longitude: hit.longitude };
      // Two hits within ~100m are the same place as far as prayer times care.
      const id = `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`;
      if (seen.has(id)) continue;
      seen.add(id);

      let label = { name: formatCoords(coords), detail: '' };
      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (address) label = labelFor(address, coords);
      } catch {
        // Keep the coordinate label rather than dropping an otherwise valid hit.
      }

      places.push({ id, coords, ...label });
    }

    return { status: 'ok', places };
  } catch {
    return { status: 'error' };
  }
}

export type CurrentLocationResult =
  | { status: 'granted'; place: ResolvedPlace }
  | { status: 'denied' }
  | { status: 'disabled' }
  | { status: 'error' };

/**
 * Asks for permission and takes a single fix.
 *
 * `Balanced` accuracy is deliberate: prayer times shift by well under a minute
 * across a city block, so a slower high-accuracy fix buys nothing.
 */
export async function getCurrentPlace(): Promise<CurrentLocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { status: 'denied' };

    if (!(await Location.hasServicesEnabledAsync())) return { status: 'disabled' };

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords: Coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    return { status: 'granted', place: { coords, name: await describeCoords(coords) } };
  } catch {
    return { status: 'error' };
  }
}
