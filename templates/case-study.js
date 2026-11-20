const { esc, join, icons, picture } = require('./helpers');
const { layout, breadcrumbNav, breadcrumbSchema, ctaBand } = require('./layout');

const FIGURE_GRID = /<div class="screenshot-grid([^"]*)">([\s\S]*?)<\/div>/g;

// Split the rendered Markdown at each <h2>: heading on the left, prose on the right,
// screenshot figures lifted out into a full-width row underneath.
function story(html) {
  const parts = html.split(/(?=<h2[ >])/).filter((p) => /<h2[ >]/.test(p));
  return parts.map((part) => {
    const m = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/);
    let rest = part.slice(m[0].length);
    const figures = [];
    rest = rest.replace(FIGURE_GRID, (_, mod, inner) => {
      const single = /\bsingle\b/.test(mod);
      inner.replace(/<figure>[\s\S]*?<\/figure>/g, (fig) => { figures.push(single ? fig.replace('<figure>', '<figure class="single">') : fig); return ''; });
      return '';
    });
    const row = `<div class="story-row"><h2>${m[1]}</h2><div class="story-body">${rest.trim()}</div></div>`;
    return figures.length ? `${row}\n<div class="story-figures">${figures.join('\n')}</div>` : row;
  }).join('\n');
}

function renderCaseStudy(ctx, cs, next) {
  const path = `/work/${cs.slug}/`;
  const crumbs = [{ label: 'Work', href: '/#work' }, { label: cs.client, path }];
  const facts = [
    ['Client', esc(cs.client)],
    ['Sector', esc(cs.sector)],
    ['Project', esc(cs.project)],
    ['Year', esc(cs.year)],
    ['Built at', esc(cs.agency)],
    ['Live site', cs.url ? `<a href="${esc(cs.url)}">${esc(cs.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : ''],
  ].filter(([, v]) => v);

  const hero = cs.hero ? `<figure class="container cs-hero">
<div class="cs-hero-shot">${picture(ctx.images, `${cs.slug}/${cs.hero.src}`, cs.hero.alt, { sizes: '(min-width: 1264px) 1136px, calc(100vw - 40px)', eager: true })}</div>
${cs.hero.caption ? `<figcaption>${esc(cs.hero.caption)}</figcaption>` : ''}
</figure>` : '';

  const results = (cs.results || []).length ? `<section class="container" style="padding-top:64px" aria-label="Results">
<div class="grid" style="--min:320px">
${join(cs.results, (r, i) => `<div class="card result-card${i === 0 ? ' is-accent' : ''}"><p class="result-big">${esc(r.value)}</p><p>${esc(r.label)}</p></div>`)}
</div>
</section>` : '';

  const quote = cs.quote ? `<section class="band-sand" aria-label="Client quote">
<figure class="container container-quote quote-band">
${icons.quote({ size: 40 })}
<blockquote class="quote-text${cs.quote.text.length > 280 ? ' quote-long' : ''}"><p>${esc(cs.quote.text)}</p></blockquote>
<figcaption class="quote-cite"><strong>${esc(cs.quote.name)}</strong><span>${esc(cs.quote.role)}</span></figcaption>
</figure>
</section>` : '';

  const nextBlock = next ? `<section class="container" style="padding-block:72px" aria-label="Next case study">
<a class="card card-link next-link" href="/work/${esc(next.slug)}/">
<span><span class="caption">Next case study</span><span class="display">${esc(next.client)}</span><span class="body-text">${esc(next.cardResult)}</span></span>
${icons.arrow({ size: 32 })}
</a>
</section>` : '';

  const body = `
<section class="container page-hero" aria-labelledby="page-title" style="gap:28px">
${breadcrumbNav(crumbs)}
<p class="eyebrow">Case study · ${esc(cs.sector)}</p>
<h1 class="h1-sub" id="page-title" style="max-width:900px">${esc(cs.title)}</h1>
<p class="lead" style="max-width:720px">${esc(cs.summary)}</p>
<dl class="facts-list">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
</section>
${hero}
${results}
<section class="container section story s96" aria-label="The story">
${story(ctx.renderBody(cs, 'story'))}
</section>
${quote}
${nextBlock}
${ctaBand(ctx, ctx.shared.ctas.caseStudy)}
`;

  const schema = [breadcrumbSchema(ctx, crumbs), {
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: cs.title, description: cs.description,
    url: ctx.site.siteUrl + path, author: { '@id': `${ctx.site.siteUrl}/#person` },
    about: { '@type': 'Organization', name: cs.client },
  }];
  return layout(ctx, { title: cs.seoTitle || `${cs.client} case study | ${ctx.site.name}`, description: cs.description, path, current: 'work', body, schema, ogType: 'article' });
}

// Own products (Suppertime, MAI…): linked from /lab/ only. Article-style body.
function renderProduct(ctx, p) {
  const path = `/work/${p.slug}/`;
  const crumbs = [{ label: 'Things I’ve built', href: '/lab/' }, { label: p.title, path }];
  const metrics = (p.metrics || []).length ? `<div class="grid" style="--min:180px">${join(p.metrics, (m) => `<div class="card result-card" style="padding:24px"><p class="result-big" style="font-size:36px">${esc(m.value)}</p><p>${esc(m.label)}</p></div>`)}</div>` : '';
  const body = `
<article class="article">
<header class="article-head">
${breadcrumbNav(crumbs)}
<p class="eyebrow">Product${p.status ? ` · ${esc(p.status)}` : ''}</p>
<h1 class="article-title" id="page-title">${esc(p.title)}</h1>
<p class="standfirst">${esc(p.description)}</p>
</header>
${metrics}
<div class="prose">${ctx.renderBody(p, 'prose')}</div>
</article>
${ctaBand(ctx, ctx.shared.ctas.lab)}
`;
  return layout(ctx, { title: `${p.title} | ${ctx.site.name}`, description: p.description, path, current: 'about', body, schema: [breadcrumbSchema(ctx, crumbs)], ogType: 'article' });
}

module.exports = { renderCaseStudy, renderProduct };
