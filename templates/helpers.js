// Shared helpers for the page templates. Templates hold structure only; all copy comes from
// content/*.yml, content/**/*.md, data/pricing.json and site.config.json.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Inline-safe JSON for <script type="application/ld+json">.
const jsonld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const join = (items, fn) => (items || []).map(fn).join('\n');

const monthYear = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// ---------- Prices (single source: data/pricing.json) ----------

const money = (n) => '£' + Number(n).toLocaleString('en-GB');

function createPricing(pricing) {
  const service = (id) => {
    const s = pricing.services.find((x) => x.id === id);
    if (!s) throw new Error(`Unknown pricing id "${id}"`);
    return s;
  };
  const cheapest = (s) => s.tiers.reduce((a, b) => (b.price < a.price ? b : a));
  // "£2,950", "from £9,500", "£75/mo"
  const tierShort = (t) => (t.from ? 'from ' : '') + money(t.price) + (t.period === 'month' ? '/mo' : '');
  // Bare starting price for "from …" sentences: "£2,950" or "£75 a month"
  const fromBare = (id) => { const t = cheapest(service(id)); return money(t.price) + (t.period === 'month' ? ' a month' : ''); };
  const lowestOneOff = () => money(Math.min(...pricing.services.flatMap((s) => s.tiers.filter((t) => !t.period).map((t) => t.price))));
  // Replace {from:id}, {price:id:Tier} and {lowest} tokens in copy.
  const fill = (text) => String(text ?? '')
    .replace(/\{from:([\w-]+)\}/g, (_, id) => fromBare(id))
    .replace(/\{price:([\w-]+):([^}]+)\}/g, (_, id, name) => {
      const t = service(id).tiers.find((x) => x.name === name);
      if (!t) throw new Error(`Unknown tier "${name}" in ${id}`);
      return money(t.price);
    })
    .replace(/\{lowest\}/g, lowestOneOff);
  return { service, cheapest, tierShort, fromBare, lowestOneOff, fill, notes: pricing.notes, services: pricing.services };
}

// ---------- Icons (decorative; always aria-hidden) ----------

const svg = (body, { size = 24, stroke = 2, cls = '' } = {}) =>
  `<svg${cls ? ` class="${cls}"` : ''} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

const icons = {
  clock: (o) => svg('<circle cx="12" cy="13" r="8"/><path d="M12 13l3.5-3.5"/><path d="M10 2h4"/>', { size: 32, stroke: 1.8, ...o }),
  shield: (o) => svg('<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>', { size: 32, stroke: 1.8, ...o }),
  wrench: (o) => svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z"/>', { size: 32, stroke: 1.8, ...o }),
  check: (o) => svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', { size: 22, stroke: 2.2, cls: 'icon-accent', ...o }),
  arrow: (o) => svg('<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>', { size: 20, ...o }),
  back: (o) => svg('<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>', { size: 16, ...o }),
  quote: (o) => svg('<path d="M4 18v-5a6 6 0 0 1 6-6"/><path d="M4 13h5v5H4z"/><path d="M14 18v-5a6 6 0 0 1 6-6"/><path d="M14 13h5v5h-5z"/>', { size: 44, stroke: 1.6, cls: 'quote-icon', ...o }),
  menu: (o) => svg('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>', { size: 18, cls: 'icon-menu', ...o }),
  close: (o) => svg('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>', { size: 18, cls: 'icon-close', ...o }),
  plus: (o) => svg('<path d="M5 12h14"/><path d="M12 5v14"/>', { size: 22, cls: 'icon-plus', ...o }),
  minus: (o) => svg('<path d="M5 12h14"/>', { size: 22, cls: 'icon-minus', ...o }),
  error: (o) => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><path d="M12 16h.01"/>', { size: 16, stroke: 2.2, ...o }),
  tick: (o) => svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', { size: 20, stroke: 2.4, ...o }),
};

// ---------- Images ----------
// `manifest` maps "<dir>/<file>" to { base, width, height, widths } (see build.js processImage).

function picture(manifest, key, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const m = manifest[key];
  if (!m) throw new Error(`No processed image for ${key}`);
  const set = (ext) => m.widths.map((w) => `${m.base}-${w}.${ext} ${w}w`).join(', ');
  const fallbackW = m.widths.includes(800) ? 800 : m.widths[0];
  const h = Math.round((m.height / m.width) * m.widths[m.widths.length - 1]);
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="${m.base}-${fallbackW}.webp" srcset="${set('webp')}" sizes="${sizes}" width="${m.widths[m.widths.length - 1]}" height="${h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>`;
}

module.exports = { esc, jsonld, join, monthYear, money, createPricing, icons, picture };
