/**
 * theme.mjs
 * Helper functions to initialize and toggle dark mode for the site.
 * Uses localStorage to persist user preference and respects prefers-color-scheme
 * on first visit. Designed to be imported as an ES module (type="module").
 */

/**
 * Read the stored theme preference.
 * @returns {('dark'|'light'|null)} 'dark' or 'light' if stored, otherwise null.
 */
export function getStoredTheme() {
  try {
    return localStorage.getItem("hap-theme");
  } catch {
    // localStorage may be unavailable in some privacy modes
    return null;
  }
}

/**
 * Persist the theme preference.
 * @param {'dark'|'light'} theme
 */
export function setStoredTheme(theme) {
  try {
    localStorage.setItem("hap-theme", theme);
  } catch {
    // ignore write errors
  }
}

/**
 * Apply the given theme to the document <html> element.
 * @param {'dark'|'light'} theme
 */
export function applyTheme(theme) {
  if (theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
}

/**
 * Determine the initial theme using stored preference or system preference.
 * @returns {'dark'|'light'}
 */
export function getInitialTheme() {
  const stored = getStoredTheme();
  if (stored === "dark" || stored === "light") return stored;

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * Toggle the current theme and persist the choice.
 * @returns {'dark'|'light'} the new theme after toggling
 */
export function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  setStoredTheme(next);
  return next;
}
