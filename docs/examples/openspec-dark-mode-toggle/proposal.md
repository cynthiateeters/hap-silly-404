<!-- Generated 2026-04-16 with @fission-ai/openspec — regenerate if template shape changes. -->

## Why

The site currently has no dark mode support. Adding a persistent dark mode toggle improves readability in low-light environments and matches modern user expectations across both the landing page and the 404 page.

## What Changes

- Add a dark/light mode toggle button in the top corner of all pages (`index.html`, `404.html`)
- Add dark mode CSS custom property overrides under `prefers-color-scheme` and a `.dark` class on `<html>`
- Persist the user's preference to `localStorage` so it survives page navigation
- Toggle button reflects current state (sun/moon icon or equivalent text)

## Capabilities

### New Capabilities

- `dark-mode-toggle`: Toggle control that switches the site between light and dark color themes, persists preference in localStorage, and respects system preference on first visit

### Modified Capabilities

- (none)

## Impact

- `css/style.css` — add dark mode custom property overrides
- `index.html` — add toggle button markup and inline JS for persistence
- `404.html` — add toggle button markup and inline JS for persistence
- No new dependencies; no serverless function changes
