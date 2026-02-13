# QA Report — Phase 1: Core Site — Static HTML & Styling

**Date:** 2026-02-13T12:00:00Z
**Branch:** phase-1-core-site
**PR:** #1
**Result:** PASS (10/10 tests passed)

## Test Results

### TC-001: index.html exists in project root
**Status:** PASS
**Steps:** Verified `index.html` exists at project root via file glob search.

### TC-002: All 8 sections present and match reference prototype
**Status:** PASS
**Steps:** Read full `index.html`, verified all 8 sections are present:
1. **Nav** (line 1001) — Fixed nav with "AI" logo, blinking cursor, `> links` style, "get in touch" CTA
2. **Hero** (line 1011) — Terminal window with `andrew@isherwood ~` chrome, title, ROLE/STACK/SINCE key-values, two CTAs
3. **Signal bar** (line 1044) — 4 stats: 32 years, 100 beta users, 4 products, AI workflows
4. **Case studies** (line 1068) — Suppertime (mobile screenshot), MAI (terminal mockup), Adaptive Coach (desktop screenshot)
5. **Timeline** (line 1196) — 1994 → 2000 → 2010 → 2018 → 2024 → NOW horizontal timeline
6. **About** (line 1235) — Narrative text left, `stack.config` terminal window right with `├─` tree notation
7. **Interactive terminal** (line 1289) — AI chatbot with `visitor@portfolio $` prompt, input field
8. **Contact + Footer** (line 1322) — Terminal window `mail — 80x24`, email link, copyright/Folkestone/GitHub footer

**Verification:** Ran `diff` between `andrewisherwood.html` (reference) and `index.html`. Only a single-line change at line 1448 (fetch URL). All sections match the reference exactly.

### TC-003: Fetch URL is /api/chat
**Status:** PASS
**Steps:** Searched `index.html` for all `fetch(` calls.
**Found:** Line 1448: `const response = await fetch('/api/chat', {`
**Verified:** The reference prototype has `fetch('https://api.anthropic.com/v1/messages'` — this was correctly changed to `/api/chat`.

### TC-004: No API key or anthropic-version header in client-side fetch
**Status:** PASS
**Steps:** Searched `index.html` for `api.anthropic.com`, `x-api-key`, `anthropic-version`, and `ANTHROPIC_API_KEY`.
**Found:** Zero matches. The fetch headers contain only `{ 'Content-Type': 'application/json' }`.

### TC-005: All image src attributes reference correct local files
**Status:** PASS
**Steps:** Searched for all `img src=` in `index.html`. Found two image references:
1. Line 1103: `src="suppertime-screenshot.png"` — file exists at project root ✓
2. Line 1188: `src="adaptive-coach-screenshot.png"` — file exists at project root ✓

Both images have descriptive `alt` attributes and `loading="lazy"`.

### TC-006: Favicon SVG linked in head
**Status:** PASS
**Steps:** Searched for `favicon` in `index.html`.
**Found:** Line 8: `<link rel="icon" type="image/svg+xml" href="favicon-c64.svg">`
**Verified:** `favicon-c64.svg` exists at project root.

### TC-007: Responsive breakpoints at 900px and 600px present in CSS
**Status:** PASS
**Steps:** Searched for `@media` rules in `index.html`.
**Found:**
- Line 975: `@media (max-width: 900px)` — adjusts case study grid, about grid, signal grid, timeline
- Line 984: `@media (max-width: 600px)` — adjusts section padding, container padding, nav, hero, case study content, hero grid

### TC-008: Scroll-reveal animation JS present
**Status:** PASS
**Steps:** Searched for `IntersectionObserver` and `.reveal` in `index.html`.
**Found:**
- CSS: `.reveal` class (line 963) with opacity:0 and translateY(30px), `.reveal.visible` (line 969) with opacity:1 and translateY(0)
- JS: Lines 1362-1374 — `IntersectionObserver` selects all `.reveal` elements, adds `visible` class on intersection with staggered `setTimeout`, then `unobserve`s
- HTML: `.reveal` class applied to signal items, case studies, about text, about aside, contact elements

### TC-009: Smooth scrolling for anchor links present
**Status:** PASS
**Steps:** Searched for `scrollIntoView` and `scroll-behavior` in `index.html`.
**Found:**
- CSS: Line 38: `html { scroll-behavior: smooth; }` — native smooth scrolling
- JS: Lines 1377-1383 — `querySelectorAll('a[href^="#"]')` with `scrollIntoView({ behavior: 'smooth', block: 'start' })` and `preventDefault()`

### TC-010: escapeHtml() used for all user input before innerHTML (XSS prevention)
**Status:** PASS
**Steps:** Audited all `innerHTML` usage and all `addHTMLLine()` calls in the JS:
1. **User input display** (line 1436): Uses `addLine()` → sets `textContent` (not innerHTML). SAFE.
2. **Thinking indicator** (line 1442): `addHTMLLine()` with hardcoded HTML only. SAFE.
3. **AI response display** (line 1477-1479): `addHTMLLine('...▸...' + escapeHtml(lines[i]))` — AI response escaped. SAFE.
4. **Separator** (line 1485): Hardcoded HTML. SAFE.
5. **Error message** (line 1489): Hardcoded HTML. SAFE.
6. **escapeHtml function** (line 1499-1503): Creates a `div`, sets `textContent`, reads `innerHTML` — standard DOM-based escaping. Correct implementation.

**Conclusion:** All dynamic content passed to `innerHTML` via `addHTMLLine()` is either hardcoded or escaped via `escapeHtml()`. No XSS vectors found.

## Additional Observations

- The diff between `andrewisherwood.html` and `index.html` shows exactly one line changed (line 1448: fetch URL). The implementation is a clean, minimal change as specified in the brief.
- Edge function (`netlify/edge-functions/chat.js`) and `netlify.toml` are not present in this branch. These are deployment infrastructure and may be addressed in a later phase.
- All fonts load from Google Fonts as specified: IBM Plex Mono, Space Grotesk, DM Serif Display.
- Scanline overlay is present (`body::before` at line 56).
- No `package.json`, `node_modules`, or build tools present. Architecture rules followed.

## Summary
- Passed: 10
- Failed: 0
- Total: 10
- **Verdict: PASS**
