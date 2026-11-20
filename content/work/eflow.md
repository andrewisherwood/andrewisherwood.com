---
category: client
order: 2
client: "Eflow Global"
slug: eflow
sector: "Compliance software"
project: "Redesign, WordPress.com to static"
year: "2021"
# TODO(andy): the live URL, if the site is still yours. Empty values are hidden.
url: ""
agency: "BugleLab, my agency at the time"
title: "Eflow Global: a 15.4-second site rebuilt to score 96 on Lighthouse."
seoTitle: "Eflow Global case study: a slow WordPress.com site rebuilt as a fast static site | Andrew Isherwood"
description: "A slow WordPress.com site rebuilt as a fast static site with an editable CMS, for a regulatory compliance software firm."
summary: "Eflow has made regulatory compliance software for financial services for over 25 years, with more than 100 clients across five continents. Its marketing team had one request: make the website faster."
cardResult: "A 15.4-second site rebuilt to score 96 on Lighthouse."
results:
  - { value: "15.4s → 96", label: "From a 15.4-second full load to a Lighthouse performance score of 96 on mobile" }
  - { value: "Passed", label: "Google’s Core Web Vitals assessment, measured on real visitors" }
hero:
  src: pages.png
  alt: "Pages from the redesigned Eflow Global site: the TZ Regulatory Compliance product page with feature cards, and MiFID II and RTS 27/28 reporting sections"
quote:
  text: "Our experience with BugleLab has been a very positive one. They helped us switch from our old buggy WordPress site to a much faster static site. They also helped set us up with a new CMS which allowed us to retain flexibility and the ability to implement new content easily without the need for a developer’s input. BugleLab didn’t just build our site, they gave us the tools we needed to be in control of it."
  name: "Charlie"
  role: "Marketing Executive, Eflow Global"
---

<!-- Source: BugleLab case study (buglelab.io/our-work). Built at BugleLab, Andy's agency; UI design by Ihsan. -->

## The problem

Charlie, from Eflow's marketing team, got in touch in 2020. An audit showed the site took 15.4 seconds to load in full. Large, uncompressed images were part of the problem, so we compressed every image, minified the scripts and CSS, and moved the images and files onto a proper CDN.

It still wasn't fast enough. The hosting was the real bottleneck: in one test the server took 7 seconds to start responding. Because the site was on WordPress.com rather than self-hosted WordPress, we couldn't just move it to a better server. Getting off that hosting meant a rebuild, and the design needed a refresh anyway.

## What I did

This was a BugleLab project, the web agency I ran at the time. In 2021 Eflow commissioned the redesign and rebuild. Ihsan, our UX and UI designer, created a new custom design, and Charlie loved it.

- **A static site:** built with Hugo, which builds every page ahead of time. The site didn't need payments, so there was no reason to run a server.
- **Editing without a developer:** each page was connected to Forestry.io, a content management system, so Charlie's team could edit content themselves.
- **Light demo booking:** the main goal was getting visitors to book a demo. Instead of a heavy booking plugin, we used Calendly, which kept the pages light.

## The result

The new site scored 96 for performance in Google Lighthouse, and the whole site passed Google's Core Web Vitals assessment, which is based on how fast the site is for real visitors.

<div class="screenshot-grid single">
  <figure><img src="lighthouse.png" alt="Google Lighthouse report for eflowglobal.com on mobile: Performance 96, Accessibility 97, Best Practices 92, SEO 100"><figcaption>Lighthouse on mobile after launch</figcaption></figure>
</div>

The lesson I took from it: if a slow site is on a platform you can't fix, don't spend weeks patching it. Move to a fast static site early. It saves the client time and money.
