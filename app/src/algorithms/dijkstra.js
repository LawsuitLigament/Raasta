// ============================================
// Dijkstra's Algorithm — Fastest Route
// Minimizes total travel time including
// variable interchange transfer times
// ============================================

import { GRAPH, STATIONS, LINES, getTransferTime, AVG_DISTANCE_KM } from '../data/metro-data.js';

class MinHeap {
  constructor() { this.heap = []; }
  
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  
  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }
  
  get size() { return this.heap.length; }
  
  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].cost <= this.heap[i].cost) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  
  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].cost < this.heap[smallest].cost) smallest = left;
      if (right < n && this.heap[right].cost < this.heap[smallest].cost) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

export function findFastestRoute(sourceId, destId) {
  if (sourceId === destId) return null;
  if (!GRAPH[sourceId] || !GRAPH[destId]) return null;

  // State: (station, currentLine) — to track interchange costs
  const dist = {};
  const prev = {};
  const heap = new MinHeap();

  // Initialize: start from source on any line it belongs to
  const sourceLines = STATIONS[sourceId].lines;
  sourceLines.forEach(line => {
    const key = `${sourceId}|${line}`;
    dist[key] = 0;
    heap.push({ cost: 0, station: sourceId, line, key });
  });

  while (heap.size > 0) {
    const { cost, station, line, key } = heap.pop();

    if (cost > (dist[key] ?? Infinity)) continue;

    // Check if we reached destination
    if (station === destId) {
      return reconstructRoute(prev, key, sourceId, destId);
    }

    // Explore neighbors on the SAME line
    const edges = GRAPH[station] || [];
    for (const edge of edges) {
      if (edge.line !== line) continue;
      
      const nextKey = `${edge.to}|${edge.line}`;
      const newCost = cost + edge.time;
      
      if (newCost < (dist[nextKey] ?? Infinity)) {
        dist[nextKey] = newCost;
        prev[nextKey] = { fromKey: key, station, line, transferTime: 0 };
        heap.push({ cost: newCost, station: edge.to, line: edge.line, key: nextKey });
      }
    }

    // Explore interchanges: switch to a different line at this station
    const stationLines = STATIONS[station].lines;
    for (const otherLine of stationLines) {
      if (otherLine === line) continue;
      
      const transferTime = getTransferTime(station, line, otherLine);
      const nextKey = `${station}|${otherLine}`;
      const newCost = cost + transferTime;
      
      if (newCost < (dist[nextKey] ?? Infinity)) {
        dist[nextKey] = newCost;
        prev[nextKey] = { fromKey: key, station, line, transferTime, isTransfer: true, fromLine: line, toLine: otherLine };
        heap.push({ cost: newCost, station, line: otherLine, key: nextKey });
      }
    }
  }

  return null; // No route found
}

function reconstructRoute(prev, endKey, sourceId, destId) {
  const path = [];
  let currentKey = endKey;

  while (currentKey && prev[currentKey]) {
    const entry = prev[currentKey];
    const [station, line] = currentKey.split('|');
    path.unshift({ station, line, isTransfer: entry.isTransfer, transferTime: entry.transferTime, fromLine: entry.fromLine, toLine: entry.toLine });
    currentKey = entry.fromKey;
  }

  // Add the source station
  if (path.length > 0) {
    const [station, line] = (currentKey || '').split('|');
    path.unshift({ station, line, isTransfer: false });
  }

  // Build segments (group consecutive stations on the same line)
  return buildRouteResult(path, sourceId, destId);
}

function buildRouteResult(path, sourceId, destId) {
  if (path.length === 0) return null;

  const segments = [];
  let currentSegment = null;
  let totalTime = 0;
  let interchanges = [];
  let totalDistance = 0;

  for (let i = 0; i < path.length; i++) {
    const node = path[i];

    if (node.isTransfer) {
      // This is a transfer at the same station
      totalTime += node.transferTime || 0;
      interchanges.push({
        station: node.station,
        stationName: STATIONS[node.station]?.name,
        fromLine: node.fromLine,
        toLine: node.toLine,
        time: node.transferTime,
      });
      continue;
    }

    if (!currentSegment || currentSegment.line !== node.line) {
      // Start new segment
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
      totalTime += 2; // ~2 min between stations
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Calculate total distance
  segments.forEach(seg => {
    const avgKm = AVG_DISTANCE_KM[seg.line] || 1.3;
    totalDistance += (seg.stationCount - 1) * avgKm;
  });

  // Calculate total stations
  const allStations = [];
  segments.forEach(seg => {
    seg.stations.forEach(s => {
      if (!allStations.includes(s)) allStations.push(s);
    });
  });

  return {
    type: 'fastest',
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
