<!-- Generated 2026-04-16 with @fission-ai/openspec — regenerate if template shape changes. -->

## ADDED Requirements

### Requirement: Toggle button present on all pages

Every page of the site SHALL display a dark/light mode toggle button in the top-right corner.

#### Scenario: Button visible on landing page

- **WHEN** a user loads `index.html`
- **THEN** a toggle button is visible in the top-right corner of the page

#### Scenario: Button visible on 404 page

- **WHEN** a user lands on `404.html`
- **THEN** a toggle button is visible in the top-right corner of the page

### Requirement: System preference respected on first visit

On a user's first visit (no saved preference), the site SHALL apply the theme matching the user's OS `prefers-color-scheme` setting.

#### Scenario: System dark mode on first visit

- **WHEN** a user visits for the first time and their OS is set to dark mode
- **THEN** the page loads in dark mode without any user action

#### Scenario: System light mode on first visit

- **WHEN** a user visits for the first time and their OS is set to light mode
- **THEN** the page loads in light mode without any user action

### Requirement: Toggle switches theme

Clicking the toggle button SHALL switch the active theme between light and dark.

#### Scenario: Switch to dark mode

- **WHEN** the page is in light mode and the user clicks the toggle button
- **THEN** the page switches to dark mode immediately

#### Scenario: Switch to light mode

- **WHEN** the page is in dark mode and the user clicks the toggle button
- **THEN** the page switches to light mode immediately

### Requirement: Toggle button reflects current theme

The toggle button SHALL display a sun icon (☀) when in dark mode and a moon icon (☾) when in light mode, indicating what clicking will do.

#### Scenario: Icon in dark mode

- **WHEN** dark mode is active
- **THEN** the button displays a sun icon (☀)

#### Scenario: Icon in light mode

- **WHEN** light mode is active
- **THEN** the button displays a moon icon (☾)

### Requirement: Preference persisted across navigation

The user's theme choice SHALL be saved to `localStorage` and restored on subsequent page loads.

#### Scenario: Dark mode persists on reload

- **WHEN** a user switches to dark mode and reloads the page
- **THEN** the page loads in dark mode

#### Scenario: Preference carries across pages

- **WHEN** a user sets dark mode on `index.html` and navigates to `404.html`
- **THEN** `404.html` loads in dark mode

### Requirement: No flash of wrong theme

The correct theme SHALL be applied before the page renders visibly to prevent a flash of the incorrect theme.

#### Scenario: No light flash on dark mode load

- **WHEN** a returning user with dark mode preference loads any page
- **THEN** the page is dark from the first paint with no visible light-mode flash
