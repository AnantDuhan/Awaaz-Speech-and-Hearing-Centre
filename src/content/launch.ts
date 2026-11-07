/**
 * Keep this `false` while the site is being reviewed. Every page then tells
 * search engines not to index it, so placeholders and unreviewed wording never
 * show up on Google.
 *
 * On launch day — content approved, real domain set in site.ts — change it to
 * `true` and redeploy. `npm run check:launch` reminds you until you do.
 */
export const allowSearchIndexing = false;
