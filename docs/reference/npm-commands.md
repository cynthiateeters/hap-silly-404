---
title: "npm commands"
type: reference
tags: [netlify, git]
created: 2026-04-18
updated: 2026-04-18
status: draft
---

# npm commands

Quick reference for every command you'll use in this repo.

## Development commands

- `npm install` — install dev dependencies after cloning, or after adding a new package
- `npm run lint` — run ESLint only; reports problems but does not rewrite files
- `npm run format` — run Prettier and rewrite files to match formatting rules
- `npm run format:check` — check formatting without rewriting; this is what CI runs
- `npm run secretlint` — scan staged and tracked files for accidentally committed secrets
- `npm run check` — runs lint + format:check + secretlint together; run this before every commit
- `npm run dev` — start the local dev server at `http://localhost:8888` with functions support; always use port 8888, not 3999

## Test commands

After adding vitest per `docs/INSTRUCTIONS.md`:

- `npm test` — run all tests once and exit
- `npm run test:watch` — run tests in watch mode; re-runs on every file save during development

## Pre-commit hook note

husky runs `npm run check` automatically when you run `git commit`. If it blocks the commit, read the output — it will tell you exactly which file and which rule failed. Fix the issue, re-stage the file, and commit again. Do not skip the hook with `--no-verify`.
