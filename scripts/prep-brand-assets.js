const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const Jimp = require('jimp-compact');
const OUT = path.join(ROOT, 'assets/images');

/**
 * Flood fill from the four corners over near-white pixels, setting alpha 0.
 * Only the OUTER background is removed — the cream arch interior and the white
 * face of the Kaaba stay opaque because they are not reachable from the border.
 */
function stripOuterWhite(img, threshold = 200) {
  const { width, height, data } = img.bitmap;
  const seen = new Uint8Array(width * height);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (seen[i]) return;
    const o = i * 4;
    if (data[o] < threshold || data[o + 1] < threshold || data[o + 2] < threshold) return;
    seen[i] = 1;
    stack.push(x, y);
  };

  push(0, 0);
  push(width - 1, 0);
  push(0, height - 1);
  push(width - 1, height - 1);

  let cleared = 0;
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    data[(y * width + x) * 4 + 3] = 0;
    cleared++;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return cleared;
}

/**
 * Erode the anti-aliased rim. Pixels left over from the drop shadow are pale and
 * touch transparency; on a dark background they read as a halo, so drop them.
 */
function feather(img, passes = 3, lumaCutoff = 165) {
  const { width, height, data } = img.bitmap;
  for (let pass = 0; pass < passes; pass++) {
    const doomed = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const o = i * 4;
        if (data[o + 3] === 0) continue;
        const luma = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
        if (luma < lumaCutoff) continue;
        const touchesVoid =
          (x > 0 && data[(i - 1) * 4 + 3] === 0) ||
          (x < width - 1 && data[(i + 1) * 4 + 3] === 0) ||
          (y > 0 && data[(i - width) * 4 + 3] === 0) ||
          (y < height - 1 && data[(i + width) * 4 + 3] === 0);
        if (touchesVoid) doomed.push(o);
      }
    }
    if (!doomed.length) break;
    for (const o of doomed) data[o + 3] = 0;
  }
}

/** Bounding box of solidly opaque pixels — ignores what is left of the shadow. */
function opaqueBounds(img) {
  const { width, height, data } = img.bitmap;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 200) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Most common opaque color — used as the splash background so it blends. */
function dominantColor(img) {
  const { width, height, data } = img.bitmap;
  const counts = new Map();
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    if (data[o + 3] < 250) continue;
    const key = (data[o] << 16) | (data[o + 1] << 8) | data[o + 2];
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let best = 0, bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) { bestCount = count; best = key; }
  }
  return '#' + best.toString(16).padStart(6, '0');
}

/**
 * Extend each row's outermost opaque color across the transparent margin.
 *
 * Clearing alpha leaves the original RGB in place — white, here. Any later resize
 * interpolates that white into the opaque edge and leaves a pale fringe, so the
 * real edge color has to be pushed underneath the transparency first.
 *
 * With `makeOpaque`, the margin is also forced to alpha 255. That is what app
 * icons need: they must be full-bleed, since iOS applies its own rounded mask and
 * Android crops to a launcher shape. Filling with a flat color instead would show
 * a step where it meets the logo's gradient, so the gradient is stretched outward.
 */
function bleedEdges(img, { makeOpaque = false } = {}) {
  const { width, height, data } = img.bitmap;

  // The outermost opaque pixels are anti-aliased against the old white
  // background, so they read pale. Sample from just inside that rim and paint it
  // over, otherwise the pale edge is what gets stretched outward.
  const inset = Math.max(2, Math.round(width * 0.008));

  const copyPixel = (fromX, fromY, toX, toY) => {
    const from = (fromY * width + fromX) * 4;
    const to = (toY * width + toX) * 4;
    data[to] = data[from];
    data[to + 1] = data[from + 1];
    data[to + 2] = data[from + 2];
    if (makeOpaque) data[to + 3] = 255;
  };

  const isOpaque = (x, y) => data[(y * width + x) * 4 + 3] > 200;

  // Columns first: this is what repairs the pale top and bottom rows. Doing rows
  // first would just smear that damage sideways before it could be replaced.
  for (let x = 0; x < width; x++) {
    let first = -1, last = -1;
    for (let y = 0; y < height; y++) {
      if (isOpaque(x, y)) {
        if (first < 0) first = y;
        last = y;
      }
    }
    if (first < 0) continue;

    const mid = Math.floor((first + last) / 2);
    const top = Math.min(first + inset, mid);
    const bottom = Math.max(last - inset, mid);

    for (let y = 0; y < top; y++) copyPixel(x, top, x, y);
    for (let y = bottom + 1; y < height; y++) copyPixel(x, bottom, x, y);
  }

  for (let y = 0; y < height; y++) {
    let first = -1, last = -1;
    for (let x = 0; x < width; x++) {
      if (isOpaque(x, y)) {
        if (first < 0) first = x;
        last = x;
      }
    }
    if (first < 0) continue;

    const mid = Math.floor((first + last) / 2);
    const left = Math.min(first + inset, mid);
    const right = Math.max(last - inset, mid);

    for (let x = 0; x < left; x++) copyPixel(left, y, x, y);
    for (let x = right + 1; x < width; x++) copyPixel(right, y, x, y);
  }
}

/** Centers `art` on a transparent square canvas of `size`, scaled to `fill`. */
function onSquareCanvas(art, size, fill) {
  const scaled = art.clone();
  if (scaled.bitmap.width >= scaled.bitmap.height) {
    scaled.resize(Math.round(size * fill), Jimp.AUTO);
  } else {
    scaled.resize(Jimp.AUTO, Math.round(size * fill));
  }
  const canvas = new Jimp(size, size, 0x00000000);
  canvas.composite(
    scaled,
    Math.round((size - scaled.bitmap.width) / 2),
    Math.round((size - scaled.bitmap.height) / 2)
  );
  return canvas;
}

(async () => {
  // Prefer the original artwork. If it is gone, fall back to the already-cleaned
  // brand-logo.png — usable, but it is only 720px so icons are upscaled.
  const rawSource = path.join(ROOT, 'logo.png');
  const derivedSource = path.join(OUT, 'brand-logo.png');
  const hasRaw = fs.existsSync(rawSource);

  const logo = await Jimp.read(hasRaw ? rawSource : derivedSource);

  if (hasRaw) {
    const cleared = stripOuterWhite(logo);
    feather(logo);
    const { minX, minY, maxX, maxY } = opaqueBounds(logo);
    logo.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
    console.log(`logo: cleared ${cleared} px, cropped to ${logo.bitmap.width}x${logo.bitmap.height}`);
  } else {
    console.warn(
      `! ${path.relative(ROOT, rawSource)} not found — using ${path.relative(ROOT, derivedSource)} ` +
        `(${logo.bitmap.width}px). Restore the original for full-resolution icons.`
    );
  }

  // Must run before anything resizes the logo, or white bleeds into every edge.
  bleedEdges(logo);
  console.log('logo dominant :', dominantColor(logo));

  // Renders at 220pt; 720px covers 3x displays with room to spare.
  const inApp = logo.clone();
  if (inApp.bitmap.width > 720) inApp.resize(720, Jimp.AUTO);
  await inApp.writeAsync(derivedSource);
  console.log('brand-logo   :', inApp.bitmap.width + 'x' + inApp.bitmap.height);

  // Native splash asset: same art, downscaled — it renders at ~220pt.
  // Keep the aspect ratio; the plugin sizes by width with resizeMode "contain".
  const splash = logo.clone().resize(512, Jimp.AUTO);
  await splash.writeAsync(path.join(OUT, 'splash-icon.png'));
  console.log('splash-icon  :', splash.bitmap.width + 'x' + splash.bitmap.height);

  // --- App icons -----------------------------------------------------------
  // The source is slightly taller than it is wide, so pad to square at native
  // resolution and bleed the gradient into the padding — then resize. Resizing
  // first would blur the artwork's edge across the padding.
  const side = Math.max(logo.bitmap.width, logo.bitmap.height);
  const square = new Jimp(side, side, 0x00000000);
  square.composite(
    logo,
    Math.round((side - logo.bitmap.width) / 2),
    Math.round((side - logo.bitmap.height) / 2)
  );
  bleedEdges(square, { makeOpaque: true });

  const icon = square.clone().resize(1024, 1024);
  await icon.writeAsync(path.join(OUT, 'icon.png'));
  console.log('icon         : 1024x1024 opaque');

  await square.clone().resize(256, 256).writeAsync(path.join(OUT, 'favicon.png'));
  console.log('favicon      : 256x256');

  // Android adaptive foreground: the launcher mask crops the outer edge, so keep
  // the artwork inside the safe area and let backgroundColor cover the rest.
  const foreground = onSquareCanvas(logo, 1024, 0.86);
  await foreground.writeAsync(path.join(OUT, 'android-icon-foreground.png'));
  console.log('android fg   : 1024x1024, art at 86%');

  // image.png (the wordmark) is deliberately NOT turned into an asset — the title,
  // tagline and icon row are rendered as real text and vector icons in
  // components/brand-wordmark.tsx so they scale and stay accessible.
})();
