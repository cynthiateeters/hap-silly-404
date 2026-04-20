---
title: "Copilot CLI — the real thing"
type: tutorial
tags: []
created: 2026-04-19
updated: 2026-04-19
---

# Copilot CLI — the real thing

## Before you read this

You'll get the most out of this if you've already:

- Used GitHub Copilot in VS Code as autocomplete or chat at least once
- Run `npm test` or `npm run dev` in a terminal — you're comfortable enough with the terminal that it doesn't feel hostile
- Read `AGENTS.md` in this repo — you know what spec-driven workflow means

You don't need to understand agents deeply. By the end of this tutorial you'll have one running.

---

## What most people think Copilot is

Copilot started as autocomplete — it watches you type and suggests the next line. That's useful. Then GitHub added Copilot Chat — a sidebar where you ask questions and it suggests code snippets you paste in. Also useful. Most students use one or both of these and call it a day.

Those tools are passive. They wait for you and hand things back to you. You do the work.

**Copilot CLI is different.** It is an agent — a background process that reads your files, writes code, runs commands, checks the output, and loops until the job is done. You give it a task. It works. You review what it built.

The last video in the official beginner series dropped three days ago. This is not a mature, settled technology with a Wikipedia article and ten books about it. You are learning this at the same time as everyone else. That includes most working developers.

---

## The mental model shift

Here's the shift you need to make:

| Copilot Chat (sidebar)       | Copilot CLI (agent)                                       |
| ---------------------------- | --------------------------------------------------------- |
| You ask, it suggests         | You assign, it acts                                       |
| You paste each change        | It edits files directly                                   |
| It stops after each response | It loops: act → check → fix → repeat                      |
| Closes when VS Code closes   | Keeps running in the background                           |
| Remembers your conversation  | Remembers your conversation _and_ reads your actual files |

The last row matters most. Copilot CLI doesn't just remember what you told it — it reads `AGENTS.md`, it reads your spec files, it reads the function it's about to modify. It builds context from the repo, not just from the chat history.

---

## How to launch a session

You need nothing beyond the VS Code GitHub Copilot extension. VS Code installs the CLI agent automatically — no separate `npm install` required.

**From the Command Palette (most reliable):**

1. Open the Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type `Chat: New Copilot CLI Session`
3. Press Enter

**From the Terminal panel:**

In the Terminal panel, click the dropdown arrow next to the `+` (New Terminal) button and choose **GitHub Copilot CLI** from the list.

**From any integrated terminal:**

Type `copilot` and press Enter. That's it.

All three paths launch the same agent. The Chat panel and the terminal are two windows into the same background process.

---

## Your first session — try this now

Open a Copilot CLI session in this repo and type:

```
Give me an overview of this project.
```

Copilot will open and read key files — `AGENTS.md`, `404.html`, `netlify/functions/insult.mjs`, `package.json` — and give you a summary. It isn't hallucinating a description. It's reading your actual code.

Then type:

```
What does the insult function do when GROQ_API_KEY is not set?
```

Watch it find the fallback logic in `insult.mjs` and explain it. You didn't tell it where to look. It looked.

This is what "agent" means — it has tools, and it uses them.

---

## The folder trust prompt

The first time you run the CLI in a directory, it will ask:

> Do you want to allow Copilot to access and potentially modify files in this folder?

This is not an error. It is not a broken install. It is the CLI asking for the permission it needs to read and edit your project files. Choose **Allow** (or **Always allow for this folder** to skip the prompt next time).

---

## Isolation mode — choose Workspace

When you start a CLI session from the VS Code Chat panel, it asks you to choose an isolation mode:

- **Workspace** — the agent works directly in your project folder
- **Worktree** — the agent creates a separate copy of your project folder

> **What's a worktree?**
>
> Git can give you more than one working folder pointing at the same repo. A worktree is a second folder — a scratch copy — where the agent makes changes without touching your main folder. Sounds safer. But for this project it creates a hard problem: the scratch copy doesn't have your Netlify CLI link, so it can't reach `GROQ_API_KEY` or `SITE_URL`. The agent would be building code it can never actually run.

**Choose Workspace.**

After choosing Workspace, set the permission level to **auto-approve**. This lets the agent run `npm` commands — `npm test`, `npm run check`, `npm run dev` — without you clicking a confirmation button on every one. Without it, a three-step task turns into twenty button clicks. If you can't find the toggle in the UI, type `/yolo` (or its alias `/autoApprove`) at the start of your session — it enables the same permission level from the command line.

---

## The four slash commands you'll actually use

Inside a session, type `/` to see all available commands. Most of them you won't need. These four you will:

### `/compact`

The agent has a context window — a limit on how much conversation it can hold at once. In a long session it will fill up. `/compact` summarizes the conversation so far and reclaims space without ending the session.

Run it when you're about to switch from one part of the task to another — for example, after Track 1 is done and you're starting Track 2. If you don't, the agent may lose important context from earlier in the session.

Copilot also runs this automatically when the limit is near. When it does, important constraints you stated earlier may get summarized away. If the agent starts behaving as if it forgot a rule, restate it.

### `/diff`

Shows every file change the agent has made in the current session.

Run this before every `git commit`. It's your "did the agent touch something I didn't ask it to?" check. Agents are thorough. They sometimes fix things you didn't ask them to fix. That sounds good until you realize you don't know what changed.

### `/context`

Shows your current token usage — how full the context window is. Use it before starting a complex task. If you're near the limit, run `/compact` first.

### `/reset-allowed-tools`

Revokes any permissions you've granted the agent during the session — like file-edit access or terminal access — without ending the session. Use this if you accidentally approved something broad and want to restore the default confirmation prompts.

---

## Instructions files — you already have one

This is the part of Copilot CLI that most people discover last. It's the most important part for this assignment.

Copilot CLI reads **instructions files** at the start of every session. The main one is `.github/copilot-instructions.md` — a markdown file that tells the agent how to behave in this project: what conventions to follow, what rules to never break, what order to do things in. This repo uses the interchangeable `AGENTS.md` convention instead — Copilot CLI reads either name, so there is no `.github/copilot-instructions.md` file here and you won't find one if you search.

You already have one. It's called `AGENTS.md`.

When you run a CLI session in this repo, the agent reads `AGENTS.md` before doing anything else. Every hard security rule in that file — "never set `Access-Control-Allow-Origin: *`", "never use `innerHTML` for API responses" — is in the agent's context before your first message arrives. You don't have to restate them. The file does it for you.

This is why the openspec artifacts live in `openspec/changes/<your-feature-slug>/` as committed files. The proposal, design, spec, and task list are instructions files for this feature. When you start a new session tomorrow, or after a `/compact` summarizes your history, those files are still there. The agent reads them fresh. The contract between you and the agent persists across sessions because it's a file, not a memory.

---

## The spec-driven workflow is your guardrail

Workspace mode with auto-approve permissions means the agent can move fast. That is genuinely useful and genuinely dangerous. An unsupervised agent with broad permissions and a vague prompt will build things you didn't ask for, restructure things you didn't intend to touch, and present you with a `git diff` that takes an hour to understand.

The spec-driven workflow exists precisely for this. You control the agent by controlling what it's allowed to build.

The rule is simple: **no implementation until there is an approved spec file.**

The anchor prompt that makes this work — paste this at the start of every implementation session:

```
Read AGENTS.md and openspec/changes/<your-feature-slug>/tasks.md before doing anything.
The spec is approved. Implement only task 1 from the Tasks section.
Stop after task 1 and show me what you changed.
```

That prompt does four things:

1. Forces the agent to load the rules before touching anything
2. Pins the agent to an approved spec
3. Limits scope to one task
4. Requires a report before continuing

After you confirm task 1 is correct, you say "looks good, continue with task 2." You stay in control. The agent implements. That's the loop.

---

## Try it: a spec-driven session from scratch

Here's the full workflow in one concrete pass — not a feature you'll submit, just practice. The feature: a "copy roast to clipboard" button on `404.html`.

1. Start a Copilot CLI session in Workspace mode with auto-approve.
2. Run the scaffold command:
   ```bash
   openspec new change clipboard-button
   ```
3. In the Copilot CLI session, run the propose loop:
   ```bash
   execute ./prompts/homepage-404-button.md
   ```
   Then adapt the prompt on the fly: when the agent asks for context, describe the clipboard button instead. Or write a `prompts/clipboard-button.md` with the slug swapped — that's exactly how the `prompts/` folder is meant to grow.
4. Read each artifact as it's written. Check `openspec/changes/clipboard-button/proposal.md` and `specs/<cap>/spec.md` against `docs/reference/security-guardrails.md`. Edit anything wrong.
5. Run `openspec validate clipboard-button`. Fix any errors.
6. Start a new Copilot CLI session and anchor to the artifacts:
   ```
   Read AGENTS.md and openspec/changes/clipboard-button/tasks.md before doing anything.
   The spec is approved. Implement only task 1 from the Tasks section.
   Stop after task 1 and show me what you changed.
   ```
7. When it stops, run `/diff`. Check every changed file.
8. Run `npm run check`. If it fails, tell the agent what the output says and ask it to fix it.
9. Confirm, then continue to task 2.

You just ran the full propose → validate → apply loop with a real agentic CLI. That is the entire assignment workflow, practiced on a feature that doesn't count.

---

## The three things to remember

1. **The CLI is an agent, not a chat.** It reads files, runs commands, and loops. Treat it like a junior developer who needs a spec and a task list, not a search engine you ask questions.
2. **The artifacts are the contract.** Instructions in chat disappear after a `/compact`. The files in `openspec/changes/<slug>/` don't. Run `propose`, validate, then implement — always in that order.
3. **`/diff` before every commit.** The agent will touch things you didn't ask it to. That's not always bad — but you need to know. Read the diff. Own what goes into git.
