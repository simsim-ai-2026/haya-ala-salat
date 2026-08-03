# Adhan recordings — attribution

## Wikimedia Commons — CC BY-SA 4.0

Used under **Creative Commons Attribution-ShareAlike 4.0**:
<https://creativecommons.org/licenses/by-sa/4.0/>

| File | Work | Author | Source |
| --- | --- | --- | --- |
| `casablanca-hassan-ii.mp3` | *Llamada a oración Mezquita Hassan II* | Fraguando | [Commons](https://commons.wikimedia.org/wiki/File:Llamada_a_oraci%C3%B3n_Mezquita_Hassan_II.wav) |
| `aaqib-azeez.mp3` | *The Adhan – Muslim Call to Prayer – Aaqib Azeez* | Atcovi | [Commons](https://commons.wikimedia.org/wiki/File:The_Adhan_-_Muslim_Call_to_Prayer_-_Aaqib_Azeez.mp3) |

`casablanca-hassan-ii.mp3` is Wikimedia's own MP3 transcode of the source WAV
(31 MB WAV → 2.8 MB MP3); the audio is otherwise unmodified. `aaqib-azeez.mp3`
is the original file, unmodified.

## Internet Archive — Public Domain Mark 1.0

| File | Work | Author | Source |
| --- | --- | --- | --- |
| `doha-standard.mp3` | *Adhan Recordings from Doha, Qatar* — Dhuhr | abd.al.rahman | [archive.org](https://archive.org/details/adhan.recordings.from.doha.qatar) |
| `kalkan-turkey.mp3` | *Marina Kalkan, Turkey — 915a Muezzin call to prayer (evening)* | Piotrek Zyla, radio aporee | [archive.org](https://archive.org/details/aporee_58326_66903) |

Both unmodified, both tagged Public Domain Mark 1.0 by their uploaders.

> **Weaker provenance than the Commons files.** These tags are self-declared, and
> Public Domain Mark is strictly for works *already* in the public domain — CC0 is
> the correct tag for releasing your own work. Both read as own field recordings
> (the Kalkan entry documents the microphone and recorder used) and neither
> credits a commercial reciter, which is why they were accepted where other
> "public domain" adhan uploads were not. If you are shipping commercially and
> want zero licence risk, drop these two and keep only the CC BY-SA pair.

Attribution is shown in the app under **Settings → Adhan**, which is what the
licence requires. Do not remove it.

## Before shipping

CC BY-SA 4.0 is a **share-alike** licence. Bundling these files unmodified
alongside the app is normally treated as mere aggregation, so the ShareAlike
term attaches to the recordings, not to your source code — but if you *edit* a
recording (trim, remix, re-encode beyond format conversion), the result must
itself be released under CC BY-SA 4.0. Get your own legal read before a
commercial release.

## Adding more recitations

The words of the adhan are ancient, but any particular **recording** is a
separate, protected performance. A file being freely downloadable, or tagged
"public domain" because the text is old, does not make it usable — that
reasoning is incorrect and appears on some Commons uploads.

Only add recordings with an explicit licence permitting redistribution. Then:

1. Put the file in this folder.
2. Add an entry to `MUEZZIN_OPTIONS` in [`lib/muezzin.ts`](../../lib/muezzin.ts),
   including its `attribution`.
3. Add `muezzin.<id>` and `muezzin.<id>Hint` to all three dictionaries in
   `lib/i18n.ts`, or the build fails.

Everything under `assets/` is bundled into the app binary, so keep files small —
a full adhan at 64 kbps mono is a few MB.
