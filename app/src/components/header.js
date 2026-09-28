// ============================================
// Header Component
// ============================================

import { getTheme, toggleTheme } from '../core/theme.js';
import { createQuickStationSearch } from './quick-station-search.js';

// SVG Icons
const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>`;
const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

const NAV_ICONS = {
  route: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 16c0-4 12-4 12-8"/></svg>`,
  fare: `<span class="nav-currency" aria-hidden="true">₹</span>`,
  stations: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 18 6 21M16 18l2 3M8 8h8M8 12h.01M16 12h.01"/><path d="M9 21h6"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
};

export function renderHeader(navigate) {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.id = 'app-header';

  header.innerHTML = `
    <div class="app-header-inner">
      <button class="app-logo" id="header-logo" type="button" aria-label="Go to route planner">
        <span class="app-logo-icon">DMRC</span>
        <span id="app-header-title">Delhi Metro</span>
      </button>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle-btn" aria-label="Toggle theme" title="Toggle theme">
          ${getTheme() === 'mocha' ? SUN_ICON : MOON_ICON}
        </button>
      </div>
    </div>
  `;

  const themeButton = header.querySelector('#theme-toggle-btn');
  const updateThemeIcon = event => {
    themeButton.innerHTML = event.detail.theme === 'mocha' ? SUN_ICON : MOON_ICON;
  };

  header.querySelector('#header-logo').addEventListener('click', () => navigate('home'));
  themeButton.addEventListener('click', () => {
    const rect = themeButton.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  });
  window.addEventListener('themechange', updateThemeIcon);

  return header;
}

export function updateHeaderTitle(title) {
  const titleEl = document.getElementById('app-header-title');
  if (titleEl) {
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

export function renderBottomNav(navigate) {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.id = 'bottom-nav';
  nav.setAttribute('aria-label', 'Primary navigation');
  nav.innerHTML = `
    <div class="bottom-nav-inner">
      <span class="nav-active-indicator" aria-hidden="true"></span>
      <button class="nav-item active" data-path="home" id="nav-home" type="button" data-label="Route" title="Route">
        ${NAV_ICONS.route}<span class="sr-only">Route</span>
      </button>
      <button class="nav-item" data-path="fare" id="nav-fare" type="button" data-label="Fare" title="Fare">
        ${NAV_ICONS.fare}<span class="sr-only">Fare</span>
      </button>
      <button class="nav-item" data-path="stations" id="nav-stations" type="button" data-label="Stations" title="Stations">
        ${NAV_ICONS.stations}<span class="sr-only">Stations</span>
      </button>
      <button class="nav-item" data-path="settings" id="nav-settings" type="button" data-label="Settings" title="Settings">
        ${NAV_ICONS.settings}<span class="sr-only">Settings</span>
      </button>
      <button class="map-menu-trigger" id="map-menu-trigger" type="button" aria-label="Open map navigation" title="Open map navigation">
        ${NAV_ICONS.menu}<span class="sr-only">Open map navigation</span>
      </button>
      <button class="quick-search-trigger" id="quick-search-trigger" type="button" aria-label="Open quick station search" title="Search destination">
        ${NAV_ICONS.search}<span class="sr-only">Search destination</span>
      </button>
    </div>
  `;

  const quickSearch = createQuickStationSearch(navigate, () => {
    nav.querySelector('#quick-search-trigger')?.focus();
  });
  const trigger = nav.querySelector('#quick-search-trigger');
  const mapMenuTrigger = nav.querySelector('#map-menu-trigger');

  const leaveMapMode = () => {
    if (!nav.classList.contains('map-mode')) return;
    nav.classList.remove('map-mode', 'rail-expanded');
    syncCollapsedState(nav);
    window.dispatchEvent(new CustomEvent('metro-map:close'));
  };

  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      leaveMapMode();
      navigate(item.dataset.path);
    });
  });

  mapMenuTrigger.addEventListener('click', () => {
    nav.classList.toggle('rail-expanded');
    nav.classList.remove('collapsed');
  });

  trigger.addEventListener('click', () => {
    nav.classList.remove('collapsed');
    quickSearch.open();
  });

  setupNavTooltips(nav);
  setupNavScroll(nav, quickSearch);
  setupNavIndicator(nav);

  window.addEventListener('metro-map:open', () => {
    nav.classList.add('map-mode', 'collapsed');
    nav.classList.remove('rail-expanded');
  });
  window.addEventListener('metro-map:close', () => {
    nav.classList.remove('map-mode', 'rail-expanded');
    syncCollapsedState(nav);
  });

  return nav;
}

function setupNavIndicator(nav) {
  const inner = nav.querySelector('.bottom-nav-inner');
  const indicator = nav.querySelector('.nav-active-indicator');
  let frame = null;

  const sync = () => {
    frame = null;
    const activeItem = nav.querySelector('.nav-item.active');
    if (!activeItem || nav.classList.contains('collapsed') || nav.classList.contains('map-mode')) {
      indicator.classList.remove('visible');
      return;
    }

    indicator.style.width = `${activeItem.offsetWidth}px`;
    indicator.style.left = `${activeItem.offsetLeft}px`;
    indicator.classList.add('visible');
  };

  const requestSync = () => {
    if (frame === null) frame = window.requestAnimationFrame(sync);
  };

  const observer = new MutationObserver(requestSync);
  observer.observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
  window.addEventListener('resize', requestSync);
  requestSync();
}

function setupNavScroll(nav, quickSearch) {
  let lastScrollY = window.scrollY;
  let direction = null;
  let directionDistance = 0;
  let ticking = false;

  const update = () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    ticking = false;

    if (nav.classList.contains('map-mode') || quickSearch.isOpen()) return;
    if (nav.matches(':focus-within') || document.querySelector('.quick-search-sheet:focus-within')) return;

    if (currentScrollY <= 10) {
      nav.classList.remove('collapsed');
      direction = null;
      directionDistance = 0;
      return;
    }
    if (Math.abs(delta) < 1) return;

    const nextDirection = delta > 0 ? 'down' : 'up';
    if (nextDirection !== direction) {
      direction = nextDirection;
      directionDistance = 0;
    }
    directionDistance += Math.abs(delta);

    if (direction === 'down' && directionDistance >= 32) nav.classList.add('collapsed');
    if (direction === 'up' && directionDistance >= 12) nav.classList.remove('collapsed');
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

function syncCollapsedState(nav) {
  if (window.scrollY <= 10) nav.classList.remove('collapsed');
  else nav.classList.add('collapsed');
}

function setupNavTooltips(nav) {
  const tooltip = document.createElement('div');
  tooltip.className = 'nav-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  nav.appendChild(tooltip);
  let holdTimer = null;
  let activeItem = null;

  const hide = () => {
    window.clearTimeout(holdTimer);
    tooltip.classList.remove('visible');
    activeItem = null;
  };
  const show = item => {
    activeItem = item;
    tooltip.textContent = item.dataset.label || item.title;
    tooltip.classList.add('visible');
  };

  nav.querySelectorAll('.nav-item, .map-menu-trigger, .quick-search-trigger').forEach(item => {
    item.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') {
        window.clearTimeout(holdTimer);
        holdTimer = window.setTimeout(() => show(item), 500);
      }
    });
    item.addEventListener('pointerup', hide);
    item.addEventListener('pointerleave', hide);
    item.addEventListener('pointercancel', hide);
  });
}
