## ROLE

You are a senior product engineer and design lead building a production-grade, mobile-first PWA: a repair cost estimator used by real-estate acquisition agents standing inside distressed houses, often offline, using one thumb. Every decision optimizes for: **speed of data entry in the field, numbers that are always correct and never contradict, and a distinctive professional look that could not be mistaken for a template.**

This is a contest submission judged 30% on Mobile UX & Polish. The reference implementation uses a dark navy header, orange fill pills, and a hamburger drawer — your design must not resemble it.

---

## TECH CONSTRAINTS (non-negotiable)

- Single self-contained `index.html` + `sw.js` + `manifest.json`. No build tools, no frameworks, no Node server.
- Vanilla JS/HTML/CSS. Allowed CDNs: Google Fonts, SheetJS (`xlsx-js-style`), JSZip, Tesseract.js (lazy-loaded only when Photos opens).
- All state in `localStorage`. Works fully offline after first load (cache-first service worker, precache every CDN URL used).
- Installable PWA: manifest + icons (generate icons at runtime via canvas — orange rounded square, white "S" — injected as blob URL).
- Pricing data: load every row of the provided `Pricing_List.csv` verbatim into a hardcoded `ITEMS` constant `{id, name, cost, unit}`. The CSV is the single source of truth — never invent or adjust a price.

---

## DESIGN SYSTEM — "Instrument"

The aesthetic is a precision field instrument — think professional-grade tool brands, not a note-taking app and not a SaaS dashboard. High contrast, engineered, numeric. Orange is the brand's hi-vis marking: used functionally (actions, selection, the total), never as wallpaper.

### Tokens (define as CSS variables, derive everything from these)

```css
:root {
  --canvas:  #F1F2F0;  /* cool light gray app background — NOT warm cream */
  --surface: #FFFFFF;  /* cards, sheets */
  --ink:     #101010;  /* primary text */
  --ink-2:   #5C5F5A;  /* secondary text */
  --line:    #DDDFDA;  /* hairline borders */
  --brand:   #C2440B;  /* Spark orange — actions, active states, the total */
  --brand-soft: #FBEDE6;/* orange tint for selected-row backgrounds */
  --ok:      #1B7F4D;  /* complete */
  --warn:    #B45309;  /* in progress */
  --danger:  #B3261E;  /* destructive */
  --radius:  10px;
  --shadow:  0 1px 2px rgb(0 0 0 / .06);
}
```

### Typography

- Display / numerals: **Archivo** weights 700–800 (Google Fonts). Used for the running total, group subtotals, screen titles.
- Body / UI: **Inter** 400/500/600.
- ALL money and quantity columns: `font-variant-numeric: tabular-nums`. Non-negotiable — columns of numbers must align vertically.
- Type scale: 11 caption / 13 secondary / 15 body / 16 inputs (never smaller — iOS zooms below 16) / 18 group titles / 22 screen titles / 28–34 the ledger total.
- Currency formatting, one function used everywhere: ≥ $100 rounds to whole dollars (`$1,425`), < $100 shows cents (`$2.35`). Never `$2` for `$2.35`.

### Signature element — the Ledger Bar

One persistent bar docked directly **above** the bottom tab bar (thumb zone), present on every tab:

```
┌──────────────────────────────────────────────┐
│  ▮▮▮▮▮▯▯▯▯▯▯▯▯▯▯▯▯▯▯   5/19    $8,362.50 ▲  │
└──────────────────────────────────────────────┘
```

- Left: segmented progress — one 6px-wide segment per group across the whole project (gray untouched / `--warn` in progress / `--ok` complete). Center: `X/19` count.
- Right: running total in Archivo 800 tabular numerals, `--brand`. Animates with a 250ms count-up on change.
- Tapping the bar expands a bottom sheet: per-room subtotals, biggest line item, groups remaining.
- Because the Ledger Bar exists, the **top header is one slim row (≤ 56px): small Spark diamond-mark SVG + project name (tap to rename) + "⊞" project-switcher button.** Nothing else. Total fixed chrome (header + ledger + tabs) must leave ≥ 60% of an iPhone SE viewport for content.

### Components

- Cards: `--surface`, 1px `--line` border, `--radius`, `--shadow`. Status is a 3px left accent strip (gray/warn/ok). No heavy shadows anywhere.
- Buttons: primary = `--brand` bg, white text, 48px height. Secondary = 1px ink border, transparent. Destructive = `--danger` text, confirm before executing.
- Bottom sheets for all modals (confirm, input, pickers). Rounded-top 16px, overlay `rgb(0 0 0 / .45)`, tap-outside cancels.
- Tab bar: 5 tabs (ESTIMATE · PHOTOS · NOTES · REVIEW · EXPORT), white bg, active = `--brand` icon + 2px top border. Labels 10px uppercase.
- Checkbox: 26px square, 2px ink border; checked = `--brand` fill + white check. Row selected state: `--brand-soft` background.

---

## UI LAWS

These fix real defects from the previous build. Violating any of them is a bug.

1. **Item rows are a fixed CSS grid** — `grid-template-columns: minmax(0,1fr) 64px 84px 84px;` name cell gets `min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;` with the unit on a second 12px line. Nothing may ever overlap, at any name length, at 320px width.
2. **One arithmetic authority.** A single `calc(project)` pure function computes every number displayed: line totals, group subtotals, room subtotals, grand total, progress. All UI reads from its output. Two numbers on screen may never disagree.
3. **Unchecked = no money.** Qty defaults to empty. Unchecked rows show `—` in the total column, not a dollar figure. Checking a row sets qty to 1 and focuses the qty input (`inputmode="decimal"`); unchecking clears it. No phantom `1 sqft = $2` lines can exist.
4. **A group header chip shows exactly one state:** `NOT STARTED` (gray) / `$X,XXX` live subtotal (warn accent) / `NO ACTION ✓` or `DONE ✓` (ok). The chip amount always equals the sum of its checked rows.
5. **Swipe reveals are exclusive.** Opening a delete reveal closes any other. Delete always confirms via bottom sheet.
6. **Every tap target ≥ 44×44px.** `touch-action: manipulation` globally, `overscroll-behavior: none`, safe-area insets respected on the tab bar.
7. **No placeholder ambiguity.** Inputs have visible 1px borders and labels; placeholder text is `--ink-2` italic, entered values are `--ink` regular. Distinguishable at a glance in sunlight.
8. **One vocabulary.** A concept has one name everywhere: "groups reviewed", "items selected", "No Action Needed". Buttons say what they do ("Export ZIP", not "Submit").
9. **Orange is earned.** Per screen, `--brand` appears only on: the total, one primary action, active states, and selection tints. If a screen looks orange, remove instances until it doesn't.
10. **Never narrate the machinery.** No "saved to localStorage" toasts; a quiet 2s "Saved ✓" only where the user explicitly acts.

---

## DATA MODEL

```js
project = {
  id, name, address, agentName, walkthroughDate,   // metadata
  createdAt, updatedAt,
  rooms: [ { roomInstanceId, roomTypeId, label,     // "Bathroom 2"
             selections: { [groupId]: { noAction: bool,
               items: { [itemId]: { checked, qty } } } } } ],
  customItems: [ { id, groupScope, name, cost, unit } ],
  priceOverrides: { [itemId]: cost },               // per-project
  photos: [ { id, dataUrl, caption, serial, ocrText } ],
  notes: ""
}
// localStorage: "spark_projects_v1", "spark_global_prices_v1"
// Effective cost = project override ?? global override ?? ITEMS default.
// Save debounced 300ms; on quota error retry without photo dataUrls and inform the user.
```

### Room types & the 19 groups (briefing structure — exact)

| Room type (addable instances) | Groups |
|---|---|
| Interior / General (one per project) | Flooring · Paint & Wall Repair · Doors · Pest Control |
| Kitchen | Cabinets · Countertops & Tile · Appliances |
| Bathroom (multi-instance) | Vanity & Countertop · Tub & Shower · Tile |
| Systems & Structure (one per project) | HVAC · Electrical · Structural · Insulation & Drywall |
| Exterior (one per project) | Fence · Siding · Windows · Garage · Trees |
| Bedroom (multi-instance) | Flooring · Paint · Doors · Closet |
| Living / Common (multi-instance) | Flooring · Paint · Doors · Lighting |

Item→group mapping: assign every CSV item to exactly one group by its `id` prefix and meaning (ig-01..06 → Flooring; ig-07..09 → Paint & Wall Repair; ig-10..19 → Doors; ig-23/24 → Pest Control; kt-* across the three kitchen groups; ba-* across the three bathroom groups; as-01..09 → HVAC; as-10/11/18/19/20/24 → Electrical; as-12..17 → Structural; as-21/22/23 → Insulation & Drywall; ex-01..03 → Fence; ex-05..09/18 → Siding; ex-13..17 → Windows; ex-19/21..23 → Garage; ex-04/10..12/20 → Trees). Sitewide leftovers (ig-20, 21, 22, 25, 26, 27, 28) live in a compact "Sitewide & Cleanup" list at the bottom of Interior/General — the 19 named groups drive the progress count. Bedroom/Living groups reference the relevant ig- items (each room instance tracks its own selections).

---

## FEATURES (all required)

**Estimate tab** — horizontally scrollable room pills, each showing name + `2/3` group count or ✓ (active pill = ink bg white text, NOT orange fill). "+ Room" opens a bottom-sheet picker of the 7 types with auto-numbered labels; long-press pill → rename/remove. Below: group cards (collapsed by default, header shows status chip per Law 4), inside: "No Action Needed" toggle, item rows per Law 1 with stepper − / qty / +, tap unit-cost to override inline (overridden prices show a small dot), "+ Add item" per group, swipe-left to delete a row. Sticky mini-bar under the pills with the active room's subtotal.

**Photos tab** — 3-col thumbnail grid; FAB only (single add path) opening `<input type="file" accept="image/*" capture="environment">` with gallery fallback; caption sheet on save; Tesseract OCR runs async with a spinner badge, regex extracts serial candidates (`[A-Z]{1,4}-?\d{5,}` and 8–20 char alphanumerics), stores `serial` + full `ocrText`, shows a 🔧 badge when found and the parse in the detail view; full-screen viewer with swipe, per-photo delete.

**Notes tab** — labeled fields for Property Address / Walkthrough Date (defaults today) / Agent Name, then a full-height auto-saving textarea.

**Review tab (creative addition)** — the offline **Field Assistant**: (a) *Missed-cost radar*: rule list flagging likely-forgotten money, e.g. tub tearout checked but no tile; wallpaper removal without paint; any HVAC item without a serial photo; 3+ groups skipped in a room; each flag deep-links to its group. (b) *Contractor scope summary*: plain-language work order generated from checked items, copyable. (c) *Materials list*: aggregated quantities by unit. Everything rule-based and deterministic — no APIs.

**Export tab** — summary card (total, items, no-action count, unreviewed count, photos) with unreviewed-groups warning; agent name required before export with the requirement adjacent to the button. "Export ZIP": styled workbook via xlsx-js-style (branded header row in `--brand`, per room → group → checked rows `Item | Unit | Qty | Unit Cost | Total`, group/room subtotals, bold grand total, currency number formats, sensible column widths; Sheet 2 = full price list with effective costs) + `photos/` + `notes.txt`, auto-download. Secondary: "Copy summary" plain-text to clipboard.

**Settings (gear in header)** — bottom sheet: global pricing editor with a **sticky search field** and collapsible sections (108 rows must be navigable), "Reset prices" with confirm, offline indicator banner wiring (`online`/`offline` events), install-to-home-screen button using captured `beforeinstallprompt`.

---

## QUALITY GATES — verify before declaring done

1. 320px-wide viewport: zero overlapping text anywhere, including the longest item name ("Interior Door Hardware (Knob + Hinges + Labor)").
2. Check an item → ledger total, group chip, room subtotal, and progress all update in the same frame and agree.
3. Fresh load → create project → add Bathroom 2 → check items → reload page: everything persists.
4. Airplane mode after first load: app opens, all tabs work, export still generates.
5. Export a project with 2 bathrooms + photos → open the xlsx: subtotals correct, grand total equals ledger, photos present in ZIP.
6. Every group can reach ✓ either by No Action or by checking an item; 19/19 → progress shows 100%.
7. Lighthouse PWA installability passes; icons render on the simulated home screen.
8. Grep your own output for `$` followed by a number in two places that could disagree — trace both to `calc()`.

Work in this order: data layer + calc() with console tests → shell + Ledger Bar → Estimate → Photos → Notes → Review → Export → PWA → polish pass against the Quality Gates. After each stage, re-read the UI Laws and fix violations before moving on.