# Adhan recordings

Four freely-licensed recitations ship here. See [CREDITS.md](CREDITS.md) for
their authors, licences and the attribution the app is required to display.

| File | Used by | Licence |
| --- | --- | --- |
| `casablanca-hassan-ii.mp3` | `muezzin.casablanca` | CC BY-SA 4.0 |
| `doha-standard.mp3` | `muezzin.dohaStandard` | PD Mark 1.0 |
| `kalkan-turkey.mp3` | `muezzin.kalkan` | PD Mark 1.0 |
| `aaqib-azeez.mp3` | `muezzin.aaqibAzeez` | CC BY-SA 4.0 |

All four are general-purpose adhan recordings. **Do not add Fajr-specific
recitations** — the dawn call carries an extra line, and this app does not
offer a per-prayer recording.

The registry lives in [`lib/muezzin.ts`](../../lib/muezzin.ts). Adding a
recitation means shipping its audio in the same change — `require()` cannot
point at a file that is absent, and Metro fails the build if it does.

It also means regenerating the notification alert sounds:
`node scripts/prep-notification-sounds.js`, then listing the new file in the
`expo-notifications` plugin's `sounds` array in `app.json`. See
[`../notification-sounds/README.md`](../notification-sounds/README.md) for why
the OS alert cannot just be the MP3.

Read the licensing note in [CREDITS.md](CREDITS.md) before adding anything: a
recording of the adhan is a protected performance in its own right, whatever the
age of the words.
