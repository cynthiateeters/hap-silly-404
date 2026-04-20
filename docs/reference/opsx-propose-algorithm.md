---
title: "opsx:propose algorithm reference"
type: reference
tags: [openspec, copilot-cli, sdd, algorithm]
created: 2026-04-20
updated: 2026-04-20
---

# opsx:propose algorithm reference

This document is the algorithm an AI agent follows when you say **"propose `<change-name>`"** in a Copilot CLI session. `AGENTS.md` points the agent here. The algorithm drives the OpenSpec CLI through the four artifacts that make up a change proposal — without writing any implementation code.

---

## Purpose

`propose` writes the four OpenSpec artifacts under `openspec/changes/<change-name>/`:

- `proposal.md` — the "why" and scope summary
- `design.md` — context, goals, decisions, risks, open questions
- `tasks.md` — numbered, checkbox-tracked work list
- `specs/<capability>/spec.md` — requirements as `WHEN/THEN` BDD scenarios (path relative to `openspec/changes/<name>/`)

`propose` does NOT write implementation code, run tests, or modify anything outside `openspec/changes/<change-name>/`. Implementation happens in a separate `apply` step — see `docs/reference/opsx-apply-algorithm.md`.

---

## Preconditions

- `openspec` CLI is installed globally (see `docs/INSTRUCTIONS.md` Part 2a).
- Node 20.19 or newer (`node --version`).
- Either `openspec/changes/<change-name>/.openspec.yaml` already exists (you ran `openspec new change` before invoking the algorithm), OR the algorithm itself runs `openspec new change <change-name>` as its first step.
- If the `openspec/changes/<change-name>/` folder already exists and contains anything beyond `.openspec.yaml` (and optionally `README.md`), the agent stops and asks before overwriting work.

---

## Algorithm

Parameterize the change name as `<name>` throughout.

1. **Scaffold the change folder.**
   If `openspec/changes/<name>/.openspec.yaml` does not exist, run:

   ```bash
   openspec new change <name>
   ```

   If the folder exists and is non-empty (beyond `.openspec.yaml` and optional `README.md`), stop and ask the user whether to resume or pick a new name.

2. **Read the initial status.**

   ```bash
   openspec status --change <name> --json
   ```

   Record the `applyRequires` array from the response. For the spec-driven schema this is `["tasks"]`, but the algorithm should read it from the response rather than hardcoding.

3. **Loop until every artifact in `applyRequires` has `status: "done"`.** For each iteration:
   - a. Among artifacts not yet `done`, pick the one whose `status` is `"ready"`. If multiple are ready at once, prefer this order: proposal → specs → design → tasks.
   - b. Fetch the instructions for that artifact:

     ```bash
     openspec instructions <artifact-id> --change <name> --json
     ```

   - c. For each entry in the response's `dependencies` array where `done: true`, read the file it names. The `path` field is relative to `openspec/changes/<name>/`.
   - d. Write the file at the response's `outputPath` using the `template` field as structural guide. Apply the `context` field (project background) and the `rules` array (per-artifact constraints) as constraints on what you write. **Do not** copy `context`, `rules`, or any `project_context` block literally into the output file — those fields are instructions for the writer, not content.
   - e. Re-run `openspec status --change <name> --json` to refresh state, then return to step 3a.

4. **Validate.**

   ```bash
   openspec validate <name>
   ```

   Expect it to pass now that `openspec/changes/<name>/specs/<capability>/spec.md` exists with delta requirements. If it errors with `CHANGE_NO_DELTAS`, the specs file was not written correctly — stop and tell the user.

5. **Show human-readable status.**

   ```bash
   openspec status --change <name>
   ```

6. **Hand off to the user.** Tell them:

   > Artifacts ready for `<name>`. Review `proposal.md`, `design.md`, `tasks.md`, and `openspec/changes/<name>/specs/<capability>/spec.md` before implementing.

   Do not start implementation. The user reads, edits, and approves first.

---

## Artifact order under the spec-driven schema

The dependency graph (from the `spec-driven` schema the CLI ships with):

- `proposal` — no deps; always `ready` first.
- `specs` — requires `proposal`.
- `design` — requires `proposal`.
- `tasks` — requires both `specs` AND `design`.

Build order: **proposal → specs → design → tasks**. `specs` and `design` become parallel after `proposal` is done; `tasks` gates on both.

`apply.requires` for this schema is `[tasks]` — the apply phase only requires the tasks artifact to be done, not all four. But the propose algorithm writes all four because `tasks` transitively requires the other three.

---

## Gotchas

- **`openspec new change` errors if the folder already exists.** Check first, or guard the call with "does `.openspec.yaml` exist in that folder?"
- **`openspec validate` validates delta specs under `openspec/changes/<name>/specs/`, not `proposal.md`.** Running it before the specs artifact is written returns `CHANGE_NO_DELTAS`. Do not call validate until after `spec.md` exists on disk.
- **`openspec instructions` is forgiving.** It returns full instructions even when dependencies are missing on disk — `dependencies[].done` will be `false`, but the command itself succeeds. This is expected, not a bug. It lets you inspect requirements before writing prerequisites.
- **`context`, `rules`, and `project_context` are CONSTRAINTS for the writer, not file content.** If you paste them into `proposal.md`, you will confuse the schema and future readers.
- **`openspec new change` prints its success message via an `ora` spinner on stderr.** The folder is created normally; just know stderr output is expected.

---

## Stop conditions

The propose algorithm is done when all of these are true:

- Every artifact id listed in `applyRequires` has `status: "done"` in the JSON status output.
- `openspec validate <name>` exits cleanly with `errorCount: 0`.
- The agent has told the user the artifacts are ready and has NOT started implementation.

---

## Related

After the user reviews and edits the artifacts, they approve and say "apply `<name>`." The implementation phase is covered by `docs/reference/opsx-apply-algorithm.md` — one task at a time, with tests and commits between each.
