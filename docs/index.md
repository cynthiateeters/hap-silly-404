---
title: "Docs index"
type: index
tags: []
created: 2026-04-18
updated: 2026-04-18
---

# docs/

Everything you need to complete the assignment is in this folder.

## Assignment

- [INSTRUCTIONS.md](INSTRUCTIONS.md) — what to build, in what order, and how to use your AI agent
- [CHECKLIST.md](CHECKLIST.md) — track your progress step by step

## Reference

Use these while coding — quick lookups, not reading assignments.

- [security-guardrails.md](reference/security-guardrails.md) — non-negotiable rules; check your code against these before every pull request
- [npm-commands.md](reference/npm-commands.md) — every command you'll need, including vitest

## Tutorials

Read these before starting either track. They build on each other — reading order matters.

1. [Serverless functions 101](tutorials/serverless-functions-101.md) — what `insult.mjs` is, how Netlify runs it, and how `netlify.toml` wires it up
2. [ES modules in the browser](tutorials/es-modules-in-the-browser.md) — what `type="module"` does, module scope vs. global scope, and why `.cjs` exists
3. [Environment variables and secrets](tutorials/environment-variables-and-secrets.md) — the three-tier config model, why `SITE_URL` fails closed, and what to do if a key leaks
4. [CORS is hard and everyone hates it](tutorials/cors-is-hard-and-everyone-hates-it.md) — why CORS exists, how the browser enforces it, the five errors you'll actually see, and a hands-on exercise using this repo
5. [Local debugging with DevTools and netlify dev](tutorials/local-debugging-with-devtools-and-netlify-dev.md) — the two-window workflow, reading function logs, and walkthroughs of six real failure modes
6. [Hardening walkthrough — applying each audit fix](tutorials/hardening-walkthrough-applying-each-audit-fix.md) — every security change made to this codebase: CSP, fail-closed CORS, rate limiting, origin checks, and defensive response parsing
7. [CSP for front-end features](tutorials/csp-for-front-end-features.md) — what each CSP directive means and what it blocks; essential before adding any new front-end resource
8. [Graceful degradation — the fallback pattern](tutorials/graceful-degradation-fallback-pattern.md) — the four fallback layers in `insult.mjs` and how to apply the same pattern to new features
9. [Secretlint — keeping secrets out of git](tutorials/secretlint-keeping-secrets-out-of-git.md) — why leaked API keys are dangerous, how the pre-commit hook works, and what to do when secretlint fires
10. [OpenSpec — spec-driven development](tutorials/openspec-spec-driven-development.md) — the five-step propose/spec/approve/implement/verify workflow with example specs for both tracks
11. [TDD with vitest](tutorials/tdd-with-vitest.md) — the red/green cycle, how to test the handler with native `Request`/`Response`, and the three tests to start from
12. [Copilot agent mode](tutorials/copilot-agent-mode.md) — how to launch an agent session, choose Workspace mode, anchor prompts to spec files, and catch drift before it costs you
