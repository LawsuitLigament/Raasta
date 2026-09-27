// ============================================
// Modified BFS â€” Least Interchanges Route
// Prioritizes minimizing line switches
// Secondary: minimize travel time
// ============================================

import { getStationEdges, getStationLines } from '../data/metro-network.js';
import { buildRouteResult } from './route-result.js';

export function findLeastInterchangesRoute(sourceId, destId) {
  if (sourceId === destId) return null;
  if (!getStationEdges(sourceId).length || !getStationEdges(destId).length) return null;

  // BFS where each "level" = one more interchange
  // State: { station, line, interchangeCount }
  // We explore all stations reachable on the current line before making interchanges

  const visited = new Set();
  const prev = {};

  // Start: explore all lines the source station is on
  let currentLevel = [];
  const sourceLines = getStationLines(sourceId);
  sourceLines.forEach(line => {
    const key = `${sourceId}|${line}`;
    visited.add(key);
    currentLevel.push({ station: sourceId, line, interchanges: 0 });
    prev[key] = null;
  });

  let interchangeCount = 0;
  const MAX_INTERCHANGES = 10;

  while (currentLevel.length > 0 && interchangeCount <= MAX_INTERCHANGES) {
    // Phase 1: Expand all reachable stations on current lines (no interchange)
    const reachableOnCurrentLines = expandOnSameLines(currentLevel, visited, prev);
    
    // Check if destination is reached
    for (const node of reachableOnCurrentLines) {
      if (node.station === destId) {
        return reconstructLeastRoute(prev, `${destId}|${node.line}`, sourceId, destId);
      }
    }

    // Phase 2: Find all interchange opportunities
    const nextLevel = [];
    for (const node of reachableOnCurrentLines) {
      const stationLines = getStationLines(node.station);
      for (const otherLine of stationLines) {
        if (otherLine === node.line) continue;
        const key = `${node.station}|${otherLine}`;
        if (visited.has(key)) continue;
        
        visited.add(key);
        prev[key] = {
          fromKey: `${node.station}|${node.line}`,
          isTransfer: true,
          fromLine: node.line,
          toLine: otherLine,
          station: node.station,
        };
        nextLevel.push({ station: node.station, line: otherLine, interchanges: interchangeCount + 1 });
      }
    }

    currentLevel = nextLevel;
    interchangeCount++;
  }

  return null; // No route found
}

function expandOnSameLines(startNodes, visited, prev) {
  // BFS on same line only â€” no interchanges
  const queue = [...startNodes];
  const allReachable = [...startNodes];
  let head = 0;

  while (head < queue.length) {
    const { station, line } = queue[head++];
    
    const edges = getStationEdges(station);
    for (const edge of edges) {
      if (edge.line !== line) continue;
      const key = `${edge.to}|${line}`;
      if (visited.has(key)) continue;
      
      visited.add(key);
      prev[key] = {
        fromKey: `${station}|${line}`,
        isTransfer: false,
        station,
        line,
      };
      
      const node = { station: edge.to, line };
      queue.push(node);
      allReachable.push(node);
    }
  }

  return allReachable;
}

function reconstructLeastRoute(prev, endKey, sourceId, destId) {
  const path = [];
  let currentKey = endKey;

  while (currentKey && prev[currentKey]) {
    const entry = prev[currentKey];
    const [station, line] = currentKey.split('|');
    path.unshift({
      station,
      line,
      isTransfer: entry.isTransfer,
      fromLine: entry.fromLine,
      toLine: entry.toLine,
    });
    currentKey = entry.fromKey;
  }

  // Add source
  if (currentKey) {
    const [station, line] = currentKey.split('|');
    path.unshift({ station, line, isTransfer: false });
  }

  return buildRouteResult(path, sourceId, destId, 'leastInterchanges');
}
