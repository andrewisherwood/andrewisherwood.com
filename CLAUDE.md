# CLAUDE.md — andrewisherwood.com

Last Updated: February 13, 2026
Status: Pre-build — awaiting MAI V3 first deployment

## What This Is

Personal portfolio site for Andrew Isherwood — Solutions Architect & Product Engineer. Single-page static site with an AI-powered interactive terminal. No framework, no build step, no dependencies.

This is the first live test of MAI V3. The build process is being logged in BUILD_LOG.md.

## Project Structure

```
andrewisherwood.com/
├── index.html                          ← The entire site (single file)
├── favicon-c64.svg                     ← C64-style favicon (AI monogram, animated cursor)
├── suppertime-screenshot.png           ← Suppertime app screenshot (mobile, portrait)
├── adaptive-coach-screenshot.png       ← AdaptiveCoach dashboard screenshot (desktop, landscape)
├── netlify/
│   └── edge-functions/
│       └── chat.js                     ← Anthropic API proxy
├── netlify.toml                        ← Deployment config
├── SCOPING.md    ← Full design & implementation brief
├── BUILD_LOG.md                        ← MAI V3 build log (written during build)
├── CLAUDE.md                           ← This file
└── README.md                           ← Project description
```

## Architecture

**Frontend:** Single HTML file. All CSS inline in `<style>`. All JS inline in `<script>`. No external dependencies except Google Fonts (IBM Plex Mono, Space Grotesk, DM Serif Display).

**AI Chat:** Interactive terminal calls `/api/chat` which is a Netlify Edge Function that proxies to the Anthropic Messages API. API key stored as Netlify env var `ANTHROPIC_API_KEY`. Model: `claude-sonnet-4-20250514`. Max tokens: 300.

**Hosting:** Netlify. Static files served from root. No build command.

## Design Language

- **Aesthetic:** C64/retro-terminal meets modern portfolio. Scanlines, phosphor glow, terminal chrome, blinking cursors.
- **Colour palette:** Dark (#0a0a0a) background, phosphor orange (#e8643a) accent, green (#3ae87a) for metrics/success, blue (#6aadff) for paths, amber (#ffbd2e) for warnings.
- **Typography:** IBM Plex Mono (UI, labels, terminal), Space Grotesk (body), DM Serif Display (headings).
- **Components:** Terminal windows with traffic-light chrome, `>` prefixed labels, `├─` tree notation, `//` comment-style section labels, scanline overlay across entire page.

## Key Sections

1. **Nav** — Fixed. "AI" logo with blinking cursor. Terminal-style `> links`.
2. **Hero** — Terminal window. `andrew@isherwood ~` chrome. Title, ROLE/STACK/SINCE key-values.
3. **Signal bar** — 32 years / 100 beta users / 4 products / AI workflows.
4. **Case studies** — Suppertime (mobile screenshot), MAI (terminal mockup), Adaptive Coach (desktop screenshot).
5. **Timeline** — 1994 → NOW horizontal career arc.
6. **About** — Narrative left, stack.config terminal window right.
7. **Interactive terminal** — AI chatbot. `visitor@portfolio $` prompt. Anthropic API via edge function.
8. **Contact** — Terminal window. Email: build@andrewisherwood.com.

## Content Rules

- All copy is in the reference HTML file (SCOPING.md points to it)
- Email: build@andrewisherwood.com (confirm with Andy if this is correct)
- Location: Folkestone, UK
- Do not add any content from the old Hugo/PaperMod blog
- Do not add a CMS, analytics, or cookie banners

## Interactive Terminal — System Prompt

The AI chat agent has a system prompt baked into the JS containing all portfolio context. If case study details change, update the system prompt in the `<script>` block AND the corresponding section in the HTML. Keep them in sync.

The system prompt instructs the agent to:
- Keep responses to 2-5 sentences
- Use plain text (no markdown)
- Direct hire/contact queries to build@andrewisherwood.com
- Be honest when it doesn't know something

## Edge Function

`/netlify/edge-functions/chat.js` proxies POST requests from the client to `https://api.anthropic.com/v1/messages`. It injects the API key from `Deno.env.get('ANTHROPIC_API_KEY')` and sets `anthropic-version: 2023-06-01`.

**Critical:** The client JS must POST to `/api/chat`, never directly to the Anthropic API. The API key must never appear in client-side code.

## Deployment

```bash
# Fresh repo
git init
git remote add origin git@github.com:andrewisherwood/andrewisherwood.com.git
git add .
git commit -m "feat: initial site build via MAI V3"
git branch -M main
git push -u origin main
```

Then in Netlify:
1. Connect repo
2. Build command: (leave blank)
3. Publish directory: `.`
4. Set env var: `ANTHROPIC_API_KEY`
5. Add custom domain: andrewisherwood.com
6. SSL auto-provisions

## Development

There is no dev server. Open `index.html` in a browser. Edit. Refresh.

The AI terminal won't work locally (no edge function). To test it locally, temporarily point the fetch at the Anthropic API directly with a hardcoded key, then revert before committing. Or use `netlify dev` if you have the Netlify CLI installed.

## MAI V3 Build Instructions

Read `SCOPING.md` for the full implementation brief. It contains:
- Design reference (the HTML prototype)
- Asset list (screenshots, favicon)
- Section-by-section structure
- Edge function code
- netlify.toml config
- Build logging requirements

Log all agent activity to `BUILD_LOG.md` using the format specified in the brief.

## Do Not

- Add node_modules or package.json
- Add a build step or framework
- Use a CSS framework (all styles are hand-written)
- Modify the favicon (it's approved)
- Remove the scanline overlay
- Expose the API key in client code
- Add content the brief doesn't specify
