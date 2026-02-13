# Project Roadmap

**Project:** andrewisherwood.com
**Last Updated:** 2026-02-13T01:00:00Z

## Phase Summary

| Phase | Name | Status | Priority | Duration | Notes |
|-------|------|--------|----------|----------|-------|
| 1 | Core Site — Static HTML & Styling | ⏳ Pending | High | — | All sections, CSS, scroll animations |
| 2 | Interactive Terminal & API Proxy | ⏳ Pending | High | — | Edge function, netlify.toml, chat proxy |
| 3 | Build Log & Deployment Readiness | ⏳ Pending | Medium | — | BUILD_LOG.md, final verification |

## Detailed Phases

### Phase 1: Core Site — Static HTML & Styling
Create the production `index.html` from the approved reference prototype. All 8 sections (nav, hero, signal bar, case studies, timeline, about, interactive terminal, contact, footer), full CSS (custom properties, terminal components, responsive breakpoints, scanline/noise overlays), and client-side JS (scroll-reveal, smooth scrolling). Fetch URL updated to `/api/chat`.

### Phase 2: Interactive Terminal & API Proxy
Create the Netlify Edge Function (`netlify/edge-functions/chat.js`) that proxies chat requests to the Anthropic Messages API. Create `netlify.toml` deployment config. Ensure the system prompt in the JS and the HTML case study content are in sync.

### Phase 3: Build Log & Deployment Readiness
Create `BUILD_LOG.md` documenting the MAI V3 build process. Verify all files present, no secrets exposed, no build artefacts. Update `README.md` with project description and deployment steps.

---

## Agent Update — 2026-02-13

**Updated by:** Coordinator
**Phase Status:** Pipeline initialised, 3 phases planned
**Changes:**
- Decomposed SCOPING.md into 3 vertical-slice phases
- Created phase plan, STATUS.md, ROADMAP.md
- Infrastructure provisioned (worktrees, memory system, security templates)

**Next Priority:** Plan and execute Phase 1 — Core Site
