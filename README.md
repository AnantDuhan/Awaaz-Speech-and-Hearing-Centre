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
| `/tools` | Staff tools index (bookmark it on the clinic computer) |
| `/tools/hearing-report` | Staff tool: enter test results, download the report as an A4 PDF |
| any unknown address | Custom "page not found" page (`src/app/not-found.tsx`, exported as `404.html`, which Netlify serves on its own) |

To add another staff tool later, add a page under `src/app/tools/` and an entry to the `tools` list in `src/app/tools/page.tsx`.

## Hearing test report tool

Open `/tools` (or `/tools/hearing-report` directly). Neither is linked anywhere on the public site or listed in the sitemap, and both are always `noindex`, even after launch.

- **Private:** everything runs in the browser. Nothing is saved or sent, and closing the page clears it.
- **Output:** a one-page A4 landscape PDF, drawn at 300 dpi, with left and right audiograms in standard ASHA symbols, PTA, mobile number and address. On phones, "Share PDF" sends it straight to WhatsApp. A JPEG download is also offered. The PDF holds the page as one image (`src/lib/pdf.ts`, no library), so its text isn't selectable.
- **Audiogram grid:** as on the clinic's printed form, one equal-width column per test frequency: 125 Hz on the left edge (the corner with the dB axis), 250 Hz one box along, 500 Hz two boxes along, and so on to 8000 Hz on the right edge. Rows are 10 dB. The chart fills the space above the results table and signature (`src/lib/renderReport.ts`). This spacing doesn't follow the octave scale of ASHA-style audiograms: 125–250 Hz (one octave) and 500–750 Hz (half an octave) are the same width.
- **Letterhead:** copied from the clinic's printed audiogram form. It has "Aawaz Speech & Hearing Centre", the four branch addresses, and "Audiologist & Speech Therapist" with the audiologist's name, phone, email and CRR no. Below that is an "AUDIOGRAM" title, and the patient details in one bordered row: Patient's Name, Age/G, Address, Mobile No., Date, Audiologist Name. "Audiologist Name" comes from the form's "Audiologist name" field. It starts as the clinic audiologist and staff can change it for each report. The letterhead and signature always show the clinic audiologist. Bone-conduction points are joined by a dotted line, and air-conduction points by a solid line. 125 Hz is on the graph's axis but has no input, because the clinic doesn't test it. The letterhead text lives in `CLINIC` in `src/components/report/HearingReportTool.tsx`.
- **Report number:** `AWZ-YYMMDD-HHMM`, the date and time the report was started. Two reports started in the same minute get the same number. The field is editable, so change one of them.
- **Signature:** a line to sign on, then the audiologist's name, qualifications ("BASLP, DHLS", from `team` in `src/content/site.ts`) and CRR no. There's no "Signature & Stamp" caption.
- **PTA, degree and type of hearing loss:** PTA is the average of the air-conduction thresholds at 500, 1000 and 2000 Hz for each ear. The degree comes from the audiologist's scale: 0–15 Normal Hearing Level, 16–25 Minimal, 26–40 Mild, 41–55 Moderate, 56–70 Moderately Severe, 71–90 Severe, above 90 Profound (upper limits inclusive). For each ear, the "Degree" dropdown starts on the degree worked out from the PTA ("From PTA: …"), and the audiologist can pick a different one. The "Type" dropdown beside it (—, Conductive, Mixed, Sensorineural) adds the type into the degree: "Mild Hearing Loss" + Mixed prints "Mild Mixed Hearing Loss", and — adds nothing. Type is switched off for "Normal Hearing Level". The report prints this in the "Degree & Type of Hearing Loss" row. The scale is `SCALES.clinic` in `src/lib/audiometry.ts`.
- **Logo:** the clinic's picture (woman with a hearing aid, from the printed form). The full picture is in the site header and the report letterhead (`src/components/aawaz-logo.jpg`). A square crop is used for the browser tab, phone home screen and installed app (`src/app/icon.png`, `apple-icon.png`, `favicon.ico`, `public/tools-icon-*.png`).
- **Not a secure system:** anyone with the address can open the tool and make a report-looking image. The report number and "call to verify" line are the safeguard. For real access control, move it behind a login.
- **Logic** is in `src/lib/audiometry.ts`, and the drawing is in `src/lib/renderReport.ts`.

### Offline use

`/tools` and `/tools/hearing-report` keep working without internet, including the preview, PDF and JPEG downloads, and sharing. Each device needs one online visit first.

- **How:** a service worker (`scripts/offline/tools-sw.js`) is registered with scope `/tools`, so the public site is never cached. After every `npm run build`, the `postbuild` script (`scripts/build-offline.mjs`) writes `out/tools-sw.js`, with the exact list of files the tools need (about 2 MB: pages, JS, CSS, the font and the logo) and a version hash of their contents.
- **Online:** the latest pages always come from the network. Build files come from the saved copy, since their names change whenever their contents do. If the network takes more than 4 seconds, the saved copy is used.
- **Updates:** deploying a change gives the worker a new version. The next online visit downloads it in the background and deletes the old copy a few seconds later.
- **Status:** a pill under the page title says "Works offline on this device", "Saving a copy for offline use…", "You're offline…", or that the browser can't save a copy (private windows, or storage turned off).
- **Install as an app:** `public/tools.webmanifest` lets Chrome or Edge install the tool (install icon in the address bar) and phones add it to the home screen. It then opens from its own icon, even offline. On iPhone, add it to the home screen: Safari can delete saved data for sites that haven't been opened in about a week.
- **Windows desktop app:** open `/tools/hearing-report` in Edge or Chrome while online, wait for "Works offline on this device", then install. In Edge: **⋯ → Apps → Install this site as an app**. In Chrome: the install icon at the right of the address bar. It gets its own window, a Start menu entry and a taskbar pin, and Edge also offers a desktop shortcut. It updates itself after each deploy, and uninstalls like any app (Settings → Apps). In the installed window, the website's menu and footer are hidden (`@media (display-mode: standalone)` in `src/app/globals.css`).
- **Not offline:** the public pages, and the site's header links from the tools page.
- **Not in `next dev`:** the worker only registers in a production build. To try it, run `npm run build && npx serve out`, open the tool, then switch off Wi-Fi.

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
