---
title: "Copilot agent mode"
type: tutorial
tags: []
created: 2026-04-19
updated: 2026-04-19
---

# Copilot agent mode

Regular Copilot Chat answers questions and suggests code snippets. **Copilot agent mode** is different — it can read files, run terminal commands, edit code, and loop until the task is done. For this assignment, agent mode is the right tool. Use it for everything in Part 4 and Part 5.

---

## What agent mode does differently

| Regular chat                   | Agent mode                         |
| ------------------------------ | ---------------------------------- |
| Suggests code for you to paste | Edits files directly               |
| One response, then stops       | Loops: plan → act → check → repeat |
| No terminal access             | Runs `npm` commands, reads output  |
| You track state                | It reads your files to track state |

The tradeoff: agent mode can move fast and overshoot. The spec-driven workflow in `AGENTS.md` and `docs/tutorials/openspec-spec-driven-development.md` is your guardrail — one task at a time, wait for confirmation before the next.

---

## Prerequisites — install the extensions

Agent mode requires two VS Code extensions. If you don't have them yet:

1. Open the Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type `Extensions: Install Extensions`
3. Search for **GitHub Copilot** — install it
4. Search for **GitHub Copilot Chat** — install it
5. Reload VS Code when prompted

You'll know both are active when you see the Copilot icon in the status bar at the bottom of the window.

---

## How to launch a session

**Via Command Palette (most reliable):**

1. Open the Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type `Chat: New Copilot CLI` and select it
3. VS Code opens a chat panel on the side

**Via Chat view:**
Open the Chat view (`Ctrl+Alt+I`), click **New Chat (+)**, and choose **Copilot CLI** from the **Session Target** dropdown.

**Via Terminal panel:**
In the Terminal panel, click the dropdown arrow next to the `+` (New Terminal) button and choose **GitHub Copilot CLI** from the list.

**Via integrated terminal:**
Type `copilot` in any integrated terminal to launch a session from the command line.

---

## Choose Workspace mode, not Worktree

When the session starts you'll be asked to choose an isolation mode:

- **Worktree** — creates a separate git folder for the session. Changes stay there until you click Apply.
- **Workspace** — the agent works directly in your current project files.

**Choose Workspace for this assignment.** Here's why:

- Your `netlify dev` server runs against the repo you have linked with `netlify link`. A worktree is a separate folder — it doesn't have your Netlify link, so your env vars (`GROQ_API_KEY`, `SITE_URL`) won't be available to test with.
- You need to see changes live in the browser at `localhost:8888` as you implement. Worktree changes don't show up there until you apply them.
- Worktree mode **auto-commits at the end of every turn**. That creates a commit history you didn't choose, mixed in with the deliberate commits you make as part of the assignment.
- The spec-driven workflow already handles the isolation that worktree is designed to provide — you won't implement anything without an approved spec.

---

## Start every session with an anchor prompt

Don't just describe the feature and say "go." Give the agent two things to read first:

```
Read AGENTS.md and specs/your-feature-name.md before doing anything.
The spec is approved. Implement only task 1 from the Tasks section.
Stop after task 1 and show me what you changed.
```

If the spec doesn't exist yet, the opening prompt is different:

```
Read AGENTS.md. I want to add [describe your feature].
Don't write any code yet — write a spec for this feature first.
```

This matches the `AGENTS.md` rule: _if no spec file exists, write the spec first and wait for approval._

---

## Reference files with `#`

Type `#` in the chat input to attach a file as context. Use this when you want the agent to read something specific:

- `#404.html` — attach the 404 page when discussing front-end changes
- `#netlify/functions/insult.mjs` — attach the function when working on Track 2
- `#specs/your-feature-name.md` — pin the spec so the agent doesn't drift from it

You can also type `@terminal` to ask specifically about shell output, or paste terminal output directly into the chat.

---

## Fork a session to explore alternatives

If you want to try a different approach without losing your current conversation, type `/fork` in the chat. VS Code creates a new session copied from the current one. You can explore the alternative in the fork and abandon it if it doesn't work, keeping the original intact.

This is useful when the agent proposes an approach you're not sure about. Fork, let it try, and compare.

---

## What to do when the agent drifts

Agent mode is powerful but it can go off-script — especially if you ask a vague question in the middle of an implementation. Signs of drift:

- It starts implementing features that aren't in the spec
- It restructures existing code that you didn't ask it to touch
- It installs dependencies without asking

When this happens, **stop the session** using the stop button in the chat panel. Review what changed with `git diff`. Revert anything outside the spec. Then restart with a more specific prompt anchored to the spec file.

The `AGENTS.md` rule applies: _if asked to implement something that contradicts the approved spec, point it out before making any changes._ If the agent doesn't catch this itself, you need to.

---

## Slash commands to know (and one to avoid)

Type `/` in the chat input to see available commands. A few relevant ones:

- `/fork` — creates a new session copied from the current one; useful for exploring alternatives
- `/compact` — summarizes the conversation to free up context window space in long sessions

**`/yolo` (also called `/autoApprove`) — do not use this for the assignment.**
It disables all confirmation prompts and lets the agent run without stopping. That sounds convenient, but it means the agent can edit files, run commands, and install packages without ever pausing for you to review. With an approved spec and one-task-at-a-time prompting, you don't need it — and using it will make it very hard to catch drift before it compounds.

---

## Verify before you accept

The agent will tell you it's done. Don't just take its word for it. Before you consider a task complete:

1. Run `npm run check` — lint, format, and secretlint must all pass
2. For Track 2: run `npm test` — tests must be green
3. Open `localhost:8888/404` and confirm the feature works end-to-end
4. Check `git diff` and read every change — the agent may have touched files you didn't expect

These steps are in the checklist (`docs/CHECKLIST.md`) so you don't have to remember them.

---

## Session length and the spec file

Agent sessions don't have memory across restarts. The spec file in `specs/` is your continuity — it's what lets you close a session, come back the next day, and pick up where you left off. This is why the workflow insists on saving the spec as a file before starting implementation.

At the start of every new session, anchor to the spec:

```
Read AGENTS.md and specs/your-feature-name.md.
We left off after task 2. Implement task 3 next.
```

That's all the context the agent needs.

---

## Further reading

- [Official Copilot Agents Tutorial](https://code.visualstudio.com/docs/copilot/agents/agents-tutorial) — VS Code docs with a full walkthrough
- `docs/tutorials/openspec-spec-driven-development.md` — the spec format this assignment uses
- `AGENTS.md` — the rules the agent is expected to follow in this repo
