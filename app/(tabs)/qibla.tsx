import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '@/components/settings';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCompassHeading } from '@/hooks/use-compass-heading';
import { useTranslation } from '@/hooks/use-translation';
import type { StringKey } from '@/lib/i18n';
import { getQiblaDirection } from '@/lib/prayer-times';

/** How close counts as facing the qibla. Phone compasses are not better than this. */
const ALIGN_TOLERANCE_DEGREES = 5;

/** Bearing of each cardinal mark around the dial. */
const CARDINALS: { label: StringKey; bearing: number }[] = [
  { label: 'compass.n', bearing: 0 },
  { label: 'compass.e', bearing: 90 },
  { label: 'compass.s', bearing: 180 },
  { label: 'compass.w', bearing: 270 },
];

/** Shortest angular distance between two bearings, 0–180. */
function angleBetween(a: number, b: number): number {
  const difference = Math.abs(a - b) % 360;
  return difference > 180 ? 360 - difference : difference;
}

export default function QiblaScreen() {
  const { settings, isLoading } = useSettings();
  const { t, rtl } = useTranslation();
  const { heading, accuracy, isAvailable, isMagneticOnly } = useCompassHeading();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand-50 dark:bg-emerald-900">
        <Text className="text-emerald-800 dark:text-sand-100">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  const qibla = getQiblaDirection(settings.coords);

  // Without a compass the dial stays north-up, which still reads correctly as
  // "the qibla is N degrees clockwise from north" — just not relative to you.
  const dialRotation = heading ?? 0;
  const isTracking = isAvailable && heading !== null;
  const isAligned = isTracking && angleBetween(qibla, heading) <= ALIGN_TOLERANCE_DEGREES;

  const align = { textAlign: rtl ? ('right' as const) : ('left' as const) };
  const notice: StringKey | null = !isAvailable
    ? 'qibla.unavailable'
    : accuracy > 0 && accuracy < 2
      ? 'qibla.calibrate'
      : isMagneticOnly
        ? 'qibla.magneticOnly'
        : null;

  return (
    <SafeAreaView className="flex-1 bg-sand-50 dark:bg-emerald-900" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pb-8">
        <View className="pb-2 pt-4">
          <Text className="text-3xl font-bold text-emerald-800 dark:text-sand-50" style={align}>
            {t('qibla.title')}
          </Text>
          <View className={`mt-2 items-center gap-1 ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <IconSymbol name="location.fill" size={14} color="#0f766e" />
            <Text className="text-sm text-emerald-700 dark:text-sand-200">
              {settings.locationName}
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-sm text-emerald-700/80 dark:text-sand-200/80" style={align}>
          {isTracking ? t('qibla.subtitle') : t('qibla.reading')}
        </Text>

        <View className="items-center py-8">
          <View
            className={`h-72 w-72 items-center justify-center rounded-full border-2 ${
              isAligned
                ? 'border-emerald-600 bg-emerald-600/10'
                : 'border-emerald-700/20 bg-white dark:border-sand-200/20 dark:bg-emerald-800'
            }`}>
            {/* Fixed notch: the direction the top of the device is pointing. */}
            <View className="absolute top-2 h-4 w-1.5 rounded-full bg-emerald-700 dark:bg-sand-100" />

            {/* The dial turns against the device so north keeps pointing north. */}
            <View className="absolute inset-0" style={{ transform: [{ rotate: `${-dialRotation}deg` }] }}>
              {CARDINALS.map((cardinal) => (
                <View
                  key={cardinal.label}
                  className="absolute inset-0 items-center"
                  style={{ transform: [{ rotate: `${cardinal.bearing}deg` }] }}>
                  <Text className="mt-5 text-sm font-semibold text-emerald-700/60 dark:text-sand-200/60">
                    {t(cardinal.label)}
                  </Text>
                </View>
              ))}

              {/* Child sits at top centre, so rotating its parent walks it around the rim. */}
              <View
                className="absolute inset-0 items-center"
                style={{ transform: [{ rotate: `${qibla}deg` }] }}>
                <View
                  className={`-mt-6 h-14 w-14 items-center justify-center rounded-full ${
                    isAligned ? 'bg-emerald-600' : 'bg-emerald-700'
                  }`}>
                  {/* MaterialCommunityIcons has no `kaaba` glyph at this version. */}
                  <MaterialCommunityIcons name="mosque" size={26} color="#ffffff" />
                </View>
              </View>
            </View>

            <Text className="text-5xl font-bold text-emerald-800 dark:text-sand-50">
              {Math.round(qibla)}°
            </Text>
            <Text className="mt-1 text-xs uppercase tracking-widest text-emerald-700/70 dark:text-sand-200/70">
              {t('qibla.direction')}
            </Text>
          </View>

          {isAligned ? (
            <View className="mt-6 flex-row items-center gap-2 rounded-full bg-emerald-600 px-5 py-2">
              <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">{t('qibla.aligned')}</Text>
            </View>
          ) : null}
        </View>

        <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
          <ReadingRow
            label={t('qibla.direction')}
            value={`${Math.round(qibla)}°`}
            hint={t('qibla.fromNorth')}
            rtl={rtl}
            isLast={!isTracking}
          />
          {isTracking ? (
            <ReadingRow
              label={t('qibla.heading')}
              value={`${Math.round(heading)}°`}
              rtl={rtl}
              isLast
            />
          ) : null}
        </View>

        {notice ? (
          <Text
            className="mt-4 text-xs leading-5 text-emerald-700/70 dark:text-sand-200/70"
            style={align}>
            {t(notice)}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReadingRow({
  label,
  value,
  hint,
  rtl,
  isLast,
}: {
  label: string;
  value: string;
  hint?: string;
  rtl: boolean;
  isLast: boolean;
}) {
  const align = { textAlign: rtl ? ('right' as const) : ('left' as const) };

  return (
    <View
      className={`items-center px-5 py-4 ${rtl ? 'flex-row-reverse' : 'flex-row'} ${
        isLast ? '' : 'border-b border-sand-100 dark:border-emerald-700'
      }`}>
      <View className="flex-1">
        <Text className="text-base text-emerald-900 dark:text-sand-50" style={align}>
          {label}
        </Text>
        {hint ? (
          <Text className="mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70" style={align}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Text className="text-lg font-semibold text-emerald-800 dark:text-sand-50">{value}</Text>
    </View>
  );
}
