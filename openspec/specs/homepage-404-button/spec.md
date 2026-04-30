# Spec: homepage-404-button

WHEN a user visits `index.html`
THEN the page displays a button with label "Trigger 404" that links to `/nonexistent-page`.

WHEN the button is focused
THEN it has a visible focus ring and an `aria-label` describing its purpose.
