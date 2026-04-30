<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

# Design: homepage-404-button

## Context

This repository is a static site with a custom 404 page. The practice button is intentionally tiny: it simply links to a known-missing path so students can verify the 404 flow and the spec-driven agent workflow.

## Goals

- Add a clear, accessible button to the homepage that navigates to `/nonexistent-page`.
- No JavaScript required; use semantic HTML and an accessible label.

## Risks

- Minimal surface area; no security changes and no server-side edits.
