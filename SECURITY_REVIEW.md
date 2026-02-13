# Security Review — Phase 2: Interactive Terminal & API Proxy

**Date:** 2026-02-13T01:35:00Z
**Branch:** phase-2-api-proxy
**PR:** #2
**Reviewer:** Security Agent
**Result:** ISSUES FOUND (2 findings)

## Phase 1 Finding Remediation

| Finding | Status | Verification |
|---------|--------|-------------|
| SEC-001: Client sends system prompt/model to proxy | **RESOLVED** | System prompt, model (`claude-sonnet-4-20250514`), and max_tokens (`300`) are now hardcoded in `netlify/edge-functions/chat.js`. Client JS only sends `{ messages: [...] }`. `SYSTEM_PROMPT` const removed from `index.html`. |
| SEC-002: No CSP headers | **RESOLVED** | CSP added in `netlify.toml`: `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'`. Also includes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| SEC-003: No rate limiting | **RESOLVED** | In-memory rate limiter added in edge function: 10 requests per minute per IP, returns 429 when exceeded. Best-effort (resets on cold start) — acceptable for portfolio site. |

## New Findings

### SEC-004: Anthropic API error responses passed through unfiltered

**Severity:** Medium
**Category:** API
**File:** netlify/edge-functions/chat.js:147–151
**Description:** The edge function returns the full Anthropic API response body to the client: `return new Response(JSON.stringify(data), { status: anthropicResponse.status, ... })`. When the Anthropic API returns an error (e.g., 401 auth failure, 400 validation error, 429 rate limit), the error body is forwarded verbatim to the client. Anthropic error responses can include internal error types, request IDs, and details about why the request failed.
**Risk:** Information disclosure. An attacker probing the endpoint could learn the API version, error structure, and potentially infer details about the server-side configuration from error messages. While no secrets are leaked (the API key is not in error responses), this violates the principle of not exposing internal details.
**Recommendation:** Filter the Anthropic response: on non-2xx status codes, return a generic error message to the client rather than forwarding the upstream response body. Example:
```js
if (!anthropicResponse.ok) {
  return new Response(
    JSON.stringify({ error: "AI service unavailable" }),
    { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}
```
**Fix Applied:** No (requires Dev Agent — changes response handling logic)

### SEC-005: Message content length validation bypassed by array-format content

**Severity:** Medium
**Category:** API
**File:** netlify/edge-functions/chat.js:100–112
**Description:** The input validation checks `typeof msg.content === "string" && msg.content.length > 1000` but the Anthropic Messages API also accepts content as an array of content blocks (e.g., `[{type: "text", text: "very long string..."}]`). When content is an array, the string length check is skipped entirely, allowing arbitrarily long messages to be forwarded to the Anthropic API.
**Risk:** A malicious client could send oversized messages via array-format content blocks, bypassing the 1000-character limit. This could increase API costs (larger input tokens) and potentially be used for prompt injection with large payloads. The impact is bounded by Anthropic's own limits, but the local validation is ineffective for this format.
**Recommendation:** Validate both content formats:
```js
for (const msg of messages) {
  if (typeof msg.content === "string" && msg.content.length > 1000) {
    // reject
  } else if (Array.isArray(msg.content)) {
    for (const block of msg.content) {
      if (typeof block.text === "string" && block.text.length > 1000) {
        // reject
      }
    }
  }
}
```
Or, more defensively, reject any message where `content` is not a string (since the client should only send plain text strings).
**Fix Applied:** No (requires Dev Agent — changes validation logic)

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
- Medium: 2
- Low: 0
- Total: 2
- Fixed by Security Agent: 0

All three Phase 1 findings (SEC-001, SEC-002, SEC-003) have been properly addressed. Two new medium-severity findings identified: SEC-004 (unfiltered API error passthrough) and SEC-005 (content validation bypass via array format). Both require Dev Agent changes to resolve. Neither is blocking — the site is safe to deploy with these findings as informational improvements for a future iteration.
