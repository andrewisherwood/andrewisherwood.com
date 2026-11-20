// Page shell: <head>, header with phone menu, footer, and shared blocks (buttons, CTA bands, breadcrumbs).
const { esc, jsonld, icons } = require('./helpers');

const NAV = [
  { id: 'services', label: 'Services', href: '/#services' },
  { id: 'pricing', label: 'Pricing', href: '/#pricing' },
  { id: 'work', label: 'Work', href: '/#work' },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'writing', label: 'Writing', href: '/blog/' },
];

// Every "Book a free call" button: one URL (site.config.json bookingUrl), same tab, tagged for analytics.
function bookButton(ctx, label = 'Book a free call', variant = 'primary', extra = '') {
  const href = ctx.site.bookingUrl || '/#contact';
  return `<a class="btn btn-${variant}${extra ? ' ' + extra : ''}" href="${esc(href)}" data-cta="book-call">${esc(label)}</a>`;
}

function header(ctx, current) {
  const links = NAV.map((n) => `<li><a href="${n.href}"${n.id === current ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
  return `<header class="site-header" data-header>
<div class="container header-inner">
<a class="brand" href="/">${esc(ctx.site.name)}</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-toggle>${icons.menu()}${icons.close()}<span data-menu-label>Menu</span></button>
<nav class="site-nav" id="site-menu" aria-label="Main">
<ul class="nav-links">${links}</ul>
${bookButton(ctx, 'Book a free call', 'primary', 'btn-nav')}
<p class="nav-email">${esc(ctx.site.email)}</p>
</nav>
</div>
</header>`;
}

function footer(ctx) {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
<div class="container footer-inner">
<p>&copy; ${year} ${esc(ctx.site.name)} · ${esc(ctx.shared.footer.tagline)}</p>
<ul class="footer-links">
<li><a href="/blog/">Writing</a></li>
<li><a href="${esc(ctx.site.github)}" rel="me">GitHub</a></li>
<li><a href="/privacy/">Privacy</a></li>
</ul>
</div>
</footer>`;
}

// Full page. `path` is the canonical path ("/", "/blog/x/"); `schema` is an array of JSON-LD objects.
function layout(ctx, { title, description, path, current = '', body, schema = [], noindex = false, ogType = 'website', extraHead = '' }) {
  const url = ctx.site.siteUrl + path;
  const og = ctx.site.siteUrl + '/og-image.png';
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}">
<meta name="author" content="${esc(ctx.site.name)}">
<meta name="theme-color" content="#F7F2EA">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/svg+xml" href="/favicon-c64.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${esc(ctx.site.name)}: writing" href="/blog/feed.xml">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(ctx.site.name)}: websites for small businesses, Wimbledon, London">
<meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="${esc(ctx.site.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${og}">
${extraHead}<link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${ctx.css}</style>
<script>document.documentElement.classList.add('js')</script>
${schema.map(jsonld).join('\n')}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header(ctx, current)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(ctx)}
<script src="/scripts/site.js" defer></script>
</body>
</html>
`;
}

function breadcrumbNav(items) {
  // items: [{ label, href }], last one is the current page (no href)
  const lis = items.map((it, i) => (i === items.length - 1
    ? `<li><span aria-current="page">${esc(it.label)}</span></li>`
    : `<li><a href="${esc(it.href)}">${esc(it.label)}</a></li>`)).join('');
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${lis}</ol></nav>`;
}

function breadcrumbSchema(ctx, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'Home', href: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.label,
      ...(it.href || it.path ? { item: ctx.site.siteUrl + (it.path || it.href) } : {}),
    })),
  };
}

// Dark closing call to action (service pages, case studies, writing index).
function ctaBand(ctx, { title, text, button }) {
  return `<section class="band-ink" aria-labelledby="cta-title">
<div class="container cta-band">
<div class="cta-band-text">
<h2 class="h2-sm" id="cta-title">${esc(title)}</h2>
<p>${esc(ctx.price.fill(text))}</p>
</div>
${bookButton(ctx, button || 'Book a free call', 'on-dark')}
</div>
</section>`;
}

module.exports = { layout, bookButton, breadcrumbNav, breadcrumbSchema, ctaBand };
