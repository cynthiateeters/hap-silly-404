---
title: "Assignment checklist"
type: checklist
tags: []
created: 2026-04-18
updated: 2026-04-18
---

# Assignment checklist

## Before you clone (do these on GitHub and Netlify first)

- [ ] Groq API key generated at console.groq.com — not shared with any AI tool
- [ ] Repo forked to your GitHub account
- [ ] Netlify site created
- [ ] `GROQ_API_KEY` added to Netlify dashboard environment variables
- [ ] `SITE_URL` added to Netlify dashboard environment variables
- [ ] Node 20.19+ confirmed (`node --version`)
- [ ] Netlify CLI installed (`npm install -g netlify-cli`)
- [ ] OpenSpec CLI installed (`npm install -g @fission-ai/openspec@latest`)

## Part 1 — Clone and verify locally

- [ ] Repo cloned and `npm install` run
- [ ] `netlify login` and `netlify link` completed
- [ ] `netlify dev` running
- [ ] DevTools → Network → `insult` request shows `"source": "groq"`
- [ ] Read `AGENTS.md`

## OpenSpec CLI

- [ ] `openspec --version` prints a version number
- [ ] `openspec init --tools none` run in the repo
- [ ] `openspec/specs/` and `openspec/changes/` folders exist

## Vitest

- [ ] Run `npm install --save-dev vitest`
- [ ] Add `"test": "vitest run"` to `package.json` scripts
- [ ] Add `"test:watch": "vitest"` to `package.json` scripts
- [ ] `tests/` folder exists
- [ ] Run `npx vitest run` — confirm it exits cleanly (zero tests is fine; bare `npx vitest` enters watch mode and hangs)

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
- [ ] `docs/tutorials/copilot-agent-mode.md`
- [ ] `docs/tutorials/copilot-cli-the-real-thing.md`

## Part 4A — PoC dry run (everyone)

- [ ] `openspec new change homepage-404-button` run
- [ ] `execute ./prompts/homepage-404-button.md` run in Copilot CLI
- [ ] Four artifacts present under `openspec/changes/homepage-404-button/`
- [ ] `openspec validate homepage-404-button` passes
- [ ] Artifacts reviewed; NO implementation started (the artifacts are the deliverable for 4A)

## Track 1 — front-end feature (Part 4B)

- [ ] `openspec new change <your-feature-slug>` run
- [ ] `propose <your-feature-slug>` run in Copilot CLI (AGENTS.md rule)
- [ ] Artifacts reviewed and edited
- [ ] `openspec validate <your-feature-slug>` passes
- [ ] `apply <your-feature-slug>` — one task at a time, committed between each
- [ ] `openspec archive <your-feature-slug> --yes` run
- [ ] `npm run check` passes
- [ ] Any permanent constraints added to `AGENTS.md`

## Track 2 — back-end security feature

- [ ] `openspec new change <your-security-feature-slug>` run
- [ ] `propose <your-security-feature-slug>` run; scenarios verified as testable
- [ ] `openspec validate <your-security-feature-slug>` passes
- [ ] Tests written before implementation (TDD) — red-first, green after
- [ ] `apply <your-security-feature-slug>` — one task at a time
- [ ] `openspec archive <your-security-feature-slug> --yes` run
- [ ] `npm test` passes
- [ ] `npm run check` passes
- [ ] Any permanent constraints added to `AGENTS.md`

## Submit

- [ ] Both features deployed to Netlify
- [ ] Share your Netlify deploy URL
