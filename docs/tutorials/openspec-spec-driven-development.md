---
title: "Spec-driven development with OpenSpec and Copilot CLI"
type: tutorial
tags: [ai-workflow, openspec, copilot-cli, sdd]
created: 2026-04-18
updated: 2026-04-20
reading_order: 10
---

# Spec-driven development with OpenSpec and Copilot CLI

## Before you read this

You'll get the most out of this if you've already:

- Used GitHub Copilot Chat (or another AI coding assistant) at least once
- Read `docs/reference/security-guardrails.md`
- Noticed that AI agents sometimes generate code you didn't ask for
- Installed the OpenSpec CLI per `docs/INSTRUCTIONS.md` Part 2a

---

## Why specs exist

When you tell an AI agent "add a dark mode toggle," it has to make dozens of decisions you haven't made: which files to touch, which CSS approach to use, how to persist the preference, whether to add a new dependency, how to handle the case where the browser doesn't support `prefers-color-scheme`. The agent will guess. Some guesses will be right. Some will quietly violate a security rule or drag in a library you don't want.

A spec is a short document that answers those questions before any code is written. It's not a PRD (that's for stakeholders to agree on what to build). It's not a design doc (that's for engineers to debate architecture). It's an execution document written specifically for the agent — clear enough that the agent doesn't have to guess, precise enough that you can check the output against it.

The core idea: you define what you want, the agent implements it, you verify it matches. The spec is the contract between those two steps.

---

## What OpenSpec adds on top

The older, informal workflow was one file: `specs/<feature>.md` with five sections. You wrote it in a chat window and saved it manually. That works fine for a single developer making a handful of decisions — but it doesn't scale past a few features, and it has no machine-readable structure.

OpenSpec formalizes the shape of a spec into four artifacts, each with a specific job:

- `proposal.md` — the "why" and the scope summary. What's changing, which capabilities are new or modified, what files are impacted.
- `design.md` — context, goals, non-goals, decisions, risks, migration plan, open questions. The engineer's reasoning.
- `tasks.md` — numbered, checkbox-tracked list of the implementation work.
- `specs/<capability>/spec.md` — the requirements themselves, written as BDD scenarios (`WHEN / THEN`) under `## ADDED Requirements` or `## MODIFIED Requirements`. This is what OpenSpec validates and what gets archived into the durable `openspec/specs/` folder when the change ships.

OpenSpec also provides a CLI: `openspec new change`, `openspec status --json`, `openspec instructions <artifact> --json`, `openspec validate`, and `openspec archive`. These commands give any CLI agent a machine-readable contract to drive the workflow. That's why the workflow can move out of Claude Code or Cursor and into GitHub Copilot CLI without losing anything important.

A full, finished example lives at `docs/examples/openspec-dark-mode-toggle/` — four files you can read right now to see what a completed change looks like.

---

## The four artifacts

### `proposal.md`

The scope summary. Answers: why, what changes, which capabilities are new or modified, what files are impacted.

Excerpt from `docs/examples/openspec-dark-mode-toggle/proposal.md`:

```markdown
## Why

The site currently has no dark mode support. Adding a persistent dark mode
toggle improves readability in low-light environments and matches modern user
expectations across both the landing page and the 404 page.

## What Changes

- Add a dark/light mode toggle button in the top corner of all pages
- Add dark mode CSS custom property overrides
- Persist the user's preference to localStorage
```

When reviewing: does the Why match your intent? Are the What Changes items all things you asked for, and nothing more?

### `design.md`

The engineering reasoning. Goals vs. non-goals, decisions with alternatives considered, risks and trade-offs.

Excerpt from `docs/examples/openspec-dark-mode-toggle/design.md`:

```markdown
**Goals:**

- Toggle button visible in the top corner of both pages
- Dark mode color overrides via a `.dark` class on `<html>`
- Respect `prefers-color-scheme: dark` on first visit

**Non-Goals:**

- Animated transitions between themes
- Per-page color customization
- Server-side theme detection
```

When reviewing: is anything in Non-Goals something you actually wanted? If so, the spec is wrong — edit it before approving.

### `tasks.md`

The numbered work list with checkboxes.

Excerpt from `docs/examples/openspec-dark-mode-toggle/tasks.md`:

```markdown
## 1. CSS Dark Mode Overrides

- [ ] 1.1 Add `.dark` class overrides for all `--hap-*` custom properties
- [ ] 1.2 Style the toggle button

## 2. Theme Init Script

- [ ] 2.1 Write inline `<script>` in `<head>` that reads localStorage
      and applies `.dark` before first paint
```

When reviewing: would you be able to check these off one at a time? If a task feels like "rewrite half the app," split it.

### `specs/<capability>/spec.md`

The requirements as BDD scenarios. This is the artifact OpenSpec actually validates.

Excerpt from `docs/examples/openspec-dark-mode-toggle/specs/dark-mode-toggle/spec.md`:

```markdown
### Requirement: Toggle switches theme

Clicking the toggle button SHALL switch the active theme between light and dark.

#### Scenario: Switch to dark mode

- **WHEN** the page is in light mode and the user clicks the toggle
- **THEN** the page switches to dark mode immediately
```

When reviewing: can each scenario be turned into a test? If a scenario is too fuzzy to test, it's too fuzzy to implement.

---

## The `--json` contract

The mechanism that lets any CLI agent drive the workflow is `openspec instructions <artifact> --change <name> --json`. Every artifact request returns a structured payload the agent consumes:

```json
{
  "changeName": "dark-mode-toggle",
  "artifactId": "proposal",
  "outputPath": "proposal.md",
  "description": "The why and scope summary for this change",
  "template": "## Why\n\n<!-- one paragraph -->\n\n## What Changes\n\n...",
  "context": "Project background the agent should know",
  "rules": ["Every proposal must name the new or modified capabilities"],
  "dependencies": [],
  "unlocks": ["specs", "design"]
}
```

The agent reads this JSON, applies `context` and `rules` as constraints on what it writes, uses `template` as the structural guide, and writes the result to `outputPath`. `context` and `rules` are instructions for the writer — they do not get pasted into the output file.

That's the whole contract. No Claude-specific tooling, no vendor SDK. Any shell-capable agent can drive it.

---

## The Copilot CLI loop

In Claude Code, a slash command like `/opsx:propose` would bookmark this algorithm — press the shortcut, the agent runs the loop. Copilot CLI has no equivalent arbitrary-prompt slash mechanism, so you emulate it two ways:

**Option A — prompt file.** You run `execute ./prompts/homepage-404-button.md` in the Copilot CLI. The file contains the algorithm verbatim — open it and read it before you run it. This is the point: a prompt is just text, and text can live in version control. Used in the PoC dry run (Part 4A) so you see exactly what the agent is being told before you hand that responsibility to `AGENTS.md`.

**Option B — AGENTS.md rule.** You add a rule to `AGENTS.md` that says "when the user says 'propose X', follow `docs/reference/opsx-propose-algorithm.md`." Used in Tracks 1B and 2, where the algorithm is already in a reference doc and the `AGENTS.md` rule is the shortcut.

The mental model: the slash command in Claude Code was never the thing doing the work. It was a bookmark — "run this prompt, follow its algorithm." The algorithm is `openspec new change` → loop `openspec instructions <artifact> --json` + write file → `openspec validate`. That algorithm runs anywhere, including in a Copilot CLI prompt. What you lose without the slash command is the shortcut. What you keep is the whole mechanism.

---

## The three-pass scaffolding

You will run the same workflow three times before it matters.

- **Pass 1A — PoC `homepage-404-button`.** Everyone builds the same tiny feature (a button on the landing page that links to a known-bad URL so visitors can trigger the 404). You run `execute ./prompts/homepage-404-button.md` — read that file before you run it. The purpose is to prove the workflow, not to ship a feature. If every student's proposal lands in roughly the same place, the workflow is working. You do NOT implement this one — the artifacts are the deliverable.
- **Pass 1B — Track 1, your real frontend feature.** You pick the feature. You use the `AGENTS.md` rule: `propose <your-feature-slug>`. You own the ambiguity. Now you implement it with `apply`.
- **Pass 2 — Track 2, backend security feature.** Same `propose` + `apply` mechanism. The new thing in Track 2 is the Tests section of `spec.md` and a TDD cycle driven by the scenarios. The workflow is muscle memory by now; your cognitive load goes to the security content and the red-green discipline.

Convergence first (prove the mechanism with a fixed feature), then ownership (you pick), then content (new concepts layered on known mechanics).

---

## How to redirect the agent when it skips steps

Agents drift. The redirects are direct:

- **"Stop — don't write code. You're in the propose phase. Write the artifacts first."**
  Use when the agent starts editing `.js` / `.html` / `.css` files before `tasks.md` exists.

- **"Stop — you checked off a task but tests are still red. Unstage that and finish the task properly."**
  Use when a Track 2 task is marked done with a failing test.

- **"Stop — the spec isn't validated yet. Run `openspec validate` before starting apply."**
  Use when the agent jumps from writing artifacts to writing code without the validation step.

- **"Stop — that's in the Non-Goals section. Don't implement it."**
  Use when the agent "helpfully" adds something the spec said not to.

---

## Try it

Open two terminals. In one, `npm run dev`. In the other, work through Part 4A of `docs/INSTRUCTIONS.md` — the `homepage-404-button` PoC. It's the first time you'll run the full loop, and it's designed so every student's result looks roughly the same. If yours does, the workflow is working and you can trust it for your real features in Tracks 1B and 2.

---

## The three things to remember

1. **The spec is yours, not the agent's.** OpenSpec writes the artifacts; you review, edit, and approve them. If the implementation doesn't match the spec, the spec wins — and if the spec is wrong, you edit it before continuing.
2. **One task per commit.** `apply` goes task-by-task, never batched. Small diffs stay reviewable; large diffs get merged unread.
3. **Constraints still matter.** The spec's Non-Goals and the repo's `AGENTS.md` rules are the guardrails that keep the agent honest. When the agent volunteers something you didn't ask for, the answer is almost always "no — that's out of scope for this change."
