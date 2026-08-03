import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';
import { resolveTasbihPhrase, TASBIH_PHRASES, TASBIH_TARGETS } from '@/lib/dhikr';
import { getItem, setItem } from '@/lib/storage';

const STORAGE_KEY = 'tasbih';
const CUSTOM_ID = 'custom';

type TasbihState = {
  /** A phrase id from TASBIH_PHRASES, or `custom` for the user's own words. */
  phraseId: string;
  customText: string;
  target: number;
  count: number;
  rounds: number;
};

const DEFAULT_STATE: TasbihState = {
  phraseId: TASBIH_PHRASES[0].id,
  customText: '',
  target: TASBIH_PHRASES[0].target,
  count: 0,
  rounds: 0,
};

/** Haptics are the point of a physical-feeling counter, but web has none. */
const CAN_VIBRATE = process.env.EXPO_OS !== 'web';

export default function TasbihScreen() {
  const { t, language, rtl } = useTranslation();
  const [state, setState] = useState<TasbihState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getItem<Partial<TasbihState>>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored) setState({ ...DEFAULT_STATE, ...stored });
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced so a fast round of 100 taps is one write, not a hundred. The guard
  // matters more: without it the defaults would overwrite the stored count in
  // the moment before AsyncStorage answers.
  useEffect(() => {
    if (!isLoaded) return;

    const handle = setTimeout(() => void setItem(STORAGE_KEY, state), 400);
    return () => clearTimeout(handle);
  }, [isLoaded, state]);

  const phrase = TASBIH_PHRASES.find((option) => option.id === state.phraseId);
  const align = { textAlign: rtl ? ('right' as const) : ('left' as const) };

  const count = () => {
    const next = state.count + 1;
    const isRoundDone = next >= state.target;

    setState({
      ...state,
      count: isRoundDone ? 0 : next,
      rounds: isRoundDone ? state.rounds + 1 : state.rounds,
    });

    if (CAN_VIBRATE) {
      if (isRoundDone) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const choosePhrase = (phraseId: string, target: number) =>
    // A new phrase starts its own count; carrying the old one over would be a
    // silent miscount.
    setState({ ...state, phraseId, target, count: 0, rounds: 0 });

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-sand-50 dark:bg-emerald-900">
        <Stack.Screen options={{ title: t('dhikr.tasbih') }} />
        <Text className="text-emerald-800 dark:text-sand-100">{t('common.loading')}</Text>
      </View>
    );
  }

  const { arabic, translation } = phrase
    ? resolveTasbihPhrase(phrase, language)
    : { arabic: state.customText, translation: null };

  return (
    <View className="flex-1 bg-sand-50 dark:bg-emerald-900">
      <Stack.Screen options={{ title: t('dhikr.tasbih') }} />

      <ScrollView contentContainerClassName="px-5 pb-10 pt-4" keyboardShouldPersistTaps="handled">
        <Text
          className="text-xs font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-sand-200/70"
          style={align}>
          {t('tasbih.choosePhrase')}
        </Text>

        <View className={`mt-3 flex-row flex-wrap gap-2 ${rtl ? 'justify-end' : ''}`}>
          {TASBIH_PHRASES.map((option) => (
            <Chip
              key={option.id}
              label={option.ar}
              selected={state.phraseId === option.id}
              onPress={() => choosePhrase(option.id, option.target)}
            />
          ))}
          <Chip
            label={t('tasbih.custom')}
            selected={state.phraseId === CUSTOM_ID}
            onPress={() => choosePhrase(CUSTOM_ID, state.target)}
          />
        </View>

        {state.phraseId === CUSTOM_ID ? (
          <TextInput
            value={state.customText}
            onChangeText={(customText) => setState({ ...state, customText })}
            placeholder={t('tasbih.customPlaceholder')}
            placeholderTextColor="#0f766e99"
            multiline
            className="mt-3 rounded-2xl bg-white px-4 py-3 text-base text-emerald-900 dark:bg-emerald-800 dark:text-sand-50"
            style={{ textAlign: rtl ? 'right' : 'left', minHeight: 56 }}
          />
        ) : null}

        <Text
          className="mt-6 text-xs font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-sand-200/70"
          style={align}>
          {t('tasbih.target')}
        </Text>

        <View className={`mt-3 flex-row flex-wrap gap-2 ${rtl ? 'justify-end' : ''}`}>
          {TASBIH_TARGETS.map((target) => (
            <Chip
              key={target}
              label={String(target)}
              selected={state.target === target}
              onPress={() => setState({ ...state, target, count: 0 })}
            />
          ))}
        </View>

        <Pressable
          onPress={count}
          accessibilityRole="button"
          accessibilityLabel={t('tasbih.tap')}
          className="mt-6 items-center justify-center rounded-3xl bg-emerald-700 px-6 py-8 active:opacity-90 dark:bg-emerald-800"
          style={{ minHeight: 280 }}>
          {arabic ? (
            <Text
              className="text-2xl text-white"
              style={{ textAlign: 'center', writingDirection: 'rtl', lineHeight: 46 }}>
              {arabic}
            </Text>
          ) : null}

          {translation ? (
            <Text className="mt-2 text-center text-sm text-sand-200">{translation}</Text>
          ) : null}

          <Text className="mt-6 text-7xl font-bold text-white">{state.count}</Text>
          <Text className="mt-1 text-sm text-sand-200">
            {state.count} / {state.target}
          </Text>

          <View className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <View
              className="h-full rounded-full bg-sand-200"
              style={{ width: `${Math.min(100, (state.count / state.target) * 100)}%` }}
            />
          </View>

          <Text className="mt-4 text-xs uppercase tracking-widest text-sand-200/80">
            {t('tasbih.rounds')} · {state.rounds}
          </Text>
        </Pressable>

        <Text className="mt-3 text-center text-xs text-emerald-700/70 dark:text-sand-200/70">
          {t('tasbih.tap')}
        </Text>

        <Pressable
          onPress={() => setState({ ...state, count: 0, rounds: 0 })}
          className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-700/30 py-4 active:opacity-70">
          <MaterialCommunityIcons name="refresh" size={18} color="#0f766e" />
          <Text className="text-base font-medium text-emerald-700 dark:text-sand-200">
            {t('tasbih.reset')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`rounded-full px-4 py-2 active:opacity-70 ${
        selected ? 'bg-emerald-700' : 'bg-white dark:bg-emerald-800'
      }`}>
      <Text
        className={`text-sm ${
          selected ? 'font-semibold text-white' : 'text-emerald-800 dark:text-sand-100'
        }`}
        style={{ lineHeight: 26 }}>
        {label}
      </Text>
    </Pressable>
  );
}
