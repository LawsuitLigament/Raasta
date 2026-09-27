// Application-level route planning.

import { findFastestRoute } from '../algorithms/dijkstra.js';
import { findLeastInterchangesRoute } from '../algorithms/bfs.js';

export function planRoutes(sourceId, destId) {
  let fastestRoute = findFastestRoute(sourceId, destId);
  let leastInterchangesRoute = findLeastInterchangesRoute(sourceId, destId);

  // When both goals produce the same number of changes, the fastest result
  // is the more useful route to show for both tabs.
  if (
    fastestRoute &&
    leastInterchangesRoute &&
    fastestRoute.interchanges.length === leastInterchangesRoute.interchanges.length
  ) {
    leastInterchangesRoute = fastestRoute;
  }

  return { fastestRoute, leastInterchangesRoute };
}

export function planFastestRoute(sourceId, destId) {
  return findFastestRoute(sourceId, destId);
}
