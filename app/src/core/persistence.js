// ============================================
// Local Persistence Utility (Saved Routes)
// ============================================

const STORAGE_KEY = 'raasta_saved_routes';

/**
 * Get all saved routes
 * @returns {Array} Array of route objects { from, to, fromName, toName, id }
 */
export function getSavedRoutes() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Save a new route
 * @param {string} fromId 
 * @param {string} toId 
 * @param {string} fromName 
 * @param {string} toName 
 */
export function saveRoute(fromId, toId, fromName, toName) {
  const routes = getSavedRoutes();
  const id = `${fromId}-${toId}`;
  
  // Don't save duplicates
  if (routes.some(r => r.id === id)) return false;
  
  routes.unshift({
    id,
    from: fromId,
    to: toId,
    fromName,
    toName,
    timestamp: Date.now()
  });
  
  // Limit to 20 routes
  const limitedRoutes = routes.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedRoutes));
  return true;
}

/**
 * Remove a saved route
 * @param {string} id 
 */
export function deleteRoute(id) {
  const routes = getSavedRoutes();
  const filtered = routes.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
