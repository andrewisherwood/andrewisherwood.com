# Security Review — Phase 1: Core Site — Static HTML & Styling

**Date:** 2026-02-13T01:25:00Z
**Branch:** phase-1-core-site
**PR:** #1
**Reviewer:** Security Agent
**Result:** ISSUES FOUND (3 findings)

## Findings

### SEC-001: Client sends system prompt and model selection to proxy

**Severity:** Medium
**Category:** API
**File:** index.html:1458–1464 (script block, `sendMessage()` function)
**Description:** The client-side JavaScript sends the full `SYSTEM_PROMPT`, `model`, and `max_tokens` values in the POST body to `/api/chat`. A user can open browser devtools and modify the fetch request to change the system prompt (prompt injection), switch to a more expensive model, or increase `max_tokens` — all of which the proxy would forward to the Anthropic API.
**Risk:** A malicious user could override the system prompt to make the AI say anything, select a more expensive model to increase costs, or set a high `max_tokens` value for cost amplification. This also exposes the full system prompt in the client JS source.
**Recommendation:** The edge function (Phase 2) should hardcode `model`, `max_tokens`, and `system` server-side. The client should only send `messages`. The system prompt should be moved entirely to the edge function. This is an architecture change that requires Dev Agent work.
**Fix Applied:** No (requires Dev Agent — changes application logic and edge function architecture)

### SEC-002: No Content Security Policy (CSP)

**Severity:** Low
**Category:** Frontend
**File:** index.html (entire file — no CSP meta tag)
**Description:** The page does not set a Content-Security-Policy header or meta tag. While the current code does not have XSS vulnerabilities (the `escapeHtml()` implementation is correct and all user input is properly escaped), a CSP would provide defence-in-depth against any future XSS vectors.
**Risk:** Without CSP, if an XSS vulnerability were introduced in a future change, there would be no browser-level mitigation to limit the damage. Low risk for the current codebase since no XSS vectors exist.
**Recommendation:** Add a CSP meta tag or configure CSP headers in `netlify.toml` (Phase 2). A suitable policy for this site would be: `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; script-src 'self' 'unsafe-inline'`. Note: `unsafe-inline` is required for both script and style since all JS/CSS is inline in the HTML.
**Fix Applied:** No (requires Dev Agent — CSP headers should be set in netlify.toml, Phase 2)

### SEC-003: No client-side rate limiting on terminal input

**Severity:** Low
**Category:** API
**File:** index.html:1510–1520 (script block, `input.addEventListener` and `sendMessage()`)
**Description:** The `isProcessing` flag prevents concurrent requests but does not rate-limit sequential requests. A user could send dozens of messages per minute once each response returns, with no throttle or cooldown.
**Risk:** API credit exhaustion through rapid sequential requests. The damage is bounded by the `max_tokens: 300` limit per request, but sustained abuse could accumulate costs.
**Recommendation:** Add server-side rate limiting in the edge function (Phase 2) — e.g., limit to 10 requests per minute per IP. Optionally add a client-side cooldown (e.g., 2-second delay between sends) as a soft measure. Server-side enforcement is the priority.
**Fix Applied:** No (server-side rate limiting belongs in the edge function, Phase 2; client-side throttle is a Dev Agent change)

## Items Verified Clean

| Check | Result | Notes |
|-------|--------|-------|
| API key exposure | **CLEAN** | No API keys, tokens, or secrets in client code |
| Fetch URL | **CLEAN** | Uses `/api/chat` proxy, not direct Anthropic API |
| XSS prevention | **CLEAN** | `escapeHtml()` uses safe `textContent`→`innerHTML` DOM pattern; all user input and AI responses go through it |
| `innerHTML` usage | **CLEAN** | `addHTMLLine()` only receives escaped content or hardcoded HTML strings |
| `addLine()` safety | **CLEAN** | Uses `textContent` — inherently safe against XSS |
| eval() / dangerous JS | **CLEAN** | No `eval()`, `Function()`, `document.write()`, or string-based `setTimeout`/`setInterval` |
| External link safety | **CLEAN** | GitHub link uses `target="_blank" rel="noopener"` |
| Google Fonts preconnect | **CLEAN** | `preconnect` with `crossorigin` on `fonts.gstatic.com` |
| Hardcoded credentials | **CLEAN** | No passwords, API keys, or secrets anywhere in the file |
| Conversation history bounds | **CLEAN** | `conversationHistory.slice(-10)` limits context window |
| Smooth scroll selector injection | **CLEAN** | Anchor `href` values are from static HTML, not user input |
| External dependencies | **CLEAN** | Only Google Fonts — no JS libraries, no npm packages |

## Summary

- Critical: 0
- High: 0
- Medium: 1
- Low: 2
- Total: 3
- Fixed by Security Agent: 0

All three findings are deferred to Phase 2 (edge function implementation). The current client-side code is well-constructed with proper XSS escaping and no exposed secrets. The primary concern is that the client controls the system prompt and model selection, which the edge function must enforce server-side.
