const { esc, join, icons, money } = require('./helpers');
const { layout, bookButton, breadcrumbNav, breadcrumbSchema, ctaBand } = require('./layout');
const { workCard, steps } = require('./home');

module.exports = function renderService(ctx, svc) {
  const price = ctx.price;
  const pricing = price.service(svc.pricing);
  const cheapest = price.cheapest(pricing);
  const path = `/services/${svc.slug}/`;
  const crumbs = [{ label: 'Services', href: '/#services' }, { label: svc.breadcrumb, path }];
  const faqs = (svc.faqs || []).filter((f) => f.q && f.a);
  const related = (svc.related || []).map((slug) => {
    const cs = ctx.caseStudies.find((c) => c.slug === slug);
    if (!cs) throw new Error(`${svc.slug}: unknown related case study "${slug}"`);
    return cs;
  });

  const tierPrice = (t) => (t.from ? 'from ' : '') + money(t.price) + (t.period === 'month' ? '<small>/month</small>' : '');

  const body = `
<section class="container service-hero" aria-labelledby="page-title">
<div class="service-hero-copy">
${breadcrumbNav(crumbs)}
<p class="eyebrow">${esc(svc.eyebrow)}</p>
<h1 class="h1-sub" id="page-title">${esc(svc.title)}</h1>
<p class="lead">${esc(svc.lead)}</p>
<div class="btn-row">
${bookButton(ctx)}
<a class="btn btn-secondary" href="#prices">See prices</a>
</div>
</div>
<div class="card card-feature glance">
<h2 class="eyebrow-muted">At a glance</h2>
<p class="glance-price"><strong>${money(cheapest.price)}</strong><span>${cheapest.period === 'month' ? 'a month, starting from' : 'fixed price, starting from'}</span></p>
<ul class="check-list">${join(svc.glance, (g) => `<li>${icons.check()}<span>${esc(g)}</span></li>`)}</ul>
</div>
</section>

<section class="band-white" aria-labelledby="benefits-title">
<div class="container section section-body s96">
<h2 class="h2" id="benefits-title" style="max-width:720px">${esc(svc.benefitsTitle)}</h2>
<div class="grid benefits">${join(svc.benefits, (b) => `<div class="benefit"><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`)}</div>
</div>
</section>

<section class="container section grid s96" style="--min:420px" aria-label="Is this for you">
<div class="card fit-card">
<h2>A good fit if</h2>
<ul class="check-list" style="gap:14px">${join(svc.fit, (f) => `<li>${icons.check()}<span>${esc(f)}</span></li>`)}</ul>
</div>
<div class="card fit-card is-sand">
<h2>Not the right fit if</h2>
<p>${esc(price.fill(svc.notFit.text))}</p>
<a class="text-link" href="${esc(svc.notFit.link.href)}">${esc(svc.notFit.link.label)}</a>
</div>
</section>

<section id="prices" class="band-sand" aria-labelledby="prices-title">
<div class="container section section-body s96" style="gap:40px">
<div class="section-head" style="gap:14px">
<p class="eyebrow">Prices</p>
<h2 class="h2" id="prices-title">${esc(svc.pricesTitle)}</h2>
<p class="section-lead">${esc(price.fill(svc.pricesLead))}</p>
</div>
<div class="grid" style="--min:300px">
${join(pricing.tiers, (t) => `<div class="card card-flat tier-card">
<h3>${esc(t.name)}</h3>
<p class="tier-card-price">${tierPrice(t)}</p>
<p>${esc(t.detail)}</p>
${bookButton(ctx, 'Book a free call', 'secondary', 'btn-block btn-sm')}
</div>`)}
</div>
<p class="small body-text">${esc(price.fill(svc.pricesNote))}</p>
</div>
</section>

${related.length ? `<section class="container section section-body s96" style="gap:40px" aria-labelledby="related-title">
<h2 class="h2" id="related-title">${esc(svc.relatedTitle)}</h2>
<div class="grid" style="--min:${related.length === 1 ? '320px' : '420px'}">${join(related, (cs) => workCard(ctx, cs, { sizes: '(min-width: 1200px) 570px, (min-width: 900px) 50vw, 100vw' }))}</div>
</section>` : ''}

<section class="band-white" aria-labelledby="steps-title">
<div class="container section section-body s96">
<h2 class="h2" id="steps-title">${esc(svc.stepsTitle)}</h2>
${steps(svc.steps)}
</div>
</section>

${faqs.length ? `<section class="container container-narrow section section-body s96" style="gap:32px" aria-labelledby="faq-title">
<h2 class="h2" id="faq-title">Questions</h2>
<div class="faq-list">
${faqs.map((f, i) => `<details class="faq"${i === 0 ? ' open' : ''}>
<summary>${esc(f.q)}${icons.plus()}${icons.minus()}</summary>
<p class="faq-answer">${esc(f.a)}</p>
</details>`).join('\n')}
</div>
</section>` : ''}

${ctaBand(ctx, { title: svc.closing.title, text: svc.closing.text, button: 'Book a free call' })}
`;

  const schema = [breadcrumbSchema(ctx, crumbs), {
    '@context': 'https://schema.org', '@type': 'Service', name: pricing.name, description: svc.seoDescription,
    url: ctx.site.siteUrl + path, areaServed: 'GB', provider: { '@id': `${ctx.site.siteUrl}/#business` },
    offers: pricing.tiers.map((t) => ({ '@type': 'Offer', name: t.name, price: String(t.price), priceCurrency: 'GBP', description: t.detail })),
  }];
  if (faqs.length) {
    schema.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return layout(ctx, { title: svc.seoTitle, description: svc.seoDescription, path, current: 'services', body, schema });
};
