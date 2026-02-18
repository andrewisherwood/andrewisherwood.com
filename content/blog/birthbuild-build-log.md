---
title: "Beyond 10x: How I Built a SaaS Product in 5 Hours"
slug: birthbuild-build-log
date: 2026-02-16
description: "I founded BirthBuild and shipped a fully deployed SaaS with 22,096 lines of code in a single working day. Here's the build log."
tags: [ai, mai, product, birthbuild]
---

There's a persistent claim in tech circles that AI makes senior engineers 10x more productive. I think that dramatically underestimates what's actually happening. Yesterday I founded BirthBuild — an AI-powered website builder for birth workers — and by the evening I had a fully deployed SaaS with its first live customer site on a custom subdomain. The entire build took roughly five hours of active work.

This wasn't a landing page or a prototype. It was 22,096 lines of code across 130 files, with authentication, an AI chatbot onboarding flow, a full dashboard editor, a static site build-and-deploy pipeline, multi-tenant instructor administration, and accessibility compliance. As a solo developer with 32 years of experience, I can tell you with confidence: this would have been three months of work without AI. That's not 10x. That's closer to 250x.

## What We Built

BirthBuild solves a real problem. Birth workers — doulas, hypnobirthing practitioners, antenatal educators — need professional websites but typically aren't technical. They graduate from training courses and immediately face the blank-page problem: how do I present myself online? BirthBuild eliminates that entirely. A guided AI chatbot asks the right questions, generates tailored content (bio, tagline, service descriptions, FAQ), and produces a polished, deployed website without the practitioner ever touching code.

The underlying platform is horizontally scalable. The same engine powers physiotherapistbuild.com, therapistbuild.com, or any practitioner vertical — swap the prompts, adjust the onboarding flow, and you have a new product. The IP is licensable to training instructors, turning course providers into distribution channels: every graduating cohort needs a website, and the tool is already familiar.

## The Build: 5 Hours, 6 Phases

I used MAI, a multi-agent development infrastructure I've built over the past year. MAI coordinates specialised AI agents for development, QA review, and security auditing, running them as parallel workstreams rather than sequential steps.

The MVP was built in a single three-hour session across six phases, each with dev, QA review, and security audit:

**Phase 1 — Foundation & Auth.** Supabase schema with six tables and row-level security, magic link authentication (no passwords — critical for a non-technical audience), React/Vite/Tailwind PWA shell, and protected routing.

**Phase 2 — Chatbot Onboarding.** Claude API proxy via Supabase Edge Function, a seven-step guided chat flow, AI content generation for bios, taglines, and FAQs, and a markdown renderer for the conversational interface.

**Phase 3 — Dashboard Form Editor.** Seven-tab form with 22 components, colour palette and typography selectors, photo upload to Supabase Storage, and debounced saves to prevent data loss.

**Phase 4 — Build Pipeline & Deploy.** Six page generators producing static HTML/CSS, ZIP creation in pure TypeScript, Netlify Deploy API integration, subdomain provisioning, and realtime build status feedback.

**Phase 5 — Instructor Admin.** Session CRUD, bulk student invites via Edge Function, student progress tracking, read-only spec viewer, and usage metrics.

**Phase 6 — Polish.** Error boundaries, mobile responsive layouts, WCAG accessibility fixes, build validation, and stale rebuild detection.

Twenty security findings were identified and fixed across twelve review rounds. Zero regressions.

A second two-hour session handled live deployment and hotfixes: auth error handling, database migration (triggers, indexes, search path fixes), Edge Function deployment, a server-side tool-use loop for multi-step Claude API calls, a temporary workaround for a Resend email outage, test tenant setup, and the first live site deployment to a custom subdomain.

## By the Numbers

- 130 files, 22,096 lines of code
- 46 commits, 6 merged pull requests
- 4 Supabase Edge Functions deployed
- 20 security findings fixed across 12 review rounds
- 1 live generated website on a custom subdomain
- ~5 hours total active development time

## What Actually Went Wrong

I'm including this because the failures are as instructive as the successes.

Three significant infrastructure issues hit during the build. The Supabase MCP (Model Context Protocol) integration failed silently, which meant MAI was writing schema and row-level security policies without being able to verify them against the actual database state. Puppeteer also failed silently, eliminating automated browser testing. And I forgot to add the OpenAI API key, which meant the tri-model adversarial review — where Claude, GPT, and Gemini challenge each other's work — never ran.

The result was predictable: the database layer was a mess. I spent ninety minutes debugging the frontend, tracing issues back to schema and RLS problems that the adversarial review would have caught if it had been running. The Supabase MCP failure was the single point of failure that cascaded into the biggest debugging session of the day.

This is actually a useful validation. When the safety nets work, they catch real problems. When they silently fail, real defects get through. The lesson for the next MAI iteration is clear: silent failures need to become loud failures. A pre-flight check that confirms all model endpoints are reachable and all tool integrations are healthy before the first phase kicks off would have saved those ninety minutes.

## Why 10x Is the Wrong Frame

The "AI makes you 10x faster" framing comes from thinking about AI as a faster typist — autocomplete on steroids. That misses what's actually changed.

A solo developer spending three months on this scope isn't writing code for three months. They're writing code for maybe three to four weeks and spending the rest on planning, context-switching, waiting for review, rebuilding context after interruptions, researching approaches, and all the overhead that surrounds actual implementation. AI doesn't just accelerate the coding — it eliminates the dead time.

With MAI, I'm running parallel workstreams with specialised agents. That's not 10x one engineer — it's closer to having a small team that doesn't need standups, doesn't context-switch, and doesn't go home. The bottleneck has shifted. The limiting factor yesterday wasn't code generation speed. It was infrastructure failures and debugging — the human-in-the-loop work is now almost entirely architectural decision-making and fault diagnosis, not implementation.

This is a qualitative shift, not just a quantitative one. The role of the senior engineer isn't to write code faster. It's to make the right architectural decisions, recognise when something has gone wrong at a systems level, and maintain the judgement to know what to build and why. Those thirty-two years of experience aren't being replaced — they're being leveraged differently.

## What's Next

BirthBuild is the first vertical. The horizontal platform beneath it is the real product — a licensable engine for building practitioner website builders across any service profession. The instructor licensing model means each training provider becomes a distribution channel, with every graduating cohort as a captive audience who need exactly this tool.

The immediate priority is hardening the database layer (the MCP failures made that urgent), fixing MAI's silent failure handling, and proving the horizontal thesis by spinning up a second vertical quickly.

But the core point stands: I went from zero to a live, deployed, revenue-ready SaaS product in a single working day. The 10x discourse isn't wrong — it's just not thinking big enough.
