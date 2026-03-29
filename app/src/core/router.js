// ============================================
// Simple SPA Router
// ============================================

const routes = {};
let currentRoute = null;
let appContainer = null;

export function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

export function navigate(path, params = {}) {
  if (currentRoute === path && !params.force) return;
  
  const container = getAppContainer();
  const screenEl = container.querySelector('.screen-container');
  
  if (screenEl) {
    screenEl.style.transition = 'opacity 150ms ease-in-out, transform 150ms ease-in-out';
    screenEl.style.opacity = '0';
    screenEl.style.transform = 'translateY(4px)';
  }
  
  setTimeout(() => {
    currentRoute = path;
    window.history.pushState({ path, params }, '', `#${path}`);
    renderCurrentRoute(params);
    updateActiveNav(path);
  }, screenEl ? 150 : 0);
}

export function getCurrentRoute() {
  return currentRoute;
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
  screenContainer.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
  screenContainer.style.opacity = '1';
  screenContainer.style.transform = 'translateY(0)';
}

function updateActiveNav(path) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const navPath = item.dataset.path;
    item.classList.toggle('active', navPath === path);
  });
}

export function initRouter() {
  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
      currentRoute = e.state.path;
      renderCurrentRoute(e.state.params || {});
      updateActiveNav(e.state.path);
    }
  });
  
  // Check initial hash
  const hash = window.location.hash.slice(1);
  if (hash && routes[hash]) {
    navigate(hash);
  } else {
    navigate('home');
  }
}
