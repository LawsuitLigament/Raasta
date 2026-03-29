// ============================================
// Theme Manager — Catppuccin Mocha / Latte
// ============================================

const THEME_KEY = 'delhi-metro-theme';

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || 'mocha';
  applyTheme(theme);
  return theme;
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'mocha';
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'mocha' ? 'latte' : 'mocha';
  applyTheme(next);
  return next;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  
  // Update meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'mocha' ? '#1e1e2e' : '#eff1f5');
  }
}
