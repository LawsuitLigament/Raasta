// ============================================
// Dijkstra's Algorithm â€” Fastest Route
// Minimizes total travel time including
// variable interchange transfer times
// ============================================

import { getStationEdges, getStationLines } from '../data/metro-network.js';
import { getTransferTime } from '../data/metro-network.js';
import { buildRouteResult } from './route-result.js';

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
  if (!getStationEdges(sourceId).length || !getStationEdges(destId).length) return null;

  // State: (station, currentLine) â€” to track interchange costs
  const dist = {};
  const prev = {};
  const heap = new MinHeap();

  // Initialize: start from source on any line it belongs to
  const sourceLines = getStationLines(sourceId);
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
    const edges = getStationEdges(station);
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
    const stationLines = getStationLines(station);
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
  return buildRouteResult(path, sourceId, destId, 'fastest');
}
