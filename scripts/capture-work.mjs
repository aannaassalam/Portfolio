/**
 * Captures each case-study site's home page and writes the pre-sized
 * screenshots the work panels use:
 *
 *   public/work/<slug>-{640,960,1280,1600,1920}.webp
 *
 * Re-run when a project's site changes. Needs `cwebp` on the PATH and
 * Playwright, which is deliberately not a project dependency:
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/capture-work.mjs [slug ...]
 *
 * The slugs match `image` in CASE_STUDIES (json/site/content.ts).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch {
  console.error("Playwright is not installed. Run: npm i --no-save playwright");
  process.exit(1);
}

const SITES = {
  "flexi-agency": "https://flexiagency.net",
  coachiatry: "https://coachiatry.com",
  "sd-photography": "https://sdphotography.synkinnovations.in",
  "yuvi-designs": "https://yuvi-designs.vercel.app"
};
/** Panel aspect is 16:11. Widths cover a phone at 3x up to half a 2x desktop. */
const WIDTHS = [640, 960, 1280, 1600, 1920];
/** Halftone artwork compresses badly; it gets a lower setting at the same look. */
const QUALITY = { "yuvi-designs": 74 };

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public/work");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "synk-work-"));
fs.mkdirSync(out, { recursive: true });

const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : Object.keys(SITES);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 990 },
  deviceScaleFactor: 2,
  locale: "en-US"
});

for (const slug of slugs) {
  const url = SITES[slug];
  if (!url) {
    console.error(`unknown slug: ${slug}`);
    continue;
  }
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "load", timeout: 90000 });
  } catch (error) {
    console.log(`${slug}: ${error.message.split("\n")[0]} (capturing anyway)`);
  }
  // Let hero animations and lazy images settle.
  await page.waitForTimeout(8000);
  const png = path.join(scratch, `${slug}.png`);
  await page.screenshot({ path: png });
  await page.close();

  for (const w of WIDTHS) {
    const h = (w * 11) / 16;
    execFileSync("cwebp", [
      "-quiet", "-q", String(QUALITY[slug] ?? 80), "-m", "6", "-sharp_yuv",
      "-resize", String(w), String(h),
      png, "-o", path.join(out, `${slug}-${w}.webp`)
    ]);
  }
  console.log(`captured ${slug}`);
}

await browser.close();
fs.rmSync(scratch, { recursive: true, force: true });
