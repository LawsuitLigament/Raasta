// ============================================
// Stations Screen — Browse All Stations
// ============================================

import { getAllStationsSorted, searchStations, LINES } from '../data/metro-data.js';
import { navigate } from '../core/router.js';

export function renderStationsScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'stations-screen';

  const allStations = getAllStationsSorted();

  screen.innerHTML = `
    <div class="container" style="padding-top: var(--space-xl);">
      
      <!-- Search -->
      <div class="input-wrapper" style="margin-bottom: var(--space-lg);">
        <input type="text" id="stations-search" class="input-field" placeholder="Search stations..." style="padding-left: 1rem;" />
      </div>
      
      <!-- Station count -->
      <div id="station-count" style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-md);">
        ${allStations.length} stations
      </div>
      
      <!-- Station List -->
      <div id="stations-list" style="display: flex; flex-direction: column; gap: var(--space-xs); padding-bottom: var(--space-2xl);">
        ${renderStationsList(allStations)}
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const searchInput = screen.querySelector('#stations-search');
    const listContainer = screen.querySelector('#stations-list');
    const countEl = screen.querySelector('#station-count');

    searchInput?.addEventListener('input', (e) => {
      const results = searchStations(e.target.value);
      listContainer.innerHTML = renderStationsList(results);
      countEl.textContent = `${results.length} stations`;
      attachStationClickHandlers(listContainer);
    });

    attachStationClickHandlers(listContainer);
  });

  return screen;
}

function renderStationsList(stations) {
  return stations.map(station => `
    <div class="station-list-item" data-station-id="${station.id}" style="
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all var(--transition-fast);
    ">
      <div style="display: flex; gap: 3px; flex-shrink: 0;">
        ${station.lines.map(l =>
          `<span class="line-dot" style="background-color: ${LINES[l]?.color || '#888'}; width: 10px; height: 10px;"></span>`
        ).join('')}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${station.name}
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
          ${station.lines.map(l => LINES[l]?.name || l).join(' · ')}
        </div>
      </div>
      ${station.lines.length > 1 ? '<span style="font-size: var(--font-size-xs); color: var(--accent-warning); font-weight: 600;">⇄</span>' : ''}
    </div>
  `).join('');
}

function attachStationClickHandlers(container) {
  container?.querySelectorAll('.station-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const stationId = item.dataset.stationId;
      navigate('station-detail', { stationId });
    });
  });
}
