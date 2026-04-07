// ============================================
// Fare Calculator Screen
// ============================================

import { createSearchInput } from '../components/search-input.js';
import { STATIONS, calculateFare, FARE_CHART } from '../data/metro-data.js';
import { findFastestRoute } from '../algorithms/dijkstra.js';

export function renderFareScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'fare-screen';

  screen.innerHTML = `
    <div class="container" style="padding-top: var(--space-xl);">
      <p class="text-caption" style="margin-bottom: var(--space-xl); text-align: center;">Check token and DMRC card fares between any two stations</p>

      <div class="card card-elevated" style="margin-bottom: var(--space-xl);">
        <div id="fare-from-container"></div>
        <div style="height: var(--space-md);"></div>
        <div id="fare-to-container"></div>
        
        <button class="btn btn-primary btn-full" id="calc-fare-btn" style="margin-top: var(--space-xl);">
          Calculate Fare
        </button>
        
        <div id="fare-error" style="display: none; margin-top: var(--space-md); text-align: center; color: var(--accent-danger); font-size: var(--font-size-sm);"></div>
      </div>

      <div id="fare-result" style="margin-bottom: var(--space-xl);"></div>

      <!-- Fare Chart -->
      <div style="margin-bottom: var(--space-2xl);">
        <h2 class="heading-3" style="margin-bottom: var(--space-md);">Fare Chart (2026)</h2>
        <div class="card" style="overflow: hidden; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-sm);">
            <thead>
              <tr style="background: var(--bg-surface-hover);">
                <th style="text-align: left; padding: var(--space-md) var(--space-lg); font-weight: 600; color: var(--text-secondary); font-size: var(--font-size-xs);">Distance</th>
                <th style="text-align: right; padding: var(--space-md) var(--space-lg); font-weight: 600; color: var(--text-secondary); font-size: var(--font-size-xs);">Token</th>
                <th style="text-align: right; padding: var(--space-md) var(--space-lg); font-weight: 600; color: var(--text-secondary); font-size: var(--font-size-xs);">Card</th>
              </tr>
            </thead>
            <tbody>
              ${FARE_CHART.slabs.map((slab, i) => {
                const prevMax = i > 0 ? FARE_CHART.slabs[i - 1].maxKm : 0;
                const distLabel = slab.maxKm === Infinity
                  ? `> ${prevMax} km`
                  : `${prevMax}–${slab.maxKm} km`;
                const cardFare = Math.round(slab.tokenFare * 0.9);
                return `
                  <tr style="border-top: 1px solid var(--border-subtle);">
                    <td style="padding: var(--space-md) var(--space-lg); color: var(--text-primary);">${distLabel}</td>
                    <td style="text-align: right; padding: var(--space-md) var(--space-lg); font-weight: 600;">₹${slab.tokenFare}</td>
                    <td style="text-align: right; padding: var(--space-md) var(--space-lg); font-weight: 600; color: var(--accent-success);">₹${cardFare}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--space-sm); text-align: center;">
          DMRC Card / NCMC holders get 10% discount on token fares
        </p>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    let fromStation = null;
    let toStation = null;

    const fromInput = createSearchInput({
      id: 'fare-from',
      label: 'FROM',
      icon: '',
      placeholder: 'Starting station...',
      onSelect: (id) => { fromStation = id; },
    });

    const toInput = createSearchInput({
      id: 'fare-to',
      label: 'TO',
      icon: '',
      placeholder: 'Destination station...',
      onSelect: (id) => { toStation = id; },
    });

    screen.querySelector('#fare-from-container')?.appendChild(fromInput);
    screen.querySelector('#fare-to-container')?.appendChild(toInput);

    const calcBtn = screen.querySelector('#calc-fare-btn');
    const errorEl = screen.querySelector('#fare-error');
    const resultEl = screen.querySelector('#fare-result');

    calcBtn?.addEventListener('click', () => {
      if (!fromStation || !toStation) {
        errorEl.textContent = 'Please select both stations';
        errorEl.style.display = 'block';
        resultEl.innerHTML = '';
        return;
      }
      if (fromStation === toStation) {
        errorEl.textContent = 'Source and destination are the same';
        errorEl.style.display = 'block';
        resultEl.innerHTML = '';
        return;
      }

      errorEl.style.display = 'none';

      // Calculate route to get distance
      const route = findFastestRoute(fromStation, toStation);
      if (!route) {
        resultEl.innerHTML = `
          <div class="card" style="text-align: center; padding: var(--space-xl);">
            <div class="empty-state-icon" style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border: 2px solid; border-radius: 50%; opacity: 0.5; margin: 0 auto; margin-bottom: var(--space-sm);">!</div>
            <div style="font-size: var(--font-size-sm); color: var(--text-muted);">No route found between these stations</div>
          </div>
        `;
        return;
      }

      const fare = calculateFare(route.totalDistance);
      
      resultEl.innerHTML = `
        <div style="animation: fadeSlideIn var(--transition-base) ease-out;">
          <!-- Distance info -->
          <div style="text-align: center; margin-bottom: var(--space-md);">
            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">
              Est. distance: ${route.totalDistance} km · ${route.totalStations} stations
            </span>
          </div>
          
          <!-- Fare Cards -->
          <div class="fare-compare">
            <div class="fare-card">
              <span class="fare-type">Token</span>
              <span class="fare-amount"><span class="currency">₹</span>${fare.tokenFare}</span>
              <span style="font-size: var(--font-size-xs); color: var(--text-muted);">Single journey</span>
            </div>
            <div class="fare-card recommended">
              <span class="fare-type">DMRC Card</span>
              <span class="fare-amount"><span class="currency">₹</span>${fare.cardFare}</span>
              <span class="fare-savings">Save ₹${fare.savings} (10%)</span>
            </div>
          </div>
        </div>
      `;
    });
  });

  return screen;
}
