const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets/audio');
const OUT = path.join(ROOT, 'assets/notification-sounds');

/**
 * iOS refuses to play a notification sound longer than 30 seconds — it falls
 * back to the system default without a word — and it will not play MP3 at all.
 * So the OS-level alert cannot be the shipped recording; it has to be a short
 * PCM copy. The full adhan still plays in-app through expo-audio.
 *
 * Mono 22.05 kHz is a deliberate floor: 28 s of stereo 44.1 kHz would be 4.7 MB
 * per recitation, in both app bundles, for a phone speaker.
 */
const SECONDS = 28;
const SAMPLE_RATE = 22050;
const FADE_SECONDS = 2;

/**
 * Must mirror `lib/muezzin.ts` — `id` is only here to make that correspondence
 * checkable by eye. Output names are Android resource names, so they are
 * lowercase with underscores; `assertValidAndroidAssetName` in the
 * expo-notifications plugin rejects anything else at prebuild.
 */
const RECITATIONS = [
  { id: 'casablanca', src: 'casablanca-hassan-ii.mp3', out: 'adhan_casablanca.wav' },
  { id: 'dohaStandard', src: 'doha-standard.mp3', out: 'adhan_doha.wav' },
  { id: 'kalkan', src: 'kalkan-turkey.mp3', out: 'adhan_kalkan.wav' },
  { id: 'aaqibAzeez', src: 'aaqib-azeez.mp3', out: 'adhan_aaqib.wav' },
];

/** Decode to mono 16-bit PCM. afconvert ships with macOS; there is no npm dep. */
function decode(inputPath, outputPath) {
  execFileSync('afconvert', [
    '-f', 'WAVE',
    '-d', `LEI16@${SAMPLE_RATE}`,
    '-c', '1',
    inputPath,
    outputPath,
  ]);
}

/**
 * Pull the samples out of a RIFF file. afconvert writes chunks we do not care
 * about beside `fmt `/`data`, so walk the chunk list rather than assuming the
 * canonical 44-byte header.
 */
function readWav(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`${file} is not a RIFF/WAVE file`);
  }

  let offset = 12;
  let format = null;
  let samples = null;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const body = buffer.subarray(offset + 8, offset + 8 + size);

    if (id === 'fmt ') {
      format = { channels: body.readUInt16LE(2), sampleRate: body.readUInt32LE(4) };
    } else if (id === 'data') {
      samples = body;
    }

    // Chunks are word-aligned; an odd size is followed by a pad byte.
    offset += 8 + size + (size % 2);
  }

  if (!format || !samples) throw new Error(`${file} has no fmt/data chunk`);
  return { ...format, samples };
}

/** Linear fade over the tail, so the cut lands as an ending rather than a clip. */
function fadeOut(samples, sampleRate) {
  const fadeSamples = Math.min(sampleRate * FADE_SECONDS, samples.length / 2);
  const first = samples.length / 2 - fadeSamples;

  for (let i = 0; i < fadeSamples; i++) {
    const at = (first + i) * 2;
    const gain = 1 - i / fadeSamples;
    samples.writeInt16LE(Math.round(samples.readInt16LE(at) * gain), at);
  }
}

function writeWav(file, { channels, sampleRate, samples }) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * 2;

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + samples.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16); // PCM fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * 2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(samples.length, 40);

  fs.writeFileSync(file, Buffer.concat([header, samples]));
}

function main() {
  if (process.platform !== 'darwin') {
    console.error('This script needs macOS `afconvert` to decode the MP3 sources.');
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'adhan-sounds-'));

  for (const recitation of RECITATIONS) {
    const source = path.join(SRC, recitation.src);
    if (!fs.existsSync(source)) {
      console.error(`  missing ${recitation.src} — skipped`);
      continue;
    }

    const decoded = path.join(scratch, `${recitation.id}.wav`);
    decode(source, decoded);

    const wav = readWav(decoded);
    const maxBytes = SECONDS * wav.sampleRate * wav.channels * 2;
    const trimmed = wav.samples.subarray(0, Math.min(maxBytes, wav.samples.length));
    fadeOut(trimmed, wav.sampleRate);

    const target = path.join(OUT, recitation.out);
    writeWav(target, { ...wav, samples: trimmed });

    const seconds = trimmed.length / (wav.sampleRate * wav.channels * 2);
    console.log(
      `  ${recitation.out}  ${seconds.toFixed(1)}s  ${(trimmed.length / 1024 / 1024).toFixed(2)} MB`
    );
  }

  fs.rmSync(scratch, { recursive: true, force: true });
  console.log(`\nWrote ${path.relative(ROOT, OUT)}. Rerun after changing MUEZZIN_OPTIONS.`);
}

main();
