/**
 * Asset pipeline for the villa sequence.
 *  - public/seq/d/f_XXXX.webp   1600w  q76   (500 frames, desktop/tablet)
 *  - public/seq/m/f_XXXX.webp    960w  q70   (250 frames, every 2nd, mobile)
 *  - public/stills/*.webp       1600w  q82   (curated section imagery)
 *  - src/app/opengraph-image.jpg 1200x630     (social card)
 * Run: node scripts/build-assets.mjs
 */
import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import os from "node:os";

const SRC = "assets/frames";
const TOTAL = 500;
const CONCURRENCY = Math.max(2, Math.min(8, os.cpus().length - 1));

const pad = (n) => String(n).padStart(4, "0");
const srcPath = (i) => `${SRC}/frame_${pad(i)}.jpg`;

/** Curated stills mined from the sequence, keyed to the room zones. */
const STILLS = [
  { name: "approach", frame: 1 },
  { name: "entrance", frame: 60 },
  { name: "portal", frame: 100 },
  { name: "living", frame: 130 },
  { name: "lounge", frame: 158 },
  { name: "kitchen", frame: 215 },
  { name: "dining", frame: 245 },
  { name: "corridor", frame: 300 },
  { name: "suite", frame: 330 },
  { name: "spa", frame: 385 },
  { name: "bath", frame: 410 },
  { name: "courtyard", frame: 455 },
  { name: "pool", frame: 480 },
  { name: "dusk", frame: 500 },
];

async function pool(items, worker) {
  let cursor = 0;
  let done = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
      done++;
      if (done % 50 === 0) process.stdout.write(`  ${done}/${items.length}\n`);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const files = await readdir(SRC);
  const count = files.filter((f) => f.endsWith(".jpg")).length;
  console.log(`source frames: ${count}`);

  await mkdir("public/seq/d", { recursive: true });
  await mkdir("public/seq/m", { recursive: true });
  await mkdir("public/stills", { recursive: true });

  console.log(`\n[1/4] desktop sequence -> public/seq/d (1600w q76, ${CONCURRENCY} workers)`);
  const desktop = Array.from({ length: TOTAL }, (_, i) => i + 1);
  await pool(desktop, async (i) => {
    await sharp(srcPath(i))
      .resize(1600, null, { fastShrinkOnLoad: true })
      .webp({ quality: 76, effort: 4 })
      .toFile(`public/seq/d/f_${pad(i)}.webp`);
  });

  console.log(`\n[2/4] mobile sequence -> public/seq/m (960w q70, every 2nd frame)`);
  const mobile = desktop.filter((i) => i % 2 === 1);
  await pool(mobile, async (i) => {
    const outIndex = (i + 1) / 2; // 1,3,5.. -> 1,2,3..
    await sharp(srcPath(i))
      .resize(960, null, { fastShrinkOnLoad: true })
      .webp({ quality: 70, effort: 4 })
      .toFile(`public/seq/m/f_${pad(outIndex)}.webp`);
  });

  console.log(`\n[3/4] curated stills -> public/stills`);
  await pool(STILLS, async ({ name, frame }) => {
    await sharp(srcPath(frame))
      .resize(1600, null, { fastShrinkOnLoad: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(`public/stills/${name}.webp`);
  });

  console.log(`\n[4/4] social card -> src/app/opengraph-image.jpg`);
  await sharp(srcPath(500))
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile("src/app/opengraph-image.jpg");

  // manifest so the client knows what exists without hardcoding counts twice
  await writeFile(
    "public/seq/manifest.json",
    JSON.stringify({ desktop: { count: TOTAL, dir: "/seq/d", width: 1600 }, mobile: { count: mobile.length, dir: "/seq/m", width: 960, stride: 2 } }, null, 2)
  );
  console.log("\ndone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
