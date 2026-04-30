<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

### Requirement: Toggle button present on all pages

Every page SHALL display a dark/light mode toggle in the top-right corner.

### Requirement: Respect system preference on first visit

On first visit, the site SHALL apply the OS `prefers-color-scheme`.

### Requirement: Persist preference

User preference SHALL be saved to `localStorage` and applied on subsequent loads.

### Requirement: No flash of wrong theme

The correct theme SHALL be applied before first paint to avoid FOUC.
