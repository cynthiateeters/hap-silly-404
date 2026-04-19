---
title: "Assignment instructions"
type: instructions
tags: []
created: 2026-04-18
updated: 2026-04-18
---

# Assignment instructions

This is a real codebase — a Netlify-deployed 404 page backed by a serverless function. You're adding features to it, not building something from scratch. Read the code before you write any.

---

## What you're building

Two features, one each for two tracks:

**Track 1 — front-end feature:** add something to the 404 page (or both pages) that makes the experience more engaging. Examples: dark mode toggle, clipboard share button, roast history for the session. You have full creative latitude on what to build. The security guardrails in `docs/reference/security-guardrails.md` apply regardless.

**Track 2 — back-end security feature:** add a security improvement to `netlify/functions/insult.mjs`. Must include vitest tests. Examples: prompt injection prevention via path sanitization, structured error logging, input validation, response caching with fallback. The feature must not weaken any existing security check.

Both tracks follow the same workflow: propose → spec → implement → verify. You don't write code until a spec is approved.

---

## Before you start

If you're reading this locally, you should already have:

- A Groq API key generated at [console.groq.com](https://console.groq.com)
- This repo forked to your GitHub account
- A Netlify site created with `GROQ_API_KEY` and `SITE_URL` set in the dashboard
- The Netlify CLI installed (`npm install -g netlify-cli`)

If any of those aren't done yet, stop and follow the setup steps in `README.md` first.

---

## Part 1 — Clone and verify locally

If you are reading this file in your editor, you have already cloned the repo. Skip step 1 and start at step 2.

Everything in this part is setup and verification. Do not start the tutorials or either track until the local dev server is returning live roasts. If something doesn't work, **stop and troubleshoot before continuing** — a broken local environment will cause confusing failures throughout the assignment.

1. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/hap-silly-404.git
   cd hap-silly-404
   ```

2. Install dev dependencies:

   ```bash
   npm install
   ```

3. Log in to the Netlify CLI and link to your Netlify site:

   ```bash
   netlify login
   netlify link
   ```

   Choose "Use current git remote origin" when prompted. This is what pulls your `GROQ_API_KEY` from the Netlify dashboard into your local dev session.

4. Start the local dev server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:8888/404`. You should see the HAP 404 page load with a roast. Now confirm the backend is actually working — roasts look the same whether they're live or canned, so you need to check two things:

   **Check 1 — the network response:**
   Open DevTools (F12) → Network tab → reload the page → click the `insult` request → Preview. You should see:

   ```json
   { "insult": "...", "source": "groq" }
   ```

   If `source` is `"fallback"` instead of `"groq"`, the Groq API call failed. The function is running but the key isn't reaching it.

   **Check 2 — the netlify dev terminal:**
   Look at the terminal where `netlify dev` is running. A successful Groq call produces no warning output. If you see `Groq API returned 401` or `Groq API returned 403`, the key is wrong or missing. If you see `SITE_URL is not set`, the environment variable wasn't picked up.

   **Do not proceed past this step until `source` is `"groq"`.** A broken API connection will cause confusing failures throughout the assignment. If you're stuck, run `netlify status` to confirm the site is linked, then check the Netlify dashboard to confirm both `GROQ_API_KEY` and `SITE_URL` are set. See `docs/tutorials/local-debugging-with-devtools-and-netlify-dev.md` for a full debugging walkthrough.

   **If the page doesn't load at all:** wrong port is the most common cause — use 8888, not 3999. Check the `netlify dev` terminal for function crash output.

6. Read `AGENTS.md` before opening Copilot Chat. It is the contract between you and your AI agent. The security rules in it are non-negotiable.

---

## Part 2 — Add vitest

Before reading the tutorials or starting either track, get vitest running:

1. Install vitest as a dev dependency:

   ```bash
   npm install --save-dev vitest
   ```

2. Open `package.json` and add two entries to the `scripts` block:

   ```json
   "test": "vitest run",
   "test:watch": "vitest"
   ```

   Both `tests/` and `specs/` folders are already in the repo. `tests/` is where your vitest files go. `specs/` is where your approved spec files go, one per feature.

3. Run vitest to confirm the setup:

   ```bash
   npx vitest
   ```

   It should start and report zero tests found. That is correct — you haven't written any yet.

4. Read `docs/tutorials/tdd-with-vitest.md` before writing any tests.

---

## Part 3 — Read the tutorials

Read all of these before starting either track. They build on each other — reading order matters.

1. `docs/tutorials/serverless-functions-101.md` — what `insult.mjs` is and how Netlify runs it; essential context for Track 2
2. `docs/tutorials/es-modules-in-the-browser.md` — why `type="module"` matters and what module scope means for your code
3. `docs/tutorials/environment-variables-and-secrets.md` — the three-tier config model: dashboard, `netlify dev`, `process.env`
4. `docs/tutorials/cors-is-hard-and-everyone-hates-it.md` — why CORS exists, the five errors you'll see, and how this repo handles it
5. `docs/tutorials/local-debugging-with-devtools-and-netlify-dev.md` — the two-window workflow, how to read function logs, six real failure mode walkthroughs
6. `docs/tutorials/hardening-walkthrough-applying-each-audit-fix.md` — every security change made to this codebase and why; read this before Track 2
7. `docs/tutorials/csp-for-front-end-features.md` — what the CSP means for every new script, style, image, or fetch you add; essential context for Track 1
8. `docs/tutorials/graceful-degradation-fallback-pattern.md` — the four fallback layers in `insult.mjs`; how to apply the pattern to new features
9. `docs/tutorials/secretlint-keeping-secrets-out-of-git.md` — how the pre-commit hook works and what to do when it fires
10. `docs/tutorials/openspec-spec-driven-development.md` — the spec workflow and how to use Copilot within it
11. `docs/tutorials/tdd-with-vitest.md` — the red/green cycle, test setup, and the three tests you'll use as a starting point
12. `docs/tutorials/copilot-agent-mode.md` — how to launch an agent session, anchor it to a spec, and catch drift before it costs you
13. `docs/tutorials/copilot-cli-the-real-thing.md` — the mental model shift, the four slash commands, instructions files, and a practice run of the full spec-driven workflow

---

## Part 4 — Track 1: front-end feature

1. Open a Copilot agent session (see `docs/tutorials/copilot-agent-mode.md`). Use this opening prompt:

   ```
   Read AGENTS.md. I want to add [describe your feature idea].
   Don't write any code yet — write a spec for this feature first.
   ```

2. Review the spec against `docs/reference/security-guardrails.md`. Edit it until it's right. Then save it as a file — `specs/your-feature-name.md` — and approve it explicitly in writing: "looks good, let's implement." The agent reads this file at the start of each session, so it doesn't lose context between sessions.

3. Start a new agent session anchored to the spec:

   ```
   Read AGENTS.md and specs/your-feature-name.md before doing anything.
   The spec is approved. Implement only task 1 from the Tasks section.
   Stop after task 1 and show me what you changed.
   ```

4. Confirm each task before moving to the next. CSS, HTML, and client-side JavaScript are yours to redesign as needed. The security guardrails apply regardless of what you build.

5. Run `npm run check`. Fix anything it reports. The pre-commit hook runs this automatically on `git commit`, but running it manually first saves time.

---

## Part 5 — Track 2: back-end security feature

1. Open a Copilot agent session. Use this opening prompt:

   ```
   Read AGENTS.md. I want to add a security improvement to insult.mjs.
   Review the handler order in AGENTS.md before proposing anything.
   Don't write any code yet — write a spec first.
   ```

2. The spec must include a Tests section listing what each test covers. See `docs/tutorials/openspec-spec-driven-development.md` for an example.

3. Review the spec against `docs/reference/security-guardrails.md`. Save it as `specs/your-feature-name.md` and approve it before any code is written.

4. Write the tests first. Create a test file in `tests/`. Run `npm run test:watch` and confirm the tests fail (red) before you write the implementation.

5. Implement the feature against the spec. Watch the tests go green.

6. Run `npm test` and `npm run check`. Both must pass before you consider the feature complete.

---

## Keeping AGENTS.md current

`AGENTS.md` is a living document. It starts as a set of rules for this repo. It should grow as you work.

After you finish each spec, look at the constraints you wrote in the "out of scope" section. If any of those constraints should apply permanently — not just to this feature — add them to `AGENTS.md` as rules. Copilot reads this file at the start of every session. Rules you add now prevent the same mistake in the next session.

Effective rules are specific and include a reason. Compare:

```
# vague — Copilot will interpret this loosely
Don't break the security stuff.

# effective — Copilot knows exactly what to do and why
Never pass unsanitized URL path values into the Groq prompt string —
prompt injection is a real attack vector even in a 404 page.
```

Useful patterns to follow:

- `Never [action] — [one-line reason]`
- `Always [action] before [trigger]`
- `If [condition], [action] instead of [default]`
- `When adding [thing], insert at [location] rather than [alternative]`

You don't need to add a rule after every commit. Add one when you catch yourself making the same decision twice, when something went wrong and you want to prevent a repeat, or when a spec constraint feels permanent enough to belong here.

---

## Deliverables

- Track 1 feature live on your Netlify deploy URL
- Track 2 feature with passing vitest tests
- `npm run check` passes (no lint, format, or secretlint errors)
- `npm test` passes
- Your spec existed before your implementation — Copilot Chat history is sufficient evidence
