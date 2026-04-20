<!-- Generated 2026-04-16 with @fission-ai/openspec — regenerate if template shape changes. -->

## Context

The site is a two-page static site (`index.html`, `404.html`) with shared styles in `css/style.css`. All colors are already defined as `hsl()` CSS custom properties prefixed `--hap-*`, which makes adding dark mode overrides straightforward. There are no build tools — everything is plain HTML/CSS/JS served by Netlify.

## Goals / Non-Goals

**Goals:**

- Toggle button visible in the top corner of both pages
- Dark mode color overrides via a `.dark` class on `<html>`
- Respect `prefers-color-scheme: dark` on first visit
- Persist choice to `localStorage` across page loads and navigation
- Sun/moon icon (unicode) to indicate current mode

**Non-Goals:**

- Animated transitions between themes
- Per-page color customization
- Server-side theme detection

## Decisions

**CSS class on `<html>` vs. `data-theme` attribute**
Using `.dark` class is simpler to target in CSS and widely understood. A `data-theme` attribute would be equally valid but adds no benefit here.

**Inline `<script>` before `</body>` for toggle logic**
A tiny inline script (no external file) avoids a separate network request and flash of wrong theme (FOUT). The script reads `localStorage` and applies `.dark` before first paint by being placed in `<head>` (or as a blocking inline script).

**No external icon library**
Use unicode characters (☀ / ☾) or simple CSS shapes to avoid adding a dependency. The button label will be visually descriptive and accessible via `aria-label`.

## Risks / Trade-offs

- [Flash of wrong theme] → Mitigate by applying the class in a `<script>` tag in `<head>` before any rendering
- [Two pages with duplicated toggle JS] → Accept duplication; a shared JS file would require a build step or an extra network request that isn't worth it for ~10 lines of code

## Migration Plan

No migration needed — purely additive CSS and JS. Rolling back means removing the toggle markup and CSS block.

## Open Questions

- (none)
