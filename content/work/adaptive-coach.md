---
title: "Adaptive Coach"
slug: adaptive-coach
date: 2026-01-15
description: "An AI-powered personal cycling coach that generates periodised training plans adapted to individual physiology, race goals, and recovery patterns."
tags: [Product, AI, Sports Tech]
stack: [Next.js, Supabase, AI/ML, Sports Science]
metrics:
  - label: Activities tracked
    value: "86"
  - label: Distance logged
    value: 2383km
status: In Progress
---

## What it is

Adaptive Coach is an AI-powered personal cycling training coach. It generates periodised training plans that adapt to individual physiology, race goals, and recovery patterns. Built to solve the problem of generic training plans that don't account for real life — illness, bad weather, work stress, or simply not feeling it today.

The system ingests activity data, models fatigue and fitness curves, and adjusts the plan dynamically. Miss a session? The plan recalculates. Have a great week? The plan responds. The goal is to bring the intelligence of a human coach to every rider, not just those who can afford one.

## Current state

The core training plan engine is built and generating plans from real activity data — 86 activities logged across 2,383km. The Strava integration pulls ride data automatically. The AI layer analyses patterns and adjusts periodisation based on actual performance rather than theoretical models.

## What's next

The next phase is adding the conversational interface — a chat-based coaching layer where riders can ask questions about their plan, report how they're feeling, and get real-time adjustments. The long-term vision is a product that feels less like software and more like having a knowledgeable coach who's always available.
