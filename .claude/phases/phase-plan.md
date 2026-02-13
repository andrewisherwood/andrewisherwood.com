# Phase Plan

**Project:** andrewisherwood.com
**Generated:** 2026-02-13T01:00:00Z
**Total Phases:** 3

## Phase 1: Core Site — Static HTML & Styling
**Dependencies:** None
**Estimated complexity:** Medium
**Description:** Create the production `index.html` from the approved reference prototype (`andrewisherwood.html`). This includes all static sections (nav, hero, signal bar, case studies, timeline, about, contact, footer), all CSS (custom properties, terminal window components, responsive breakpoints, scanline overlay, noise texture), and client-side JavaScript for scroll-reveal animations and smooth scrolling. The fetch URL for the interactive terminal must be updated from the direct Anthropic API URL to `/api/chat` to prepare for the edge function proxy. All images reference the existing asset files (`suppertime-screenshot.png`, `adaptive-coach-screenshot.png`, `favicon-c64.svg`).
**Acceptance criteria:**
- [ ] `index.html` exists in project root with all 8 sections matching the reference prototype
- [ ] All CSS variables, terminal chrome, scanline overlay, and noise texture render correctly
- [ ] Scroll-reveal animations fire on intersection with staggered delay
- [ ] Smooth scrolling works for all anchor links
- [ ] Responsive layout works at 600px and 900px breakpoints
- [ ] The AI terminal fetch URL points to `/api/chat` (not directly to Anthropic)
- [ ] All image `src` attributes reference the correct local asset files
- [ ] Favicon SVG is linked in the `<head>`

## Phase 2: Interactive Terminal & API Proxy
**Dependencies:** Phase 1
**Estimated complexity:** Low
**Description:** Create the Netlify Edge Function that proxies chat requests to the Anthropic Messages API, injecting the API key server-side. Create the `netlify.toml` deployment configuration. The AI terminal system prompt containing all portfolio context is already embedded in the `<script>` block from Phase 1. This phase ensures the interactive terminal works end-to-end when deployed.
**Acceptance criteria:**
- [ ] `netlify/edge-functions/chat.js` exists and correctly proxies POST requests to `https://api.anthropic.com/v1/messages`
- [ ] Edge function reads `ANTHROPIC_API_KEY` from `Deno.env.get()` and never exposes it to the client
- [ ] Edge function returns 405 for non-POST requests
- [ ] Edge function sets CORS headers (`Access-Control-Allow-Origin: *`)
- [ ] `netlify.toml` maps `/api/chat` to the `chat` edge function
- [ ] `netlify.toml` sets publish directory to `.` with no build command
- [ ] System prompt in the `<script>` block is in sync with the case study content in the HTML

## Phase 3: Build Log & Deployment Readiness
**Dependencies:** Phase 2
**Estimated complexity:** Low
**Description:** Create the `BUILD_LOG.md` documenting the MAI V3 build process — this is both a project deliverable and content for the MAI case study. Verify all files are present, all links work, and the site is deployment-ready. No DNS or deployment actions are taken (those are manual steps by the user), but instructions are documented.
**Acceptance criteria:**
- [ ] `BUILD_LOG.md` exists with timestamped agent activity, QA findings, security findings, and build summary
- [ ] All required files are present: `index.html`, `favicon-c64.svg`, `suppertime-screenshot.png`, `adaptive-coach-screenshot.png`, `netlify/edge-functions/chat.js`, `netlify.toml`
- [ ] No API keys or secrets appear in any committed file
- [ ] No `node_modules`, `package.json`, or build artefacts exist in the repo
- [ ] `README.md` describes the project and deployment steps
