<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

## Context

The site is a small static site (`index.html`, `404.html`) with shared styles in `css/style.css`. Colors are defined with `--hap-*` variables.

## Goals

- Toggle button accessible in top-right of both pages
- Respect `prefers-color-scheme` on first visit
- Persist to `localStorage`
- Use external JS modules (no inline scripts) to satisfy the repo CSP

## Decisions

- Use a `.dark` class on `<html>` for theme toggling
- Provide a tiny `js/theme.mjs` helper imported by `js/404.mjs` and `js/index.mjs` (or inline small module imports via `<script type="module">` in HTML)
- Use unicode sun/moon icons for the toggle
