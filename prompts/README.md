# prompts/

Reusable prompt files for the Copilot CLI. Run any file here with:

```bash
execute ./prompts/<filename>.md
```

A prompt file is plain text — the same words you'd type into a chat window, saved where your team can read, version, and improve them together. That's the idea: prompts are artifacts, not magic spells whispered once and forgotten.

## Files in this folder

- `homepage-404-button.md` — drives the Part 4A PoC dry run. Emulates `/opsx:propose` for the `homepage-404-button` change, walking the agent through the openspec artifact loop step by step.

## Prompts you could add

As you work through the assignment, you may find yourself typing the same instructions more than once. That's a sign a prompt wants to be a file. Some candidates:

- `propose-<feature>.md` — a propose prompt scoped to your specific Track 1 feature, with context the generic `AGENTS.md` rule doesn't have (your chosen color, your label text, your accessibility decision)
- `review-artifacts.md` — a checklist prompt that reads each artifact in `openspec/changes/<change>/` and tells you what looks weak before you start `apply`
- `tdd-cycle.md` — for Track 2, a prompt that runs one red-green-refactor cycle for a single BDD scenario and stops for your review before moving to the next
- `security-review.md` — a prompt that reads `docs/reference/security-guardrails.md` and audits a given function for the issues listed there

## Fine-tuning a prompt

Prompt files are just text, so improving one is the same as improving any other file: edit, commit, and note what changed. A few things worth tuning:

- **Specificity** — vague instructions produce vague output. Replace "write something reasonable" with the actual constraint (label text, max line count, required aria attribute).
- **Stop conditions** — add explicit "if X, stop and ask me" rules. The `homepage-404-button.md` prompt does this for ambiguous label text. More stop conditions mean fewer surprises.
- **Output format** — if the agent keeps adding preamble you don't want, add "do not summarize what you're about to do, just do it."
- **Read-before-run** — before executing any prompt file, read it. Understanding what you're asking the agent to do is the skill. The file makes that possible in a way a chat history never does.
