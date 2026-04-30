<!-- Generated 2026-04-29 by Copilot agent for openspec workflow -->

# Spec: homepage-404-button

## Requirement: Homepage contains a 404 trigger button

WHEN a user visits `index.html`
THEN the page displays a button with label "Trigger 404" that links to `/nonexistent-page`.

### Requirement: Button accessible

WHEN the button is focused
THEN it has a visible focus ring and an `aria-label` describing its purpose.
