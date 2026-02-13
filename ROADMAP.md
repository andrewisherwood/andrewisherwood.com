# Project Roadmap

**Project:** andrewisherwood.com
**Last Updated:** 2026-02-13T01:50:00Z

## Phase Summary

| Phase | Name | Status | Priority | Duration | Notes |
|-------|------|--------|----------|----------|-------|
| 1 | Core Site — Static HTML & Styling | ✅ Complete | High | ~15 min | All sections, CSS, scroll animations |
| 2 | Interactive Terminal & API Proxy | ✅ Complete | High | ~24 min | Edge function, netlify.toml, chat proxy, security hardening |
| 3 | Build Log & Deployment Readiness | ✅ Complete | Medium | ~10 min | BUILD_LOG.md, README.md, final verification |

## Detailed Phases

### Phase 1: Core Site — Static HTML & Styling
Create the production `index.html` from the approved reference prototype. All 8 sections (nav, hero, signal bar, case studies, timeline, about, interactive terminal, contact, footer), full CSS (custom properties, terminal components, responsive breakpoints, scanline/noise overlays), and client-side JS (scroll-reveal, smooth scrolling). Fetch URL updated to `/api/chat`.

### Phase 2: Interactive Terminal & API Proxy
Create the Netlify Edge Function (`netlify/edge-functions/chat.js`) that proxies chat requests to the Anthropic Messages API. Create `netlify.toml` deployment config. Security hardening: system prompt moved server-side, CSP headers, rate limiting, input validation, error filtering. 5 security findings resolved across 2 review rounds.

### Phase 3: Build Log & Deployment Readiness
Create `BUILD_LOG.md` documenting the MAI V3 build process. Create `README.md` with project description and deployment steps. Final verification of all files, no secrets, no build artefacts.

---

## Agent Update — 2026-02-13

**Updated by:** Coordinator
**Phase Status:** All phases complete — project delivered
**Changes:**
- All 3 phases planned, built, reviewed, and merged
- 3 PRs merged to main (#1, #2, #3)
- 5 security findings identified and resolved
- 4 QA review rounds, all passed

**Next Priority:** Deploy to Netlify (manual step — connect repo, set ANTHROPIC_API_KEY env var, add custom domain)
