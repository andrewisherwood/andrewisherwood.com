# Implementation Brief

**Task:** Create Netlify Edge Function, netlify.toml, and update client JS
**Phase:** 2
**Branch:** `phase-2-api-proxy`
**PR Title:** `Phase 2: Interactive Terminal & API Proxy`
**Priority:** High
**Created:** 2026-02-13T01:19:00Z
**Created by:** Coordinator

---

## Summary
Create the Netlify Edge Function that proxies chat requests to the Anthropic Messages API with server-side security hardening. Move the system prompt, model, and max_tokens to the edge function (the client should only send messages). Create netlify.toml with deployment config and CSP security headers. Add rate limiting and input validation in the edge function. Update the client-side JS in index.html to match the new API contract.

## Architecture Rules (MUST follow)
1. Edge function file: `netlify/edge-functions/chat.js` — uses Deno APIs
2. Config file: `netlify.toml` in project root
3. API key via `Deno.env.get('ANTHROPIC_API_KEY')` only — never in client code
4. System prompt, model, max_tokens must be hardcoded in the edge function — NOT sent from client
5. Client JS must only send `{ messages: [...] }` to `/api/chat`
6. No npm packages or node_modules
7. Do NOT change the HTML structure, CSS, or visual design of index.html — only modify the `<script>` block

---

## Implementation Steps

### Loop 1: Create the edge function (`netlify/edge-functions/chat.js`)
1. Create directory: `mkdir -p netlify/edge-functions`
2. Create `netlify/edge-functions/chat.js` with:
   - Handle CORS preflight (OPTIONS → 204 with Access-Control headers)
   - Reject non-POST requests (405)
   - Parse request body, extract only `messages` array
   - Validate: `messages` must be an array, length ≤ 20, each message content ≤ 1000 chars
   - Rate limit: in-memory Map tracking requests per IP, limit 10/minute, return 429 when exceeded
   - Hardcode: `model: 'claude-sonnet-4-20250514'`, `max_tokens: 300`
   - Embed the system prompt (copy the full `SYSTEM_PROMPT` string from `index.html`)
   - Call `https://api.anthropic.com/v1/messages` with: model, max_tokens, system, messages
   - Headers: `x-api-key` from `Deno.env.get('ANTHROPIC_API_KEY')`, `anthropic-version: 2023-06-01`, `Content-Type: application/json`
   - Return Anthropic response with `Content-Type: application/json` and CORS headers
   - Export `config = { path: '/api/chat' }`

### Loop 2: Create `netlify.toml`
1. Create `netlify.toml` in project root:
```toml
[build]
  publish = "."

[[edge_functions]]
  function = "chat"
  path = "/api/chat"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'"
```

### Loop 3: Update client-side JS in `index.html`
1. Remove the entire `SYSTEM_PROMPT` const definition (the multi-line string starting with `const SYSTEM_PROMPT = \`You are Andrew...` and ending with the closing backtick)
2. In `sendMessage()`, change the `body: JSON.stringify(...)` call to only send messages:
   ```js
   body: JSON.stringify({
     messages: conversationHistory.slice(-10)
   })
   ```
   Remove `model`, `max_tokens`, and `system` from the JSON body.

---

## Files Summary

### Files to Modify
- `index.html` — remove SYSTEM_PROMPT const, simplify fetch body to only send messages

### Files to Create
- `netlify/edge-functions/chat.js` — API proxy with security hardening
- `netlify.toml` — deployment config and security headers

---

## Acceptance Criteria
- [ ] `netlify/edge-functions/chat.js` exists and exports `config = { path: '/api/chat' }`
- [ ] Edge function returns 405 for non-POST requests
- [ ] Edge function handles CORS preflight (OPTIONS → 204)
- [ ] Edge function hardcodes model, max_tokens, and system prompt
- [ ] Edge function reads API key from `Deno.env.get('ANTHROPIC_API_KEY')`
- [ ] Edge function validates messages (array, length ≤ 20, content ≤ 1000 chars)
- [ ] Edge function has rate limiting (10 req/min/IP, returns 429)
- [ ] `netlify.toml` exists with publish = "." and edge function mapping
- [ ] `netlify.toml` includes CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers
- [ ] `index.html` no longer contains the SYSTEM_PROMPT const
- [ ] `index.html` fetch body only sends `{ messages: [...] }`
- [ ] No API key or secret appears anywhere in client-side code
- [ ] System prompt content in edge function matches the original from index.html

---

## Security Notes
- This phase addresses SEC-001, SEC-002, and SEC-003 from Phase 1 security review
- The system prompt must be removed from client JS to prevent prompt injection via devtools
- Rate limiting is best-effort (in-memory, resets on cold start) — acceptable for a portfolio site
- CSP uses `unsafe-inline` for both script-src and style-src because all JS/CSS is inline in the HTML

---

## Context

### Existing patterns to follow
- The reference edge function in SCOPING.md is the basic version (no rate limiting or hardcoded prompt). Enhance it per the security findings.

### Key function locations
- `index.html` line ~1386: `SYSTEM_PROMPT` const (to be removed)
- `index.html` line ~1448: `fetch('/api/chat', ...)` call (to be updated)
- `index.html` line ~1451: `body: JSON.stringify({...})` (to be simplified)

### Build command
```bash
# No build step. Test with: netlify dev
```
