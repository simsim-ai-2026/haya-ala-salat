import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/hooks/use-translation';
import { DHIKR_CATEGORIES, getDhikr, type DhikrCategory } from '@/lib/dhikr';
import type { StringKey } from '@/lib/i18n';

const ICONS: Record<DhikrCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  morning: 'weather-sunset-up',
  evening: 'weather-sunset-down',
  night: 'weather-night',
  afterPrayer: 'mosque',
};

export default function DhikrScreen() {
  const { t, rtl } = useTranslation();
  const align = { textAlign: rtl ? ('right' as const) : ('left' as const) };

  return (
    <SafeAreaView className="flex-1 bg-sand-50 dark:bg-emerald-900" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-8">
        <View className="pb-6 pt-4">
          <Text className="text-3xl font-bold text-emerald-800 dark:text-sand-50" style={align}>
            {t('dhikr.title')}
          </Text>
          <Text className="mt-1 text-sm text-emerald-700/80 dark:text-sand-200/80" style={align}>
            {t('dhikr.subtitle')}
          </Text>
        </View>

        <View className="gap-3">
          {DHIKR_CATEGORIES.map((category) => (
            <DhikrCard
              key={category}
              icon={ICONS[category]}
              title={t(`dhikr.${category}` as StringKey)}
              hint={t(`dhikr.${category}Hint` as StringKey)}
              badge={String(getDhikr(category).length)}
              rtl={rtl}
              onPress={() =>
                router.push({ pathname: '/dhikr/[category]', params: { category } })
              }
            />
          ))}

          <DhikrCard
            icon="counter"
            title={t('dhikr.tasbih')}
            hint={t('dhikr.tasbihHint')}
            rtl={rtl}
            onPress={() => router.push('/dhikr/tasbih')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DhikrCard({
  icon,
  title,
  hint,
  badge,
  rtl,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  hint: string;
  badge?: string;
  rtl: boolean;
  onPress: () => void;
}) {
  const align = { textAlign: rtl ? ('right' as const) : ('left' as const) };

  return (
    <Pressable
      onPress={onPress}
      className={`items-center gap-4 rounded-2xl bg-white p-4 active:opacity-70 dark:bg-emerald-800 ${
        rtl ? 'flex-row-reverse' : 'flex-row'
      }`}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-emerald-700/10 dark:bg-emerald-700/40">
        <MaterialCommunityIcons name={icon} size={24} color="#0f766e" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-emerald-900 dark:text-sand-50" style={align}>
          {title}
        </Text>
        <Text className="mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70" style={align}>
          {hint}
        </Text>
      </View>

      {badge ? (
        <Text className="text-sm font-semibold text-emerald-700/60 dark:text-sand-200/60">
          {badge}
        </Text>
      ) : null}
      <MaterialCommunityIcons
        name={rtl ? 'chevron-left' : 'chevron-right'}
        size={22}
        color="#0f766e"
      />
    </Pressable>
  );
}
