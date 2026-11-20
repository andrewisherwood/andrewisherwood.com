---
category: client
order: 3
client: "Nasaco International"
slug: nasaco
sector: "Chemicals"
project: "WordPress to static on Netlify"
# TODO(andy): the year of the migration, and the live URL. Empty values are hidden.
year: ""
url: ""
title: "Nasaco International: a client since 2002, now on a faster, cheaper build."
seoTitle: "Nasaco International case study: from WordPress to a fast static site | Andrew Isherwood"
description: "I built Nasaco's first website when I was 18. They're still a client. Their latest site moved off WordPress onto a fast, static build on Netlify."
summary: "Nasaco International designs, formulates, produces and markets chemicals for froth flotation and other mineral processing. I built their first website in 2002, when I was 18. Twenty-four years later, they’re still a client."
cardResult: "A client since 2002, now on a faster, cheaper build."
# TODO(andy): a second result, e.g. before/after load time or monthly hosting cost.
results:
  - { value: "24 years", label: "as a client, from their first website in 2002 to today" }
hero:
  src: homepage.png
  alt: "Nasaco's homepage today: a navy header with the Nasaco ‘solutions for flotation’ logo, and the headline ‘Solutions for flotation’ over a photo of an open-pit mine in a mountain valley, with View our products and Contact us buttons"
---

<!-- TODO(andy): add how the relationship carried on from 2002, anything specific Nasaco asked for, how the migration went (content, redirects, design), and before/after speed and hosting numbers. Before/after screenshots go in content/work/images/nasaco/ and can be added to the body like the other case studies. -->

## The problem

Nasaco's site ran on WordPress. That meant regular plugin and core updates to keep it secure, and hosting built to run a database.

The brief was simple: keep the content, lose the maintenance.

## What I did

I moved the site from WordPress to a static build made with Hugo and hosted on Netlify. Every page is built ahead of time and served from a global CDN, so there's no database, no plugins and no admin login to attack.

## The result

- **Security:** no plugins to patch and no database to break into.
- **Maintenance:** no more WordPress core and plugin updates to keep on top of.

It's come a long way from the first site I built for them.

<div class="screenshot-grid single">
  <figure><img src="first-site-2002.png" alt="Nasaco International's first website from 2002: a dark blue page with the company name in grey script, a photo of a tank container, and a bubble graphic describing the business"><figcaption>Where it started: Nasaco's first site in February 2002, credited “Site design by Andrew Isherwood”. (Internet Archive)</figcaption></figure>
</div>
