import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { BrandWordmark } from '@/components/brand-wordmark';

/**
 * Width the logo renders at, in points. Must match `imageWidth` in the
 * expo-splash-screen plugin config so the native splash hands over to this
 * component without the logo visibly jumping.
 */
export const LOGO_WIDTH = 220;

const LOGO_ASPECT = 720 / 760; // brand-logo.png

const HOLD_MS = 950;
const REVEAL_MS = 600;
const FADE_MS = 450;

type Props = {
  /** Flip to true once the app has what it needs to render its first screen. */
  isAppReady: boolean;
  /** Called after the overlay has fully faded out. */
  onFinish?: () => void;
};

/**
 * Full-screen overlay that continues the native splash in JS so the wordmark can
 * be shown — the native splash supports an image and a background color only.
 *
 * Sequence: native splash → this mounts identically → logo lifts, wordmark fades
 * in → hold → whole overlay fades out.
 */
export function BrandedSplash({ isAppReady, onFinish }: Props) {
  const [isMounted, setIsMounted] = useState(true);

  const overlayOpacity = useSharedValue(1);
  const logoShift = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);

  // Hand over from the native splash only once this overlay has painted,
  // otherwise there is a blank frame between the two.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
      // Already hidden — nothing to do.
    });
  }, []);

  useEffect(() => {
    if (!isAppReady) return;

    const easing = Easing.out(Easing.cubic);

    logoShift.value = withTiming(-28, { duration: REVEAL_MS, easing });
    wordmarkOpacity.value = withTiming(1, { duration: REVEAL_MS, easing });

    overlayOpacity.value = withDelay(
      REVEAL_MS + HOLD_MS,
      withTiming(0, { duration: FADE_MS, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
          if (onFinish) runOnJS(onFinish)();
        }
      })
    );
  }, [isAppReady, logoShift, onFinish, overlayOpacity, wordmarkOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoShift.value }] }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: (1 - wordmarkOpacity.value) * 16 }],
  }));

  if (!isMounted) return null;

  return (
    <Animated.View
      pointerEvents={isAppReady ? 'none' : 'auto'}
      style={[
        {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b2b22',
        },
        overlayStyle,
      ]}>
      <Animated.View style={logoStyle}>
        <Image
          source={require('@/assets/images/brand-logo.png')}
          style={{ width: LOGO_WIDTH, height: LOGO_WIDTH / LOGO_ASPECT }}
          contentFit="contain"
          // The splash must not wait on a network/disk decode round trip.
          cachePolicy="memory-disk"
        />
      </Animated.View>

      <Animated.View style={[{ marginTop: 28, paddingHorizontal: 24 }, wordmarkStyle]}>
        <BrandWordmark />
      </Animated.View>
    </Animated.View>
  );
}
