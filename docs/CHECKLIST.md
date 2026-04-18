---
title: "Assignment checklist"
type: checklist
tags: []
created: 2026-04-18
updated: 2026-04-18
---

# Assignment checklist

## Before you start

- [ ] Groq API key generated at console.groq.com
- [ ] Repo forked on GitHub
- [ ] Netlify site created
- [ ] `GROQ_API_KEY` added to Netlify dashboard environment variables
- [ ] `SITE_URL` added to Netlify dashboard environment variables
- [ ] Netlify CLI installed (`npm install -g netlify-cli`)

## Part 1 — Clone and verify locally

- [ ] Repo cloned and `npm install` run
- [ ] `netlify login` and `netlify link` completed
- [ ] `netlify dev` running
- [ ] `http://localhost:8888/404` loads with a **live** roast (not a canned fallback)
- [ ] Read `AGENTS.md`

## Vitest and specs

- [ ] Run `npm install --save-dev vitest`
- [ ] Add `"test": "vitest run"` to `package.json` scripts
- [ ] Add `"test:watch": "vitest"` to `package.json` scripts
- [ ] Confirm `tests/` and `specs/` folders exist (both ship with the repo)
- [ ] Run `npx vitest` — confirm it starts (zero tests is fine)

## Read tutorials (check off as you read)

- [ ] `docs/tutorials/serverless-functions-101.md`
- [ ] `docs/tutorials/es-modules-in-the-browser.md`
- [ ] `docs/tutorials/environment-variables-and-secrets.md`
- [ ] `docs/tutorials/cors-is-hard-and-everyone-hates-it.md`
- [ ] `docs/tutorials/local-debugging-with-devtools-and-netlify-dev.md`
- [ ] `docs/tutorials/hardening-walkthrough-applying-each-audit-fix.md`
- [ ] `docs/tutorials/csp-for-front-end-features.md`
- [ ] `docs/tutorials/graceful-degradation-fallback-pattern.md`
- [ ] `docs/tutorials/secretlint-keeping-secrets-out-of-git.md`
- [ ] `docs/tutorials/openspec-spec-driven-development.md`
- [ ] `docs/tutorials/tdd-with-vitest.md`

## Track 1 — front-end feature

- [ ] Feature idea proposed in Copilot Chat
- [ ] Spec written by Copilot and reviewed by you
- [ ] Spec saved as `specs/your-feature-name.md`
- [ ] Spec approved before any code written
- [ ] Feature implemented
- [ ] `npm run check` passes
- [ ] Any permanent constraints added to `AGENTS.md`

## Track 2 — back-end security feature

- [ ] Feature idea proposed in Copilot Chat
- [ ] Spec written by Copilot and reviewed by you
- [ ] Spec saved as `specs/your-feature-name.md`
- [ ] Spec approved before any code written
- [ ] Tests written before implementation (TDD)
- [ ] Feature implemented
- [ ] `npm test` passes
- [ ] `npm run check` passes
- [ ] Any permanent constraints added to `AGENTS.md`

## Submit

- [ ] Both features deployed to Netlify
- [ ] Share your Netlify deploy URL
