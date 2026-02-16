# House Scoring Website – Complete TODOs for Gemini Coding Agent

Project goal: Client-side house scoring / real-estate analysis tool with CSV upload, persistent local storage, light/dark mode, clean table display matching the source CSV, GitHub Actions build & deploy, and proper favicon.

## Priority Order

1. CSV upload + LocalStorage persistence (foundational for UX)
2. Light / Dark mode toolbar (quick visible win)
3. Table columns & data matching the exact CSV structure
4. GitHub Actions build + deploy pipelines
5. Favicon update
6. Final polish & verification

## 0. CSV File Upload + LocalStorage Persistence (Highest Priority – Core UX)

- [ ] Add file upload UI
  - Prominent "Upload CSV" button or drag-and-drop area (top of app, below theme toolbar or in header/sidebar)
  - Restrict to `.csv` files only (`accept="text/csv,.csv"`)
  - After upload: display filename, size, upload timestamp

- [ ] Read file and store in localStorage
  - Use FileReader → readAsText()
  - Store two keys:
    - `house-scoring-csv-content` → full CSV string (raw text) or compressed version
    - `house-scoring-csv-meta` → JSON: `{ name: string, size: number, lastModified: number, uploadTimestamp: string (ISO) }`
  - Recommended: compress if file > ~300 KB
    - Use `pako` library (npm install pako)
    - gzip → Uint8Array → base64 → store
    - On load: base64 → Uint8Array → gunzip → text

- [ ] Load from localStorage on initial app mount
  - Check for `house-scoring-csv-content`
  - If present → (decompress if needed) → Papa.parse() → set headers + rows into global state
  - Also load and show meta (filename, when uploaded)
  - Fallback: show empty/upload prompt: "Upload your real-estate CSV to begin scoring homes"

- [ ] Enforce file size limits + user feedback
  - Hard limit: 4 MB raw file size
    - If file.size > 4×1024×1024 → error toast/alert:
      "File too large (max 4 MB). Try removing columns or splitting the CSV."
  - Soft warning at 2 MB:
    "File is large (X MB). May feel slower on mobile. Continue anyway?"
  - After compression: if still > ~4 MB → reject with message

- [ ] Add "Clear saved data" button
  - Removes both localStorage keys
  - Resets table/state to empty/upload view

- [ ] Polish
  - Loading spinner during read/parse on app start
  - Success toasts: "Loaded from previous session" / "New CSV uploaded"
  - Optional: last-saved indicator ("CSV last saved: 2 hours ago")

## 1. Light / Dark Mode Toolbar Component

- [ ] Create dedicated component: `src/components/ThemeToolbar.tsx`
- [ ] Place at absolute top of layout (above any existing nav/header)
- [ ] Implement toggle (light/dark/auto) using existing theme library
  - Most likely: next-themes + tailwind or chakra-ui colorMode
- [ ] Persist in localStorage, respect system preference
- [ ] Self-contained component (minimal/no side effects in other files)
- [ ] Style: slim height, right-aligned toggle icon/button, optional logo/name on left
- [ ] Add to root layout / \_app / main layout file so it appears everywhere

After: Verify toggle works, persists on refresh, looks good on mobile/desktop.

## 2. Match Table Exactly to the Provided CSV

CSV reference file (for column names/order):  
`/Users/ckleest/Downloads/Z-Real-Estate-Scraper-Data-& Homes For Sale-2026-02-13.csv`

- [ ] Extract exact column headers in original order (case-sensitive, including any special chars/spaces)
  - Tip: use Papa.parse on first row or quick console log of headers
- [ ] Update main data table component to use **exactly** these columns:
  - Same names
  - Same order
  - Same display formatting where obvious (currency, dates, etc.)
- [ ] Load data either from:
  - LocalStorage persisted CSV (preferred – see task 0)
  - OR fallback/static JSON/CSV import during dev
- [ ] Keep any house-scoring / calculated columns that already exist — just ensure raw source columns match CSV 1:1
- [ ] Use dynamic column generation from headers when possible (more maintainable)

After: Table should visually match the spreadsheet view of the CSV file.

## 3. GitHub Actions – Build & Deploy Workflows

Reference: https://github.com/collinkleest/collinkleest.com/tree/master/.github/workflows

- [ ] Create `.github/workflows/` folder if missing
- [ ] Copy both workflow files (build + deploy) from the reference repo
- [ ] Adapt for this project:
  - Correct package manager command (npm/pnpm/yarn – check package.json)
  - Correct build script (`npm run build` etc.)
  - Correct output directory (usually `.next/` or `out/` for static export)
  - Keep GitHub Pages deployment target (unless changing)
  - Update any env vars / secrets if needed
- [ ] Commit + push to test → confirm workflow runs on main

After: Push to main → site auto-builds and deploys successfully.

## 4. Favicon Update

- [ ] Replace current favicon with house-scoring themed set
  - Suggested concept: simple house icon + score badge (green check / number) or clean house silhouette
  - Sizes needed: 16×16, 32×32, 180×180 (apple-touch), 192×192+, 512×512 (manifest)
- [ ] Generate via https://favicon.io or realfavicongenerator.net
- [ ] Place files in `/public/` (favicon.ico, apple-touch-icon.png, etc.)
- [ ] Update references:
  - `app/layout.tsx` or `pages/_document.tsx` (Next.js)
  - Any manifest.json if using PWA
- [ ] Remove old favicon files

## Final Verification Checklist

- [ ] `npm run dev` → upload CSV → refresh → data persists
- [ ] Upload >4 MB file → see rejection message
- [ ] Light/dark toggle works + persists
- [ ] Table columns exactly match CSV headers/order
- [ ] Build command succeeds locally (`npm run build`)
- [ ] Push to GitHub → Actions complete → site live on GitHub Pages
- [ ] New favicon appears in browser tab
- [ ] Mobile layout looks acceptable (toolbar, upload, table)

Optional stretch goals (after core is done):

- Export scored table as CSV
- Basic scoring rules UI (adjust weights, save presets)
- Pagination / search / sort on table
- "Sample CSV" download button for first-time users

Good luck Collin — once this list is complete you'll have a solid, offline-capable, auto-deploying house scoring prototype.
