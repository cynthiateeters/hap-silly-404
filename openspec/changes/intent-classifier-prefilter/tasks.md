<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

# Tasks: intent-classifier-prefilter

1. Add `openspec/changes/intent-classifier-prefilter/` artifacts (proposal/design/tasks/spec) — done.
2. Write vitest tests:
   - Happy path: allowed prompt calls Groq and returns 200.
   - Rejection: off-topic prompt returns 403 and Groq is not invoked.
   - Quota: simulate request quota exceeded -> returns 429.
3. Implement a small `isAllowedIntent()` helper in `netlify/functions/insult.mjs` and wire it after the origin/referer check.
4. Run tests and `npm run check`. Fix any lint/format issues.
5. Commit and archive the openspec change.
