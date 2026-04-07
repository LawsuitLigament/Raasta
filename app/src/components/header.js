// ============================================
// Header Component
// ============================================

import { navigate } from '../core/router.js';
import { getTheme, toggleTheme } from '../core/theme.js';

// SVG Icons
const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>`;

const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.id = 'app-header';

  header.innerHTML = `
    <div class="app-header-inner">
      <div class="app-logo" id="header-logo">
        <span class="app-logo-icon">DMRC</span>
        <span id="app-header-title">Delhi Metro</span>
      </div>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle-btn" aria-label="Toggle theme" title="Toggle theme">
          ${getTheme() === 'mocha' ? SUN_ICON : MOON_ICON}
        </button>
      </div>
    </div>
  `;

  // Logo click → go home
  header.querySelector('#header-logo').addEventListener('click', () => {
    navigate('home');
  });

  // Theme toggle
  header.querySelector('#theme-toggle-btn').addEventListener('click', () => {
    const newTheme = toggleTheme();
    header.querySelector('#theme-toggle-btn').innerHTML = newTheme === 'mocha' ? SUN_ICON : MOON_ICON;
  });

  return header;
}

/**
 * Updates the header title dynamically
 * @param {string} title 
 */
export function updateHeaderTitle(title) {
  const titleEl = document.getElementById('app-header-title');
  if (titleEl) {
    // Fade transition for title
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(-2px)';
    
    setTimeout(() => {
      titleEl.textContent = title;
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'translateY(0)';
    }, 150);
  }
}

// ============================================
// Bottom Navigation Component
// ============================================

export function renderBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.id = 'bottom-nav';

  nav.innerHTML = `
    <div class="bottom-nav-inner">
      <button class="nav-item active" data-path="home" id="nav-home">
        <span>Route</span>
      </button>
      <button class="nav-item" data-path="fare" id="nav-fare">
        <span>Fare</span>
      </button>
      <button class="nav-item" data-path="stations" id="nav-stations">
        <span>Stations</span>
      </button>
      <button class="nav-item" data-path="settings" id="nav-settings">
        <span>Settings</span>
      </button>
    </div>
  `;

  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const path = item.dataset.path;
      navigate(path);
    });
  });

  return nav;
}
