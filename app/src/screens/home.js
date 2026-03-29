// ============================================
// Home Screen — Route Planning
// ============================================

import { createSearchInput } from '../components/search-input.js';
import { STATIONS } from '../data/metro-data.js';
import { getState, setState } from '../core/state.js';
import { navigate } from '../core/router.js';

export function renderHomeScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'home-screen';

  // Create the search card
  const searchCard = document.createElement('div');
  searchCard.className = 'container';
  searchCard.innerHTML = `
    <div style="padding-top: var(--space-xl);">
      <div style="text-align: center; margin-bottom: var(--space-2xl);">
        <h1 class="heading-1" style="margin-bottom: var(--space-xs);">
          Find Your Route
        </h1>
        <p class="text-caption">Plan your Delhi Metro journey in seconds</p>
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
      
      <!-- Quick Info Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-xl);">
        <div class="card" id="quick-fare" style="cursor: pointer; text-align: center;">
          <div style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary);">Fare Calculator</div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Check metro fares</div>
        </div>
        <div class="card" id="quick-stations" style="cursor: pointer; text-align: center;">
          <div style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary);">All Stations</div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Browse metro stations</div>
        </div>
      </div>
      
      <!-- Metro Network Stats -->
      <div class="card" style="margin-top: var(--space-md); margin-bottom: var(--space-2xl);">
        <div style="text-align: center; margin-bottom: var(--space-md);">
          <div style="font-size: var(--font-size-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Delhi Metro Network 2026</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); text-align: center;">
          <div>
            <div style="font-size: var(--font-size-lg); font-weight: 800; color: var(--accent-primary);">10</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Lines</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-lg); font-weight: 800; color: var(--accent-primary);">280+</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Stations</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-lg); font-weight: 800; color: var(--accent-primary);">400+</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">km Network</div>
          </div>
        </div>
      </div>
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

    // Quick action cards
    screen.querySelector('#quick-fare')?.addEventListener('click', () => navigate('fare'));
    screen.querySelector('#quick-stations')?.addEventListener('click', () => navigate('stations'));
  });

  return screen;
}
