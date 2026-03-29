// ============================================
// Delhi Metro Route Planner — Main Entry
// ============================================

import './styles/index.css';
import './styles/components.css';
import './styles/animations.css';

import { registerRoute, initRouter } from './core/router.js';
import { initTheme } from './core/theme.js';
import { renderHeader, renderBottomNav } from './components/header.js';
import { renderHomeScreen } from './screens/home.js';
import { renderResultsScreen } from './screens/results.js';
import { renderStationsScreen } from './screens/stations.js';
import { renderStationDetailScreen } from './screens/station-detail.js';
import { renderFareScreen } from './screens/fare.js';
import { renderSettingsScreen } from './screens/settings.js';

// Initialize app
function init() {
  // Initialize theme
  initTheme();

  // Set up layout
  const app = document.getElementById('app');
  
  // Add header
  app.prepend(renderHeader());
  
  // Add bottom navigation
  app.appendChild(renderBottomNav());

  // Register routes
  registerRoute('home', renderHomeScreen);
  registerRoute('results', renderResultsScreen);
  registerRoute('stations', renderStationsScreen);
  registerRoute('station-detail', renderStationDetailScreen);
  registerRoute('fare', renderFareScreen);
  registerRoute('settings', renderSettingsScreen);

  // Start router
  initRouter();

  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.remove(), 400);
    }, 600);
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed — that's ok
      });
    });
  }

  // Offline detection
  const offlineBadge = document.createElement('div');
  offlineBadge.className = 'offline-badge';
  offlineBadge.id = 'offline-badge';
  offlineBadge.innerHTML = 'Offline Mode';
  document.body.appendChild(offlineBadge);

  window.addEventListener('online', () => {
    offlineBadge.classList.remove('visible');
  });

  window.addEventListener('offline', () => {
    offlineBadge.classList.add('visible');
  });

  if (!navigator.onLine) {
    offlineBadge.classList.add('visible');
  }
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
