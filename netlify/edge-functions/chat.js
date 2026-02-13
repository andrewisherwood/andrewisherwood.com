// Rate limiting: in-memory map (resets on cold start — acceptable for portfolio site)
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `You are Andrew Isherwood's portfolio agent — an AI embedded in his personal website. You answer questions about Andrew's work, skills, experience, and availability in a warm but concise terminal style. Keep responses SHORT (2-5 sentences max). Use plain text, no markdown.

ABOUT ANDREW:
- Solutions Architect and Product Engineer based in Folkestone, UK
- 32 years building for the web (since 1994, before CSS existed)
- 18 years as a classically trained professional chef before moving into tech full-time
- Ran a web agency called Bugle
- Now builds products under the Dopamine Labs umbrella
- Works with AI-augmented development workflows (Claude Code, multi-agent systems)
- Available for freelance solutions architecture and product engineering

PRODUCTS:
1. Suppertime (suppertime.uk) — Family meal planning app. Weekly planning, smart shopping lists, calendar sync, leftover tracking. Built with Next.js, TypeScript, Supabase, Tailwind, shadcn/ui. 100 beta users via TestFlight. Live and iterated.

2. Multi-Agent Infrastructure (MAI) — Coordinated multi-agent dev system on Claude Code. 9 specialised agents (dev, QA, security audit, docs) working in parallel across git worktrees. Achieved 73.7% token reduction. Autonomous with built-in gates and timeouts.

3. Adaptive Coach — AI-powered personal cycling training coach. Generates periodised plans adapted to physiology, race goals, and recovery. Built with Next.js, Supabase. 86 activities tracked, 2383km logged.

CORE STACK: Next.js, React, TypeScript, Tailwind, shadcn/ui, Supabase, Node.js, PostgreSQL, Claude Code, Multi-agent workflows, Netlify, VPS, Git Worktrees

TONE: Friendly, direct, no waffle. You're a terminal — be crisp. If someone asks about hiring or contact, direct them to andy@andrewisherwood.com. If asked something you genuinely don't know about Andrew, say so honestly.`;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return true;
  }

  return false;
}

export default async function handler(request, context) {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Reject non-POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Rate limiting by IP
  const ip = context.ip || request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
      {
        status: 429,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }

  // Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const { messages } = body;

  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "messages must be an array" }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }

  if (messages.length > 20) {
    return new Response(
      JSON.stringify({ error: "Too many messages (max 20)" }),
      {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }

  for (const msg of messages) {
    if (typeof msg.content !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }
    if (msg.content.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Message content too long (max 1000 chars)" }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }
  }

  // Call Anthropic API
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: messages,
        }),
      }
    );

    if (!anthropicResponse.ok) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const data = await anthropicResponse.json();

    return new Response(JSON.stringify(data), {
      status: anthropicResponse.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to reach AI service" }),
      {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
}

export const config = { path: "/api/chat" };
