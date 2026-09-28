// ============================================
// Results Screen — Route Display with Tabs
// ============================================

import { getState, setState } from '../core/state.js';
import { STATIONS } from '../data/metro-network.js';
import { planRoutes } from '../core/route-planner.js';
import { renderRouteDisplay, renderConstructionRouteDisplay } from '../components/route-display.js';
import { renderMetroMap } from '../components/metro-map.js';
import { navigate } from '../core/router.js';
import { saveRoute } from '../core/persistence.js';

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

  const {
    fastestRoute,
    leastInterchangesRoute,
    constructionFastestRoute,
    constructionLeastInterchangesRoute,
  } = planRoutes(fromStation, toStation);
  setState({ fastestRoute, leastInterchangesRoute });

  const fromName = STATIONS[fromStation]?.name || fromStation;
  const toName = STATIONS[toStation]?.name || toStation;
  const activeTab = state.activeTab || 'fastest';

  const activeRoute = activeTab === 'fastest' ? fastestRoute : leastInterchangesRoute;
  const activeConstructionRoute = activeTab === 'fastest'
    ? constructionFastestRoute
    : constructionLeastInterchangesRoute;

  screen.innerHTML = `
    <div class="container" style="padding-top: var(--space-lg);">
      <!-- Back + Route Header -->
      <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-lg);">
        <button class="icon-btn" id="results-back" aria-label="Go back">←</button>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${fromName}</div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">→ ${toName}</div>
        </div>
        <button class="icon-btn" id="save-route-btn" aria-label="Save Route" title="Save Route">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <button class="icon-btn" id="toggle-map-btn" aria-label="View Map">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="route-tabs">
        <span class="tab-active-indicator" aria-hidden="true"></span>
        <button class="tab ${activeTab === 'fastest' ? 'active' : ''}" data-tab="fastest">
          Fastest
        </button>
        <button class="tab ${activeTab === 'least' ? 'active' : ''}" data-tab="least">
          Least Changes
        </button>
      </div>

      <!-- Tab Content -->
      <div id="tab-content" style="margin-top: var(--space-lg); padding-bottom: var(--space-2xl);">
        ${renderRouteDisplay(activeRoute)}
        ${renderConstructionRouteDisplay(activeConstructionRoute)}
      </div>
    </div>
    
    <!-- Sliding Map Panel -->
    <div class="map-sliding-panel" id="map-panel">
      <div class="map-panel-header">
        <button class="map-panel-close" id="close-map-header" type="button" aria-label="Close map" title="Close map (swipe up)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>
      <div class="map-container-wrapper" id="map-container-wrapper">
        <!-- Map will be rendered here -->
      </div>
    </div>
  `;

  // Event listeners
  requestAnimationFrame(() => {
    // Back button
    screen.querySelector('#results-back')?.addEventListener('click', () => navigate('home'));

    // Save route button
    const saveBtn = screen.querySelector('#save-route-btn');
    saveBtn?.addEventListener('click', () => {
      const isSaved = saveRoute(fromStation, toStation, fromName, toName);
      if (isSaved) {
        saveBtn.style.color = 'var(--accent-success)';
        saveBtn.title = 'Saved!';
        saveBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-success)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
        setTimeout(() => {
          saveBtn.style.color = '';
          saveBtn.title = 'Save Route';
          saveBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          `;
        }, 2000);
      }
    });

    // Map toggle logic
    const mapPanel = screen.querySelector('#map-panel');
    const mapWrapper = screen.querySelector('#map-container-wrapper');
    const toggleMapBtn = screen.querySelector('#toggle-map-btn');
    const closeMapHeader = screen.querySelector('#close-map-header');

    const renderActiveMap = () => {
      const currentActiveTab = getState().activeTab || 'fastest';
      const currentRoute = currentActiveTab === 'fastest' ? fastestRoute : leastInterchangesRoute;
      mapWrapper.innerHTML = '';
      mapWrapper.appendChild(renderMetroMap(currentRoute));
    };

    const openMap = () => {
      // Render the selected tab's route before opening the full-screen map.
      renderActiveMap();
      mapPanel.classList.add('open');
      window.dispatchEvent(new CustomEvent('metro-map:open'));
    };

    const closeMap = () => {
      mapPanel.classList.remove('open');
      window.dispatchEvent(new CustomEvent('metro-map:close'));
    };

    toggleMapBtn?.addEventListener('click', openMap);
    closeMapHeader?.addEventListener('click', closeMap);
    
    // Swipe down on screen to open map
    let screenTouchStartY = 0;
    screen.addEventListener('touchstart', (e) => {
      // Only detect swipe down if we're at the top of the scroll
      if (window.scrollY <= 10) {
        screenTouchStartY = e.touches[0].clientY;
      } else {
        screenTouchStartY = -1; // Disable
      }
    }, { passive: true });

    screen.addEventListener('touchmove', (e) => {
      if (screenTouchStartY === -1 || mapPanel.classList.contains('open')) return;
      const touchY = e.touches[0].clientY;
      const diffY = touchY - screenTouchStartY;
      
      // If pulled down more than 100px, open the map
      if (diffY > 100) {
        openMap();
        screenTouchStartY = -1; // Prevent multiple triggers
      }
    }, { passive: true });
    
    // Swipe up on the close arrow to dismiss the map.
    let handleTouchStartY = null;
    closeMapHeader?.addEventListener('touchstart', (e) => {
      handleTouchStartY = e.touches[0]?.clientY ?? null;
    }, { passive: true });
    closeMapHeader?.addEventListener('touchend', (e) => {
      if (handleTouchStartY === null) return;
      const touchY = e.changedTouches[0]?.clientY ?? handleTouchStartY;
      const swipeDistance = handleTouchStartY - touchY;
      handleTouchStartY = null;
      if (swipeDistance > 50) closeMap();
    }, { passive: true });

    setupTabIndicator(screen);

    // Tab switching
    screen.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        setState({ activeTab: tabId });

        // Update tab active state
        screen.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        syncTabIndicator(screen);

        // Update content
        const content = screen.querySelector('#tab-content');
        if (content) {
          content.style.animation = 'none';
          void content.offsetWidth; // trigger reflow
          content.style.animation = 'fadeSlideIn 150ms ease-out forwards';

          const selectedRoute = tabId === 'fastest' ? fastestRoute : leastInterchangesRoute;
          const selectedConstructionRoute = tabId === 'fastest'
            ? constructionFastestRoute
            : constructionLeastInterchangesRoute;
          content.innerHTML = `${renderRouteDisplay(selectedRoute)}${renderConstructionRouteDisplay(selectedConstructionRoute)}`;
        }
        if (mapPanel.classList.contains('open')) renderActiveMap();
      });
    });
  });

  return screen;
}

function setupTabIndicator(screen) {
  window.requestAnimationFrame(() => syncTabIndicator(screen));
  window.addEventListener('resize', () => syncTabIndicator(screen));
}

function syncTabIndicator(screen) {
  const tabs = screen.querySelector('#route-tabs');
  const indicator = tabs?.querySelector('.tab-active-indicator');
  const activeTab = tabs?.querySelector('.tab.active');
  if (!tabs || !indicator || !activeTab) return;
  indicator.style.left = `${activeTab.offsetLeft}px`;
  indicator.style.width = `${activeTab.offsetWidth}px`;
}
