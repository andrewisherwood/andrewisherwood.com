const { esc, join, icons, monthYear } = require('./helpers');
const { layout, bookButton, breadcrumbNav, breadcrumbSchema, ctaBand } = require('./layout');

// ---------- Writing index (/blog/) ----------

function renderWritingIndex(ctx) {
  const w = ctx.shared.writing;
  const items = join(ctx.posts, (p) => `<li><a href="/blog/${esc(p.slug)}/">
<span class="post-list-date"><time datetime="${esc(p.date)}">${monthYear(p.date)}</time></span>
<span class="post-list-main">
<span class="post-list-title">${esc(p.title)}</span>
<span class="post-list-summary">${esc(p.summary || p.description)}</span>
<span class="post-list-more">Read the post · ${p.minutes} min</span>
</span>
</a></li>`);
  const body = `
<section class="container page-hero" style="padding-block:80px 48px;gap:18px" aria-labelledby="page-title">
<h1 class="h1-sub" id="page-title">${esc(w.title)}</h1>
<p class="lead" style="max-width:640px">${esc(w.lead)}</p>
</section>
<section class="container" style="padding-bottom:96px" aria-label="Posts">
<ul class="post-list">${items}</ul>
</section>
${ctaBand(ctx, ctx.shared.ctas.writing)}
`;
  const crumbs = [{ label: 'Writing', path: '/blog/' }];
  return layout(ctx, { title: w.seoTitle, description: w.description, path: '/blog/', current: 'writing', body, schema: [breadcrumbSchema(ctx, crumbs)] });
}

// ---------- Article (/blog/<slug>/) ----------

function avatar(ctx, size) {
  return ctx.site.photo ? `<img class="avatar" src="${esc(ctx.site.photo)}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">` : '';
}

function renderArticle(ctx, post) {
  const path = `/blog/${post.slug}/`;
  const a = ctx.shared.author;
  const more = ctx.posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const cta = ctx.shared.ctas.article;
  const body = `
<article class="article">
<header class="article-head">
<a class="back-link" href="/blog/">${icons.back()}All writing</a>
<p class="small muted"><time datetime="${esc(post.date)}">${monthYear(post.date)}</time> · ${post.minutes} min read</p>
<h1 class="article-title" id="page-title">${esc(post.title)}</h1>
<p class="standfirst">${esc(post.standfirst || post.description)}</p>
<p class="byline">${avatar(ctx, 44)}<span><strong>${esc(a.name)}</strong><span class="small muted">${esc(a.role)}</span></span></p>
</header>
<div class="prose">${ctx.renderBody(post, 'prose')}</div>
<aside class="card author-box" aria-label="About the author">
${avatar(ctx, 72)}
<div><strong>Written by ${esc(a.name)}</strong><p>${esc(a.bio)}</p><a class="text-link" href="${esc(a.link.href)}">${esc(a.link.label)}</a></div>
</aside>
</article>

<section class="container" style="padding-bottom:80px" aria-labelledby="cta-title">
<div class="cta-panel">
<div><h2 id="cta-title">${esc(cta.title)}</h2><p>${esc(ctx.price.fill(cta.text))}</p></div>
${bookButton(ctx, cta.button)}
</div>
</section>

${more.length ? `<section class="container section-body" style="padding-bottom:96px;gap:24px" aria-labelledby="more-title">
<h2 class="display" id="more-title" style="font-size:28px;font-weight:700;letter-spacing:-0.015em">More writing</h2>
<div class="grid" style="--min:420px">${join(more, (p) => `<a class="card card-link more-card" href="/blog/${esc(p.slug)}/"><span class="caption">${monthYear(p.date)}</span><span class="display">${esc(p.title)}</span></a>`)}</div>
</section>` : ''}
`;
  const crumbs = [{ label: 'Writing', href: '/blog/' }, { label: post.title, path }];
  const schema = [breadcrumbSchema(ctx, crumbs), {
    '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.description,
    datePublished: post.date, dateModified: post.updated || post.date, image: `${ctx.site.siteUrl}/og-image.png`,
    author: { '@type': 'Person', name: ctx.site.name, url: `${ctx.site.siteUrl}/` },
    publisher: { '@type': 'Person', name: ctx.site.name, url: `${ctx.site.siteUrl}/` },
    mainEntityOfPage: ctx.site.siteUrl + path,
  }];
  return layout(ctx, {
    title: post.seoTitle || `${post.title} | ${ctx.site.name}`, description: post.seoDescription || post.description,
    path, current: 'writing', body, schema, ogType: 'article',
    extraHead: `<meta property="article:published_time" content="${esc(post.date)}">\n`,
  });
}

// ---------- Plain page (privacy, 404) ----------

function renderPage(ctx, page) {
  const path = page.output === '404.html' ? '/404.html' : `/${page.slug}/`;
  const body = `
<article class="article">
<header class="article-head"><h1 class="article-title" id="page-title">${esc(page.title)}</h1></header>
<div class="prose">${ctx.renderBody(page, 'prose')}</div>
</article>`;
  return layout(ctx, { title: `${page.title} | ${ctx.site.name}`, description: page.description, path, body, noindex: !!page.noindex });
}

// ---------- Thanks (/thanks/) ----------

function renderThanks(ctx, page) {
  const s = ctx.site;
  const steps = [
    { title: s.replyTime ? `I reply within ${s.replyTime}` : 'I reply by email', text: 'You’ll hear from me at the email address you gave.' },
    { title: 'We have a free discovery call', text: 'We talk through what your site needs to do. If you already have one, I’ll audit it for free.' },
    { title: 'You get a fixed, written quote', text: 'A clear price and scope. Nothing to pay until you decide to book.' },
  ];
  const featured = ctx.caseStudies.find((c) => c.slug === 'oasis-clinics') || ctx.caseStudies[0];
  const body = `
<section class="container container-narrow page-hero" style="padding-block:96px 64px;gap:24px" aria-labelledby="page-title">
<div class="thanks-mark">${icons.tick({ size: 30 })}</div>
<h1 class="h1-sub" id="page-title" data-thanks-title>Thanks. Your enquiry is in.</h1>
<p class="lead" style="max-width:640px">I read every enquiry myself. Here’s what happens next.</p>
</section>

<section class="container container-narrow" style="padding-bottom:72px" aria-label="What happens next">
<ol class="next-steps">
${steps.map((st, i) => `<li><span class="num" aria-hidden="true">${i + 1}</span><div><h2>${esc(st.title)}</h2><p>${esc(st.text)}</p></div></li>`).join('\n')}
</ol>
${s.bookingUrl ? `<p class="body-text" style="margin-top:24px">Can’t wait? <a class="text-link" href="${esc(s.bookingUrl)}" data-cta="book-call">Book your call now</a></p>` : ''}
<p class="body-text" style="margin-top:${s.bookingUrl ? '8px' : '24px'};font-size:16px">Something urgent? Email <a class="text-link" href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>
</section>

<section class="container container-narrow section-body" style="padding-bottom:104px;gap:20px" aria-labelledby="wait-title">
<h2 class="eyebrow-muted" id="wait-title">While you wait</h2>
<div class="grid" style="--min:300px;gap:20px">
<a class="tile-link" href="/work/${esc(featured.slug)}/"><span><span class="display">See client results</span><small>${esc(featured.client)}: ${esc(featured.cardResult)}</small></span>${icons.arrow({ size: 24 })}</a>
<a class="tile-link" href="/blog/"><span><span class="display">Read my writing</span><small>How I work, in more detail</small></span>${icons.arrow({ size: 24 })}</a>
</div>
</section>`;
  return layout(ctx, { title: `${page.title} | ${ctx.site.name}`, description: page.description, path: '/thanks/', body, noindex: true });
}

// ---------- Lab (/lab/) ----------

function renderLab(ctx) {
  const l = ctx.shared.lab;
  const crumbs = [{ label: 'About', href: '/#about' }, { label: l.title, path: '/lab/' }];
  const cards = join(ctx.products, (p) => `<a class="card card-link card-stack" href="/work/${esc(p.slug)}/">
<p class="caption">${esc((p.tags || []).filter((t) => t !== 'Product').join(' · '))}${p.status ? ` · ${esc(p.status)}` : ''}</p>
<h2 class="h3">${esc(p.title)}</h2>
<p class="body-text" style="flex:1">${esc(p.description)}</p>
<span class="text-link">Read more</span>
</a>`);
  const body = `
<section class="container page-hero" style="padding-block:56px 48px;gap:18px" aria-labelledby="page-title">
${breadcrumbNav(crumbs)}
<h1 class="h1-sub" id="page-title">${esc(l.title)}</h1>
<p class="lead" style="max-width:640px">${esc(l.lead)}</p>
</section>
<section class="container" style="padding-bottom:96px" aria-label="Products">
<div class="grid" style="--min:420px">${cards}</div>
</section>
${ctaBand(ctx, ctx.shared.ctas.lab)}
`;
  return layout(ctx, { title: l.seoTitle, description: l.description, path: '/lab/', current: 'about', body, schema: [breadcrumbSchema(ctx, crumbs)] });
}

module.exports = { renderWritingIndex, renderArticle, renderPage, renderThanks, renderLab };
