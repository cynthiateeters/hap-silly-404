Emulate /opsx:propose for change "homepage-404-button". I've already run
`openspec new change homepage-404-button`, so openspec/changes/homepage-404-button/
exists with a .openspec.yaml and nothing else. You write the artifacts.

Algorithm — do not skip steps:

1. Run: openspec status --change homepage-404-button --json
2. Loop until every id in applyRequires has status "done":
   a. Pick the artifact whose status is "ready".
   b. Run: openspec instructions <artifact-id> --change homepage-404-button --json
   c. For each entry in the "dependencies" array where "done" is true, read the
   file it names.
   d. Write the file at "outputPath" using the "template" field as the structure.
   Apply "context" and "rules" as constraints on what you write.
   Do NOT copy context, rules, or project_context blocks into the output file.
   e. Print one line: "wrote <outputPath>".
   f. Re-run: openspec status --change homepage-404-button --json
3. After the loop, run: openspec validate homepage-404-button
   Expect it to pass now (openspec/changes/homepage-404-button/specs/<capability>/spec.md exists with delta requirements).
   If it errors with CHANGE_NO_DELTAS, stop and tell me — something is wrong.
4. Run: openspec status --change homepage-404-button
5. Tell me: "Artifacts ready for homepage-404-button. Review before implementing."

Rules:

- Do not write any code outside openspec/changes/homepage-404-button/.
- If the feature has genuine ambiguity (label text, target URL, new-tab behavior,
  aria-label), ASK ME before writing the spec. Better to pause than guess.
- Read AGENTS.md and docs/reference/security-guardrails.md and apply their rules.
