# Implementation Brief

**Task:** Create production index.html from reference prototype
**Phase:** 1
**Branch:** `phase-1-core-site`
**PR Title:** `Phase 1: Core Site — Static HTML & Styling`
**Priority:** High
**Created:** 2026-02-13T01:03:00Z
**Created by:** Coordinator

---

## Summary
Create the production `index.html` by copying the approved reference prototype (`andrewisherwood.html`) and making targeted changes: update the interactive terminal's fetch URL from the direct Anthropic API endpoint to `/api/chat` (the edge function proxy), and remove the API-specific headers from the client-side fetch call. Verify all asset paths and responsive behaviour.

## Architecture Rules (MUST follow)
1. Single HTML file — all CSS in `<style>`, all JS in `<script>`, no external dependencies except Google Fonts
2. No framework, no build step, no `package.json`, no `node_modules`
3. Do NOT modify `favicon-c64.svg`
4. Do NOT remove the scanline overlay
5. Do NOT expose the Anthropic API key in client code
6. Match the reference prototype's aesthetic exactly
7. Fonts: IBM Plex Mono, Space Grotesk, DM Serif Display (loaded from Google Fonts)

---

## Implementation Steps

### Loop 1: Create index.html from reference prototype
1. Copy `andrewisherwood.html` to `index.html`
2. In the `<script>` block, find the `fetch('https://api.anthropic.com/v1/messages'` call and change it to `fetch('/api/chat'`
3. In the same fetch call, simplify the `headers` to only `{ 'Content-Type': 'application/json' }` — remove any API key or anthropic-version headers (the edge function adds those server-side)
4. Verify all image `src` attributes: `suppertime-screenshot.png`, `adaptive-coach-screenshot.png`
5. Verify favicon: `href="favicon-c64.svg"`
6. Verify all 8 sections are present: nav, hero, signal bar, case studies, timeline, about, interactive terminal, contact+footer

### Loop 2: Verify responsive behaviour and animations
1. Confirm CSS breakpoints at 900px and 600px are present and correct
2. Confirm scroll-reveal IntersectionObserver JS is present
3. Confirm smooth scrolling JS is present for anchor links
4. No code changes expected — this is verification only

---

## Files Summary

### Files to Modify
None — `andrewisherwood.html` is read-only reference

### Files to Create
- `index.html` — copy of `andrewisherwood.html` with fetch URL fix

---

## Acceptance Criteria
- [ ] `index.html` exists in project root
- [ ] All 8 sections match the reference prototype visually
- [ ] Fetch URL is `/api/chat` (not `https://api.anthropic.com/v1/messages`)
- [ ] No API key or `anthropic-version` header in client-side fetch
- [ ] All image `src` attributes reference correct local files
- [ ] Favicon SVG is linked in `<head>`
- [ ] Responsive breakpoints at 900px and 600px present in CSS
- [ ] Scroll-reveal animation JS present and working
- [ ] Smooth scrolling for anchor links present

---

## Security Notes
- The fetch call must NOT include the Anthropic API key or any auth headers
- User input in the terminal is escaped via `escapeHtml()` — verify XSS prevention
- The `addHTMLLine` function uses `innerHTML` — all user content must go through `escapeHtml()` first

---

## Context

### Existing patterns to follow
The reference file `andrewisherwood.html` is the single source of truth. Match it exactly except for the fetch URL change.

### Key function locations
- `sendMessage()` — the function that calls the API (contains the fetch URL to change)
- `escapeHtml()` — XSS prevention for terminal output
- `addLine()` / `addHTMLLine()` — terminal output rendering
- IntersectionObserver for `.reveal` elements — scroll animations

### Build command
```bash
# No build step. Open index.html in a browser.
```
