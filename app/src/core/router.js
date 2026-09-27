// ============================================
// Simple SPA Router
// ============================================

const routes = {};
let currentRoute = null;
let appContainer = null;
let routeStack = [];
let exitAppHandler = () => {};
let exitPromptTimer = null;
let lastBackPress = 0;
const EXIT_PRESS_WINDOW_MS = 2000;

import { updateHeaderTitle } from '../components/header.js';

const ROUTE_TITLES = {
  'home': 'Find Route',
  'results': 'Route Result',
  'stations': 'All Stations',
  'station-detail': 'Station Detail',
  'fare': 'Fare Calculator',
  'settings': 'Settings'
};

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigate(path, params = {}) {
  if (currentRoute === path && !params.force) return;

  const { force: _force, replace: replaceRequested, ...routeParams } = params;
  const replace = replaceRequested || path === 'home';
  const container = getAppContainer();
  const screenEl = container.querySelector('.screen-container');
  
  // Update header title
  updateHeaderTitle(ROUTE_TITLES[path] || 'Delhi Metro');

  if (screenEl) {
    screenEl.style.transition = 'opacity 150ms ease-in-out, transform 150ms ease-in-out';
    screenEl.style.opacity = '0';
    screenEl.style.transform = 'translateY(4px)';
  }
  
  setTimeout(() => {
    currentRoute = path;
    if (replace) {
      if (routeStack.length === 0) routeStack.push(path);
      else routeStack[routeStack.length - 1] = path;
    } else {
      routeStack.push(path);
    }
    const state = { path, params: routeParams };
    if (replace) {
      window.history.replaceState(state, '', `#${path}`);
    } else {
      window.history.pushState(state, '', `#${path}`);
    }
    renderCurrentRoute(routeParams);
    updateActiveNav(path);
  }, screenEl ? 150 : 0);
}

export function getCurrentRoute() {
  return currentRoute;
}

export function setExitAppHandler(handler) {
  exitAppHandler = typeof handler === 'function' ? handler : () => {};
}

function showExitPrompt() {
  let prompt = document.getElementById('back-exit-prompt');
  if (!prompt) {
    prompt = document.createElement('div');
    prompt.id = 'back-exit-prompt';
    prompt.setAttribute('role', 'status');
    prompt.setAttribute('aria-live', 'polite');
    prompt.style.cssText = [
      'position: fixed', 'left: 50%', 'bottom: 88px', 'z-index: 1000',
      'transform: translateX(-50%)', 'padding: 12px 18px', 'border-radius: 999px',
      'background: var(--bg-elevated, #272735)', 'color: var(--text-primary, #fff)',
      'box-shadow: 0 4px 16px rgb(0 0 0 / 25%)', 'font-size: 14px',
      'white-space: nowrap', 'pointer-events: none'
    ].join(';');
    document.body.appendChild(prompt);
  }
  prompt.textContent = 'Click back again to exit';
  clearTimeout(exitPromptTimer);
  exitPromptTimer = setTimeout(() => prompt.remove(), EXIT_PRESS_WINDOW_MS);
}

function returnToHome(showPrompt = false) {
  currentRoute = 'home';
  routeStack = ['home'];
  window.history.replaceState({ path: 'home', params: {} }, '', '#home');
  renderCurrentRoute();
  updateActiveNav('home');
  if (showPrompt) showExitPrompt();
}

export function handleBack() {
  if (currentRoute && currentRoute !== 'home') {
    if (routeStack.length > 1) {
      window.history.back();
    } else {
      returnToHome(true);
    }
    return;
  }

  const now = Date.now();
  if (now - lastBackPress <= EXIT_PRESS_WINDOW_MS) {
    lastBackPress = 0;
    exitAppHandler();
    return;
  }
  lastBackPress = now;
  showExitPrompt();
}

function getAppContainer() {
  if (!appContainer) {
    appContainer = document.getElementById('app');
  }
  return appContainer;
}

function renderCurrentRoute(params = {}) {
  const renderFn = routes[currentRoute];
  if (!renderFn) return;
  
  const container = getAppContainer();
  let screenContainer = container.querySelector('.screen-container');
  
  if (!screenContainer) {
    screenContainer = document.createElement('div');
    screenContainer.className = 'screen-container';
    container.appendChild(screenContainer);
  }
  
  screenContainer.innerHTML = '';
  screenContainer.style.transition = 'none';
  screenContainer.style.opacity = '0';
  screenContainer.style.transform = 'translateY(4px)';
  
  const screen = renderFn(params);
  if (typeof screen === 'string') {
    screenContainer.innerHTML = screen;
  } else if (screen instanceof HTMLElement) {
    screenContainer.appendChild(screen);
  }

  // Scroll to top on navigation
  window.scrollTo(0, 0);

  // Trigger reflow and apply enter transition
  void screenContainer.offsetWidth;
  screenContainer.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out';
  screenContainer.style.opacity = '1';
  screenContainer.style.transform = 'translateY(0)';
}

function updateActiveNav(path) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const navPath = item.dataset.path;
    const isActive = navPath === path;
    item.classList.toggle('active', isActive);
    if (isActive) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
}

export function initRouter() {
  // Handle browser back/forward and gestures. Never let an empty entry exit the app.
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path && routes[e.state.path]) {
      currentRoute = e.state.path;
      const stackIndex = routeStack.lastIndexOf(e.state.path);
      routeStack = stackIndex >= 0 ? routeStack.slice(0, stackIndex + 1) : [e.state.path];
      renderCurrentRoute(e.state.params || {});
      updateActiveNav(e.state.path);
    } else {
      returnToHome(true);
    }
  });
  
  // Check initial hash
  const hash = window.location.hash.slice(1);
  if (hash && routes[hash]) {
    navigate(hash, { replace: true });
  } else {
    navigate('home', { replace: true });
  }
}
