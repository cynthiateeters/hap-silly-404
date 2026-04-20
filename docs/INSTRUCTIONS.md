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

## What you're building - completing both tracks

A minimum of 2 new features, one each for the two tracks:

**Track 1 — front-end feature:** change or add one or more somethings to the 404 page (or both pages) that makes the experience more engaging. Examples: change of html and/or css changing its content and/or look, dark mode toggle, clipboard share button, roast history for the session. You have full creative latitude on what to build. The security guardrails in `docs/reference/security-guardrails.md` apply regardless.

**Track 2 — back-end security feature:** add a security improvement to `netlify/functions/insult.mjs`. Must include vitest tests. Examples: prompt injection prevention via path sanitization, structured error logging, input validation, response caching with fallback. The feature must not weaken any existing security check.

Both tracks follow the same workflow: propose → spec → implement → verify. You don't write code until a spec is approved by you for your agent.

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

## Part 2 — Tooling setup

Before reading the tutorials or starting either track, you need two tools installed and verified: the OpenSpec CLI (drives the spec workflow) and vitest (runs the Track 2 tests). OpenSpec requires Node 20.19 or newer — check first:

```bash
node --version
```

If your Node is older, upgrade before continuing.

### Part 2a — OpenSpec CLI

1. Install OpenSpec globally:

   ```bash
   npm install -g @fission-ai/openspec@latest
   ```

2. Verify it installed:

   ```bash
   openspec --version
   ```

3. Initialize OpenSpec in this repo. The `--tools none` flag skips any tool-specific integrations (we're using Copilot CLI, not Claude Code or Cursor):

   ```bash
   openspec init --tools none
   ```

   This creates three folders: `openspec/specs/` (capability specs promoted by `openspec archive`), `openspec/changes/` (in-progress changes you'll add in Parts 4 and 5), and a small `openspec/config.yaml`. It does NOT create any `.claude/`, `.cursor/`, or `.github/prompts/` folder — Copilot CLI is tool-agnostic, so you drive the workflow via the prompts and rules in Parts 4 and 5 instead.

   The `openspec/` folder is not committed to the starter repo — you just created it in your fork. Every subsequent commit that adds a change will include the relevant `openspec/changes/<name>/` artifacts alongside your code. Those artifact files are the durable evidence that your spec existed before your implementation.

**Why this matters for grading:** in this workflow, `openspec/changes/` and `openspec/changes/archive/` folders in your pushed PR ARE the evidence that the spec existed before the code. This replaces any reliance on private chat history.

### Part 2b — vitest

1. Install vitest as a dev dependency:

   ```bash
   npm install --save-dev vitest
   ```

2. Open `package.json` and add two entries to the `scripts` block:

   ```json
   "test": "vitest run",
   "test:watch": "vitest"
   ```

   The `tests/` folder is already in the repo — that's where your vitest files go.

3. Run vitest to confirm the setup:

   ```bash
   npx vitest run
   ```

   It should report zero tests found and exit cleanly. That is correct — you haven't written any yet. (Bare `npx vitest` enters watch mode and hangs; always use `vitest run` when you want it to exit.)

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

You will run the OpenSpec workflow twice here:

- **Part 4A** — a PoC dry run (`homepage-404-button`), same feature for everyone. Purpose: prove the workflow before you trust it with your real feature.
- **Part 4B** — your real Track 1 feature, using the `AGENTS.md` rule instead of a paste-in prompt.

A full finished example lives at `docs/examples/openspec-dark-mode-toggle/` — open those four files before starting if you want to see what a completed change looks like.

### Part 4A — dry run: `homepage-404-button` (everyone)

The feature: a button on `index.html` that links to a known-bad URL so a visitor can click through to the 404 roast without typing a broken path. Scope is deliberately tiny — label text, target URL, whether it opens in a new tab, `aria-label`. The point is that every student's result should land in roughly the same place. That convergence proves the workflow.

Workflow:

1. In one terminal, start the dev server and leave it running:

   ```bash
   npm run dev
   ```

2. In another terminal, scaffold the change folder:

   ```bash
   openspec new change homepage-404-button
   ```

3. Start a Copilot CLI session in the repo. Execute the prompt file:

   ```bash
   execute ./prompts/homepage-404-button.md
   ```

   Open `prompts/homepage-404-button.md` and read it — that file **is** the prompt. This is the point: a prompt can live in version control just like code. You'll use it once here, then use the `AGENTS.md` rule shortcut for every feature after this.

4. Answer any clarifying questions the agent asks. Then read each artifact as it's written. Check each one:
   - `openspec/changes/homepage-404-button/proposal.md` — does it match what you want?
   - `openspec/changes/homepage-404-button/specs/<cap>/spec.md` — are the BDD scenarios testable?
   - `openspec/changes/homepage-404-button/design.md` — are the Non-Goals reasonable?
   - `openspec/changes/homepage-404-button/tasks.md` — would you be able to check these off one at a time?

5. Run validation manually to confirm:

   ```bash
   openspec validate homepage-404-button
   ```

6. **Stop here.** The PoC is the artifact set, not a live button. Do not `apply` yet. The purpose of 4A is to verify the workflow before you trust it with your real feature. Keep the `openspec/changes/homepage-404-button/` folder around — it's part of your PR evidence.

### Part 4B — your Track 1 feature

Pick a frontend feature that's NOT `homepage-404-button` and NOT the `dark-mode-toggle` example. Ideas: clipboard share button, roast history for the session, keyboard-only refresh, fun hover animation.

Workflow — shorter, because you've seen it once:

1. Scaffold:

   ```bash
   openspec new change <your-feature-slug>
   ```

   The slug is kebab-case (e.g., `clipboard-share-button`).

2. In Copilot CLI, say:

   ```
   propose <your-feature-slug>
   ```

   The `AGENTS.md` rule directs the agent to `docs/reference/opsx-propose-algorithm.md`, which drives the same loop you ran in 4A.

3. Review the artifacts. Edit any that are wrong — the agent proposed them, you own them. Commit the artifacts (they belong in the same PR as your code).

4. In Copilot CLI, say:

   ```
   apply <your-feature-slug>
   ```

   Follow the algorithm in `docs/reference/opsx-apply-algorithm.md`: one task at a time, review and commit between each.

5. When all tasks are checked and you're satisfied, archive the change:

   ```bash
   openspec archive <your-feature-slug> --yes
   ```

   This moves the change to `openspec/changes/archive/<YYYY-MM-DD>-<slug>/` and promotes the spec into `openspec/specs/`. Commit the archive move — it's the durable audit trail.

6. Run `npm run check`. Fix anything it reports.

---

## Part 5 — Track 2: back-end security feature

Same `propose` + `apply` mechanism as Part 4B. The new thing in Track 2 is the BDD scenarios in `spec.md` — you turn each scenario into a vitest test, and you write those tests FIRST, before the implementation.

Examples of Track 2 features: prompt injection prevention via path sanitization, structured error logging, input validation, response caching with fallback. The feature must not weaken any existing security check — see `docs/reference/security-guardrails.md` and the handler order in `AGENTS.md`.

Workflow:

1. Scaffold:

   ```bash
   openspec new change <your-security-feature-slug>
   ```

2. In Copilot CLI, say:

   ```
   propose <your-security-feature-slug>
   ```

   When the agent asks clarifying questions, be explicit that it must:
   - Review the handler order in `AGENTS.md` and state which step the new logic slots into.
   - Produce BDD scenarios that are testable with vitest — each scenario should map to one `it()` block.

3. Review the artifacts carefully. Confirm:
   - Every scenario in `specs/<cap>/spec.md` is testable with vitest.
   - `tasks.md` has a task for writing tests before the implementation task.
   - `design.md` explicitly names the security property being preserved (e.g., "origin check remains the first gate").

4. Commit the artifacts. Then in Copilot CLI, say:

   ```
   apply <your-security-feature-slug>
   ```

   The `AGENTS.md` rule directs the agent to `docs/reference/opsx-apply-algorithm.md`, which requires a red-first test cycle for Track 2. For each task:
   - If it's a test task, the agent writes the test from the scenario. Run `npm run test:watch` and confirm red.
   - If it's an implementation task, the agent writes the minimum code to make the previously-red test pass. Watch it go green.
   - The agent checks the box in `tasks.md` only after tests and `npm run check` pass.
   - The agent commits one task at a time and stops for your review.

5. When all tasks are checked:

   ```bash
   npm test && npm run check
   ```

   Both must be green.

6. Archive:

   ```bash
   openspec archive <your-security-feature-slug> --yes
   ```

   Commit the archive move.

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
- `openspec/changes/homepage-404-button/` (PoC artifacts from Part 4A) committed in your PR
- `openspec/changes/archive/<date>-<track-1-slug>/` and `openspec/changes/archive/<date>-<track-2-slug>/` present, showing your spec existed before your implementation
