// Quick destination search opened from the floating navigation.

import { createSearchInput } from './search-input.js';
import { STATIONS } from '../data/metro-network.js';
import { getState, setState } from '../core/state.js';

export function createQuickStationSearch(navigate, restoreFocus) {
  const overlay = document.createElement('div');
  overlay.className = 'quick-search-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="quick-search-backdrop" data-close-search></div>
    <section class="quick-search-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-search-title">
      <div class="quick-search-handle" aria-hidden="true"></div>
      <div class="quick-search-header">
        <div>
          <p class="text-caption">Quick destination</p>
          <h2 id="quick-search-title">Where are you going?</h2>
        </div>
        <button class="icon-btn" type="button" data-close-search aria-label="Close station search" title="Close station search">×</button>
      </div>
      <div id="quick-search-input-container"></div>
      <div class="quick-search-message" id="quick-search-message" role="status" aria-live="polite"></div>
      <div class="quick-search-actions hidden" id="quick-search-actions">
        <button class="btn btn-primary" type="button" id="set-origin-btn">Set as origin</button>
        <button class="btn btn-secondary" type="button" id="swap-route-btn">Swap</button>
        <button class="btn btn-ghost" type="button" id="choose-another-btn">Choose another station</button>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);

  const syncKeyboardOffset = () => {
    const viewport = window.visualViewport;
    const keyboardOffset = viewport
      ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      : 0;
    overlay.style.setProperty('--quick-search-keyboard-offset', `${keyboardOffset}px`);
  };

  syncKeyboardOffset();
  window.visualViewport?.addEventListener('resize', syncKeyboardOffset);
  window.visualViewport?.addEventListener('scroll', syncKeyboardOffset);

  const inputContainer = overlay.querySelector('#quick-search-input-container');
  const message = overlay.querySelector('#quick-search-message');
  const actions = overlay.querySelector('#quick-search-actions');
  const setOriginButton = overlay.querySelector('#set-origin-btn');
  const swapButton = overlay.querySelector('#swap-route-btn');
  const chooseAnotherButton = overlay.querySelector('#choose-another-btn');
  let pendingStationId = null;
  let searchInput;

  function clearConfirmation() {
    pendingStationId = null;
    message.textContent = '';
    actions.classList.add('hidden');
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    clearConfirmation();
    window.setTimeout(() => restoreFocus?.(), 180);
  }

  function showSameOriginConfirmation(stationId) {
    pendingStationId = stationId;
    message.textContent = `${STATIONS[stationId]?.name || 'This station'} is already your origin. Set as origin?`;
    actions.classList.remove('hidden');
  }

  function selectStation(stationId) {
    if (!stationId) return;

    const state = getState();
    if (state.fromStation === stationId) {
      showSameOriginConfirmation(stationId);
      return;
    }

    if (state.fromStation) {
      setState({ toStation: stationId });
      close();
      navigate('results', { force: true, replace: true });
      return;
    }

    setState({ toStation: stationId, focusHomeField: 'from' });
    close();
    navigate('home', { force: true });
  }

  function setAsOrigin() {
    if (!pendingStationId) return;
    setState({ fromStation: pendingStationId, focusHomeField: 'to' });
    close();
    navigate('home', { force: true });
  }

  function swapRoute() {
    if (!pendingStationId) return;
    const state = getState();
    setState({
      fromStation: state.toStation,
      toStation: state.fromStation,
      focusHomeField: 'to',
    });
    close();
    navigate('home', { force: true });
  }

  searchInput = createSearchInput({
    id: 'quick-destination',
    label: 'DESTINATION',
    icon: '',
    placeholder: 'Search destination station...',
    onSelect: selectStation,
  });
  inputContainer.appendChild(searchInput);

  overlay.querySelectorAll('[data-close-search]').forEach(element => {
    element.addEventListener('click', close);
  });
  setOriginButton.addEventListener('click', setAsOrigin);
  swapButton.addEventListener('click', swapRoute);
  chooseAnotherButton.addEventListener('click', () => {
    clearConfirmation();
    searchInput.clear();
    searchInput.focus();
  });
  overlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });

  return {
    open() {
      clearConfirmation();
      const state = getState();
      const destinationName = state.toStation ? STATIONS[state.toStation]?.name : '';
      searchInput.setStation(state.toStation, destinationName);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      window.requestAnimationFrame(() => searchInput.focus());
    },
    close,
    isOpen() {
      return overlay.classList.contains('open');
    },
  };
}
