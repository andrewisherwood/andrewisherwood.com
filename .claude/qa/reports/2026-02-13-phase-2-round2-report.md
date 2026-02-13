# QA Report — Phase 2: Interactive Terminal & API Proxy (Round 2)

**Date:** 2026-02-13T01:37:00Z
**Branch:** phase-2-api-proxy
**PR:** #2
**Round:** 2 (re-review after SEC-004 / SEC-005 fixes)
**Result:** PASS (15/15 tests passed)

---

## Security Fix Verification

### SEC-004: Non-2xx Anthropic responses return generic 502

**Status:** PASS
**File:** `netlify/edge-functions/chat.js:162-166`
**Evidence:** When `!anthropicResponse.ok`, the function returns `{ error: "AI service unavailable" }` with status 502. The upstream response body is never forwarded to the client. Verified in commit `90ec245`.

### SEC-005: Messages with non-string content rejected (400)

**Status:** PASS
**File:** `netlify/edge-functions/chat.js:110-119`
**Evidence:** The `for` loop now checks `typeof msg.content !== "string"` first, returning `{ error: "Invalid message format" }` with status 400. This blocks array-based content (e.g. tool-use blocks) before they reach the Anthropic API. Previously the code only checked `msg.content.length > 1000` without first verifying the type was a string. Verified in commit `90ec245`.

---

## Original Acceptance Criteria Re-Verification

### TC-001: Edge function file exists with config export

**Status:** PASS
**Evidence:** `netlify/edge-functions/chat.js` exists. Line 186: `export const config = { path: "/api/chat" };`

### TC-002: Edge function returns 405 for non-POST requests

**Status:** PASS
**Evidence:** Lines 58-63: `if (request.method !== "POST")` returns `{ error: "Method not allowed" }` with status 405 and CORS headers.

### TC-003: Edge function handles CORS preflight (OPTIONS → 204)

**Status:** PASS
**Evidence:** Lines 53-55: `if (request.method === "OPTIONS")` returns `new Response(null, { status: 204, headers: CORS_HEADERS })`.

### TC-004: Edge function hardcodes model, max_tokens, and system prompt

**Status:** PASS
**Evidence:** Lines 153-158: API call body contains `model: "claude-sonnet-4-20250514"`, `max_tokens: 300`, `system: SYSTEM_PROMPT`. Lines 12-32: `SYSTEM_PROMPT` is a hardcoded const containing the full portfolio agent prompt.

### TC-005: Edge function reads API key from Deno.env

**Status:** PASS
**Evidence:** Line 132: `const apiKey = Deno.env.get("ANTHROPIC_API_KEY");` — key is read from environment, never hardcoded. Lines 133-141 return 500 if the key is not configured.

### TC-006: Edge function validates messages (array, length ≤ 20, content ≤ 1000 chars)

**Status:** PASS
**Evidence:**
- Lines 90-98: `if (!Array.isArray(messages))` → 400
- Lines 100-108: `if (messages.length > 20)` → 400
- Lines 110-119: `if (typeof msg.content !== "string")` → 400 (SEC-005 fix)
- Lines 120-128: `if (msg.content.length > 1000)` → 400

### TC-007: Edge function has rate limiting (10 req/min/IP, returns 429)

**Status:** PASS
**Evidence:** Lines 2-4: `RATE_LIMIT = 10`, `RATE_WINDOW_MS = 60_000`. Lines 34-49: `isRateLimited()` function tracks per-IP requests in a Map. Lines 66-75: returns `{ error: "Rate limit exceeded. Try again in a minute." }` with status 429 when exceeded.

### TC-008: netlify.toml exists with publish = "." and edge function mapping

**Status:** PASS
**Evidence:** `netlify.toml` lines 1-2: `[build]` / `publish = "."`. Lines 4-6: `[[edge_functions]]` / `function = "chat"` / `path = "/api/chat"`.

### TC-009: netlify.toml includes CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers

**Status:** PASS
**Evidence:** `netlify.toml` lines 8-14: `[[headers]]` for `/*` with:
- `X-Frame-Options = "DENY"`
- `X-Content-Type-Options = "nosniff"`
- `Referrer-Policy = "strict-origin-when-cross-origin"`
- `Content-Security-Policy = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'"`

### TC-010: index.html no longer contains the SYSTEM_PROMPT const

**Status:** PASS
**Evidence:** `grep SYSTEM_PROMPT index.html` returns no matches. The const was removed in commit `802184e`.

### TC-011: index.html fetch body only sends { messages: [...] }

**Status:** PASS
**Evidence:** Lines 1429-1431: `body: JSON.stringify({ messages: conversationHistory.slice(-10) })`. No `model`, `max_tokens`, or `system` fields.

### TC-012: No API key or secret appears anywhere in client-side code

**Status:** PASS
**Evidence:** `grep -E "ANTHROPIC_API_KEY|x-api-key|api\.anthropic\.com" index.html` returns no matches. The only reference to API key is in the edge function via `Deno.env.get()`.

### TC-013: System prompt content in edge function matches original

**Status:** PASS
**Evidence:** `chat.js` lines 12-32 contain the full system prompt starting with "You are Andrew Isherwood's portfolio agent" and ending with the tone instructions. Content matches the original specification from SCOPING.md including all sections: ABOUT ANDREW, PRODUCTS (Suppertime, MAI, Adaptive Coach), CORE STACK, and TONE.

---

## Summary

- **Security fixes verified:** 2/2
- **Original ACs re-verified:** 13/13
- **Total tests passed:** 15/15
- **Total tests failed:** 0/15

All SEC-004 and SEC-005 fixes are correctly implemented. No regressions detected in the original 13 acceptance criteria.
