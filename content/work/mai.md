---
title: "Multi-Agent Infrastructure"
slug: mai
date: 2026-02-01
description: "A coordinated multi-agent development system built on Claude Code. Autonomous specialised agents working in parallel across git worktrees."
tags: [AI Engineering, Architecture, Automation]
stack: [Claude Code, Multi-Agent, Git Worktrees, Bash, Node.js]
metrics:
  - label: Specialised agents
    value: "9"
  - label: Token reduction
    value: 73.7%
status: In Development
---

## What it is

MAI is a coordinated multi-agent development system built on Claude Code. Instead of a single AI assistant working sequentially, MAI runs specialised agents in parallel across isolated git worktrees — development, QA, security audit, documentation — each with their own context, tools, and responsibilities.

A coordinator agent on the main branch plans phases, writes implementation briefs, and reviews pull requests. Dev agents on feature branches write code. Security agents on audit branches review every commit automatically via post-commit hooks and write findings to SECURITY.md. The agents specialise so each one operates within a focused context window, which is how the system achieves a 73.7% token reduction compared to a monolithic single-agent approach.

## How it works

The system uses a three-layer memory architecture: working memory (conversation context), session memory (status files per agent), and project memory (CLAUDE.md files that persist across sessions). This lets agents pick up where they left off without losing context, and lets the coordinator track progress across all workstreams.

Each phase follows a strict gate sequence: plan → implement → QA review → security audit → PR → merge. No phase ships without passing all gates. The adversarial review layer can optionally pit Claude, GPT, and Gemini against each other to challenge assumptions and catch blind spots.

## Current state

MAI V3 is the current iteration. It built this portfolio site, BirthBuild, and Suppertime's iOS app. The immediate focus is on eliminating silent failures (the biggest weakness surfaced during the BirthBuild build) and improving the pre-flight check system so all tool integrations are verified before the first phase kicks off.
