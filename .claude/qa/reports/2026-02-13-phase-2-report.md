# QA Report — Phase 2: Interactive Terminal & API Proxy

**Date:** 2026-02-13T01:45:00Z
**Branch:** phase-2-api-proxy
**PR:** #2
**Result:** PASS (13/13 tests passed)

## Test Results

### TC-001: Edge function file exists with config export
**Status:** PASS
**Steps:** Verified `netlify/edge-functions/chat.js` exists on branch. Confirmed last line exports `config = { path: "/api/chat" }`.

### TC-002: Edge function returns 405 for non-POST requests
**Status:** PASS
**Steps:** Code review of `handler()` function. After CORS preflight check, non-POST requests hit the `if (request.method !== "POST")` guard which returns a 405 response with `{ error: "Method not allowed" }` and CORS headers.

### TC-003: CORS preflight (OPTIONS → 204)
**Status:** PASS
**Steps:** Code review of `handler()` function. First check in handler is `if (request.method === "OPTIONS")` which returns `new Response(null, { status: 204, headers: CORS_HEADERS })`. CORS headers include `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`.

### TC-004: Hardcoded model, max_tokens, and system prompt
**Status:** PASS
**Steps:** Verified the Anthropic API call at line ~130 hardcodes `model: "claude-sonnet-4-20250514"`, `max_tokens: 300`, and `system: SYSTEM_PROMPT`. The `SYSTEM_PROMPT` constant is defined at the top of the file as a template literal. None of these values are sourced from the client request body.

### TC-005: API key from Deno.env.get('ANTHROPIC_API_KEY')
**Status:** PASS
**Steps:** Verified `const apiKey = Deno.env.get("ANTHROPIC_API_KEY")` is used to retrieve the key. Key is passed as `x-api-key` header to the Anthropic API. A missing key returns 500 with `{ error: "API key not configured" }`.

### TC-006: Message validation (array, length ≤ 20, content ≤ 1000 chars)
**Status:** PASS
**Steps:** Code review confirms three validation checks:
1. `if (!Array.isArray(messages))` → 400 "messages must be an array"
2. `if (messages.length > 20)` → 400 "Too many messages (max 20)"
3. Loop checks `msg.content.length > 1000` → 400 "Message content too long (max 1000 chars)"

### TC-007: Rate limiting (10 req/min/IP, returns 429)
**Status:** PASS
**Steps:** Code review of `isRateLimited()` function. Uses in-memory `Map` keyed by IP. Window is 60,000ms (`RATE_WINDOW_MS`), limit is 10 (`RATE_LIMIT`). Returns 429 with `{ error: "Rate limit exceeded. Try again in a minute." }` when exceeded. IP sourced from `context.ip` or `x-forwarded-for` header, falling back to `"unknown"`.

### TC-008: netlify.toml exists with correct config
**Status:** PASS
**Steps:** Verified `netlify.toml` exists at project root with:
- `[build] publish = "."`
- `[[edge_functions]] function = "chat"` and `path = "/api/chat"`

### TC-009: Security headers in netlify.toml
**Status:** PASS
**Steps:** Verified `[[headers]]` block with `for = "/*"` includes:
- `X-Frame-Options = "DENY"`
- `X-Content-Type-Options = "nosniff"`
- `Referrer-Policy = "strict-origin-when-cross-origin"`
- `Content-Security-Policy` with `default-src 'self'`, `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src https://fonts.gstatic.com`, `img-src 'self'`, `connect-src 'self'`, `script-src 'self' 'unsafe-inline'`

### TC-010: SYSTEM_PROMPT removed from index.html
**Status:** PASS
**Steps:** Searched PR branch `index.html` for `SYSTEM_PROMPT` — zero matches. The `git diff` confirms the entire `const SYSTEM_PROMPT = \`...\`;` block (22 lines) was removed from the `<script>` section.

### TC-011: Fetch body only sends { messages }
**Status:** PASS
**Steps:** Verified the `fetch('/api/chat', ...)` call in PR branch `index.html` (line 1429). The `body: JSON.stringify(...)` now only contains `{ messages: conversationHistory.slice(-10) }`. The `model`, `max_tokens`, and `system` fields have been removed from the client-side request.

### TC-012: No API key or secret in client-side code
**Status:** PASS
**Steps:** Searched PR branch `index.html` for: `SYSTEM_PROMPT`, `api.key`, `ANTHROPIC_API_KEY`, `sk-ant-`, `api_key`, `apikey`, `secret` — zero matches for all patterns.

### TC-013: System prompt content matches original
**Status:** PASS
**Steps:** Extracted the `SYSTEM_PROMPT` template literal from `origin/main:index.html` and `origin/phase-2-api-proxy:netlify/edge-functions/chat.js`. Ran `diff` — zero differences. The system prompt has been moved server-side with identical content.

## Summary
- Passed: 13
- Failed: 0
- Total: 13

## Notes
- This was a code review (static analysis of the diff), not a runtime/browser test. The site has no dev server running and the edge function requires Netlify's runtime environment.
- All acceptance criteria from the phase 2 brief are met.
- The implementation follows the architecture rules: no npm packages, no build step, Deno-native edge function, API key server-side only.
- CSP uses `unsafe-inline` for script-src and style-src as expected (all JS/CSS is inline in the single HTML file).
