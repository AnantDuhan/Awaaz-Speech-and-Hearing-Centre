# Speech & Hearing Centre — website

A small website for a speech, language and hearing centre, built with Next.js 16 (App Router, TypeScript) and CSS Modules. No UI libraries.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm start              # serve the production build
npm run check:launch   # list what's still unfinished before going live
```

Requires Node.js 20.9 or newer.

## Pages

| Page | What it is |
| --- | --- |
| `/` | Home: hero, "where would you like to start", milestones, services, team, FAQ, contact, map |
| `/services` | All services, grouped into children and adults |
| `/services/[slug]` | One page per service (9 in total), each with its own search title |
| `/checklist` | The 2-minute milestone checklist for parents |
| `/sitemap.xml`, `/robots.txt` | Generated for search engines |
| `/tools/hearing-report` | Staff tool: enter test results, download the report as an A4 PDF |

## Hearing test report tool

Open `/tools/hearing-report`. It isn't linked anywhere on the site, isn't in the sitemap, and is always `noindex`, even after launch.

- **Private:** everything runs in the browser. Nothing is saved or sent, and closing the page clears it.
- **Output:** a one-page A4 PDF, drawn at 300 dpi, with right and left audiograms in standard ASHA symbols, PTA, degree of hearing loss, speech audiometry, tympanometry, impression and recommendations. On phones, "Share PDF" sends it straight to WhatsApp. A JPEG download is also offered. The PDF holds the page as one image (`src/lib/pdf.ts`, no library), so its text isn't selectable.
- **Grading:** Goodman (1965, PTA of 0.5/1/2 kHz) or WHO (2021, PTA of 0.5/1/2/4 kHz), chosen per report. The audiologist should confirm which one the clinic uses.
- **Not a secure system:** anyone with the address can open the tool and make a report-looking image. The report number and "call to verify" line are the safeguard. For real access control, move it behind a login.
- **Logic** is in `src/lib/audiometry.ts`, and the drawing is in `src/lib/renderReport.ts`.

A floating WhatsApp button appears on every page.

## Before going live

Run `npm run check:launch`. It lists every placeholder and unreviewed item in `src/content/site.ts` by line number and exits with an error until they're done.

1. **Fill in the details** in `src/content/site.ts`: centre name, domain, address, phone, WhatsApp number, email, hours, languages, team names, qualifications and registration numbers. All page text lives in this file.
2. **Clinical review.** Three flags need the centre's sign-off:
   - `checklist.reviewed`: the checklist questions. The checklist page shows a "Draft" notice until this is `true`.
   - `servicesReviewed`: the wording of the 9 service pages.
   - `faq.reviewed`: the FAQ answers, including fees and session lengths.
3. **Google.** Set up or claim the centre's Google Business Profile, then fill in `site.google`:
   - `mapEmbedUrl`: Google Maps → the listing → Share → Embed a map → copy the `src` URL.
   - `profileUrl`: link to the listing.
   - `reviewsUrl`: link that opens the reviews. The "Read our Google reviews" button only appears once this is set.
4. **Real photos.** `src/components/PhotoPlaceholder.tsx` and `Team.tsx` mark each slot. Put photos in `public/photos/` and swap in `next/image`. Use the centre's own team and rooms, not stock images.
5. **Booking link.** `links.book` dials the phone. Point it at an online booking page if there is one.
6. **After launch:** test the home page at https://search.google.com/test/rich-results and submit `/sitemap.xml` in Google Search Console.

## Privacy

The checklist runs entirely in the browser. Nothing is stored or sent unless the parent taps "Send these answers on WhatsApp". If you later add a form that collects patient or child details, that is health data under India's DPDP Act 2023. Keep it minimal, add a clear consent line, and get proper advice.

## Structure

```
src/
  app/
    layout.tsx            Font, metadata, header, footer, WhatsApp button
    page.tsx              Home page sections in order
    services/             Services index and [slug] detail pages
    checklist/            Milestone checklist page
    sitemap.ts, robots.ts
    globals.css           Colour tokens and base styles
  components/             One file per section, each with its own .module.css
  content/site.ts         All text, contact details, services, FAQ, checklist
  styles/ui.module.css    Shared container, headings, buttons
  fonts/                  Nunito (SIL Open Font License, see OFL.txt)
scripts/check-launch.mjs  The launch checklist
```

To change colours, edit the tokens at the top of `src/app/globals.css`. `--highlight` (yellow) and `--accent` (blue) are the two main ones.

## Deploy

`npm run build` exports the whole site as static files into the `out` folder. No server needed.

- **Quickest:** drag the `out` folder onto https://app.netlify.com/drop.
- **Auto-deploy from GitHub:** connect the repo in Netlify. `netlify.toml` already sets the build command and the `out` folder. Cloudflare Pages works too: build command `npm run build`, output directory `out`.

While the doctor is reviewing, every page carries a `noindex` tag so nothing shows up on Google. On launch day, set `allowSearchIndexing` to `true` in `src/content/launch.ts`, set the real domain in `site.url`, and redeploy.
