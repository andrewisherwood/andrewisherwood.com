const { esc, join, icons, picture } = require('./helpers');
const { layout, bookButton } = require('./layout');

function hero(ctx) {
  const h = ctx.home.hero;
  const facts = join(h.facts, (f) => {
    const value = f.value === 'lowest-price' ? `From ${ctx.price.lowestOneOff()}` : f.value;
    return `<li><strong>${esc(value)}</strong><span>${esc(f.label)}</span></li>`;
  });
  const r = ctx.home.results;
  const rows = join(r.rows, (row) => `<hr class="result-divider">
<div class="result-row">
<div class="result-row-name"><strong>${esc(row.client)}</strong><span class="caption">${esc(row.sector)}</span></div>
${row.value
    ? `<span class="result-value">${esc(row.value)}</span>`
    : `<span class="result-value"><s class="result-was"><span class="visually-hidden">From </span>${esc(row.from)}</s>${icons.arrow()}<span><span class="visually-hidden">to </span>${esc(row.to)}</span></span>`}
</div>`);
  return `<section class="container hero" aria-labelledby="hero-title">
<div class="hero-copy">
<p class="eyebrow">${esc(h.eyebrow)}</p>
<h1 class="h1" id="hero-title">${esc(h.title)}</h1>
<p class="lead">${esc(h.lead)}</p>
<div class="btn-row">
${bookButton(ctx, 'Book a free discovery call')}
<a class="btn btn-secondary" href="${esc(h.secondary.href)}">${esc(h.secondary.label)}</a>
</div>
<ul class="hero-facts">${facts}</ul>
</div>
<div class="card card-feature results-card">
<h2 class="eyebrow-muted">${esc(r.title)}</h2>
<div class="result-bars">
<div class="result-head"><strong>${esc(r.bar.client)}</strong><span class="caption">${esc(r.bar.label)}</span></div>
<div class="result-bar"><span>Before</span><span class="bar" aria-hidden="true"><span style="--w:${Number(r.bar.before)}%"></span></span><span>${esc(r.bar.before)}</span></div>
<div class="result-bar"><span>After</span><span class="bar bar-after" aria-hidden="true"><span style="--w:${Number(r.bar.after)}%"></span></span><span>${esc(r.bar.after)}</span></div>
</div>
${rows}
</div>
</section>`;
}

function trusted(ctx) {
  const t = ctx.home.trusted;
  return `<section class="rule-block" aria-label="Clients">
<ul class="container trusted">
<li class="trusted-label">${esc(t.label)}</li>
${join(t.names, (n) => `<li>${esc(n)}</li>`)}
</ul>
</section>`;
}

function problems(ctx) {
  const p = ctx.home.problems;
  const cards = join(p.items, (it) => {
    const svc = ctx.services.find((s) => s.pricing === it.service);
    return `<div class="card card-stack problem-card">
${icons[it.icon]()}
<h3 class="h3">${esc(it.title)}</h3>
<p>${esc(it.text)}</p>
<a class="text-link" href="/services/${esc(svc.slug)}/">${esc(it.link)}, from ${esc(ctx.price.fromBare(it.service))}</a>
</div>`;
  });
  return `<section id="services" class="container section section-body" aria-labelledby="services-title">
<div class="section-head">
<h2 class="h2" id="services-title">${esc(p.title)}</h2>
<p class="section-lead">${esc(p.lead)}</p>
</div>
<div class="grid" style="--min:320px">${cards}</div>
</section>`;
}

function pricingBlock(ctx) {
  const p = ctx.home.pricing;
  const cards = join(ctx.price.services, (s) => {
    const svc = ctx.services.find((x) => x.pricing === s.id);
    return `<div class="card card-flat price-card">
<div class="price-card-head"><h3 class="h3"><a href="/services/${esc(svc.slug)}/" class="card-title-link">${esc(s.name)}</a></h3><p>${esc(s.tagline)}</p></div>
<ul class="tier-rows">
${join(s.tiers, (t) => `<li class="tier-row"><div><strong>${esc(t.name)}</strong><span>${esc(t.summary)}</span></div><span class="tier-price">${esc(ctx.price.tierShort(t))}</span></li>`)}
</ul>
</div>`;
  });
  return `<section id="pricing" class="band-sand" aria-labelledby="pricing-title">
<div class="container section section-body">
<div class="section-head">
<p class="eyebrow">${esc(p.eyebrow)}</p>
<h2 class="h2" id="pricing-title">${esc(p.title)}</h2>
<p class="section-lead">${esc(p.lead)}</p>
</div>
<div class="grid" style="--min:330px">${cards}</div>
<div class="pricing-foot">
<p>${esc(ctx.price.notes)}</p>
<a class="btn btn-secondary" href="/#contact">${esc(p.cta)}</a>
</div>
</div>
</section>`;
}

function workCard(ctx, cs, { sizes = '(min-width: 1200px) 380px, (min-width: 760px) 50vw, 100vw' } = {}) {
  const img = cs.hero ? `<div class="shot">${picture(ctx.images, `${cs.slug}/${cs.hero.src}`, cs.hero.alt, { sizes })}</div>` : '';
  return `<a class="card card-link work-card" href="/work/${esc(cs.slug)}/">
${img}
<div class="work-card-body">
<p class="caption">${esc(cs.sector)} · ${esc(cs.project)}</p>
<h3>${esc(cs.client)}</h3>
<p class="work-card-result">${esc(cs.cardResult)}</p>
<span class="text-link">Read the case study</span>
</div>
</a>`;
}

function work(ctx) {
  const w = ctx.home.work;
  return `<section id="work" class="container section section-body" aria-labelledby="work-title">
<div class="section-head">
<p class="eyebrow">${esc(w.eyebrow)}</p>
<h2 class="h2" id="work-title">${esc(w.title)}</h2>
</div>
<div class="grid" style="--min:340px">${join(ctx.caseStudies, (cs) => workCard(ctx, cs))}</div>
</section>`;
}

function testimonial(ctx) {
  const cs = ctx.caseStudies.find((c) => c.slug === ctx.home.testimonial);
  if (!cs || !cs.quote) return '';
  const q = cs.quote;
  return `<section class="band-ink" aria-label="Testimonial">
<figure class="container container-quote section quote-band" style="gap:28px">
${icons.quote()}
<blockquote class="quote-text"><p>${esc(q.short || q.text)}</p></blockquote>
<figcaption class="quote-cite"><strong>${esc(q.name)}</strong><span>${esc(q.role)}</span></figcaption>
</figure>
</section>`;
}

function steps(list) {
  return `<ol class="grid steps">
${list.map((s, i) => `<li class="step"><span class="step-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n')}
</ol>`;
}

function process(ctx) {
  const p = ctx.home.process;
  const lead = ctx.site.projectLength ? `<p class="section-lead">${esc(p.lead.replace('{projectLength}', ctx.site.projectLength))}</p>` : '';
  return `<section id="process" class="container section section-body" aria-labelledby="process-title">
<div class="section-head">
<p class="eyebrow">${esc(p.eyebrow)}</p>
<h2 class="h2" id="process-title">${esc(p.title)}</h2>
${lead}
</div>
${steps(p.steps)}
</section>`;
}

function about(ctx) {
  const a = ctx.home.about;
  const photo = ctx.site.photo
    ? `<div class="about-photo"><img src="${esc(ctx.site.photo)}" alt="${esc(ctx.site.photoAlt)}" width="900" height="1125" loading="lazy" decoding="async"></div>`
    : '';
  return `<section id="about" class="band-white" aria-labelledby="about-title">
<div class="container section about${photo ? '' : ' no-photo'}">
${photo}
<div class="about-copy">
<p class="eyebrow">${esc(a.eyebrow)}</p>
<h2 class="h2" id="about-title">${esc(a.title)}</h2>
${join(a.paragraphs, (p) => `<p>${esc(p)}</p>`)}
<div class="link-row">${join(a.links, (l) => `<a class="text-link" href="${esc(l.href)}">${esc(l.label)}</a>`)}</div>
</div>
</div>
</section>`;
}

function contact(ctx) {
  const c = ctx.home.contact;
  const lead = ctx.site.replyTime ? c.lead.replace('{replyTime}', ctx.site.replyTime) : c.leadNoTime;
  const err = (id) => `<p class="field-error" id="${id}-error" hidden>${icons.error()}<span></span></p>`;
  const options = (list) => list.map((o) => `<option>${esc(o)}</option>`).join('');
  return `<section id="contact" class="band-ink" aria-labelledby="contact-title">
<div class="container section contact">
<div class="contact-copy">
<h2 id="contact-title">${esc(c.title)}</h2>
<p>${esc(lead)}</p>
<dl class="contact-facts">
<div><dt>Prefer email?</dt><dd><a href="mailto:${esc(ctx.site.email)}">${esc(ctx.site.email)}</a></dd></div>
${ctx.site.availability ? `<div><dt>Next availability</dt><dd>${esc(ctx.site.availability)}</dd></div>` : ''}
<div><dt>Based in</dt><dd>${esc(ctx.site.location)}</dd></div>
</dl>
</div>
<form class="form-card" name="contact" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company-website" data-enquiry-form>
<input type="hidden" name="form-name" value="contact">
<p class="hp-field" aria-hidden="true"><label>Leave this empty <input name="company-website" tabindex="-1" autocomplete="off"></label></p>
<div class="form-row">
<div class="field"><label for="f-name">Name</label><input id="f-name" type="text" name="name" autocomplete="name" required data-error="Please tell me your name.">${err('f-name')}</div>
<div class="field"><label for="f-email">Email</label><input id="f-email" type="email" name="email" autocomplete="email" required data-error="Please enter your email address so I can reply." data-error-type="Please enter a full email address so I can reply.">${err('f-email')}</div>
</div>
<div class="field"><label for="f-company">Company <span class="optional">(optional)</span></label><input id="f-company" type="text" name="company" autocomplete="organization"></div>
<div class="form-row">
<div class="field"><label for="f-need">What do you need?</label><select id="f-need" name="need">${options(c.needs)}</select></div>
<div class="field"><label for="f-budget">Budget</label><select id="f-budget" name="budget">${options(c.budgets)}</select></div>
</div>
<div class="field"><label for="f-message">About your project</label><textarea id="f-message" name="message" rows="4" required data-error="Please tell me a little about your project."></textarea>${err('f-message')}</div>
<p class="form-status" role="status" hidden data-form-status></p>
<button class="btn btn-primary" type="submit">Send enquiry</button>
<p class="form-note">I’ll only use your details to reply. <a href="/privacy/">Privacy notice</a></p>
</form>
</div>
</section>`;
}

function schema(ctx) {
  const s = ctx.site;
  const address = { '@type': 'PostalAddress', addressLocality: 'Wimbledon', addressRegion: 'London', addressCountry: 'GB' };
  return [{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService', '@id': `${s.siteUrl}/#business`, name: s.name, url: `${s.siteUrl}/`,
        description: ctx.home.seo.description, email: s.email, image: `${s.siteUrl}/og-image.png`, logo: `${s.siteUrl}/icon-512.png`,
        priceRange: `${ctx.price.lowestOneOff()}+`, address,
        areaServed: [{ '@type': 'City', name: 'London' }, { '@type': 'Country', name: 'United Kingdom' }],
        founder: { '@id': `${s.siteUrl}/#person` },
        makesOffer: ctx.services.map((svc) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: ctx.price.service(svc.pricing).name, url: `${s.siteUrl}/services/${svc.slug}/` } })),
      },
      {
        '@type': 'Person', '@id': `${s.siteUrl}/#person`, name: s.name, url: `${s.siteUrl}/`, jobTitle: 'Web Designer & Developer',
        email: `mailto:${s.email}`, address, worksFor: { '@id': `${s.siteUrl}/#business` }, sameAs: [s.github],
      },
    ],
  }];
}

module.exports = function renderHome(ctx) {
  const body = [hero(ctx), trusted(ctx), problems(ctx), pricingBlock(ctx), work(ctx), testimonial(ctx), process(ctx), about(ctx), contact(ctx)].join('\n\n');
  return layout(ctx, { title: ctx.home.seo.title, description: ctx.home.seo.description, path: '/', body, schema: schema(ctx) });
};
module.exports.workCard = workCard;
module.exports.steps = steps;
