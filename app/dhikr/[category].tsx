import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';
import { getDhikr, isDhikrCategory, resolveDhikr, type DhikrEntry } from '@/lib/dhikr';
import type { LanguageCode, StringKey } from '@/lib/i18n';

export default function DhikrCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { t, language, rtl } = useTranslation();
  // How many repetitions the user has ticked off, per entry. Deliberately not
  // persisted: adhkār are for the current morning, not a streak to maintain.
  const [counts, setCounts] = useState<Record<string, number>>({});

  if (!isDhikrCategory(category)) return null;

  const entries = getDhikr(category);
  const title = t(`dhikr.${category}` as StringKey);

  const tap = (entry: DhikrEntry) => {
    setCounts((previous) => {
      const current = previous[entry.id] ?? 0;
      // Tapping a finished dhikr starts it over, so a second reading needs no
      // separate reset control.
      return { ...previous, [entry.id]: current >= entry.repeat ? 0 : current + 1 };
    });
  };

  return (
    <View className="flex-1 bg-sand-50 dark:bg-emerald-900">
      <Stack.Screen options={{ title }} />

      <ScrollView contentContainerClassName="gap-3 px-5 pb-10 pt-4">
        <Text
          className="pb-1 text-xs text-emerald-700/70 dark:text-sand-200/70"
          style={{ textAlign: rtl ? 'right' : 'left' }}>
          {t('dhikr.tapToCount')}
        </Text>

        {entries.map((entry) => (
          <DhikrRow
            key={entry.id}
            entry={entry}
            count={counts[entry.id] ?? 0}
            language={language}
            rtl={rtl}
            doneLabel={t('dhikr.done')}
            onPress={() => tap(entry)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function DhikrRow({
  entry,
  count,
  language,
  rtl,
  doneLabel,
  onPress,
}: {
  entry: DhikrEntry;
  count: number;
  language: LanguageCode;
  rtl: boolean;
  doneLabel: string;
  onPress: () => void;
}) {
  const { arabic, translation, source } = resolveDhikr(entry, language);
  const isDone = count >= entry.repeat;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`rounded-2xl border p-5 active:opacity-70 ${
        isDone
          ? 'border-emerald-600 bg-emerald-600/10'
          : 'border-transparent bg-white dark:bg-emerald-800'
      }`}>
      {/*
        The dhikr is Arabic whatever the UI language, so it is always laid out
        right-to-left. Harakat clip on Android at the default leading, hence the
        explicit lineHeight rather than a Tailwind leading-* class.
      */}
      <Text
        className="text-2xl text-emerald-900 dark:text-sand-50"
        style={{ textAlign: 'right', writingDirection: 'rtl', lineHeight: 46 }}>
        {arabic}
      </Text>

      {translation ? (
        <Text
          className="mt-3 text-sm leading-5 text-emerald-800/80 dark:text-sand-100/80"
          style={{ textAlign: rtl ? 'right' : 'left' }}>
          {translation}
        </Text>
      ) : null}

      <View
        className={`mt-4 items-center gap-3 ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {isDone ? (
          <View className={`items-center gap-1.5 ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#0f766e" />
            <Text className="text-xs font-semibold text-emerald-700 dark:text-sand-100">
              {doneLabel}
            </Text>
          </View>
        ) : (
          <Text className="text-xs font-semibold text-emerald-700 dark:text-sand-100">
            {count} / {entry.repeat}
          </Text>
        )}

        <View className="flex-1" />

        {source ? (
          <Text className="text-xs text-emerald-700/60 dark:text-sand-200/60">{source}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
