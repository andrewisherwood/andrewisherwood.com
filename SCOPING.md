# andrewisherwood.com — Rebuild Brief

## Context
This is a complete rebuild of andrewisherwood.com. The current site is a dormant Hugo/PaperMod blog with 4 posts from 2021. It needs to become a freelance portfolio that attracts solutions architecture and product engineering clients.

## Reference Design
The file `andrewisherwood.html` in this repo is the approved design prototype. Use it as the visual and structural reference. Match the aesthetic, typography, layout, and tone exactly.

## Assets
- `andrewisherwood.html` — approved design prototype, match this exactly
- `suppertime-screenshot.png` — real app screenshot for the Suppertime case study card (mobile, portrait)
- `adaptive-coach-screenshot.png` — real app screenshot for the Adaptive Coach case study card (desktop, landscape — displayed in a browser window frame)

## Platform Decision

**Plain HTML. No framework. No build step. No dependencies.**

This is a single-page site. It does not need Hugo, Astro, Next.js, or any static site generator. Netlify serves static files from root and runs one edge function for the AI chat proxy.

### Repo Structure

```
andrewisherwood.com/
├── index.html                          ← The entire site
├── favicon-c64.svg                     ← C64-style favicon (AI monogram)
├── suppertime-screenshot.png           ← Mobile app screenshot
├── adaptive-coach-screenshot.png       ← Desktop dashboard screenshot
├── netlify/
│   └── edge-functions/
│       └── chat.js                     ← Anthropic API proxy (adds key server-side)
├── netlify.toml                        ← Deployment config
├── BUILD_LOG.md                        ← MAI V3 writes this during build
└── README.md                           ← Brief project description
```

No `node_modules`. No `package.json`. No build command. No dependencies.

### netlify.toml

```toml
[build]
  publish = "."

[[edge_functions]]
  function = "chat"
  path = "/api/chat"
```

### Edge Function (chat.js)

The edge function proxies requests to the Anthropic Messages API, injecting the API key server-side. The API key is stored as a Netlify environment variable (`ANTHROPIC_API_KEY`). The client JS in index.html should POST to `/api/chat` instead of directly to `api.anthropic.com`.

```js
export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const config = { path: '/api/chat' };
```

### Deployment
- Create fresh repo: `andrewisherwood/andrewisherwood.com`
- Connect to Netlify
- Set environment variable: `ANTHROPIC_API_KEY`
- Point andrewisherwood.com DNS to Netlify
- SSL auto-provisions via Netlify

### What to update in index.html
The fetch URL in the interactive terminal JS must point to `/api/chat` not `https://api.anthropic.com/v1/messages`.

## Structure

### Single page with sections:
- **Nav** — Fixed, blurred background. "AI" logo with blinking cursor. Terminal-style `> links`.
- **Hero** — Inside a terminal window with `andrew@isherwood ~` chrome. Title, key-value output (ROLE, STACK, SINCE), two CTAs.
- **Signal bar** — 4 key stats in monospace.
- **Work** — 3 case study cards (Suppertime, Multi-Agent Infrastructure, Adaptive Coach). Each has: tag with `>` prefix, title, description, tech stack tags, metrics, and a visual element.
- **Timeline** — Horizontal timeline from 1994 → NOW showing career arc.
- **About** — Two-column: narrative text left, stack list in a terminal window (with `├─` tree notation) right.
- **Interactive Terminal** — AI-powered chatbot in a terminal window. Uses Anthropic API (claude-sonnet-4-20250514) with a system prompt containing all portfolio context. Visitors type questions, get crisp answers about Andy's work/stack/availability. This is a key differentiator — keep it prominent.
- **Contact** — Inside a terminal window titled "mail — 80x24". Email link: andy@andrewisherwood.com
- **Footer** — Copyright, location (Folkestone), GitHub link.

### Interactive Terminal Implementation Notes:
- Uses the Anthropic Messages API directly from the browser (no API key in client code — you'll need a lightweight proxy/edge function to add the key server-side)
- System prompt contains all portfolio context so the AI can answer questions about Andy's work
- Conversation history maintained in-memory (last 10 messages)
- max_tokens capped at 300 to keep responses terminal-crisp
- Graceful fallback if API fails: "Connection failed. Try emailing andy@andrewisherwood.com instead."
- IMPORTANT: For production, set up a Netlify Edge Function or similar to proxy the API call and keep the API key server-side. Never expose the key in client JS.

### Design tokens:
- Fonts: DM Serif Display (headings), Outfit (body), JetBrains Mono (code/labels)
- Background: #0a0a0a
- Accent: #e8643a (warm orange-red)
- Green for metrics: #3ae87a
- Noise texture overlay at low opacity
- Scroll-triggered fade-up reveals

### Future expansion:
- Individual case study pages at /work/suppertime, /work/mai, /work/adaptive-coach
- Blog section (optional, low priority, technical writing only)

## Content

All copy is in the reference HTML. Key things to note:
- Email: andy@andrewisherwood.com (UPDATE THIS if your actual email is different)
- Location: Folkestone
- The about section references: 18 years as a chef, building for web since before CSS, ran a web agency, AI-augmented workflows

## Deployment
- Domain: andrewisherwood.com (already owned, currently pointing to Hugo site)
- Host: Netlify (or wherever the current site is hosted)
- SSL: auto via host

## What to do
1. Scaffold the project
2. Implement the design from the reference HTML
3. Ensure it's fully responsive (mobile-first)
4. Test scroll animations
5. Set up deployment config
6. Provide instructions for DNS/deployment switchover

## What NOT to do
- Don't add a CMS
- Don't add analytics yet (can add later)
- Don't add any of the old blog posts
- Don't use a theme or template — this is custom
- Don't over-engineer the build system

## MAI V3 Build Logging

This site is the first live test of the MAI V3 multi-agent infrastructure. The build process itself is part of the case study. Log everything.

### What to capture:
- **Build timeline** — Total wall-clock time from first agent initialisation to deployment-ready
- **Agent activity log** — Which agents activated, in what order, how many cycles each
- **QA findings** — What the QA agent flagged, how many review-fix rounds occurred
- **Security findings** — What the security agent caught and wrote to SECURITY.md
- **Token usage** — Total tokens consumed across all agents
- **Human interventions** — Every time a human had to step in (ideally zero, but log honestly)
- **Errors and recoveries** — Any failures, timeouts, or retries and how the system handled them

### Where to log:
Write a `BUILD_LOG.md` in the repo root with timestamped entries using this format:

```
## MAI V3 Build Log — andrewisherwood.com

### Build Started: [timestamp]
### Build Completed: [timestamp]
### Total Duration: [X minutes]

---

#### Agent: Coordinator
- [timestamp] Initialised build from brief
- [timestamp] Delegated frontend scaffold to Dev Agent
- ...

#### Agent: Dev
- [timestamp] Scaffolded project structure
- [timestamp] Implemented hero section
- ...

#### Agent: QA
- [timestamp] First review pass
- [timestamp] Flagged: [issue]
- ...

#### Agent: Security
- [timestamp] Audit pass
- [timestamp] Finding: [issue]
- ...

### Summary
- Total agent cycles: X
- QA rounds: X
- Security findings: X
- Human interventions: X
- Tokens consumed: ~X
```

### Why this matters:
This log becomes content for the MAI case study on the site itself. A multi-agent system that documents its own performance while building the portfolio that showcases it. Ship the BUILD_LOG.md alongside the site — it's proof of work.
