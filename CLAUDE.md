# CLAUDE.md — andrewisherwood.com

Last Updated: November 20, 2026
Status: Warm redesign (Claude Design handoff, `~/Downloads/andrewisherwood-redesign-handoff.zip`) on branch `feat/redesign-warm`. Replaces the retro-terminal look.

## What This Is

Personal site for Andrew Isherwood — web designer & developer, Wimbledon, London. One goal: get UK small and mid-sized businesses to **book a free discovery call**. His own products live on `/lab/`, linked from About only — never on the homepage.

Static site, no framework. `node build.js` (using `marked`, `js-yaml`, `sharp`) generates **every** page, including the homepage, from content and data files. Generated output is committed.

## Where content lives (never hard-code copy in templates)

```
site.config.json           ← Shared settings: bookingUrl, email, replyTime, availability, projectLength, location, photo
data/pricing.json          ← The ONLY place prices live (homepage pricing, service cards, service pages)
content/home.yml           ← Homepage copy (hero, problems, process, about, contact)
content/shared.yml         ← Closing CTA bands, writing intro, author box, lab page
content/services/*.md      ← Service pages (YAML front matter only) → /services/<slug>/
content/work/*.md          ← category: client → case study /work/<slug>/ (ordered by `order`, shown on homepage)
                             category: product → /work/<slug>/, listed on /lab/
content/work/images/<slug>/← Source screenshots; build makes AVIF + WebP at 800/1600px
content/blog/*.md          ← Posts → /blog/<slug>/ (reading time is computed)
content/pages/*.md         ← privacy, thanks (layout: thanks), 404 (output: 404.html)
```

Templates are JS modules in `templates/` (`layout.js` = head/header/footer/CTA band, `home.js`, `service.js`, `case-study.js`, `pages.js`, `helpers.js`). Styles: `styles/tokens.css` (from the handoff, don't change values) + `styles/site.css`; the build inlines both into each page. The only JS is `scripts/site.js` (phone menu, enquiry form, thanks-page name).

Copy tokens: `{from:<service id>}`, `{price:<service id>:<Tier>}` and `{lowest}` in YAML/Markdown are filled from `data/pricing.json`.

A value left as `""` in `site.config.json` hides the line that uses it — nothing is ever shown as a placeholder.

## Behaviour

- **Book a free call**: every button uses `site.config.json → bookingUrl` (Google Calendar appointment page), same tab, `data-cta="book-call"`. While empty, buttons go to `/#contact`.
- **Enquiry form**: Netlify Form `contact`, honeypot `company-website`, 3-second timing check, validates on submit then on change, posts with fetch and falls back to a native POST to `/thanks/` (works without JS). Netlify email notification sets Reply-To from the `email` field.
- **Phone menu** below 860px; without JS the nav links wrap instead.
- **FAQ**: `<details>`, first open; `FAQPage` JSON-LD from the same content. Empty answers are skipped.

## Design Language

Warm, plain-spoken. Cream `#F7F2EA` background, ink `#211A15`, rust `#8A3B12` as the single accent (see `styles/tokens.css`). Bricolage Grotesque (headings), Inter (text), JetBrains Mono (article code only), self-hosted latin woff2 in `fonts/`.

- "Book a free call" is the only primary (rust) button in any section; everything else is secondary (outline) or a text link.
- Dark (ink) sections: testimonial, contact, closing CTAs, footer. Buttons on dark are cream.
- **No** terminal prompts, monospace headings, scanlines, emoji, gradients, or AI-product sections on the homepage.
- Quality bar: Lighthouse 100 mobile, WCAG 2.2 AA, 44px targets, visible focus ring.

## Homepage order

Hero + results card → Trusted by → Services (3 problems) → Pricing → Client work → Testimonial → How it works → About → Contact.

## Content Rules

- Email: build@andrewisherwood.com. Location: Wimbledon, London, UK.
- Never invent stats, prices, testimonials or client details. Unknown facts go in an HTML/YAML comment `TODO(andy): …` and the field is left empty so nothing shows. `grep -rn "TODO(andy)"` lists them all.
- Do not add any content from the old Hugo/PaperMod blog.
- No CMS, no cookie banners. No analytics unless Andy approves a cookieless one (the privacy notice currently says there is none).

## Hosting

Netlify. Build `npm install && node build.js`, publish `.`. `_redirects` maps `/writing` → `/blog/` etc. CSP in `netlify.toml` allows only `'self'`.

`netlify/edge-functions/chat.js` (the old Ask Me Anything proxy at `/api/chat`) is no longer used by any page. The API key must never appear in client-side code.

Netlify setup: Forms → enable detection and add an email notification for `contact` to Andy's Google Workspace inbox.

## Development

`node build.js`, then serve the root (e.g. `python3 -m http.server`). Pages use absolute paths. Check at 360, 390, 768, 1024, 1280 and 1440px.

## Do Not

- Commit node_modules
- Add a framework or CSS framework
- Modify the favicon (approved)
- Put copy or prices in templates
- Expose the API key in client code
