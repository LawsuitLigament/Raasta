// ============================================
// Station Detail Screen
// ============================================

import { STATIONS, LINES, LINE_STATIONS } from '../data/metro-data.js';
import { navigate } from '../core/router.js';
import { setState } from '../core/state.js';

export function renderStationDetailScreen(params = {}) {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'station-detail-screen';

  const stationId = params.stationId;
  const station = STATIONS[stationId];

  if (!station) {
    screen.innerHTML = `
      <div class="container">
        <div class="empty-state">
          <div class="empty-state-icon" style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border: 2px solid; border-radius: 50%; opacity: 0.5;">?</div>
          <div class="empty-state-title">Station Not Found</div>
          <button class="btn btn-primary" id="back-stations" style="margin-top: var(--space-lg);">← Back to Stations</button>
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      screen.querySelector('#back-stations')?.addEventListener('click', () => navigate('stations'));
    });
    return screen;
  }

  const isInterchange = station.lines.length > 1;

  screen.innerHTML = `
    <div class="container" style="padding-top: var(--space-lg);">
      <!-- Back button -->
      <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xl);">
        <button class="icon-btn" id="detail-back" aria-label="Go back">←</button>
        <span style="font-size: var(--font-size-sm); color: var(--text-muted);">Station Details</span>
      </div>

      <!-- Station Header Card -->
      <div class="card card-elevated" style="text-align: center; margin-bottom: var(--space-lg);">
        <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: var(--space-md);">
          ${station.lines.map(l => `
            <span style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 3px 10px;
              background: ${LINES[l]?.color || '#888'};
              color: ${LINES[l]?.textColor || '#fff'};
              border-radius: var(--radius-full);
              font-size: var(--font-size-xs);
              font-weight: 600;
            ">${LINES[l]?.name || l}</span>
          `).join('')}
        </div>
        
        <h1 class="heading-1" style="margin-bottom: var(--space-xs);">${station.name}</h1>
        
        ${isInterchange ? `
          <div style="display: inline-flex; align-items: center; gap: var(--space-xs); padding: 4px 12px; background: rgba(249, 226, 175, 0.1); border: 1px solid rgba(249, 226, 175, 0.2); border-radius: var(--radius-full); margin-top: var(--space-sm);">
            <span style="font-size: var(--font-size-xs); color: var(--accent-warning); font-weight: 600;">Interchange Station</span>
          </div>
        ` : ''}
      </div>

      <!-- Quick Actions -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-xl);">
        <button class="btn btn-secondary btn-full" id="set-as-from">
          Set as Start
        </button>
        <button class="btn btn-secondary btn-full" id="set-as-to">
          Set as Dest
        </button>
      </div>

      <!-- Lines passing through -->
      <div style="margin-bottom: var(--space-xl);">
        <h2 class="heading-3" style="margin-bottom: var(--space-md);">Metro Lines</h2>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          ${station.lines.map(lineId => {
            const line = LINES[lineId];
            const lineStations = LINE_STATIONS[lineId] || [];
            const stationIdx = lineStations.indexOf(stationId);
            const prevStation = stationIdx > 0 ? STATIONS[lineStations[stationIdx - 1]] : null;
            const nextStation = stationIdx < lineStations.length - 1 ? STATIONS[lineStations[stationIdx + 1]] : null;

            return `
              <div class="card" style="padding: var(--space-md) var(--space-lg);">
                <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                  <span class="line-dot" style="background-color: ${line?.color || '#888'}"></span>
                  <span style="font-size: var(--font-size-sm); font-weight: 600;">${line?.name || lineId}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-xs); color: var(--text-muted);">
                  ${prevStation ? `<span>← ${prevStation.name}</span>` : '<span>Terminal</span>'}
                  <span>·</span>
                  ${nextStation ? `<span>${nextStation.name} →</span>` : '<span>Terminal</span>'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Station Info -->
      <div style="margin-bottom: var(--space-2xl);">
        <h2 class="heading-3" style="margin-bottom: var(--space-md);">Station Info</h2>
        <div class="card" style="padding: var(--space-lg);">
          <div style="display: flex; flex-direction: column; gap: var(--space-md);">
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <div>
                <div style="font-size: var(--font-size-sm); font-weight: 600;">Operating Hours</div>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">6:00 AM — 11:00 PM (approx.)</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <div>
                <div style="font-size: var(--font-size-sm); font-weight: 600;">Station Type</div>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${isInterchange ? 'Interchange (Multiple Lines)' : 'Regular Station'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    screen.querySelector('#detail-back')?.addEventListener('click', () => navigate('stations'));

    screen.querySelector('#set-as-from')?.addEventListener('click', () => {
      setState({ fromStation: stationId });
      navigate('home');
    });

    screen.querySelector('#set-as-to')?.addEventListener('click', () => {
      setState({ toStation: stationId });
      navigate('home');
    });
  });

  return screen;
}
