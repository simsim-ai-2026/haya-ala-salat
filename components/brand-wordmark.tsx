import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

/** Sampled from the source artwork; also in `brand` in tailwind.config.js. */
const GOLD = '#d9b771';

export const BRAND_TITLE = 'حَيَّ عَلَى الصَّلَاة';
export const BRAND_TAGLINE = 'رفيقك اليومي للصلاة والعبادة';

/**
 * The five things the app is for. Order matches the source artwork, and is
 * right-to-left in that artwork, so it is reversed on render below.
 */
const PILLARS = [
  { icon: 'clock-outline', label: 'Prayer times' },
  { icon: 'compass-outline', label: 'Qibla' },
  { icon: 'book-open-page-variant-outline', label: 'Quran' },
  { icon: 'dots-circle', label: 'Dhikr' },
  { icon: 'hands-pray', label: 'Dua' },
] as const;

type Props = {
  /** Scales the whole lockup; 1 is the splash size. */
  scale?: number;
};

export function BrandWordmark({ scale = 1 }: Props) {
  const titleSize = 38 * scale;

  return (
    <View className="items-center">
      <Text
        accessibilityRole="header"
        className="text-center font-bold text-brand-cream"
        style={{
          fontSize: titleSize,
          // Arabic harakat sit above the baseline and clip on Android without
          // generous leading and matching vertical padding.
          lineHeight: titleSize * 1.55,
          paddingVertical: titleSize * 0.12,
        }}>
        {BRAND_TITLE}
      </Text>

      <View className="mt-1 flex-row items-center" style={{ gap: 10 * scale }}>
        <View className="h-px bg-brand-gold/40" style={{ width: 56 * scale }} />
        <MaterialCommunityIcons name="star-four-points" size={11 * scale} color={GOLD} />
        <View className="h-px bg-brand-gold/40" style={{ width: 56 * scale }} />
      </View>

      <Text
        className="mt-3 text-center text-brand-cream/85"
        style={{ fontSize: 14 * scale, lineHeight: 14 * scale * 1.7 }}>
        {BRAND_TAGLINE}
      </Text>

      <View
        className="mt-4 flex-row items-center"
        style={{ gap: 22 * scale }}
        accessibilityRole="list">
        {/* Reversed so the reading order matches the right-to-left artwork. */}
        {[...PILLARS].reverse().map((pillar) => (
          <MaterialCommunityIcons
            key={pillar.icon}
            name={pillar.icon}
            size={26 * scale}
            color={GOLD}
            accessibilityLabel={pillar.label}
          />
        ))}
      </View>
    </View>
  );
}
