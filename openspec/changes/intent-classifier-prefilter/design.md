<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

## Context

`insult.mjs` is a Netlify serverless function that receives GET requests and calls Groq to generate a roast. The handler already performs origin checks, misconfig guards, and rate limiting. We will insert a lightweight intent prefilter after the origin check.

## Goals

- Reject off-topic requests before calling Groq.
- Provide explicit, testable refusal messages.
- Keep the classifier deterministic and test-friendly (start with keyword-based classifier; swap-in embedding similarity later if needed).

## Decisions

- Implement a deterministic keyword-based classifier first (allowlist of topic keywords and simple regex). This avoids external dependencies and keeps tests deterministic.
- Return 403 for off-topic requests.
