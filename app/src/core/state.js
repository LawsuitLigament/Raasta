// ============================================
// Simple State Management
// ============================================

const state = {
  fromStation: null,
  toStation: null,
  fastestRoute: null,
  leastInterchangesRoute: null,
  activeTab: 'fastest', // 'fastest' | 'least'
  focusHomeField: null, // 'from' | 'to' | null
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetRoute() {
  setState({
    fastestRoute: null,
    leastInterchangesRoute: null,
    activeTab: 'fastest',
  });
}
