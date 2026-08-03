import type { AudioSource } from 'expo-audio';

import type { StringKey } from '@/lib/i18n';

export type MuezzinId = 'none' | 'casablanca' | 'dohaStandard' | 'kalkan' | 'aaqibAzeez';

export type MuezzinAttribution = {
  /** Title of the work, as published. */
  work: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};

export type MuezzinOption = {
  id: MuezzinId;
  labelKey: StringKey;
  hintKey: StringKey;
  /**
   * The recording, or `null` for the silent option. `require()` cannot point at
   * a file that is absent — Metro fails the build — so new entries must ship
   * their audio alongside the code change.
   */
  source: AudioSource | null;
  /** Required by the licence. Surfaced in Settings and in assets/audio/CREDITS.md. */
  attribution?: MuezzinAttribution;
};

const CC_BY_SA_4 = {
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

const PD_MARK = {
  license: 'Public Domain Mark 1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
};

/**
 * Bundled recitations are freely licensed uploads from Wikimedia Commons.
 *
 * Anything added here must be licensed for redistribution — a recording of the
 * adhan is a copyrighted performance in its own right, regardless of the words
 * being centuries old. Attribution is not optional under CC BY-SA; see CREDITS.md.
 */
export const MUEZZIN_OPTIONS: MuezzinOption[] = [
  {
    id: 'none',
    labelKey: 'muezzin.none',
    hintKey: 'muezzin.noneHint',
    source: null,
  },
  {
    id: 'casablanca',
    labelKey: 'muezzin.casablanca',
    hintKey: 'muezzin.casablancaHint',
    source: require('../assets/audio/casablanca-hassan-ii.mp3'),
    attribution: {
      work: 'Llamada a oración Mezquita Hassan II',
      author: 'Fraguando',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Llamada_a_oraci%C3%B3n_Mezquita_Hassan_II.wav',
      ...CC_BY_SA_4,
    },
  },
  {
    id: 'dohaStandard',
    labelKey: 'muezzin.dohaStandard',
    hintKey: 'muezzin.dohaStandardHint',
    source: require('../assets/audio/doha-standard.mp3'),
    attribution: {
      work: 'Adhan Recordings from Doha, Qatar — Dhuhr',
      author: 'Uploaded by abd.al.rahman (field recording, 2013–2014)',
      sourceUrl: 'https://archive.org/details/adhan.recordings.from.doha.qatar',
      ...PD_MARK,
    },
  },
  {
    id: 'kalkan',
    labelKey: 'muezzin.kalkan',
    hintKey: 'muezzin.kalkanHint',
    source: require('../assets/audio/kalkan-turkey.mp3'),
    attribution: {
      work: 'Marina Kalkan, Turkey — 915a Muezzin call to prayer (evening)',
      author: 'Piotrek Zyla, radio aporee',
      sourceUrl: 'https://archive.org/details/aporee_58326_66903',
      ...PD_MARK,
    },
  },
  {
    id: 'aaqibAzeez',
    labelKey: 'muezzin.aaqibAzeez',
    hintKey: 'muezzin.aaqibAzeezHint',
    source: require('../assets/audio/aaqib-azeez.mp3'),
    attribution: {
      work: 'The Adhan – Muslim Call to Prayer – Aaqib Azeez',
      author: 'Atcovi',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3',
      ...CC_BY_SA_4,
    },
  },
];

export function getMuezzinOption(id: MuezzinId): MuezzinOption {
  return MUEZZIN_OPTIONS.find((option) => option.id === id) ?? MUEZZIN_OPTIONS[0];
}

/** `none` is always selectable; every other entry needs its recording present. */
export function isMuezzinAvailable(option: MuezzinOption): boolean {
  return option.id === 'none' || option.source !== null;
}

/** Every attribution that has to be displayed somewhere in the app. */
export const MUEZZIN_ATTRIBUTIONS: MuezzinAttribution[] = MUEZZIN_OPTIONS.flatMap((option) =>
  option.attribution ? [option.attribution] : []
);
