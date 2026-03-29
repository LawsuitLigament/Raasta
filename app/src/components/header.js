// ============================================
// Header Component
// ============================================

import { navigate } from '../core/router.js';
import { getTheme, toggleTheme } from '../core/theme.js';

export function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.id = 'app-header';

  header.innerHTML = `
    <div class="app-header-inner">
      <div class="app-logo" id="header-logo">
        <span class="app-logo-icon">DMRC</span>
        <span>Delhi Metro</span>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost" id="theme-toggle-btn" aria-label="Toggle theme" title="Toggle theme">
          ${getTheme() === 'mocha' ? 'Light' : 'Dark'}
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
    header.querySelector('#theme-toggle-btn').textContent = newTheme === 'mocha' ? 'Light' : 'Dark';
  });

  return header;
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
