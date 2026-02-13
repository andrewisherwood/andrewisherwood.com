# andrewisherwood.com

Personal portfolio site for Andrew Isherwood — Solutions Architect & Product Engineer.

## Tech

- Single HTML file (no framework, no build step)
- Netlify Edge Function for AI chat proxy
- Anthropic Claude API (claude-sonnet-4-20250514)

## Local Development

Open `index.html` in a browser. Edit. Refresh.

The AI terminal requires a Netlify Edge Function to proxy API calls. To test locally, use `netlify dev` with the Netlify CLI, or temporarily point the fetch at the Anthropic API directly (revert before committing).

## Deployment

1. Connect the repo to Netlify
2. Build command: *(leave blank)*
3. Publish directory: `.`
4. Set environment variable: `ANTHROPIC_API_KEY`
5. Add custom domain: `andrewisherwood.com`
6. SSL auto-provisions via Netlify

## Built with MAI V3

This site was built entirely by the MAI V3 multi-agent pipeline. See [BUILD_LOG.md](BUILD_LOG.md) for the full build timeline.
