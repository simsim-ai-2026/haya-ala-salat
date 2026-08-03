import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';
import { formatCoords } from '@/lib/location';
import type { LocationPickerMapProps } from '@/components/location-picker-map';

/**
 * react-native-maps has no web implementation, so the web build gets a readout
 * instead of a map. Browser geolocation still works, so "Use my current
 * location" remains the way to set a position here.
 */
export function LocationPickerMap({ coords }: LocationPickerMapProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-sand-100 px-8 dark:bg-emerald-800">
      <MaterialCommunityIcons name="map-marker-radius-outline" size={44} color="#0f766e" />
      <Text className="mt-3 text-center text-base font-medium text-emerald-900 dark:text-sand-50">
        {formatCoords(coords)}
      </Text>
      <Text className="mt-2 text-center text-sm text-emerald-700/80 dark:text-sand-200/80">
        {t('location.webOnly')}
      </Text>
    </View>
  );
}
