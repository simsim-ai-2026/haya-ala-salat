import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPickerMap } from '@/components/location-picker-map';
import { LocationSearch } from '@/components/location-search';
import { useSettings } from '@/components/settings';
import { useTranslation } from '@/hooks/use-translation';
import { describeCoords, formatCoords, getCurrentPlace } from '@/lib/location';
import type { Coords } from '@/lib/prayer-times';

export default function LocationSetupScreen() {
  const { settings, updateSettings } = useSettings();
  const { t, rtl } = useTranslation();
  // Present as an editable screen when reached from Settings, not onboarding.
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === '1';

  const [coords, setCoords] = useState<Coords>(settings.coords);
  const [name, setName] = useState(isEditing ? settings.locationName : '');
  const [focusToken, setFocusToken] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  const pick = (next: Coords) => {
    setCoords(next);
    setName('');
    // Naming the point is best-effort and must not block the confirm button.
    describeCoords(next).then(setName);
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    const result = await getCurrentPlace();
    setIsLocating(false);

    if (result.status === 'granted') {
      setCoords(result.place.coords);
      setName(result.place.name);
      setFocusToken((token) => token + 1);
      return;
    }

    const message =
      result.status === 'denied'
        ? t('location.denied')
        : result.status === 'disabled'
          ? t('location.disabled')
          : t('location.error');

    Alert.alert(t('location.unavailableTitle'), message);
  };

  const [isConfirmed, setIsConfirmed] = useState(false);

  const confirm = () => {
    updateSettings({
      coords,
      locationName: name || formatCoords(coords),
      hasSetLocation: true,
    });
    setIsConfirmed(true);
  };

  // Leaving is deferred until the new flag is actually in context. Navigating in
  // the same tick races the tab layout's redirect, which would bounce the user
  // straight back here and lose the pin they just placed.
  useEffect(() => {
    if (!isConfirmed || !settings.hasSetLocation) return;
    if (isEditing && router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [isConfirmed, isEditing, settings.hasSetLocation]);

  return (
    <SafeAreaView className="flex-1 bg-sand-50 dark:bg-emerald-900" edges={['top']}>
      <View className="flex-row items-start gap-3 px-5 pb-4 pt-2">
        {isEditing ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="mt-1 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}>
            <MaterialCommunityIcons name={rtl ? 'chevron-right' : 'chevron-left'} size={28} color="#0f766e" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-emerald-800 dark:text-sand-50">
            {isEditing ? t('location.editTitle') : t('location.title')}
          </Text>
          <Text className="mt-1 text-sm text-emerald-700/80 dark:text-sand-200/80">
            {t('location.subtitle')}
          </Text>
        </View>
      </View>

      <View className="px-5 pb-3">
        <LocationSearch
          onSelect={(place) => {
            setCoords(place.coords);
            setName(place.name);
            setFocusToken((token) => token + 1);
          }}
        />
      </View>

      <View className="mx-5 flex-1 overflow-hidden rounded-2xl">
        <LocationPickerMap coords={coords} onChange={pick} focusToken={focusToken} />
      </View>

      <View className="px-5 pb-6 pt-4">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="map-marker" size={18} color="#0f766e" />
          <Text
            numberOfLines={1}
            className="flex-1 text-base font-medium text-emerald-900 dark:text-sand-50">
            {name || formatCoords(coords)}
          </Text>
        </View>
        <Text className="ml-6 mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70">
          {formatCoords(coords)}
        </Text>

        <Pressable
          onPress={useCurrentLocation}
          disabled={isLocating}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-700/30 py-3.5 active:opacity-70 disabled:opacity-50">
          {isLocating ? (
            <ActivityIndicator color="#0f766e" />
          ) : (
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#0f766e" />
          )}
          <Text className="text-base font-medium text-emerald-700 dark:text-sand-200">
            {isLocating ? t('location.locating') : t('location.useCurrent')}
          </Text>
        </Pressable>

        <Pressable
          onPress={confirm}
          className="mt-3 items-center rounded-2xl bg-emerald-700 py-4 active:opacity-80">
          <Text className="text-base font-semibold text-white">
            {isEditing ? t('location.save') : t('location.confirm')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
