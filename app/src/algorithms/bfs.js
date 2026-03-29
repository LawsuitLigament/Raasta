// ============================================
// Modified BFS — Least Interchanges Route
// Prioritizes minimizing line switches
// Secondary: minimize travel time
// ============================================

import { GRAPH, STATIONS, LINES, getTransferTime, AVG_DISTANCE_KM } from '../data/metro-data.js';

export function findLeastInterchangesRoute(sourceId, destId) {
  if (sourceId === destId) return null;
  if (!GRAPH[sourceId] || !GRAPH[destId]) return null;

  // BFS where each "level" = one more interchange
  // State: { station, line, interchangeCount }
  // We explore all stations reachable on the current line before making interchanges

  const visited = new Set();
  const prev = {};

  // Start: explore all lines the source station is on
  let currentLevel = [];
  const sourceLines = STATIONS[sourceId].lines;
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
      const stationLines = STATIONS[node.station].lines;
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
  // BFS on same line only — no interchanges
  const queue = [...startNodes];
  const allReachable = [...startNodes];
  let head = 0;

  while (head < queue.length) {
    const { station, line } = queue[head++];
    
    const edges = GRAPH[station] || [];
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

  return buildLeastRouteResult(path, sourceId, destId);
}

function buildLeastRouteResult(path, sourceId, destId) {
  if (path.length === 0) return null;

  const segments = [];
  let currentSegment = null;
  let totalTime = 0;
  let interchanges = [];
  let totalDistance = 0;

  for (let i = 0; i < path.length; i++) {
    const node = path[i];

    if (node.isTransfer) {
      const transferTime = getTransferTime(node.station, node.fromLine, node.toLine);
      totalTime += transferTime;
      interchanges.push({
        station: node.station,
        stationName: STATIONS[node.station]?.name,
        fromLine: node.fromLine,
        toLine: node.toLine,
        time: transferTime,
      });
      continue;
    }

    if (!currentSegment || currentSegment.line !== node.line) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        line: node.line,
        lineName: LINES[node.line]?.name || node.line,
        lineColor: LINES[node.line]?.color || '#888',
        stations: [node.station],
        stationCount: 1,
      };
    } else {
      currentSegment.stations.push(node.station);
      currentSegment.stationCount++;
      totalTime += 2;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Calculate distance
  segments.forEach(seg => {
    const avgKm = AVG_DISTANCE_KM[seg.line] || 1.3;
    totalDistance += (seg.stationCount - 1) * avgKm;
  });

  const allStations = [];
  segments.forEach(seg => {
    seg.stations.forEach(s => {
      if (!allStations.includes(s)) allStations.push(s);
    });
  });

  return {
    type: 'leastInterchanges',
    segments,
    interchanges,
    totalTime,
    totalStations: allStations.length,
    totalDistance: Math.round(totalDistance * 10) / 10,
    allStations,
    source: sourceId,
    dest: destId,
  };
}
