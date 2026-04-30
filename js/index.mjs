import { applyTheme, getInitialTheme, toggleTheme } from "./theme.mjs";

/* Apply initial theme immediately */
applyTheme(getInitialTheme());

const themeBtn = document.querySelector("#theme-toggle-btn");
if (themeBtn) {
  const isDark = document.documentElement.classList.contains("dark");
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  themeBtn.addEventListener("click", () => {
    const next = toggleTheme();
    themeBtn.textContent = next === "dark" ? "☀️" : "🌙";
  });
}
