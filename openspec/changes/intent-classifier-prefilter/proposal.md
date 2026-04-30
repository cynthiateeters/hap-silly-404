<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

# Proposal: intent-classifier-prefilter

## Why

We need a server-side intent prefilter to prevent off-topic or malicious prompts from reaching the Groq API. This reduces risk of role-deviation, denial-of-wallet attacks, and unintended data exposure.

## What Changes

- Add an intent-classifier prefilter inside `netlify/functions/insult.mjs` inserted after origin/referer checks and before the Groq call.
- If the input is classified as off-topic, return a 400/403 response with a polite refusal message and avoid calling Groq.
- Add vitest tests covering happy, rejection, and quota scenarios.

## Deliverables

- `openspec/changes/intent-classifier-prefilter/` artifacts (proposal, design, tasks, spec).
- Tests in `tests/` that assert Groq is called only for allowed prompts.
- Implementation changes in `netlify/functions/insult.mjs`.
