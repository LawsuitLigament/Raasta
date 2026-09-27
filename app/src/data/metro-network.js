// Narrow interface over the metro network implementation.
// Consumers should ask network questions instead of depending on storage details.

import {
  GRAPH,
  STATIONS,
  LINES,
  LINE_STATIONS,
  getTransferTime,
  AVG_DISTANCE_KM,
  calculateFare,
  FARE_CHART,
  EXIT_GATES,
  getAllStationsSorted,
  searchStations,
} from './metro-data.js';

export {
  LINES,
  STATIONS,
  LINE_STATIONS,
  getTransferTime,
  AVG_DISTANCE_KM,
  calculateFare,
  FARE_CHART,
  EXIT_GATES,
  getAllStationsSorted,
  searchStations,
};

export function getStation(stationId) {
  return STATIONS[stationId];
}

export function getStationEdges(stationId) {
  return GRAPH[stationId] || [];
}

export function getStationLines(stationId) {
  return STATIONS[stationId]?.lines || [];
}

export function getLine(lineId) {
  return LINES[lineId];
}
