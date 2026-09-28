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

export function toggleTheme(origin = null) {
  const current = getTheme();
  const next = current === 'mocha' ? 'latte' : 'mocha';
  applyTheme(next, origin);
  return next;
}

export function applyTheme(theme, origin = null) {
  const commit = () => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'mocha' ? '#1e1e2e' : '#eff1f5');
    }
  };

  if (origin && document.startViewTransition) {
    document.documentElement.style.setProperty('--theme-origin-x', `${origin.x}px`);
    document.documentElement.style.setProperty('--theme-origin-y', `${origin.y}px`);
    document.startViewTransition(commit);
  } else {
    commit();
    if (origin) animateThemeFallback(origin);
  }

  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function animateThemeFallback(origin) {
  const transition = document.createElement('div');
  transition.className = 'theme-transition-wash';
  transition.style.setProperty('--theme-origin-x', `${origin.x}px`);
  transition.style.setProperty('--theme-origin-y', `${origin.y}px`);
  document.body.appendChild(transition);
  requestAnimationFrame(() => transition.classList.add('active'));
  window.setTimeout(() => transition.remove(), 650);
}
