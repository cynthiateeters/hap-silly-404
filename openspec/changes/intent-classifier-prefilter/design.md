<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

# Design: intent-classifier-prefilter

## Context

`insult.mjs` is a Netlify serverless function that receives GET requests and calls Groq to generate a roast. The handler already performs origin checks, misconfig guards, and rate limiting. We will insert a lightweight intent prefilter after the origin check.

## Goals

- Reject off-topic requests before calling Groq.
- Provide explicit, testable refusal messages.
- Keep the classifier deterministic and test-friendly (start with keyword-based classifier; swap-in embedding similarity later if needed).

## Decisions

- Implement a deterministic keyword-based classifier first (allowlist of topic keywords and simple regex). This avoids external dependencies and keeps tests deterministic.
- Return 403 for off-topic requests.

## Implementation note (final)

- Placement: the prefilter is evaluated immediately after the origin/referer same-origin check and before any API key lookups or Groq calls. This preserves the function's existing CORS and origin protections while preventing wasted external API calls.
- Matching strategy: tokens are matched using word-boundary aware regular expressions (escaped tokens wrapped in `\\b...\\b`) to avoid accidental substring matches. Matching is case-insensitive.
- Test coverage: the change ships with vitest tests covering:
  - allowed prompt (calls Groq via mocked fetch and returns 200 with source="groq")
  - off-topic prompt (returns 403 and does not call fetch)
  - empty query (no `q` param) is allowed and returns 200
- Rationale: deterministic allowlist simplifies local testing and reduces the attack surface for prompt-injection-like inputs. If more nuanced intent detection is needed later, replace or augment this layer with a safe, server-side classifier that is also tested and rate-limited.

## Next steps (optional)

- Consider archiving this openspec change once reviewed.
- If false positives/negatives appear in production, collect minimal telemetry (count of rejected requests) and tune the allowlist or add a lightweight classifier with a manual review path.
