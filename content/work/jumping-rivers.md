---
category: client
order: 5
client: "Jumping Rivers"
slug: jumping-rivers
sector: "Data science consultancy"
project: "WordPress to static"
# TODO(andy): the year of this project, and the live URL if the site is still yours. Empty values are hidden.
year: ""
url: ""
agency: "BugleLab, my agency at the time"
title: "Jumping Rivers: off WordPress, and edited straight from GitLab."
seoTitle: "Jumping Rivers case study: WordPress to a fast Hugo site edited in GitLab | Andrew Isherwood"
description: "A data science consultancy moved off WordPress onto a fast Hugo site that their team edits from GitLab, the tool they already use every day."
summary: "Jumping Rivers is a data science consultancy that runs training courses and helps organisations get value from their data. The team was tired of running their site on WordPress."
cardResult: "The team now edits its own site straight from GitLab."
results:
  - { value: "GitLab", label: "Courses, pages and posts are now published from the tool the team already uses every day" }
  - { value: "Passed", label: "Google’s Core Web Vitals assessment, measured on real visitors over 28 days" }
hero:
  src: pages.png
  alt: "Pages from the Jumping Rivers site: the homepage hero, a Scottish Government case study, a contact form and a pricing table"
quote:
  text: "Excellent job. It’s now much easier for us to create courses and posts from within GitLab. Thanks!"
  name: "Colin Gillespie"
  role: "Jumping Rivers"
---

<!-- Source: BugleLab case study (buglelab.io/our-work). Built at BugleLab, Andy's agency. -->

## The problem

The Jumping Rivers team wanted to change pages, courses and blog posts in GitLab, which most of them already use every day, instead of logging into WordPress.

They also wanted what a static site gives you for free: very fast pages, almost nothing to attack, and a full version history of every change.

## What I did

This was a BugleLab project, the web agency I ran at the time. Colin Gillespie first asked us to rebuild just the homepage in Hugo as a proof of concept, with the code kept in GitLab. It worked well, so we rebuilt the whole site, redesigning some sections along the way.

- **Static site:** built with Hugo, which is fast and suits content-heavy sites with lots of blog posts. We built a custom theme as plain HTML first, then connected it to the content.
- **Content migration:** posts and pages were exported from WordPress with a migration plugin, so nothing was retyped by hand.
- **Basket:** the site didn't need card payments, so instead of a full e-commerce backend we built a lightweight basket in plain JavaScript that sends orders through Netlify Forms.

## The result

The site passed Google's Core Web Vitals assessment, based on how fast it is for real visitors over 28 days. The team now publish courses and posts from GitLab, without logging into WordPress.

Building a basket from scratch was harder than it looked. It had to do most of what WooCommerce does, and the edge cases took real work. But it became a reusable module we used on later projects.
