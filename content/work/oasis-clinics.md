---
category: client
order: 4
client: "Oasis Clinics"
slug: oasis-clinics
sector: "Healthcare"
project: "Redesign and online booking"
# TODO(andy): the year of this project, and the live URL if the site is still yours. Empty values are hidden.
year: ""
url: ""
agency: "BugleLab, my agency at the time"
title: "Oasis Clinics: a failing WordPress site replaced with fast pages and online booking."
seoTitle: "Oasis Clinics case study: a fast multi-clinic site with online booking | Andrew Isherwood"
description: "A failed WordPress site replaced with a fast multi-clinic website, with appointment booking, for a medical group in Egypt."
summary: "Oasis Clinics is a medical group in Egypt, running outpatient and day-surgery services since 2010 across more than 30 specialties and clinics in Sheikh Zayed, New Cairo and the North Coast. Its old site was slow, and staff couldn’t update it."
cardResult: "A failing WordPress site replaced with fast pages and booking."
results:
  - { value: "Online booking", label: "Patients can request appointments straight from every service page", accent: true }
  - { value: "2 seconds", label: "for the main content to load on mobile, measured on real visitors" }
hero:
  src: overview.png
  alt: "Oasis Clinics website pages: a branch homepage with clinic services, a mobile doctors directory filtered by clinic, a contact form and a clinics map"
quote:
  text: "Andrew and his team have been the best freelancers I’ve ever worked with. They were very accommodating to some changes in the project plan mid-stream. All in all, very communicative, met deadlines and took very challenging requirements in the web-app-like components as interesting problems that can be solved/engineered away. They are working with the latest web development stacks, which I highly recommend for anyone looking to build something fast/responsive website that lasts without having to do much maintenance. You hardly find professionals like that. I am definitely working with them on my next project."
  # Shorter excerpt (verbatim) for the homepage testimonial band.
  short: "Andrew and his team have been the best freelancers I’ve ever worked with. They were very accommodating to some changes in the project plan mid-stream. You hardly find professionals like that."
  name: "Mai Azbak"
  role: "Marketing Director, Oasis Clinics"
---

<!-- Source: BugleLab case study (buglelab.io/our-work). Built at BugleLab, Andy's agency; UI design by Ihsan. -->

## The problem

Patients needed to find the right clinic and doctor and book an appointment online. Their old WordPress site got in the way: it was slow and didn't reflect the quality of the clinics.

The previous developers had tried to build a custom PHP admin system so staff could update the site themselves. It never worked. Oasis wanted a full redesign and rebuild.

## What I did

This was a BugleLab project, the web agency I ran at the time. Ihsan, our UX and UI designer, produced the designs as a proof of concept. Once they were approved, we built the site.

- **Editing:** Forestry.io as the content management system, so staff can update clinics, doctors and services without a developer.
- **Booking:** appointment requests go through Netlify Forms. Each one is passed through Zapier into a Google Sheet that staff share, so no booking gets lost in an inbox.
- **Speed:** built with Hugo and plain JavaScript instead of jQuery and plugins. Hugo also resizes and compresses every image at build time.

<div class="screenshot-grid single">
  <figure><img src="services.png" alt="Oasis Clinics service pages on desktop and mobile, with a Book Appointment button and an appointment form"><figcaption>Service pages, each with a booking button</figcaption></figure>
</div>

## The result

Based on real visitors over 28 days, the site passed Google's Core Web Vitals assessment on mobile. The main content loaded in 2 seconds and nothing jumped around as the page loaded.

<div class="screenshot-grid single">
  <figure><img src="core-web-vitals.png" alt="Google PageSpeed Insights for oasisclinics.com on mobile: Core Web Vitals assessment passed, Largest Contentful Paint 2 seconds, First Input Delay 37 milliseconds, Cumulative Layout Shift 0"><figcaption>Google PageSpeed Insights, real-visitor data on mobile</figcaption></figure>
</div>

Halfway through the project, the previous developers took the old site down. We had planned to carry its content across, and suddenly there was nothing to copy. Ihsan's designs carried it. The lesson: always take a backup before you start, even if it's only screenshots.
