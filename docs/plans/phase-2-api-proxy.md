# Phase Plan

**Project:** andrewisherwood.com
**Generated:** 2026-02-13T01:18:00Z
**Total Phases:** 3

Phase 1: Core Site — Static HTML & Styling (✅ Complete)
Phase 2: Interactive Terminal & API Proxy (← current)
Phase 3: Build Log & Deployment Readiness

---

# Detailed Plan: Phase 2 — Interactive Terminal & API Proxy

**Date:** 2026-02-13
**Status:** Approved
**Branch:** `feature/phase-2-api-proxy`

## Overview
Create the Netlify Edge Function that proxies chat requests from the client to the Anthropic Messages API. The edge function must hardcode the system prompt, model, and max_tokens server-side (per SEC-001 from Phase 1 security review) — the client should only send the `messages` array. Create `netlify.toml` with deployment config and CSP headers (per SEC-002). Add server-side rate limiting in the edge function (per SEC-003). Update the client-side JS in `index.html` to send only `messages` (not system prompt, model, or max_tokens).

## Pre-existing Code
- `index.html` — the production site (from Phase 1). The `sendMessage()` function currently sends `model`, `max_tokens`, `system`, and `messages` in the fetch body.
- `SCOPING.md` — contains the reference edge function code (basic proxy without security hardening).

## Architecture Rules (MUST follow)
1. Edge function file: `netlify/edge-functions/chat.js`
2. Config file: `netlify.toml` in project root
3. The edge function reads `ANTHROPIC_API_KEY` from `Deno.env.get('ANTHROPIC_API_KEY')` — never exposed to client
4. The system prompt must be server-side only — remove it from client JS, embed it in the edge function
5. `model` and `max_tokens` must be hardcoded in the edge function
6. The client-side JS in `index.html` must only send `{ messages: [...] }` to `/api/chat`
7. No npm dependencies — the edge function uses Deno APIs
8. Add CSP headers in `netlify.toml` (or edge function response headers)

## Loops

### Loop 1: Create the edge function
**Files:** `netlify/edge-functions/chat.js` (create)
**What:**
1. Create `netlify/edge-functions/chat.js`
2. Handle POST requests only (return 405 for others)
3. Handle CORS preflight (OPTIONS request returning 204 with appropriate headers)
4. Parse the request body — extract only `messages` array
5. Hardcode: `model: 'claude-sonnet-4-20250514'`, `max_tokens: 300`
6. Embed the full system prompt (copy from the `SYSTEM_PROMPT` const in `index.html`)
7. Call `https://api.anthropic.com/v1/messages` with all parameters
8. Inject API key from `Deno.env.get('ANTHROPIC_API_KEY')`
9. Set `anthropic-version: 2023-06-01` header
10. Return response with CORS headers
11. Add basic rate limiting: track request counts per IP using a simple in-memory Map with TTL (e.g., 10 requests per minute per IP). This is best-effort (resets on cold start) but sufficient for basic protection.
12. Return 429 Too Many Requests when rate limit exceeded
13. Add input validation: reject if `messages` is not an array, if array length > 20, or if any message content exceeds 1000 characters

### Loop 2: Create netlify.toml
**Files:** `netlify.toml` (create)
**What:**
1. Set `[build] publish = "."`
2. Map edge function: `[[edge_functions]] function = "chat" path = "/api/chat"`
3. Add security headers via `[[headers]]`:
   - Content-Security-Policy: `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'`
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin

### Loop 3: Update client-side JS
**Files:** `index.html` (modify)
**What:**
1. Remove the `SYSTEM_PROMPT` const from the `<script>` block entirely
2. In `sendMessage()`, change the fetch body from `JSON.stringify({ model, max_tokens, system, messages })` to `JSON.stringify({ messages: conversationHistory.slice(-10) })`
3. The system prompt comment block in the HTML should remain for documentation (but is not functional code)

---

## Security Considerations
- SEC-001: System prompt moved to edge function. Client cannot override model, max_tokens, or system prompt.
- SEC-002: CSP headers added in netlify.toml.
- SEC-003: Rate limiting added in edge function (10 req/min/IP).
- API key only accessed via `Deno.env.get()` — never in client code.
- Input validation prevents oversized payloads.

## Edge Cases
- Edge function cold starts: rate limit map resets (acceptable — this is a portfolio site, not high-traffic).
- Client sends unexpected fields: edge function ignores everything except `messages`.
- Empty messages array: Anthropic API will return an error, which the client handles with the existing error fallback.
- Netlify free tier: edge functions have a 50ms CPU time limit — this should be fine for a simple proxy.

## Sequencing Notes
- Loop 1 and Loop 2 can be developed in parallel (no dependencies between them)
- Loop 3 depends on Loop 1 (need to know the final edge function contract before updating the client)
- The system prompt content must be identical between what was in `index.html` and what goes into `chat.js`
