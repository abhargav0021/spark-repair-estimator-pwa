# Spark Repair Estimator

Mobile-first offline repair-cost estimator for acquisition walkthroughs in distressed homes.

## How to Run

Open `index.html` in a browser, or serve the folder with any static file server:

```sh
python3 -m http.server 8765
```

Then open `http://localhost:8765/index.html`.

No build step, package install, backend, or server-side component is required. The app is intended to install as a PWA after first load and continue working offline.

## Submission Files

The app runtime is:

- `index.html`
- `sw.js`
- `manifest.json`

Other files in the repository are development/test/support files.

## Approach

The estimator is built as a single-page vanilla HTML/CSS/JS app. Pricing data is hardcoded into `index.html` from the provided price list, and all project state is stored in `localStorage`. A cache-first service worker precaches the app shell and CDN assets so the app works after the first load without network access.

The main UX is organized around fast field entry:

- persistent ledger bar with total and group progress
- room pills and group cards for quick walkthrough navigation
- fixed item rows with item name, price/unit, quantity, and line total
- deterministic review assistant for missed-cost flags, scope summary, and materials list
- export package with workbook, notes, and photos

## Libraries / External Resources

- Google Fonts: Inter and Archivo
- `xlsx-js-style`: styled workbook export
- JSZip: ZIP export
- Tesseract.js: lazy-loaded OCR for serial-number extraction in Photos

All external runtime URLs used by the app are listed in `sw.js` for service-worker caching.

## AI Tool Usage

AI tools were used as a development assistant for implementation, debugging, UI polish, acceptance-test planning, and regression checks. Final product decisions, testing, and submission review were performed by me.
