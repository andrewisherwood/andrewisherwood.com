---
title: "The Spec Is the Prompt"
slug: the-spec-is-the-prompt
date: 2026-02-18
description: "I built a landing page in one prompt. It looked like a £1,000 design job. Here's why specification density matters more than prompt engineering."
tags: [ai, specification-density, product]
---

So I built a landing page for [BirthBuild](https://birthbuild.com) last week. One prompt. One shot. And it came back looking like something I'd have paid a designer serious money for. I know this because I *have* paid designers serious money for exactly this kind of work.

And I kept asking myself why it was so good. Because I didn't do anything clever. No prompt engineering. No "act as a senior designer with 15 years of experience." No chain-of-thought wizardry. I just pasted in my rebuild spec and said build me a landing page.

That's when it clicked.

## The spec did the work

The thing I gave the model wasn't a brief. It was a 4,000-word technical specification I'd written to guide a ground-up rebuild of the BirthBuild codebase. It had everything in it. The full user journey from magic link auth through chatbot onboarding to Netlify deployment. Four colour palettes with actual hex values. Typography presets with specific Google Font pairings. The instructor dashboard features. The chatbot's 7-step flow. Who the users are. What they care about.

And when the landing page came back, every section mapped to something real. The animated chat demo uses the actual onboarding steps. The palette showcase uses the actual hex values. The instructor dashboard mockup has real status badges and progress bars. The pricing tiers match the actual feature split.

Nothing was invented. Nothing was generic. The model didn't have to guess what the product does because I'd already told it in obsessive detail.

Same thing happened with [andrewisherwood.com](https://andrewisherwood.com). The model had access to the projects I was actually building. The architecture docs, the product specs, the user journeys. So instead of writing portfolio copy for a generic "tech founder," it wrote about real things with real texture. Because the context was real.

## Why most AI output feels mid

When you ask an LLM to "build me a landing page for my SaaS product," it has to fill every gap with assumptions. What does it do? Who uses it? What's the pricing? What colours? What tone? The model will answer all of those questions for you. But it'll answer them generically, because you gave it nothing specific to work with.

And that's how you end up with output that looks... fine. Technically correct. Emotionally flat. The kind of thing where you go "yeah that's okay I guess" and then spend three hours trying to fix it into something that actually feels like your product.

The gap between "fine" and "this is exactly right" is almost never about the model. It's about what you fed it.

## Specification density

I've started calling this *specification density*. It's the ratio of specific, concrete, true information to total context.

High density looks like: "The primary colour is sage (#5f7161) on a sand background (#f5f0e8). Typography pairs Cormorant Garamond for display headings with Outfit for body. The CTA uses the same sage green."

Low density looks like: "Make it professional and calming. Earth tones."

Both are valid instructions. But the first one gives the model almost nothing to improvise on. The second gives it almost nothing to work with. And the distance between those two inputs is the distance between a £1,000 landing page and a template.

This isn't about writing longer prompts either. A 10,000-word doc full of "we want to disrupt the industry" and "our mission is to empower" has terrible specification density. A 500-word doc with exact colours, real user quotes, and a concrete feature list has great specification density. What matters is how much of it is specific and true.

## The bit that surprised me

The spec I wrote for BirthBuild wasn't written for marketing. It was a technical document for rebuilding a codebase. But because it captured the product truthfully and in detail, it turned out to be the best creative brief I could have written for the landing page.

And then the same spec produced an LLM generation architecture plan. Database migrations, Edge Function specs, cost modelling, four-phase implementation timeline. Different output, same quality driver.

One document, multiple uses, each one elevated by the density of the input.

That's the compounding return on good documentation that nobody talks about. Every hour you spend making a spec more precise pays dividends across every task that touches it. The landing page. The architecture plan. The investor pitch. The onboarding flow. They all inherit from the same source of truth.

## Where it gets meta

Here's where my brain goes because it always goes here. This insight maps directly to what BirthBuild itself does.

The product's core loop is a chatbot that guides birth workers through a structured conversation. Business name, services, philosophy, testimonials, design preferences. That conversation populates a site specification. That specification feeds an LLM that generates their website.

The chatbot onboarding *is* specification writing. The birth worker doesn't know they're writing a brief. They think they're having a conversation. But by the end of it they've produced a dense, structured document with everything the generation model needs to build something personal and specific.

A doula who says "I specialise in home births for second-time parents in South Bristol, and my philosophy centres on informed choice and physiological birth" is going to get a dramatically better site than one who says "I'm a doula in Bristol."

So the product's real job isn't just data collection. It's eliciting specificity. Asking the right follow-ups. Drawing out details the user wouldn't think to mention. The better the conversation, the denser the spec, the better the site.

Which means I accidentally built a product that proves its own thesis.

## The short version

If your LLM output feels generic, the problem probably isn't the model. It's the input.

Write a better spec. Not a better prompt. A better spec. Real details. Exact values. Actual features. The more specific and true the context you provide, the less the model has to make up. And making stuff up is where things go generic.

The moat in LLM-powered products isn't the model. It's the structured context you feed it.
