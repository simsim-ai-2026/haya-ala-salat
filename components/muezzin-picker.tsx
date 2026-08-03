import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTranslation } from '@/hooks/use-translation';
import {
  isMuezzinAvailable,
  MUEZZIN_OPTIONS,
  type MuezzinId,
  type MuezzinOption,
} from '@/lib/muezzin';

type Props = {
  selected: MuezzinId;
  onSelect: (id: MuezzinId) => void;
};

export function MuezzinPicker({ selected, onSelect }: Props) {
  const { t, rtl } = useTranslation();

  // One player reused across rows; `replace()` swaps the recording.
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [previewId, setPreviewId] = useState<MuezzinId | null>(null);

  useEffect(() => {
    // The adhan should be audible even with the ringer switched off.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status.didJustFinish) setPreviewId(null);
  }, [status.didJustFinish]);

  // Previewing is a decision aid, not playback the user expects to continue.
  useEffect(() => {
    return () => {
      player.pause();
    };
  }, [player]);

  const togglePreview = (option: MuezzinOption) => {
    if (!option.source) return;

    if (previewId === option.id && status.playing) {
      player.pause();
      setPreviewId(null);
      return;
    }

    player.replace(option.source);
    player.seekTo(0);
    player.play();
    setPreviewId(option.id);
  };

  const choose = (option: MuezzinOption) => {
    if (!isMuezzinAvailable(option)) return;
    if (option.id === 'none') {
      player.pause();
      setPreviewId(null);
    }
    onSelect(option.id);
  };

  return (
    <View className="overflow-hidden rounded-2xl bg-white dark:bg-emerald-800">
      {MUEZZIN_OPTIONS.map((option, index) => {
        const available = isMuezzinAvailable(option);
        const isPlaying = previewId === option.id && status.playing;

        return (
          <View
            key={option.id}
            className={`items-center px-5 py-4 ${rtl ? 'flex-row-reverse' : 'flex-row'} ${
              index === MUEZZIN_OPTIONS.length - 1
                ? ''
                : 'border-b border-sand-100 dark:border-emerald-700'
            } ${available ? '' : 'opacity-50'}`}>
            <Pressable
              onPress={() => choose(option)}
              disabled={!available}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === option.id, disabled: !available }}
              className="flex-1 px-3 active:opacity-60">
              <Text
                className="text-base text-emerald-900 dark:text-sand-50"
                style={{ textAlign: rtl ? 'right' : 'left' }}>
                {t(option.labelKey)}
              </Text>
              <Text
                className="mt-0.5 text-xs text-emerald-700/70 dark:text-sand-200/70"
                style={{ textAlign: rtl ? 'right' : 'left' }}>
                {available ? t(option.hintKey) : t('muezzin.unavailable')}
              </Text>
            </Pressable>

            {option.source ? (
              <Pressable
                onPress={() => togglePreview(option)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? t('muezzin.stop') : t('muezzin.play')}
                className="px-2 active:opacity-60">
                <MaterialCommunityIcons
                  name={isPlaying ? 'stop-circle-outline' : 'play-circle-outline'}
                  size={26}
                  color="#0f766e"
                />
              </Pressable>
            ) : null}

            {selected === option.id ? (
              <MaterialCommunityIcons name="check" size={20} color="#0f766e" />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
