# CLAUDE.md — andrewisherwood.com

Last Updated: November 19, 2026
Status: Live. Repositioning for freelance web design clients (see `~/Downloads/andrewisherwood-site-brief.pdf`).

## What This Is

Personal site for Andrew Isherwood — web designer & developer, Wimbledon, London. It wins freelance web design and build clients (small and mid-sized businesses); his own products are shown lower down as proof of depth. Static site, no framework. A small Node build (`build.js`, using `marked` + `sharp`) generates the blog, case study and standalone pages from Markdown.

## Project Structure

```
andrewisherwood.com/
├── index.html              ← Homepage (hand-written; build.js injects the writing list + availability line)
├── site.config.json        ← Availability line shown above the contact form ("Taking on new projects for…")
├── build.js                ← Generates blog/, work/, privacy/, thanks/ from content/ + templates/
├── content/
│   ├── blog/*.md           ← Blog posts
│   ├── work/*.md           ← Case studies (front matter `category: client` → back link to Client work)
│   └── pages/*.md          ← Standalone pages (privacy, thanks; `noindex: true` supported)
├── templates/              ← case-study, blog-post, blog-index, page + partials (nav, footer)
├── styles/                 ← base.css (tokens, @font-face, shared), home.css, content.css
├── fonts/                  ← Self-hosted woff2 (latin + box-drawing subsets)
├── images/home/            ← Responsive WebP screenshots for the homepage
├── docs/og-image.html      ← Source for og-image.png (screenshot at 1200x630)
├── netlify/edge-functions/chat.js  ← Anthropic API proxy (Ask Me Anything; section currently hidden)
└── netlify.toml            ← Build command, CSP, cache headers
```

Generated output (`blog/`, `work/`, `privacy/`, `thanks/`) is committed. Run `node build.js` after editing content or templates.

## Architecture

**Frontend:** Static HTML + three CSS files, no framework. Fonts are self-hosted (no Google Fonts); the CSP only allows `'self'`.

**Contact:** Netlify Form named `contact` (honeypot field `company-website`), posting to `/thanks/`. Email fallback: build@andrewisherwood.com.

**AI Chat:** The Ask Me Anything section is hidden (`hidden` attribute) because `/api/chat` returned 502 (model id `claude-sonnet-4-20250514` is likely retired). Re-scope it for clients before re-enabling.

**Hosting:** Netlify. Build command `npm install && node build.js`, publish directory `.`.

## Design Language

- **Aesthetic:** C64/retro-terminal meets modern portfolio. Scanlines, phosphor glow, terminal chrome, blinking cursors.
- **Colour palette:** Dark (#0a0a0a) background, phosphor orange (#e8643a) accent, green (#3ae87a) for metrics/success, blue (#6aadff) for paths, amber (#ffbd2e) for warnings.
- **Typography:** IBM Plex Mono (UI, labels, terminal), Space Grotesk (body), DM Serif Display (headings).
- **Components:** Terminal windows with traffic-light chrome, `>` prefixed labels, `├─` tree notation, `//` comment-style section labels, scanline overlay across entire page.

## Key Sections (homepage order)

1. **Nav** — services · work · about · writing · [start a project]
2. **Hero** — "Websites built properly, by someone who's been doing it since 1994". WHAT/FOR/BASED key-values.
3. **Signal bar** — client-facing stats
4. **Services** (`#services`) — new site, WordPress → static migration, care plan; hourly line
5. **Client work** (`#work`) — Nasaco International lead case study, then Eflow, Oasis Clinics, Jumping Rivers and 4ARMED (BugleLab-era agency work, credited as such), Oasis testimonial
6. **How it works** (`#process`) — call → fixed quote → build with previews → launch & care
7. **Things I've built** (`#built`) — Suppertime, MAI, Adaptive Coach, BirthBuild
8. **Timeline**, **About** (`#about`), **Writing**
9. **Contact** (`#contact`) — Netlify form + availability line
10. **Stack** (`#stack`) — stack.config panel, for the technically curious

## Content Rules

- Email: build@andrewisherwood.com
- Location: Wimbledon, London, UK
- Never invent stats, prices, testimonials or client details. Use `<span class="todo">TODO</span>` plus an `<!-- TODO(andy): … -->` comment; `grep -rn "TODO(andy)"` lists them all.
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
2. Build command and publish directory come from `netlify.toml`
3. Set env var: `ANTHROPIC_API_KEY`
4. Add custom domain: andrewisherwood.com
5. SSL auto-provisions
6. Forms: enable form detection (Site configuration → Forms) and add an email notification for the `contact` form

## Development

Run `node build.js`, then serve the root (e.g. `python3 -m http.server`). Pages use absolute paths (`/styles/…`), so opening files directly won't work.

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

- Commit node_modules
- Add a framework or a CSS framework (all styles are hand-written)
- Modify the favicon (it's approved)
- Remove the scanline overlay
- Expose the API key in client code
- Add content the brief doesn't specify
