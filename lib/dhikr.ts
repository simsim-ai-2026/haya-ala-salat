import type { LanguageCode } from '@/lib/i18n';

/**
 * The adhkār themselves.
 *
 * Deliberately *not* in `lib/i18n.ts`. That module is a flat key → string map
 * where the three languages say the same thing; here the Arabic is the dhikr and
 * the other two are a translation of it, which is a different relationship: the
 * Arabic is never substituted, only accompanied. Screens read this through
 * `resolveDhikr()` rather than `translate()`.
 *
 * Texts are the widely transmitted wordings from Al-Bukhari, Muslim, Abu Dawud,
 * At-Tirmidhi and Ahmad. Long Qur'anic passages (Ayat al-Kursi, the closing
 * sūrahs) are referenced rather than reproduced — a transcription slip in a
 * verse is a worse failure than an extra tap to open a muṣḥaf.
 */

export type DhikrCategory = 'morning' | 'evening' | 'night' | 'afterPrayer';

export const DHIKR_CATEGORIES: DhikrCategory[] = [
  'morning',
  'evening',
  'night',
  'afterPrayer',
];

export type DhikrEntry = {
  id: string;
  /** The remembrance. Always shown, in every UI language. */
  ar: string;
  /** Meaning in English. Shown only when the UI language is not Arabic. */
  en: string;
  /** Meaning in French. Shown only when the UI language is not Arabic. */
  fr: string;
  /** Times it is repeated. 1 unless the narration specifies a number. */
  repeat: number;
  /** Narrator, in Arabic and in Latin script — a name, not a sentence. */
  source?: { ar: string; latin: string };
};

const BUKHARI = { ar: 'البخاري', latin: 'Al-Bukhārī' };
const MUSLIM = { ar: 'مسلم', latin: 'Muslim' };
const AGREED = { ar: 'متفق عليه', latin: 'Al-Bukhārī & Muslim' };
const ABU_DAWUD = { ar: 'أبو داود', latin: 'Abū Dāwūd' };
const TIRMIDHI = { ar: 'الترمذي', latin: 'At-Tirmidhī' };
const AHMAD = { ar: 'أحمد', latin: 'Aḥmad' };
const ABU_DAWUD_TIRMIDHI = { ar: 'أبو داود والترمذي', latin: 'Abū Dāwūd & At-Tirmidhī' };

const SAYYID_AL_ISTIGHFAR: Omit<DhikrEntry, 'id'> = {
  ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
  en: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I hold to Your covenant and Your promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me, and I acknowledge my sin, so forgive me — for none forgives sins but You.',
  fr: "Ô Allah, Tu es mon Seigneur, il n'y a de dieu que Toi. Tu m'as créé et je suis Ton serviteur ; je reste fidèle à Ton pacte et à Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j'ai commis. Je reconnais Ton bienfait sur moi et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés hormis Toi.",
  repeat: 1,
  source: BUKHARI,
};

const BISMILLAH_NO_HARM: Omit<DhikrEntry, 'id'> = {
  ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
  en: 'In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
  fr: "Au nom d'Allah, avec le nom duquel rien sur terre ni dans le ciel ne peut nuire, et Il est l'Audient, l'Omniscient.",
  repeat: 3,
  source: ABU_DAWUD_TIRMIDHI,
};

const RADITU: Omit<DhikrEntry, 'id'> = {
  ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
  en: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.',
  fr: "Je suis satisfait d'Allah comme Seigneur, de l'islam comme religion et de Muhammad (paix et salut sur lui) comme Prophète.",
  repeat: 3,
  source: AHMAD,
};

const HASBIYALLAH: Omit<DhikrEntry, 'id'> = {
  ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
  en: 'Allah is sufficient for me; there is no god but He. In Him I place my trust, and He is the Lord of the Mighty Throne.',
  fr: "Allah me suffit ; il n'y a de dieu que Lui. C'est en Lui que je place ma confiance, et Il est le Seigneur du Trône immense.",
  repeat: 7,
  source: ABU_DAWUD,
};

const SUBHANALLAH_WA_BIHAMDIH: Omit<DhikrEntry, 'id'> = {
  ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  en: 'Glory be to Allah, and praise be to Him.',
  fr: 'Gloire et louange à Allah.',
  repeat: 100,
  source: AGREED,
};

const MUAWWIDHAT: Omit<DhikrEntry, 'id'> = {
  ar: 'قِرَاءَةُ سُورَةِ الْإِخْلَاصِ وَالْفَلَقِ وَالنَّاسِ',
  en: 'Recite Sūrat al-Ikhlāṣ, al-Falaq and an-Nās.',
  fr: "Réciter les sourates al-Ikhlâs, al-Falaq et an-Nâs.",
  repeat: 3,
  source: ABU_DAWUD_TIRMIDHI,
};

const AYAT_AL_KURSI: Omit<DhikrEntry, 'id'> = {
  ar: 'قِرَاءَةُ آيَةِ الْكُرْسِيِّ',
  en: 'Recite Ayat al-Kursī (Qur’an 2:255).',
  fr: 'Réciter Ayat al-Koursî (Coran 2:255).',
  repeat: 1,
};

const MORNING: DhikrEntry[] = [
  {
    id: 'morning-mulk',
    ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    en: 'We have entered the morning and the dominion has entered the morning belonging to Allah. Praise belongs to Allah. There is no god but Allah alone, with no partner; His is the dominion, His is the praise, and He has power over all things.',
    fr: "Nous voici au matin et la royauté est à Allah. Louange à Allah. Il n'y a de dieu qu'Allah, Seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est capable de toute chose.",
    repeat: 1,
    source: MUSLIM,
  },
  {
    id: 'morning-bika',
    ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    en: 'O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection.',
    fr: "Ô Allah, c'est par Toi que nous entrons dans le matin et dans le soir, par Toi que nous vivons et que nous mourons, et vers Toi se fera la résurrection.",
    repeat: 1,
    source: TIRMIDHI,
  },
  { id: 'morning-istighfar', ...SAYYID_AL_ISTIGHFAR },
  { id: 'morning-bismillah', ...BISMILLAH_NO_HARM },
  { id: 'morning-raditu', ...RADITU },
  {
    id: 'morning-afiyah',
    ar: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    en: 'O Allah, grant me well-being in my body. O Allah, grant me well-being in my hearing. O Allah, grant me well-being in my sight. There is no god but You.',
    fr: "Ô Allah, accorde-moi la santé dans mon corps. Ô Allah, accorde-moi la santé dans mon ouïe. Ô Allah, accorde-moi la santé dans ma vue. Il n'y a de dieu que Toi.",
    repeat: 3,
    source: ABU_DAWUD,
  },
  { id: 'morning-hasbi', ...HASBIYALLAH },
  {
    id: 'morning-ya-hayy',
    ar: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    en: 'O Ever-Living, O Sustainer, by Your mercy I seek help. Set right all my affairs, and do not leave me to myself for the blink of an eye.',
    fr: "Ô Vivant, ô Subsistant par Soi, j'implore Ton secours par Ta miséricorde. Réforme toute ma situation et ne me confie pas à moi-même le temps d'un clin d'œil.",
    repeat: 1,
    source: TIRMIDHI,
  },
  { id: 'morning-tasbih', ...SUBHANALLAH_WA_BIHAMDIH },
  { id: 'morning-kursi', ...AYAT_AL_KURSI },
  { id: 'morning-muawwidhat', ...MUAWWIDHAT },
];

const EVENING: DhikrEntry[] = [
  {
    id: 'evening-mulk',
    ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    en: 'We have entered the evening and the dominion has entered the evening belonging to Allah. Praise belongs to Allah. There is no god but Allah alone, with no partner; His is the dominion, His is the praise, and He has power over all things.',
    fr: "Nous voici au soir et la royauté est à Allah. Louange à Allah. Il n'y a de dieu qu'Allah, Seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est capable de toute chose.",
    repeat: 1,
    source: MUSLIM,
  },
  {
    id: 'evening-bika',
    ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    en: 'O Allah, by You we enter the evening and by You we enter the morning; by You we live and by You we die, and to You is the return.',
    fr: "Ô Allah, c'est par Toi que nous entrons dans le soir et dans le matin, par Toi que nous vivons et que nous mourons, et vers Toi est le retour.",
    repeat: 1,
    source: TIRMIDHI,
  },
  { id: 'evening-istighfar', ...SAYYID_AL_ISTIGHFAR },
  { id: 'evening-bismillah', ...BISMILLAH_NO_HARM },
  { id: 'evening-raditu', ...RADITU },
  {
    id: 'evening-kalimat',
    ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    en: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    fr: "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
    repeat: 3,
    source: MUSLIM,
  },
  { id: 'evening-hasbi', ...HASBIYALLAH },
  { id: 'evening-tasbih', ...SUBHANALLAH_WA_BIHAMDIH },
  { id: 'evening-kursi', ...AYAT_AL_KURSI },
  { id: 'evening-muawwidhat', ...MUAWWIDHAT },
];

const NIGHT: DhikrEntry[] = [
  {
    id: 'night-bismika',
    ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    en: 'In Your name, O Allah, I die and I live.',
    fr: 'En Ton nom, ô Allah, je meurs et je vis.',
    repeat: 1,
    source: BUKHARI,
  },
  {
    id: 'night-aslamtu',
    ar: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
    en: 'O Allah, I submit myself to You, entrust my affair to You, turn my face to You and lean my back upon You, in hope of You and in fear of You. There is no refuge and no escape from You except to You. I believe in Your Book which You revealed, and in Your Prophet whom You sent.',
    fr: "Ô Allah, je me remets à Toi, je Te confie mon affaire, je tourne mon visage vers Toi et j'adosse mon dos à Toi, par désir et par crainte de Toi. Il n'y a ni refuge ni salut hors de Toi si ce n'est auprès de Toi. Je crois en Ton Livre que Tu as révélé et en Ton Prophète que Tu as envoyé.",
    repeat: 1,
    source: AGREED,
  },
  {
    id: 'night-qini',
    ar: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    en: 'O Allah, protect me from Your punishment on the Day You raise up Your servants.',
    fr: 'Ô Allah, préserve-moi de Ton châtiment le Jour où Tu ressusciteras Tes serviteurs.',
    repeat: 3,
    source: ABU_DAWUD,
  },
  {
    id: 'night-hamd',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ',
    en: 'Praise belongs to Allah, who has fed us and given us drink, sufficed us and sheltered us. How many there are with no one to suffice them and no shelter.',
    fr: "Louange à Allah qui nous a nourris, abreuvés, comblés et abrités. Combien sont ceux qui n'ont personne pour les combler ni les abriter.",
    repeat: 1,
    source: MUSLIM,
  },
  {
    id: 'night-tasbih',
    ar: 'سُبْحَانَ اللَّهِ ثَلَاثًا وَثَلَاثِينَ، وَالْحَمْدُ لِلَّهِ ثَلَاثًا وَثَلَاثِينَ، وَاللَّهُ أَكْبَرُ أَرْبَعًا وَثَلَاثِينَ',
    en: 'Glory be to Allah thirty-three times, praise be to Allah thirty-three times, and Allah is the Greatest thirty-four times.',
    fr: 'Gloire à Allah trente-trois fois, louange à Allah trente-trois fois, et Allah est le plus Grand trente-quatre fois.',
    repeat: 1,
    source: AGREED,
  },
  { id: 'night-kursi', ...AYAT_AL_KURSI },
  { id: 'night-muawwidhat', ...MUAWWIDHAT },
];

const AFTER_PRAYER: DhikrEntry[] = [
  {
    id: 'after-istighfar',
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    en: 'I seek the forgiveness of Allah.',
    fr: "Je demande pardon à Allah.",
    repeat: 3,
    source: MUSLIM,
  },
  {
    id: 'after-salam',
    ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    en: 'O Allah, You are Peace and from You comes peace. Blessed are You, Owner of Majesty and Honour.',
    fr: 'Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, Détenteur de la Majesté et de la Munificence.',
    repeat: 1,
    source: MUSLIM,
  },
  {
    id: 'after-la-mani',
    ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    en: 'There is no god but Allah alone, with no partner; His is the dominion, His is the praise, and He has power over all things. O Allah, none can withhold what You give and none can give what You withhold, and no fortune can avail its owner against You.',
    fr: "Il n'y a de dieu qu'Allah, Seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est capable de toute chose. Ô Allah, nul ne peut retenir ce que Tu donnes ni donner ce que Tu retiens, et la fortune de celui qui la possède ne lui sert à rien contre Toi.",
    repeat: 1,
    source: AGREED,
  },
  {
    id: 'after-ainni',
    ar: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    en: 'O Allah, help me to remember You, to thank You, and to worship You well.',
    fr: "Ô Allah, aide-moi à T'évoquer, à Te remercier et à T'adorer de la meilleure façon.",
    repeat: 1,
    source: ABU_DAWUD,
  },
  {
    id: 'after-subhanallah',
    ar: 'سُبْحَانَ اللَّهِ',
    en: 'Glory be to Allah.',
    fr: 'Gloire à Allah.',
    repeat: 33,
    source: MUSLIM,
  },
  {
    id: 'after-alhamdulillah',
    ar: 'الْحَمْدُ لِلَّهِ',
    en: 'Praise belongs to Allah.',
    fr: 'Louange à Allah.',
    repeat: 33,
    source: MUSLIM,
  },
  {
    id: 'after-allahuakbar',
    ar: 'اللَّهُ أَكْبَرُ',
    en: 'Allah is the Greatest.',
    fr: 'Allah est le plus Grand.',
    repeat: 33,
    source: MUSLIM,
  },
  {
    id: 'after-tahlil',
    ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    en: 'There is no god but Allah alone, with no partner; His is the dominion, His is the praise, and He has power over all things. (Completing the hundred.)',
    fr: "Il n'y a de dieu qu'Allah, Seul, sans associé ; à Lui la royauté, à Lui la louange, et Il est capable de toute chose. (Pour compléter la centaine.)",
    repeat: 1,
    source: MUSLIM,
  },
  { id: 'after-kursi', ...AYAT_AL_KURSI },
  { id: 'after-muawwidhat', ...MUAWWIDHAT },
];

const DHIKR: Record<DhikrCategory, DhikrEntry[]> = {
  morning: MORNING,
  evening: EVENING,
  night: NIGHT,
  afterPrayer: AFTER_PRAYER,
};

export function getDhikr(category: DhikrCategory): DhikrEntry[] {
  return DHIKR[category];
}

export function isDhikrCategory(value: string | undefined): value is DhikrCategory {
  return DHIKR_CATEGORIES.includes(value as DhikrCategory);
}

export type ResolvedDhikr = {
  arabic: string;
  /** Null for an Arabic UI, where a "translation" would be the same text twice. */
  translation: string | null;
  source: string | null;
};

export function resolveDhikr(entry: DhikrEntry, language: LanguageCode): ResolvedDhikr {
  return {
    arabic: entry.ar,
    translation: language === 'ar' ? null : entry[language],
    source: entry.source ? (language === 'ar' ? entry.source.ar : entry.source.latin) : null,
  };
}

/**
 * Phrases offered by the tasbih counter. `target` is the conventional count for
 * one round; the screen lets the user override it.
 */
export type TasbihPhrase = {
  id: string;
  ar: string;
  en: string;
  fr: string;
  target: number;
};

export const TASBIH_PHRASES: TasbihPhrase[] = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللَّهِ', en: 'Glory be to Allah', fr: 'Gloire à Allah', target: 33 },
  {
    id: 'alhamdulillah',
    ar: 'الْحَمْدُ لِلَّهِ',
    en: 'Praise belongs to Allah',
    fr: 'Louange à Allah',
    target: 33,
  },
  {
    id: 'allahuakbar',
    ar: 'اللَّهُ أَكْبَرُ',
    en: 'Allah is the Greatest',
    fr: 'Allah est le plus Grand',
    target: 33,
  },
  {
    id: 'tahlil',
    ar: 'لَا إِلَهَ إِلَّا اللَّهُ',
    en: 'There is no god but Allah',
    fr: "Il n'y a de dieu qu'Allah",
    target: 100,
  },
  {
    id: 'istighfar',
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    en: 'I seek the forgiveness of Allah',
    fr: 'Je demande pardon à Allah',
    target: 100,
  },
  {
    id: 'hawqala',
    ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    en: 'There is no power and no strength except by Allah',
    fr: "Il n'y a de force ni de puissance qu'en Allah",
    target: 100,
  },
  {
    id: 'salawat',
    ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    en: 'O Allah, send blessings upon Muhammad',
    fr: 'Ô Allah, prie sur Muhammad',
    target: 100,
  },
  {
    id: 'tasbih-hamd',
    ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    en: 'Glory be to Allah and praise be to Him',
    fr: 'Gloire et louange à Allah',
    target: 100,
  },
];

/** Counts the tasbih screen offers as a target, alongside the phrase's own. */
export const TASBIH_TARGETS = [33, 99, 100];

export function resolveTasbihPhrase(
  phrase: TasbihPhrase,
  language: LanguageCode
): { arabic: string; translation: string | null } {
  return {
    arabic: phrase.ar,
    translation: language === 'ar' ? null : phrase[language],
  };
}
