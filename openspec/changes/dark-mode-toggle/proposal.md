<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

## Why

The site lacks dark mode support. Adding a persistent dark mode toggle improves accessibility and user comfort in low-light environments and modernizes the user experience on the landing and 404 pages.

## What Changes

- Add a dark/light mode toggle button visible in the top-right corner of all pages (`index.html`, `404.html`).
- Add dark mode CSS custom property overrides and a `.dark` class on `<html>`.
- Persist the user's preference to `localStorage` so it survives navigation.
- Implement the toggle logic in `js/404.mjs` and a small shared helper in `js/theme.mjs` (CSP-safe external modules).

## Deliverables

- `openspec/changes/dark-mode-toggle/` proposal artifacts (this file + design/tasks/spec).
- Implementation edits to `css/style.css`, `404.html`, `index.html`, and `js/*` as needed.
- Tests: none required for UI-only change, but manual verification steps will be provided.
