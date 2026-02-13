# Security Review — Phase 2: Interactive Terminal & API Proxy

**Date:** 2026-02-13T01:35:00Z
**Updated:** 2026-02-13T02:10:00Z (Round 2)
**Branch:** phase-2-api-proxy
**PR:** #2
**Reviewer:** Security Agent
**Result:** CLEAN (0 open findings)

## Phase 1 Finding Remediation

| Finding | Status | Verification |
|---------|--------|-------------|
| SEC-001: Client sends system prompt/model to proxy | **RESOLVED** | System prompt, model (`claude-sonnet-4-20250514`), and max_tokens (`300`) are now hardcoded in `netlify/edge-functions/chat.js`. Client JS only sends `{ messages: [...] }`. `SYSTEM_PROMPT` const removed from `index.html`. |
| SEC-002: No CSP headers | **RESOLVED** | CSP added in `netlify.toml`: `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'`. Also includes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| SEC-003: No rate limiting | **RESOLVED** | In-memory rate limiter added in edge function: 10 requests per minute per IP, returns 429 when exceeded. Best-effort (resets on cold start) — acceptable for portfolio site. |

## Phase 2 Finding Remediation (Round 2)

| Finding | Status | Verification |
|---------|--------|-------------|
| SEC-004: Anthropic API error responses passed through unfiltered | **RESOLVED** | `chat.js:162–167` now checks `if (!anthropicResponse.ok)` and returns a generic `{ error: "AI service unavailable" }` with status 502. The upstream Anthropic error body is never forwarded to the client. Matches the exact recommendation from Round 1. |
| SEC-005: Message content length validation bypassed by array-format content | **RESOLVED** | `chat.js:111–119` now checks `typeof msg.content !== "string"` first, rejecting any non-string content with `{ error: "Invalid message format" }` (400). This adopts the more defensive recommendation — array-format content blocks are rejected outright. The length check on line 120 only runs on confirmed strings. No bypass possible. |

## Round 2 Regression Check

Reviewed the fix commit (`90ec245`) for new issues:

| Check | Result | Notes |
|-------|--------|-------|
| SEC-004 fix introduces new leak | **CLEAN** | Generic 502 response only. No upstream body forwarded. |
| SEC-005 fix breaks valid input | **CLEAN** | Client only sends string content (plain text). Rejecting non-string is correct for this use case. |
| Fix changes application logic | **CLEAN** | Both fixes are additive guards — they reject bad input earlier. Normal request flow unchanged. |
| New error response info leak | **CLEAN** | Error messages are generic: "AI service unavailable", "Invalid message format". No internal details. |
| Fix introduces type coercion issue | **CLEAN** | `typeof msg.content !== "string"` is a strict type check. No coercion risk. |
| Successful response still works | **CLEAN** | `anthropicResponse.ok` (2xx) falls through to `anthropicResponse.json()` → `JSON.stringify(data)` → 200 response. Unchanged. |

## Items Verified Clean

| Check | Result | Notes |
|-------|--------|-------|
| API key exposure | **CLEAN** | Key accessed only via `Deno.env.get('ANTHROPIC_API_KEY')` — never in client code, never logged |
| System prompt location | **CLEAN** | Hardcoded server-side in `chat.js`. Removed from `index.html`. Content matches original. |
| Model/max_tokens hardcoded | **CLEAN** | `claude-sonnet-4-20250514` and `300` hardcoded in edge function — client cannot override |
| Client fetch body | **CLEAN** | `index.html:1429–1431` sends only `{ messages: conversationHistory.slice(-10) }` |
| CORS configuration | **CLEAN** | `Access-Control-Allow-Origin: "*"` is acceptable — this is a public portfolio site with no authentication, no cookies, no session state. The endpoint returns only public chat responses. |
| XSS prevention | **CLEAN** | `escapeHtml()` pattern unchanged — uses safe `textContent`→`innerHTML` DOM approach |
| `innerHTML` usage | **CLEAN** | `addHTMLLine()` only receives escaped content or hardcoded HTML strings |
| CSP headers | **CLEAN** | Correct for this site. `unsafe-inline` required for inline JS/CSS. All external resources (Google Fonts) whitelisted by domain. |
| X-Frame-Options | **CLEAN** | Set to `DENY` — prevents clickjacking |
| X-Content-Type-Options | **CLEAN** | Set to `nosniff` — prevents MIME type sniffing |
| Referrer-Policy | **CLEAN** | Set to `strict-origin-when-cross-origin` — appropriate |
| Rate limiting | **CLEAN** | 10 req/min/IP with sliding window. Uses `context.ip` with `x-forwarded-for` fallback. |
| Method enforcement | **CLEAN** | Non-POST returns 405, OPTIONS returns 204 with CORS headers |
| JSON parsing | **CLEAN** | Wrapped in try/catch, returns 400 on invalid JSON |
| Messages array validation | **CLEAN** | Checks `Array.isArray()`, length ≤ 20 |
| Content type validation | **CLEAN** | Non-string content rejected at line 111. String content length capped at 1000 chars. |
| Error handling | **CLEAN** | No stack traces in custom error responses. Generic messages for 400/405/429/500/502 |
| Edge function config | **CLEAN** | `export const config = { path: "/api/chat" }` matches `netlify.toml` mapping |
| Message role validation | **NOTE** | Not validated, but Anthropic API rejects invalid roles — low risk, no finding warranted |
| Rate limit memory | **NOTE** | Map never prunes expired entries, but edge functions are short-lived — no finding warranted |
| `eval()` / dangerous JS | **CLEAN** | No `eval()`, `Function()`, `document.write()` in any changed file |
| Hardcoded credentials | **CLEAN** | No secrets in source files |
| Dependencies | **CLEAN** | No new dependencies added — no `package.json`, no imports |

## Automated Findings Triage

`SECURITY.md` contains no automated findings to triage. The post-commit hook categories (secrets, dangerous functions, env leaks) were checked — no matches in the PR diff.

## Summary

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Total: 0 open findings
- Previously found: 5 (SEC-001 through SEC-005)
- All resolved: 5
- Fixed by Security Agent: 0

All five security findings across Phase 1 and Phase 2 have been resolved. SEC-001, SEC-002, and SEC-003 were addressed in the initial Phase 2 implementation. SEC-004 and SEC-005 were identified in Round 1 and fixed by the Dev Agent in commit `90ec245`. No new issues introduced by the fixes. The PR is clean for merge.
