// Runs after `next build` (the "postbuild" npm script). Writes out/tools-sw.js:
// the service worker from scripts/offline/tools-sw.js plus the list of files the
// staff tools need offline. Its version is a hash of those files, so every deploy
// that changes them makes browsers fetch the new copy on their next online visit.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const PAGES = ["/tools", "/tools/hearing-report"];
// Site icons used only by the browser tab; not needed offline (icon.svg is ~3 MB).
const SKIP = [/^\/_next\/static\/media\/(icon|favicon)\./];

const toUrl = (file) => "/" + relative(OUT, file).split(sep).join("/");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

for (const page of PAGES) {
  if (!existsSync(join(OUT, `${page}.html`))) {
    console.error(`build-offline: ${OUT}${page}.html is missing. Run "next build" first.`);
    process.exit(1);
  }
}

// Files fetched by URL (pages) and the files behind them, for the version hash.
const entries = [
  ...PAGES.map((page) => ({ url: page, file: join(OUT, `${page}.html`) })),
  // Page data the in-app router loads when moving between /tools and the report.
  ...[join(OUT, "tools.txt"), ...walk(join(OUT, "tools")).filter((file) => file.endsWith(".txt"))].map((file) => ({
    url: toUrl(file),
    file,
  })),
  // JavaScript, CSS, the font and the logo.
  ...walk(join(OUT, "_next", "static"))
    .map((file) => ({ url: toUrl(file), file }))
    .filter(({ url }) => !SKIP.some((pattern) => pattern.test(url))),
  // "Install as app" manifest and its icons.
  ...["tools.webmanifest", "tools-icon-192.png", "tools-icon-512.png"]
    .map((name) => ({ url: `/${name}`, file: join(OUT, name) }))
    .filter(({ file }) => existsSync(file)),
];

const hash = createHash("sha256");
let bytes = 0;
for (const { url, file } of entries) {
  const content = readFileSync(file);
  bytes += content.length;
  hash.update(url).update(content);
}
const version = hash.digest("hex").slice(0, 12);
const precache = entries.map(({ url }) => url);

const source = readFileSync("scripts/offline/tools-sw.js", "utf8");
writeFileSync(
  join(OUT, "tools-sw.js"),
  `const VERSION = ${JSON.stringify(version)};\nconst PRECACHE = ${JSON.stringify(precache, null, 2)};\n\n${source}`,
);
console.log(
  `build-offline: out/tools-sw.js (version ${version}) saves ${precache.length} files, ` +
    `${(bytes / 1024 / 1024).toFixed(1)} MB, for offline use of ${PAGES.join(" and ")}.`,
);
