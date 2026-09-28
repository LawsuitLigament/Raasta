// Narrow interface over the metro network implementation.
// Consumers should ask network questions instead of depending on storage details.

import {
  GRAPH,
  CONSTRUCTION_GRAPH,
  NETWORK_METADATA,
  STATIONS,
  LINES,
  LINE_STATIONS,
  CONSTRUCTION_LINE_STATIONS,
  getTransferTime,
  AVG_DISTANCE_KM,
  calculateFare,
  FARE_CHART,
  EXIT_GATES,
  getAllStationsSorted,
  searchStations,
} from './metro-data.js';

export {
  NETWORK_METADATA,
  LINES,
  STATIONS,
  LINE_STATIONS,
  CONSTRUCTION_LINE_STATIONS,
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

export function getStationEdges(stationId, includeConstruction = false) {
  const operationalEdges = GRAPH[stationId] || [];
  if (!includeConstruction) return operationalEdges;
  return operationalEdges.concat(CONSTRUCTION_GRAPH[stationId] || []);
}

export function getStationLines(stationId, includeConstruction = false) {
  const station = STATIONS[stationId];
  if (!station) return [];
  return includeConstruction ? station.lines : station.operationalLines;
}

export function getLine(lineId) {
  return LINES[lineId];
}
