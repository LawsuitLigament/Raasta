// ============================================
// Settings Screen
// ============================================

import { getTheme, toggleTheme } from '../core/theme.js';
import { STATIONS, LINES, FARE_CHART, NETWORK_METADATA } from '../data/metro-network.js';

export function renderSettingsScreen() {
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.id = 'settings-screen';

  const currentTheme = getTheme();
  const operationalLines = Object.values(LINES).filter(line => line.status !== 'construction');
  const constructionLines = Object.values(LINES).filter(line => line.status === 'construction');
  const operationalStations = Object.values(STATIONS).filter(station => station.operationalLines.length > 0);
  const constructionStations = Object.values(STATIONS).filter(station => station.constructionLines.length > 0);
  const lowestFare = FARE_CHART.slabs[0].tokenFare;
  const highestFare = FARE_CHART.slabs[FARE_CHART.slabs.length - 1].tokenFare;

  screen.innerHTML = `
    <div class="container" style="padding-top: var(--space-lg);">
      <h1 class="heading-2" style="margin-bottom: var(--space-xl);">Settings</h1>

      <!-- Appearance -->
      <div class="settings-group" style="margin-bottom: var(--space-xl);">
        <div class="settings-group-title">Appearance</div>
        <div class="setting-item" id="theme-setting">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Dark Mode</span>
              <span class="setting-item-desc">Catppuccin ${currentTheme === 'mocha' ? 'Mocha' : 'Latte'} theme</span>
            </div>
          </div>
          <div class="toggle ${currentTheme === 'mocha' ? 'active' : ''}" id="theme-toggle"></div>
        </div>
      </div>

      <!-- Data Info -->
      <div class="settings-group" style="margin-bottom: var(--space-xl);">
        <div class="settings-group-title">Metro Data</div>
        <div class="setting-item">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Network Coverage</span>
              <span class="setting-item-desc">${operationalLines.length} operational lines · ${operationalStations.length} stations</span>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Construction Coverage</span>
              <span class="setting-item-desc">${constructionLines.length} planned corridors · ${constructionStations.length} planned stations</span>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Data Updated</span>
              <span class="setting-item-desc">${NETWORK_METADATA.updated}</span>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Fare Structure</span>
              <span class="setting-item-desc">${NETWORK_METADATA.fareRevision} · ₹${lowestFare}–₹${highestFare} · ${FARE_CHART.cardDiscountPercent}% card discount</span>
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-group" style="margin-bottom: var(--space-xl);">
        <div class="settings-group-title">About</div>
        <div class="setting-item">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Delhi Metro Route Planner</span>
              <span class="setting-item-desc">Version ${NETWORK_METADATA.version}</span>
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-item-left">
            <div class="setting-item-text">
              <span class="setting-item-title">Offline Support</span>
              <span class="setting-item-desc">All route calculations work offline</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="card" style="margin-bottom: var(--space-2xl); padding: var(--space-lg);">
        <div style="font-size: var(--font-size-xs); color: var(--text-muted); text-align: center; line-height: 1.6;">
          <strong style="color: var(--text-secondary);">Disclaimer</strong><br />
          This app is not officially affiliated with DMRC. Station data, fare information, and travel times are estimated and may not reflect real-time changes. Please verify with official DMRC sources for critical travel planning.
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const themeToggle = screen.querySelector('#theme-toggle');
    const themeSetting = screen.querySelector('#theme-setting');

    const handleThemeToggle = () => {
      const headerBtn = document.querySelector('#theme-toggle-btn');
      const originRect = headerBtn?.getBoundingClientRect();
      const newTheme = toggleTheme(originRect ? {
        x: originRect.left + originRect.width / 2,
        y: originRect.top + originRect.height / 2,
      } : null);
      themeToggle.classList.toggle('active', newTheme === 'mocha');
      
      const desc = themeSetting.querySelector('.setting-item-desc');
      if (desc) desc.textContent = `Catppuccin ${newTheme === 'mocha' ? 'Mocha' : 'Latte'} theme`;


    };

    themeSetting?.addEventListener('click', handleThemeToggle);
  });

  return screen;
}
