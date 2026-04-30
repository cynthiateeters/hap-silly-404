<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

1. Add `.dark` overrides to `css/style.css` for relevant `--hap-*` variables.
2. Add `js/theme.mjs` helper that reads/writes `localStorage` and toggles `.dark` on `<html>`.
3. Update `index.html` and `404.html` to include a toggle button and import `js/theme.mjs` (module script) in a CSP-friendly way.
4. Style the toggle button in `css/404.css` to position top-right and add accessible focus state.
5. Manual verification steps and update docs/examples if needed.
