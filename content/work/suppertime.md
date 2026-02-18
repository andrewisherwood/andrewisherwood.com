---
title: "Suppertime"
slug: suppertime
date: 2026-02-18
description: "A family meal planning app that closes the daily 'what's for dinner?' decision. Built from personal need, tested with 100 parents."
tags: [Product, Full-Stack, Shipped]
stack: [SwiftUI, Core Data, Supabase, Claude API, Resend, Netlify]
metrics:
  - label: Beta users
    value: "100"
  - label: Recipes
    value: 86+
  - label: Core Data entities
    value: "12"
status: Shipped
---

## The 4pm question

Every parent knows it. You're in the middle of something. Maybe work. Maybe school pickup. Maybe just trying to keep a small person alive. And the thought arrives like clockwork.

What's for dinner tonight?

Not a hard question. But when you're already running on fumes it feels impossible. You open the fridge. Stare at it. Close it. Open it again as if the contents might have changed. Check a recipe app that wants you to cook something with ingredients you don't have. Give up. Order takeaway. Feel bad about it.

I built Suppertime because I was tired of that loop. I'm a stay-at-home dad. I spent 18 years as a professional chef. I can cook anything. But the decision of what to cook, every single day, for a family that includes a toddler with strong opinions? That's the bit that breaks you.

## What it does

Suppertime is a meal planning app for families. Drag meals onto the week. Everyone in the household sees the same plan. The shopping list writes itself.

That's the pitch. Here's what it actually looks like in practice.

![Weekly meal plan](plan.png)

**The plan.** A week at a glance. Breakfast, lunch, dinner, snacks. Each meal slot is colour-coded so you can scan the day instantly. Tap the day pills to jump between days. Hit the + button to add a meal from your recipe library. The whole thing is designed to feel like organising sticky notes on a fridge, not filling in a spreadsheet.

![Recipe browser with 86 recipes](recipes.png)

**Recipes.** 86 recipes and growing. Filter by meal type, dietary needs, time available. Every recipe card shows the hero image, cook time, servings, and tags at a glance. Breakfast, Lunch, Dinner, Snack, Quick. Tap to see the full detail.

![Recipe detail for chunky vegetable soup](recipe.png)

**Recipe detail.** Full ingredients, method, prep time. Tagged by everything that matters for family cooking. Vegetarian. Vegan. Batch cook. Freezer friendly. Kid friendly. The hero images are AI-generated but they look good and they help you remember which recipe is which when you're scrolling at speed.

![Shopping list grouped by aisle](shopping.png)

**Shopping list.** This is the screen that gets used in the supermarket. Auto-generated from the week's plan. Grouped by aisle. Bakery. Dairy. Produce. Meat. So you're not zigzagging back across the shop because you forgot the yoghurt.

The key detail: every item shows which recipe it's for. "28 slice bread" sounds mad until you see it's covering Beans on toast, Cheese toastie, PBJ sandwich, and Scrambled eggs on toast across the week. "Crusty bread to serve" is for the Chunky vegetable soup. You always know why something is on the list.

73 items for a week. Tick them off as you go. Export to iOS Reminders if you want it on your wrist.

**Voice recipes.** Tell it what you want. "Roast leg of lamb with apricots." It generates a full recipe. Ingredients, method, timings. Structured so everything flows straight into the plan and the shopping list. No copy-pasting from ChatGPT. The recipe is part of the system.

**Everyone ate.** The only success metric that matters. At the end of the meal, tap "Done cooking?" and you get a choice. Everyone ate. Not tonight. If everyone ate, you get confetti. Leftovers get auto-added to tomorrow's lunch. Tomorrow's a new day.

## The closed loop

Most recipe apps solve the wrong problem. They give you recipes. You already have recipes. You have too many recipes. What you don't have is a system that connects the plan to the shop to the kitchen to the table and back again.

Suppertime is that system. Pick recipes. Build the week. Generate the list. Go shopping. Cook. Eat. Mark it done. Leftovers carry forward. Start again.

I tested this loop properly before launching. Lived with it for a full week. Followed the shopping list verbatim. Cooked from the generated recipes. Checked if the AI recipes held up to someone with 18 years of professional kitchen experience.

They did. The timings were right. The technique was sound. The seasoning was there. Most recipe apps fail that test immediately with anyone who actually knows how to cook.

## How it's built

Suppertime started as a PWA. Next.js, TypeScript, Supabase, Tailwind. It proved the concept but the PWA friction was real. Saving to home screen. Agreeing to download Shortcuts for iOS Reminders integration. Losing connectivity in the supermarket and not being able to check why the list says three packs of butter.

So I rebuilt it as a native iOS app. SwiftUI, offline-first with Core Data, background sync. Same Supabase backend. Same user accounts. Same data. A completely separate codebase, not a conversion.

The architecture decisions that mattered:

**Offline-first.** The app reads and writes to a local Core Data store. Never waits for network. Standing in Tesco with no signal? Everything's there. Recipes, menus, shopping list, the lot. Twelve Core Data entities mirror the Supabase schema exactly. Every mutable entity carries sync metadata: status, last modified, server timestamp. Local changes get queued as sync operations and push when connectivity returns.

A dedicated SyncEngine orchestrates the whole thing. NetworkMonitor watches connectivity via NWPathMonitor. When the app comes back online or becomes active, it pulls from Supabase and pushes queued local changes. Background refresh via BGAppRefreshTask keeps things current even when the app isn't open. The conflict resolution strategy is last-write-wins. For a family meal planning app where you're not editing the same recipe simultaneously, that's fine.

**Household sharing.** Multiple family members on the same plan. My daughter helps choose meals for the week. She drags them onto the days herself. It syncs across devices. The family sees the same plan. Row-level security in Supabase means each household only ever sees their own data. New members join via an invite code shared from Settings.

**AI meal planner.** Not just recipe generation. A conversational chatbot that plans your entire week from your household's recipe catalogue. It runs via a Supabase Edge Function calling the Claude API. The prompt knows your existing recipes, your family's preferences, what's quick enough for a weeknight. Input sanitisation server-side: 500 character limit per message, 20 message conversation cap, 30 second timeout. It generates structured meal plans that save directly to your calendar. No copy-pasting.

Voice recipe creation works too. Tell it what you want. "Roast leg of lamb with apricots." It creates a full recipe, structured into the data model. Ingredients flow to the shopping list automatically.

**Magic link auth.** No passwords. Enter your email, tap the link, you're in. Supabase handles the OTP. Deep links with the `suppertime://` scheme bring you straight back to the app. Custom SMTP via Resend so the emails come from hello@suppertime.uk, not a Supabase default.

**How I built it.** I use a multi-agent development system I built called MAI. Three Claude Code sessions running in parallel via git worktrees. A coordinator agent on main plans phases and reviews PRs. A dev agent on a feature branch writes code and builds. A security agent on an audit branch reviews every commit automatically via a post-commit hook and writes findings to SECURITY.md. The whole thing ships faster than a traditional solo dev workflow because the agents specialise. The dev agent never has to think about security. The security agent never has to think about features. The coordinator keeps them in sync.

## Getting to 100 users

I launched to a parenting WhatsApp group. Founding members at £2.50/month. Half the regular £5. Lifetime rate as a thank you for being early.

100 parents signed up for the TestFlight beta.

The feedback loop has been tight. Real families using it every week. Real bugs surfacing from actual kitchen situations, not product manager hypotheticals.

The things that mattered most to users weren't what I expected. The shopping list got the daily use. The meal plan got the weekly habit. The "everyone ate" confetti got the emotional response.

But the thing that kept people coming back was simpler than any feature.

They didn't have to think about dinner anymore. The plan was there. The list was there. The decision was already made.

## What I learned

**The decision is the product, not the recipe.** Every competitor focuses on recipes. Better recipes. More recipes. AI recipes. But the pain point was never "I don't know how to cook chicken." It was "I can't face deciding what to cook." Suppertime's value is eliminating that decision, not providing that recipe.

**PWA friction is real for daily-use apps.** For something you check once a week, a PWA is fine. For something you use in the supermarket with wet hands, in the kitchen covered in flour, at bedtime when planning tomorrow, the native experience matters. Home screen icon. Offline reliability. OS integration. Going native was the right call.

**AI recipes are commoditised. Integration is the moat.** Any LLM can generate a recipe. The value isn't the recipe itself. It's what happens after. Ingredients flow to the shopping list. Meals slot into the calendar. The recipe becomes part of a system, not a standalone document you screenshot and forget.

**Show where the ingredients come from.** The single most useful detail on the shopping list is the small text under each item showing which recipes need it. "28 slice bread" makes sense when you can see it covers four different meals. Without that context, you'd second-guess the list. With it, you trust the system and buy what it says.

**Build for your own family first.** I built Suppertime because I needed it. I'm the user. I cook the meals. I do the shop. I know exactly where the friction is because I feel it every day. Every feature decision was tested against one question: does this make my week easier?

It did. Then it made 100 other families' weeks easier too.
