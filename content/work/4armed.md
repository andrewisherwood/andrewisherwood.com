---
category: client
order: 1
client: "4ARMED"
slug: 4armed
sector: "Cyber security"
project: "Redesign and rebuild"
# TODO(andy): the year of this project, and the live URL if the site is still yours. Empty values are hidden.
year: ""
url: ""
agency: "BugleLab, my agency at the time"
title: "4ARMED: a cyber security site rebuilt to score 100 on mobile."
seoTitle: "4ARMED case study: mobile speed score from 31 to 100 | Andrew Isherwood"
description: "A redesign and rebuild for a cyber security consultancy, taking its mobile Lighthouse score from 31 to 100."
summary: "4ARMED is a UK cyber security consultancy that tests the security of web applications and cloud systems. Its site needed a new design, clearer services and a lot more speed."
cardResult: "Mobile speed score up from 31 to 100."
results:
  - { value: "31 → 100", label: "Google Lighthouse performance score on mobile, before and after" }
  - { value: "No jQuery", label: "Plain JavaScript and one small stylesheet, instead of heavy libraries on every page" }
hero:
  src: pages.png
  alt: "4ARMED's Application Penetration Testing page on desktop and mobile, with a dark hero, a side menu of sections and an overview of security testing levels"
---

<!-- Source: BugleLab case study (buglelab.io/our-work, unpublished draft). Built at BugleLab, Andy's agency; UI design by Ihsan. Andy confirmed the site launched. -->

## The problem

Marc, from 4ARMED, asked us to redesign and rebuild the company's existing site. He felt it needed a new design, and its services and resources needed reorganising.

The site also scored badly on Google's speed tests, mostly because it loaded large third-party libraries like jQuery and Bootstrap on every page. And there was a design challenge: 4ARMED wanted to show the stack of technologies and services it works across in a way that was clear, rather than a wall of logos.

## What I did

This was a BugleLab project, the web agency I ran at the time. Ihsan, our UX and UI designer, created a modern black and white design. It brought 4ARMED's resources to the front and came with a design system, so new pages stay consistent.

We built the site with Hugo:

- **One stylesheet:** Hugo's Sass pipeline compiles all the styles into a single small file.
- **No jQuery or Bootstrap:** everything interactive is written in plain JavaScript, so there are no heavy libraries to download.

## The result

The new site scored 100 for performance in Google Lighthouse on mobile, up from 31 on the old site.

<div class="screenshot-grid single">
  <figure><img src="lighthouse.webp" alt="Google Lighthouse lab data for the new 4ARMED site: performance 100, First Contentful Paint 0.9 seconds, Largest Contentful Paint 1.5 seconds, Total Blocking Time 0 ms, Cumulative Layout Shift 0"><figcaption>Lighthouse on mobile, tested on the preview build before launch</figcaption></figure>
</div>

The custom stack illustration took longer than planned because we built it in plain JavaScript. Looking back, an existing JavaScript library would probably have done the job faster. There's no prize for reinventing the wheel.
