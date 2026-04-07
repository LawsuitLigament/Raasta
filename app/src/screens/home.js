// ============================================
// Home Screen — Route Planning
// ============================================

import { createSearchInput } from '../components/search-input.js';
import { STATIONS } from '../data/metro-data.js';
import { getState, setState } from '../core/state.js';
import { navigate } from '../core/router.js';
import { getSavedRoutes, deleteRoute } from '../core/persistence.js';

export function renderHomeScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'home-screen';

  // Create the search card
  const searchCard = document.createElement('div');
  searchCard.className = 'container';
  searchCard.innerHTML = `
    <div style="padding-top: var(--space-xl);">
      <div style="text-align: center; margin-bottom: var(--space-xl);">
        <p class="text-caption">Plan your Delhi Metro journey with ease</p>
      </div>
      
      <div class="card card-elevated" id="search-card" style="position: relative;">
        <div id="from-input-container"></div>
        
        <div style="display: flex; justify-content: center; margin: var(--space-xs) 0;">
          <button class="swap-btn" id="swap-btn" aria-label="Swap stations" title="Swap stations">⇅</button>
        </div>
        
        <div id="to-input-container"></div>
        
        <button class="btn btn-primary btn-full btn-lg" id="find-route-btn" style="margin-top: var(--space-xl);">
          <span>Find Route</span>
        </button>
        
        <div id="route-error" style="display: none; margin-top: var(--space-md); text-align: center; color: var(--accent-danger); font-size: var(--font-size-sm);"></div>
      </div>
      
      <!-- Saved Routes Dropdown Container -->
      <div id="saved-routes-container" style="margin-top: var(--space-xl); margin-bottom: var(--space-2xl);"></div>
    </div>
  `;

  screen.appendChild(searchCard);

  // Create search inputs after DOM is attached
  requestAnimationFrame(() => {
    const state = getState();

    const fromInput = createSearchInput({
      id: 'from-station',
      label: 'FROM',
      icon: '',
      placeholder: 'Select starting station...',
      initialValue: state.fromStation ? STATIONS[state.fromStation]?.name : '',
      onSelect: (stationId) => setState({ fromStation: stationId }),
    });

    const toInput = createSearchInput({
      id: 'to-station',
      label: 'TO',
      icon: '',
      placeholder: 'Select destination station...',
      initialValue: state.toStation ? STATIONS[state.toStation]?.name : '',
      onSelect: (stationId) => setState({ toStation: stationId }),
    });

    if (state.fromStation) fromInput.setStation(state.fromStation, STATIONS[state.fromStation]?.name);
    if (state.toStation) toInput.setStation(state.toStation, STATIONS[state.toStation]?.name);

    const fromContainer = screen.querySelector('#from-input-container');
    const toContainer = screen.querySelector('#to-input-container');
    if (fromContainer) fromContainer.appendChild(fromInput);
    if (toContainer) toContainer.appendChild(toInput);

    // Swap button
    const swapBtn = screen.querySelector('#swap-btn');
    swapBtn?.addEventListener('click', () => {
      const fromStation = fromInput.getSelectedStation();
      const toStation = toInput.getSelectedStation();
      const fromName = fromStation ? STATIONS[fromStation]?.name : '';
      const toName = toStation ? STATIONS[toStation]?.name : '';

      fromInput.setStation(toStation, toName);
      toInput.setStation(fromStation, fromName);
      setState({ fromStation: toStation, toStation: fromStation });
    });

    // Saved Routes Logic
    const savedContainer = screen.querySelector('#saved-routes-container');
    const updateSavedRoutes = () => {
      const routes = getSavedRoutes();
      if (routes.length === 0) {
        savedContainer.innerHTML = '';
        return;
      }

      savedContainer.innerHTML = `
        <div class="saved-routes-dropdown" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
          <button class="btn btn-ghost btn-full" id="toggle-saved-btn" style="display: flex; justify-content: space-between; padding: var(--space-md) var(--space-lg); border-radius: 0;">
            <span>Saved Routes (${routes.length})</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="saved-chevron" style="transition: transform var(--transition-fast);">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div id="saved-list" class="saved-list hidden" style="border-top: 1px solid var(--border-subtle); max-height: 200px; overflow-y: auto;">
            ${routes.map(r => `
              <div class="saved-item" data-id="${r.id}" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--border-subtle); cursor: pointer;">
                <div class="saved-item-info" style="flex: 1; min-width: 0;">
                  <div style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.fromName}</div>
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">→ ${r.toName}</div>
                </div>
                <button class="delete-saved-btn" data-id="${r.id}" style="color: var(--text-muted); background: none; border: none; padding: var(--space-xs); font-size: 1.1rem; flex-shrink: 0;" title="Delete">×</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const toggleBtn = savedContainer.querySelector('#toggle-saved-btn');
      const savedList = savedContainer.querySelector('#saved-list');
      const chevron = savedContainer.querySelector('#saved-chevron');

      toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        savedList?.classList.toggle('hidden');
        if (chevron) {
          chevron.style.transform = savedList?.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      });

      // Selection logic
      savedContainer.querySelectorAll('.saved-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-saved-btn')) return;
          const routeId = item.dataset.id;
          const route = routes.find(r => r.id === routeId);
          if (route) {
            fromInput.setStation(route.from, route.fromName);
            toInput.setStation(route.to, route.toName);
            setState({ fromStation: route.from, toStation: route.to });
            savedList?.classList.add('hidden');
            if (chevron) {
              chevron.style.transform = 'rotate(0deg)';
            }
          }
        });
      });

      // Delete logic
      savedContainer.querySelectorAll('.delete-saved-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const routeId = btn.dataset.id;
          deleteRoute(routeId);
          updateSavedRoutes();
        });
      });
    };

    updateSavedRoutes();

    // Find Route button
    const findBtn = screen.querySelector('#find-route-btn');
    const errorEl = screen.querySelector('#route-error');
    findBtn?.addEventListener('click', () => {
      const from = fromInput.getSelectedStation();
      const to = toInput.getSelectedStation();
      
      if (!from || !to) {
        errorEl.textContent = 'Please select both stations';
        errorEl.style.display = 'block';
        return;
      }
      if (from === to) {
        errorEl.textContent = 'Source and destination are the same';
        errorEl.style.display = 'block';
        return;
      }

      errorEl.style.display = 'none';
      setState({ fromStation: from, toStation: to });
      navigate('results');
    });
  });

  return screen;
}
