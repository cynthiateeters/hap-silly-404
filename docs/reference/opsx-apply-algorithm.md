---
title: "opsx:apply algorithm reference"
type: reference
tags: [openspec, copilot-cli, sdd, algorithm]
created: 2026-04-20
updated: 2026-04-20
---

# opsx:apply algorithm reference

This document is the algorithm an AI agent follows when you say **"apply `<change-name>`"** in a Copilot CLI session. `AGENTS.md` points the agent here. The algorithm drives the implementation phase of an already-proposed change — one task at a time, with verification and commits.

---

## Purpose

`apply` reads `tasks.md`, implements the first unchecked task, runs the repo's test and lint commands, checks the box, commits, and stops.

`apply` does NOT:

- Re-plan or re-spec.
- Batch multiple tasks into a single commit.
- Edit `proposal.md`, `design.md`, or `openspec/changes/<name>/specs/<capability>/spec.md`. If the plan is wrong, the agent stops and asks the user to re-propose.

---

## Preconditions

- `openspec validate <change-name>` passes cleanly (`errorCount: 0`).
- `openspec/changes/<change-name>/tasks.md` exists with at least one unchecked (`- [ ]`) checkbox.
- The working tree is reasonably clean — you have committed or stashed unrelated work.
- The propose phase is complete: all four artifacts exist and you have reviewed them.

If any precondition fails, the agent stops and says why.

---

## Algorithm

One iteration per task. Do not batch.

1. Read `openspec/changes/<name>/tasks.md`. Find the first unchecked task (`- [ ]`).
2. Read the relevant spec section in `openspec/changes/<name>/specs/<capability>/spec.md`. Identify the Requirement whose scenarios this task satisfies.
3. **(Track 2 only)** Check `tests/` for existing vitest tests covering this task. If none exist, note that tests must be written first per TDD.
4. **(Track 2 TDD)** If no failing test exists for this task, write the test FIRST from the spec's scenarios. Run:

   ```bash
   npm run test:watch
   ```

   Confirm it is red.

5. Implement the minimum code to satisfy this task and the scenarios it covers. No extra features, no drive-by refactors.
6. Run verification:

   ```bash
   npm run test     # Track 2 only
   npm run check    # all tracks
   ```

   Confirm both pass.

7. If either is red, fix before continuing. Do not check the box until everything is green.
8. Check the box in `tasks.md` (`- [x]`). Stage the code change and the `tasks.md` update together.
9. Commit with a shell-safe message describing this task (no code fencing, no special shell chars).
10. Stop. Tell the user:

    > Task `<N>` done. `<M>` tasks remaining. Ready for review before next task.

    Wait for the user to say to continue.

---

## Stop conditions

The apply algorithm is done for the change when all of these are true:

- Every task in `tasks.md` is checked.
- `npm run test` passes (Track 2).
- `npm run check` passes.
- The user has approved moving on — the algorithm pauses after every task, so the user is always in the loop.

---

## Archiving a completed change

When every task is checked AND the user approves, archive the change:

```bash
openspec archive <change-name> --yes
```

This moves `openspec/changes/<name>/` to `openspec/changes/archive/<YYYY-MM-DD>-<name>/` and updates `openspec/specs/<capability>/spec.md` — promoting the delta requirements into the durable spec tree.

Commit the archive move. The archived folder is the permanent record that this change existed and what it contained. In a grading context, the presence of the archived folder is evidence that the full propose → apply → archive loop was completed.

---

## Gotchas

- **Do not batch tasks.** One task per commit keeps the review loop tight and rollback trivial.
- **Do not edit `proposal.md`, `design.md`, or `openspec/changes/<name>/specs/<cap>/spec.md` during apply.** If the plan is wrong, stop and re-propose. Editing the spec mid-apply defeats the audit trail.
- **Do not run apply on an unvalidated change.** If `openspec validate <name>` has not passed, stop and run it first.
- **If `openspec/changes/<name>/` does not exist**, the user has not run `propose` yet. Stop and ask.
- **(Track 2) Writing implementation before the test** undermines TDD and the spec's Tests section. Always red-first, green after.

---

## Related

- `docs/reference/opsx-propose-algorithm.md` — the companion doc for the planning phase.
- `docs/tutorials/tdd-with-vitest.md` — the red/green cycle this algorithm assumes for Track 2.
