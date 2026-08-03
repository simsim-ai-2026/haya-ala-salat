import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useTranslation, type Translator } from '@/hooks/use-translation';
import {
  MIN_QUERY_LENGTH,
  searchPlaces,
  type PlaceSuggestion,
  type SearchResult,
} from '@/lib/location';

/**
 * Generous, because each keystroke costs a geocode plus a reverse geocode and the
 * platform geocoders throttle. Short enough to still feel like type-ahead.
 */
const DEBOUNCE_MS = 450;

type Props = {
  onSelect: (place: PlaceSuggestion) => void;
};

export function LocationSearch({ onSelect }: Props) {
  const { t, rtl } = useTranslation();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Responses can land out of order; only the newest query may write state.
  const latestQuery = useRef('');

  useEffect(() => {
    const trimmed = query.trim();
    latestQuery.current = trimmed;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResult(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchPlaces(trimmed).then((next) => {
        if (latestQuery.current !== trimmed) return;
        setResult(next);
        setIsSearching(false);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const choose = (place: PlaceSuggestion) => {
    Keyboard.dismiss();
    setQuery('');
    setResult(null);
    setIsFocused(false);
    onSelect(place);
  };

  const clear = () => {
    setQuery('');
    setResult(null);
  };

  // Sits above the map in the stacking order; Android needs elevation too.
  const showDropdown = isFocused && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <View className="z-10" style={{ zIndex: 10, elevation: 10 }}>
      <View className="flex-row items-center gap-2 rounded-2xl bg-white px-4 dark:bg-emerald-800">
        <MaterialCommunityIcons name="magnify" size={20} color="#0f766e" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          placeholder={t('location.search')}
          placeholderTextColor="#0f766e80"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 py-3.5 text-base text-emerald-900 dark:text-sand-50"
          style={{ textAlign: rtl ? 'right' : 'left' }}
          accessibilityLabel={t('location.search')}
        />
        {isSearching ? <ActivityIndicator size="small" color="#0f766e" /> : null}
        {query.length > 0 && !isSearching ? (
          <Pressable onPress={clear} hitSlop={10} accessibilityLabel={t('location.clearSearch')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#0f766e" />
          </Pressable>
        ) : null}
      </View>

      {showDropdown ? (
        <View
          className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl bg-white dark:bg-emerald-800"
          style={{ maxHeight: 240, elevation: 10 }}>
          <SuggestionList
            result={result}
            isSearching={isSearching}
            onChoose={choose}
            t={t}
            rtl={rtl}
          />
        </View>
      ) : null}
    </View>
  );
}

function SuggestionList({
  result,
  isSearching,
  onChoose,
  t,
  rtl,
}: {
  result: SearchResult | null;
  isSearching: boolean;
  onChoose: (place: PlaceSuggestion) => void;
  t: Translator;
  rtl: boolean;
}) {
  if (isSearching && !result) {
    return <Hint text={t('location.searching')} />;
  }
  if (!result) return null;

  if (result.status === 'denied') {
    return <Hint text={t('location.searchNeedsPermission')} />;
  }
  if (result.status === 'error') {
    return <Hint text={t('location.searchUnavailable')} />;
  }
  if (result.places.length === 0) {
    return <Hint text={t('location.noMatch')} />;
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {result.places.map((place, index) => (
        <Pressable
          key={place.id}
          onPress={() => onChoose(place)}
          className={`items-center gap-3 px-4 py-3 active:opacity-60 ${
            rtl ? 'flex-row-reverse' : 'flex-row'
          } ${
            index === result.places.length - 1
              ? ''
              : 'border-b border-sand-100 dark:border-emerald-700'
          }`}>
          <MaterialCommunityIcons name="map-marker-outline" size={18} color="#0f766e" />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base text-emerald-900 dark:text-sand-50"
              style={{ textAlign: rtl ? 'right' : 'left' }}>
              {place.name}
            </Text>
            {place.detail ? (
              <Text
                numberOfLines={1}
                className="text-xs text-emerald-700/70 dark:text-sand-200/70"
                style={{ textAlign: rtl ? 'right' : 'left' }}>
                {place.detail}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <Text className="px-4 py-3 text-sm text-emerald-700/80 dark:text-sand-200/80">{text}</Text>
  );
}
