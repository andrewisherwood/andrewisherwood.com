# Phase Plan

**Project:** andrewisherwood.com
**Generated:** 2026-02-13T01:02:00Z
**Total Phases:** 3

Phase 1: Core Site — Static HTML & Styling (← current)
Phase 2: Interactive Terminal & API Proxy
Phase 3: Build Log & Deployment Readiness

---

# Detailed Plan: Phase 1 — Core Site

**Date:** 2026-02-13
**Status:** Approved
**Branch:** `feature/phase-1-core-site`

## Overview
Create the production `index.html` by adapting the approved reference prototype (`andrewisherwood.html`). The reference is a complete, working HTML file with all sections, CSS, and JavaScript. The primary changes needed are: (1) rename/copy to `index.html`, (2) update the fetch URL from the direct Anthropic API endpoint to `/api/chat` for the edge function proxy, (3) verify all asset paths are correct.

## Pre-existing Code
- `andrewisherwood.html` — the complete approved prototype (1521 lines). Contains all HTML structure, inline `<style>` block (~997 lines of CSS), and inline `<script>` block (~157 lines of JS).
- `favicon-c64.svg` — approved C64-style favicon with AI monogram
- `suppertime-screenshot.png` — mobile screenshot for Suppertime case study
- `adaptive-coach-screenshot.png` — desktop screenshot for Adaptive Coach case study

## Architecture Rules (MUST follow)
1. Single HTML file — all CSS in `<style>`, all JS in `<script>`, no external dependencies except Google Fonts
2. No framework, no build step, no `package.json`, no `node_modules`
3. Do NOT modify `favicon-c64.svg` (it's approved)
4. Do NOT remove the scanline overlay
5. Do NOT expose the Anthropic API key in client code — the fetch must call `/api/chat`
6. Match the reference prototype's aesthetic exactly — do not redesign
7. Fonts: IBM Plex Mono, Space Grotesk, DM Serif Display (loaded from Google Fonts)

## Loops

### Loop 1: Create index.html from reference prototype
**Files:** `index.html` (create)
**What:** Copy `andrewisherwood.html` to `index.html`. Then make the following targeted changes:
1. **Line 1448** — Change `fetch('https://api.anthropic.com/v1/messages', {` to `fetch('/api/chat', {`
2. **Lines 1449-1451** — Remove the `headers` block from the fetch call (the edge function handles headers). Replace with just `headers: { 'Content-Type': 'application/json' },`
3. Verify all image `src` attributes point to the correct files: `suppertime-screenshot.png`, `adaptive-coach-screenshot.png`
4. Verify favicon link: `href="favicon-c64.svg"`

**Acceptance criteria:**
- `index.html` renders identically to `andrewisherwood.html` visually
- The fetch URL is `/api/chat` (not the direct Anthropic URL)
- No API key or auth headers appear in the client-side fetch call
- All 8 sections present: nav, hero, signal bar, case studies, timeline, about, interactive terminal, contact+footer

### Loop 2: Verify responsive behaviour and animations
**Files:** `index.html` (verify only — no changes expected)
**What:** Confirm the responsive CSS breakpoints at 900px and 600px work correctly. Confirm scroll-reveal animations fire. Confirm smooth scrolling. This is a verification loop — the CSS is already in the prototype.

**Acceptance criteria:**
- At 900px: case study grid becomes single-column, about grid becomes single-column, signal grid becomes 2x2, timeline wraps
- At 600px: reduced padding, smaller nav fonts, hero min-height 90vh, hero-grid hidden
- Scroll-reveal `.reveal` elements animate on intersection
- Smooth scrolling works for `#work`, `#about`, `#contact` anchor links

---

## Security Considerations
- The client-side JS must never contain or reference the Anthropic API key
- The fetch in the interactive terminal must call the local proxy (`/api/chat`), not the Anthropic API directly
- User input in the terminal is escaped via `escapeHtml()` before being inserted as `innerHTML` — verify this prevents XSS
- The `addHTMLLine` function uses `innerHTML` — ensure all user-generated content passes through `escapeHtml()` first

## Edge Cases
- If Google Fonts fails to load, the CSS fallback fonts (`Courier New`, `-apple-system`, `Georgia`) should maintain readability
- If the AI terminal receives no response or an error, the existing error handler shows a fallback message with the email address
- Very long AI responses: the terminal has `max-height: 500px` with `overflow-y: auto` scrolling

## Sequencing Notes
- Loop 1 must complete before Loop 2 (verification depends on the file existing)
- This phase has no external dependencies — all assets are already in the repo
- Phase 2 depends on this phase being complete (edge function needs `index.html` to be finalized)
