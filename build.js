// Static site build. Reads content/, data/ and site.config.json, writes every page as plain HTML.
//   node build.js
// Output (committed): index.html, services/, work/, blog/, lab/, privacy/, thanks/, 404.html,
// sitemap.xml, robots.txt, blog/feed.xml.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const sharp = require('sharp');
const yaml = require('js-yaml');

const { createPricing, picture, esc } = require('./templates/helpers');
const renderHome = require('./templates/home');
const renderService = require('./templates/service');
const { renderCaseStudy, renderProduct } = require('./templates/case-study');
const { renderWritingIndex, renderArticle, renderPage, renderThanks, renderLab } = require('./templates/pages');

const start = Date.now();
const written = [];

// ---------- Helpers ----------

const read = (f) => fs.readFileSync(f, 'utf8');
const ensureDir = (d) => fs.mkdirSync(d, { recursive: true });
const loadYaml = (f) => yaml.load(read(f), { schema: yaml.CORE_SCHEMA });

function write(file, content) {
  ensureDir(path.dirname(file) || '.');
  fs.writeFileSync(file, content);
  written.push(file);
}

// Markdown file with YAML front matter. CORE_SCHEMA keeps dates as plain strings.
function loadMarkdown(file) {
  const raw = read(file);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const data = m ? yaml.load(m[1], { schema: yaml.CORE_SCHEMA }) || {} : {};
  const body = m ? m[2] : raw;
  return { ...data, slug: data.slug || path.basename(file, '.md'), body, file };
}

const loadDir = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => loadMarkdown(path.join(dir, f))) : []);

const readingMinutes = (text) => Math.max(1, Math.round(text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length / 220));

// ---------- Images: AVIF + WebP at 800 and 1600px wide (or the source width if smaller) ----------

async function processImage(src, outDir, publicDir) {
  const name = path.basename(src).replace(/\.[^.]+$/, '');
  const meta = await sharp(src).metadata();
  const widths = [800, 1600].filter((w) => w <= meta.width);
  if (!widths.length) widths.push(meta.width);
  const srcTime = fs.statSync(src).mtimeMs;
  for (const w of widths) {
    for (const ext of ['avif', 'webp']) {
      const out = path.join(outDir, `${name}-${w}.${ext}`);
      written.push(out);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue; // cached
      const pipe = sharp(src).resize({ width: w, withoutEnlargement: true });
      await (ext === 'avif' ? pipe.avif({ quality: 55, effort: 4 }) : pipe.webp({ quality: 80 })).toFile(out);
      console.log(`    ${path.relative('.', out)}`);
    }
  }
  return { base: `${publicDir}/${name}`, width: meta.width, height: meta.height, widths };
}

// Remove files a previous build wrote that this build no longer produces.
function prune(dir, keepExt = /\.(html|xml|webp|avif)$/) {
  if (!fs.existsSync(dir)) return;
  const keep = new Set(written.map((f) => path.resolve(f)));
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(p); if (!fs.readdirSync(p).length) fs.rmdirSync(p); }
      else if (keepExt.test(entry.name) && !keep.has(path.resolve(p))) { fs.unlinkSync(p); console.log(`  removed ${p}`); }
    }
  };
  walk(dir);
}

(async () => {
  // ---------- Load content ----------

  const site = JSON.parse(read('site.config.json'));
  for (const k of Object.keys(site)) if (k.startsWith('_')) delete site[k];
  const pricing = JSON.parse(read('data/pricing.json'));
  const home = loadYaml('content/home.yml');
  const shared = loadYaml('content/shared.yml');

  const work = loadDir('content/work');
  const caseStudies = work.filter((w) => w.category === 'client').sort((a, b) => a.order - b.order);
  const products = work.filter((w) => w.category === 'product').sort((a, b) => a.order - b.order);
  const services = loadDir('content/services').sort((a, b) => a.order - b.order);
  const pages = loadDir('content/pages');
  const posts = loadDir('content/blog')
    .filter((p) => !p.draft)
    .map((p) => ({ ...p, minutes: readingMinutes(p.body) }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // ---------- Images ----------

  const images = {};
  for (const w of work) {
    const dir = path.join('content/work/images', w.slug);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => /\.(png|jpe?g|webp)$/i.test(x))) {
      images[`${w.slug}/${f}`] = await processImage(path.join(dir, f), path.join('work', w.slug), `/work/${w.slug}`);
    }
  }

  // ---------- Context shared by every template ----------

  const css = (read('styles/tokens.css') + '\n' + read('styles/site.css'))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').replace(/\n+/g, '\n').trim();

  const ctx = { site, pricing, price: createPricing(pricing), home, shared, caseStudies, products, services, posts, images, css };

  // Markdown → HTML. Images inside a work item become responsive <picture>s; links to other sites get rel=noopener.
  ctx.renderBody = (item, mode) => {
    let html = marked(item.body);
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    html = html.replace(/<img src="([^"/]+)" alt="([^"]*)"[^>]*>/g, (tag, src, alt) => {
      const key = `${item.slug}/${src}`;
      if (!images[key]) throw new Error(`${item.file}: image ${src} not found in content/work/images/${item.slug}/`);
      const sizes = mode === 'story' ? '(min-width: 1024px) 960px, calc(100vw - 40px)' : '(min-width: 744px) 680px, calc(100vw - 40px)';
      return picture(images, key, alt.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'), { sizes });
    });
    html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" rel="noopener"');
    return html;
  };

  // ---------- Pages ----------

  write('index.html', renderHome(ctx));

  for (const svc of services) write(`services/${svc.slug}/index.html`, renderService(ctx, svc));

  caseStudies.forEach((cs, i) => write(`work/${cs.slug}/index.html`, renderCaseStudy(ctx, cs, caseStudies[(i + 1) % caseStudies.length])));
  for (const p of products) write(`work/${p.slug}/index.html`, renderProduct(ctx, p));
  write('lab/index.html', renderLab(ctx));

  write('blog/index.html', renderWritingIndex(ctx));
  for (const post of posts) write(`blog/${post.slug}/index.html`, renderArticle(ctx, post));

  for (const page of pages) {
    const out = page.output || `${page.slug}/index.html`;
    write(out, page.layout === 'thanks' ? renderThanks(ctx, page) : renderPage(ctx, page));
  }

  // ---------- RSS ----------

  const x = (s) => esc(s);
  write('blog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${x(site.name)}: writing</title>
<link>${site.siteUrl}/blog/</link>
<description>${x(shared.writing.description)}</description>
<language>en-gb</language>
<atom:link href="${site.siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${posts.map((p) => `<item>
<title>${x(p.title)}</title>
<link>${site.siteUrl}/blog/${p.slug}/</link>
<guid>${site.siteUrl}/blog/${p.slug}/</guid>
<pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>
<description>${x(p.description)}</description>
</item>`).join('\n')}
</channel>
</rss>
`);

  // ---------- Sitemap and robots ----------

  const urls = ['/', ...services.map((s) => `/services/${s.slug}/`), ...caseStudies.map((c) => `/work/${c.slug}/`),
    '/blog/', ...posts.map((p) => `/blog/${p.slug}/`), '/lab/', ...products.map((p) => `/work/${p.slug}/`),
    ...pages.filter((p) => !p.noindex).map((p) => `/${p.slug}/`)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${site.siteUrl}${u}</loc></url>`).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);

  // ---------- Tidy stale output ----------

  for (const dir of ['work', 'blog', 'services', 'lab']) prune(dir);

  console.log(`\nBuilt ${written.filter((f) => f.endsWith('.html')).length} pages (${services.length} services, ${caseStudies.length} case studies, ${products.length} products, ${posts.length} posts) in ${Date.now() - start}ms`);
})().catch((err) => { console.error(err); process.exit(1); });
