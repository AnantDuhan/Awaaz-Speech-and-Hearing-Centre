// Lists everything in src/content/site.ts that still needs filling in or
// sign-off before the site goes live. Run with: npm run check:launch
import { readFileSync } from "node:fs";

const file = new URL("../src/content/site.ts", import.meta.url);
const lines = readFileSync(file, "utf8").split("\n");

const todo = [];
const placeholder = /\[[A-Za-z][A-Za-z0-9 .:&'’–-]*\]/g;

lines.forEach((line, index) => {
  const text = line.trim();
  const at = `line ${index + 1}`;
  if (text.startsWith("//") || text.startsWith("*") || text.startsWith("/*")) return;

  const found = text.match(placeholder);
  if (found) todo.push(`${at}: fill in ${[...new Set(found)].join(", ")}`);

  if (/reviewed\s*[:=]\s*false/i.test(text)) {
    todo.push(`${at}: needs sign-off from the centre — ${text}`);
  }
  if (/example\.com/.test(text)) todo.push(`${at}: set the real domain in site.url`);
  if (/910000000000/.test(text)) todo.push(`${at}: replace the placeholder phone/WhatsApp number`);
  if (/(mapEmbedUrl|profileUrl|reviewsUrl):\s*""/.test(text)) {
    todo.push(`${at}: add the Google link — ${text.split(":")[0]}`);
  }
  const embed = text.match(/mapEmbedUrl:\s*"([^"]+)"/);
  if (embed && !embed[1].startsWith("https://www.google.com/maps/embed")) {
    todo.push(
      `${at}: mapEmbedUrl is a share link, which Google blocks in iframes — use the "Embed a map" src (https://www.google.com/maps/embed?pb=…)`,
    );
  }
});

if (todo.length === 0) {
  console.log("✓ Ready to launch: no placeholders or unreviewed content left in site.ts.");
} else {
  console.log(`${todo.length} things left in src/content/site.ts before launch:\n`);
  for (const item of todo) console.log(`  • ${item}`);
  console.log("\nAlso: swap the photo placeholders for real photos (see PhotoPlaceholder.tsx).");
  process.exitCode = 1;
}
