import { useEffect, useRef } from 'react';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { Coords } from '@/lib/prayer-times';

/** Roughly city-scale. Wide enough to reorient, tight enough to place a pin. */
const SPAN = 0.08;

export type LocationPickerMapProps = {
  coords: Coords;
  onChange: (coords: Coords) => void;
  /**
   * Bump this to recenter on `coords`. The map is otherwise uncontrolled — a
   * controlled `region` fights the user's own pan and drag gestures.
   */
  focusToken?: number;
};

function regionFor(coords: Coords): Region {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: SPAN,
    longitudeDelta: SPAN,
  };
}

export function LocationPickerMap({ coords, onChange, focusToken = 0 }: LocationPickerMapProps) {
  const mapRef = useRef<MapView>(null);
  const initialRegion = useRef(regionFor(coords)).current;

  useEffect(() => {
    if (focusToken === 0) return;
    mapRef.current?.animateToRegion(regionFor(coords), 450);
    // Only react to the token; `coords` also changes on every tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onPress={(event) => onChange(event.nativeEvent.coordinate)}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}>
      <Marker
        coordinate={coords}
        draggable
        onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
        pinColor="#0f766e"
      />
    </MapView>
  );
}
