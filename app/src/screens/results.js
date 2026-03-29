// ============================================
// Results Screen — Route Display with Tabs
// ============================================

import { getState, setState } from '../core/state.js';
import { STATIONS } from '../data/metro-data.js';
import { findFastestRoute } from '../algorithms/dijkstra.js';
import { findLeastInterchangesRoute } from '../algorithms/bfs.js';
import { renderRouteDisplay } from '../components/route-display.js';
import { navigate } from '../core/router.js';

export function renderResultsScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'results-screen';

  const state = getState();
  const { fromStation, toStation } = state;

  if (!fromStation || !toStation) {
    screen.innerHTML = `
      <div class="container">
        <div class="empty-state">
          <div class="empty-state-icon" style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border: 2px solid; border-radius: 50%; opacity: 0.5;">!</div>
          <div class="empty-state-title">No Stations Selected</div>
          <div class="empty-state-desc">Go back and select your starting and destination stations.</div>
          <button class="btn btn-primary" id="go-back-btn" style="margin-top: var(--space-lg);">← Go Back</button>
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      screen.querySelector('#go-back-btn')?.addEventListener('click', () => navigate('home'));
    });
    return screen;
  }

  // Calculate routes
  let fastestRoute = findFastestRoute(fromStation, toStation);
  let leastRoute = findLeastInterchangesRoute(fromStation, toStation);

  if (fastestRoute && leastRoute && fastestRoute.interchanges.length === leastRoute.interchanges.length) {
    leastRoute = fastestRoute;
  }

  setState({ fastestRoute, leastInterchangesRoute: leastRoute });

  const fromName = STATIONS[fromStation]?.name || fromStation;
  const toName = STATIONS[toStation]?.name || toStation;
  const activeTab = state.activeTab || 'fastest';

  screen.innerHTML = `
    <div class="container" style="padding-top: var(--space-lg);">
      <!-- Back + Route Header -->
      <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-lg);">
        <button class="icon-btn" id="results-back" aria-label="Go back">←</button>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${fromName}</div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">→ ${toName}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="route-tabs">
        <button class="tab ${activeTab === 'fastest' ? 'active' : ''}" data-tab="fastest">
          Fastest
        </button>
        <button class="tab ${activeTab === 'least' ? 'active' : ''}" data-tab="least">
          Least Changes
        </button>
      </div>

      <!-- Tab Content -->
      <div id="tab-content" style="margin-top: var(--space-lg); padding-bottom: var(--space-2xl);">
        ${activeTab === 'fastest' ? renderRouteDisplay(fastestRoute) : renderRouteDisplay(leastRoute)}
      </div>
    </div>
  `;

  // Event listeners
  requestAnimationFrame(() => {
    // Back button
    screen.querySelector('#results-back')?.addEventListener('click', () => navigate('home'));

    // Tab switching
    screen.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        setState({ activeTab: tabId });

        // Update tab active state
        screen.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content
        const content = screen.querySelector('#tab-content');
        if (content) {
          content.style.animation = 'none';
          void content.offsetWidth; // trigger reflow
          content.style.animation = 'fadeSlideIn 150ms ease-out forwards';

          content.innerHTML = tabId === 'fastest'
            ? renderRouteDisplay(fastestRoute)
            : renderRouteDisplay(leastRoute);
        }
      });
    });
  });

  return screen;
}
