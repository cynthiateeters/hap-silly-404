<!-- Generated 2026-04-16 with @fission-ai/openspec — regenerate if template shape changes. -->

## 1. CSS Dark Mode Overrides

- [x] 1.1 Add `.dark` class overrides for all `--hap-*` custom properties in `css/style.css`
- [x] 1.2 Style the toggle button (position fixed top-right, no background, accessible focus ring)

## 2. Theme Init Script

- [x] 2.1 Write inline `<script>` in `<head>` that reads `localStorage` (or `prefers-color-scheme`) and applies `.dark` to `<html>` before first paint

## 3. Toggle Button — index.html

- [x] 3.1 Add toggle button markup to `index.html` with `aria-label` and sun/moon icon
- [x] 3.2 Add inline `<script>` before `</body>` that wires the button click to toggle `.dark` on `<html>` and save to `localStorage`

## 4. Toggle Button — 404.html

- [x] 4.1 Add toggle button markup to `404.html` with `aria-label` and sun/moon icon
- [x] 4.2 Add inline `<script>` before `</body>` that wires the button click to toggle `.dark` on `<html>` and save to `localStorage`

## 5. Verify

- [ ] 5.1 Run `netlify dev` and confirm dark mode applies on first load for system dark preference
- [ ] 5.2 Confirm toggle switches theme on both pages with correct icon state
- [ ] 5.3 Confirm preference persists after reload and across `index.html` ↔ `404.html` navigation
